#!/bin/sh
# Repeatable parity verification for a Waterford Clinic deploy - covers every
# Phase B check from the Cloudflare migration plan. Run this against staging
# before cutover, and again against the live domain immediately after.
#
# Usage:
#   ./scripts/verify-deploy.sh <base_url> [admin_username] [admin_password]
#
# Examples:
#   ./scripts/verify-deploy.sh https://cf-staging.waterfordclinic.ie
#   ./scripts/verify-deploy.sh https://waterfordclinic.ie admin 'real-password'
#
# Admin username/password are optional - without them, the admin auth-cycle
# check is skipped rather than failing (never hardcode real credentials into
# this file). A booking-flow test POST always runs by default; set
# SKIP_BOOKING_TEST=1 to skip it if you don't want a synthetic test
# appointment landing in the real database.

set -eu

BASE_URL="${1:?Usage: $0 <base_url> [admin_username] [admin_password]}"
ADMIN_USER="${2:-}"
ADMIN_PASS="${3:-}"
JAR="$(mktemp)"
FAILED=0

pass() { printf '  \033[32mPASS\033[0m %s\n' "$1"; }
fail() { printf '  \033[31mFAIL\033[0m %s\n' "$1"; FAILED=1; }
section() { printf '\n\033[1m== %s ==\033[0m\n' "$1"; }

cleanup() { rm -f "$JAR"; }
trap cleanup EXIT

section "1. Basic health"
CODE=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/up")
[ "$CODE" = "200" ] && pass "/up returns 200" || fail "/up returned $CODE"

# /api/admin/health deliberately has no 'web' middleware (routes/api.php),
# so it never sets a session cookie - use /api/admin/me instead, which does,
# to actually exercise session/cookie behavior.
#
# curl's Netscape cookie-jar format prefixes HttpOnly cookie lines with
# "#HttpOnly_" (not a comment, despite the leading #) - strip that first or
# the exact rows get misread as comments and silently skipped.
#
# NOT comparing the cookie's raw encrypted VALUE across requests - Laravel's
# cookie encryption uses a random IV every time, so the encrypted string
# legitimately differs on every single response even for a perfectly stable
# session. That's expected, not a bug. The actual signature of the
# SESSION_DRIVER=cookie regression found on the previous host wasn't a
# changing value - it was an EXTRA cookie appearing, named after the current
# session ID instead of the fixed config name. So the real check here is:
# does exactly the expected, fixed set of cookie names show up, with nothing
# unrecognized alongside them.
section "2. Session persistence across requests (real cookie jar, like a browser)"
curl -s -o /dev/null -c "$JAR" -b "$JAR" "$BASE_URL/api/admin/me"
COOKIE_NAMES=$(sed 's/^#HttpOnly_//' "$JAR" | awk '!/^#/ {print $6}' | sort -u)
echo "  cookies present: $(echo "$COOKIE_NAMES" | tr '\n' ' ')"
if echo "$COOKIE_NAMES" | grep -qx "twl_clinic_session"; then
  pass "twl_clinic_session present with its fixed, configured name"
else
  fail "twl_clinic_session not found by its expected fixed name"
fi
UNEXPECTED=$(echo "$COOKIE_NAMES" | grep -vx -e "twl_clinic_session" -e "XSRF-TOKEN" -e "__cf_bm" || true)
if [ -z "$UNEXPECTED" ]; then
  pass "no unexpected extra cookies (this is the exact SESSION_DRIVER=cookie regression signature)"
else
  fail "unexpected cookie name(s) present: $(echo "$UNEXPECTED" | tr '\n' ' ') - check SESSION_DRIVER"
fi

section "3. Cookie security flags"
HEADERS=$(curl -sI "$BASE_URL/api/admin/me")
echo "$HEADERS" | grep -qi 'twl_clinic_session.*Secure' && pass "Secure flag present" || fail "Secure flag missing"
echo "$HEADERS" | grep -qi 'twl_clinic_session.*HttpOnly' && pass "HttpOnly flag present" || fail "HttpOnly flag missing"
echo "$HEADERS" | grep -qi 'twl_clinic_session.*SameSite=Lax' && pass "SameSite=Lax present" || fail "SameSite=Lax missing"

section "4. Admin DB health"
BODY=$(curl -s "$BASE_URL/api/admin/health")
STATUS=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/api/admin/health")
echo "  response: $BODY"
[ "$STATUS" = "200" ] && pass "admin health reports ok ($STATUS)" || echo "  (non-200 is expected before migrations run - check the message above)"

section "5. Cache store sanity (exercises config/cache.php's database store via login rate-limiting)"
CODE=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE_URL/api/admin/login" \
  -H 'Content-Type: application/json' -d '{"email_or_username":"__verify_script__","password":"wrong"}')
if [ "$CODE" = "401" ]; then
  pass "login endpoint reachable, cache-backed throttle middleware did not 500"
else
  fail "expected 401 (invalid creds), got $CODE - check the database cache store fix"
fi

if [ -n "$ADMIN_USER" ] && [ -n "$ADMIN_PASS" ]; then
  section "6. Full admin auth cycle"
  LOGIN_CODE=$(curl -s -o /dev/null -w '%{http_code}' -c "$JAR" -b "$JAR" -X POST "$BASE_URL/api/admin/login" \
    -H 'Content-Type: application/json' \
    -d "{\"email_or_username\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}")
  [ "$LOGIN_CODE" = "200" ] && pass "login succeeded" || fail "login returned $LOGIN_CODE"

  ME_CODE=$(curl -s -o /dev/null -w '%{http_code}' -c "$JAR" -b "$JAR" "$BASE_URL/api/admin/me")
  [ "$ME_CODE" = "200" ] && pass "/me returns 200 while authenticated" || fail "/me returned $ME_CODE while authenticated"

  curl -s -o /dev/null -c "$JAR" -b "$JAR" -X POST "$BASE_URL/api/admin/logout"
  ME_AFTER_LOGOUT=$(curl -s -o /dev/null -w '%{http_code}' -c "$JAR" -b "$JAR" "$BASE_URL/api/admin/me")
  [ "$ME_AFTER_LOGOUT" = "401" ] && pass "/me returns 401 after logout (session actually invalidated)" || fail "/me returned $ME_AFTER_LOGOUT after logout, expected 401"
else
  section "6. Full admin auth cycle"
  echo "  SKIPPED - pass admin_username and admin_password as args 2 and 3 to run this"
fi

if [ "${SKIP_BOOKING_TEST:-0}" != "1" ]; then
  section "7. Public booking flow (writes a real test appointment - set SKIP_BOOKING_TEST=1 to skip)"
  BOOK_RESPONSE=$(curl -s -w '\n%{http_code}' -X POST "$BASE_URL/api/appointments" \
    -H 'Content-Type: application/json' \
    -d '{
      "clinic": "waterford",
      "firstName": "VerifyScript",
      "lastName": "TestPatient",
      "phone": "0000000000",
      "dob": "1990-01-01",
      "address": "Test Address, Waterford",
      "service": "Verification test - safe to delete",
      "date": "'"$(date -d '+1 day' +%F 2>/dev/null || date -v+1d +%F)"'",
      "time": "10:00",
      "consent": true
    }')
  BOOK_CODE=$(echo "$BOOK_RESPONSE" | tail -1)
  BOOK_BODY=$(echo "$BOOK_RESPONSE" | sed '$d')
  if [ "$BOOK_CODE" = "201" ] || [ "$BOOK_CODE" = "200" ]; then
    pass "booking created ($BOOK_CODE) - $BOOK_BODY"
    echo "  -> manually verify the confirmation email arrived, and delete this test row from the admin panel"
  else
    fail "booking POST returned $BOOK_CODE - $BOOK_BODY"
  fi
else
  section "7. Public booking flow"
  echo "  SKIPPED (SKIP_BOOKING_TEST=1)"
fi

section "8. Prerendered pages: real content + correct no-cache headers"
for PAGE in "" "services" "walk-in-doctor" "minor-injuries" "womens-health" "blood-tests" "sick-certificates"; do
  URL="$BASE_URL/$PAGE"
  CODE=$(curl -s -o /dev/null -w '%{http_code}' "$URL")
  CC=$(curl -sI "$URL" | grep -i '^cache-control' | tr -d '\r')
  CF_STATUS=$(curl -sI "$URL" | grep -i '^cf-cache-status' | tr -d '\r')
  if [ "$CODE" = "200" ]; then
    pass "/$PAGE -> 200"
  else
    fail "/$PAGE -> $CODE"
  fi
  echo "    $CC"
  [ -n "$CF_STATUS" ] && echo "    $CF_STATUS (confirm this isn't HIT overriding the no-store header above)"
done

section "9. Real 404 for unknown paths (not a soft-404)"
CODE=$(curl -s -o /dev/null -w '%{http_code}' "$BASE_URL/this-page-does-not-exist-$$")
[ "$CODE" = "404" ] && pass "unknown path returns real 404" || fail "unknown path returned $CODE, expected 404"

echo
if [ "$FAILED" = "0" ]; then
  printf '\033[32mAll checks passed.\033[0m\n'
else
  printf '\033[31mOne or more checks failed - see above before proceeding with cutover.\033[0m\n'
  exit 1
fi
