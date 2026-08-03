// Small two-tone notification chime, synthesized with the Web Audio API so
// no audio file needs to ship with the app. Browsers block audio until the
// page has had some user interaction (e.g. logging in already counts), so
// this is safe to call from a background poll once the admin is logged in.
let ctx = null

export function playChime() {
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)()
    if (ctx.state === 'suspended') ctx.resume()

    const now = ctx.currentTime
    ;[[880, 0], [1108, 0.13]].forEach(([freq, delay]) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, now + delay)
      gain.gain.linearRampToValueAtTime(0.18, now + delay + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.35)
      osc.connect(gain).connect(ctx.destination)
      osc.start(now + delay)
      osc.stop(now + delay + 0.4)
    })
  } catch {
    // Web Audio unavailable/blocked — fail silently, the visual toast still shows.
  }
}
