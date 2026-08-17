// Pings the main app's /up health check every 5 minutes so its container
// never idles past sleepAfter (24h, set in worker/entry.ts) - Cloudflare
// Containers has no "min instances" feature, so this is the actual
// mitigation for cold starts. Deliberately its own tiny separate Worker
// (not folded into the main app's Worker) so its schedule/target are
// visible and editable independent of the main deploy.

interface Env {
  TARGET_URL: string;
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      fetch(env.TARGET_URL, { method: 'GET' })
        .then((res) => {
          if (!res.ok) {
            console.error(`keepalive ping to ${env.TARGET_URL} returned ${res.status}`);
          }
        })
        .catch((err) => {
          console.error(`keepalive ping to ${env.TARGET_URL} failed`, err);
        }),
    );
  },
};
