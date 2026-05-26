// lib/audio.ts
// System sound design (Web Audio API). Pure synth, no samples.
// Lazy-init on first user gesture; safe to import in SSR (only touches window in callbacks).

let ctx: AudioContext | null = null
let master: GainNode | null = null
let enabled = true
let volume = 0.35

function ensure(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx!.createGain()
    master.gain.value = volume
    master.connect(ctx!.destination)
  }
  if (ctx && ctx.state === 'suspended') ctx.resume()
  return ctx
}

function envelope(g: GainNode, t0: number, attack: number, hold: number, release: number, peak = 1) {
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(peak, t0 + attack)
  g.gain.setValueAtTime(peak, t0 + attack + hold)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + attack + hold + release)
}

function tone(freq: number, t0: number, dur: number, type: OscillatorType = 'sine', peak = 0.4) {
  if (!ctx || !master) return
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.type = type
  o.frequency.value = freq
  o.connect(g); g.connect(master)
  envelope(g, t0, 0.005, dur * 0.3, dur * 0.7, peak)
  o.start(t0); o.stop(t0 + dur + 0.02)
}

function noise(t0: number, dur: number, peak = 0.15, filterFreq = 4000) {
  if (!ctx || !master) return
  const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const src = ctx.createBufferSource()
  src.buffer = buf
  const filt = ctx.createBiquadFilter()
  filt.type = 'bandpass'; filt.frequency.value = filterFreq; filt.Q.value = 8
  const g = ctx.createGain()
  src.connect(filt); filt.connect(g); g.connect(master)
  envelope(g, t0, 0.005, dur * 0.2, dur * 0.8, peak)
  src.start(t0); src.stop(t0 + dur + 0.05)
}

export const sfx = {
  setEnabled(v: boolean) {
    enabled = !!v
    if (master) master.gain.value = enabled ? volume : 0
  },
  setVolume(v: number) {
    volume = Math.max(0, Math.min(1, v))
    if (master) master.gain.value = enabled ? volume : 0
  },
  ping() {
    if (!ensure() || !enabled || !ctx) return
    const t = ctx.currentTime
    tone(1320, t, 0.18, 'sine', 0.35)
    tone(1980, t + 0.02, 0.14, 'sine', 0.18)
    noise(t, 0.06, 0.04, 2800)
  },
  tick() {
    if (!ensure() || !enabled || !ctx) return
    const t = ctx.currentTime
    tone(2200 + Math.random() * 400, t, 0.025, 'square', 0.08)
  },
  blip() {
    if (!ensure() || !enabled || !ctx) return
    const t = ctx.currentTime
    tone(880, t, 0.06, 'triangle', 0.15)
    tone(1320, t + 0.02, 0.05, 'triangle', 0.1)
  },
  issue() {
    if (!ensure() || !enabled || !ctx) return
    const t = ctx.currentTime
    tone(440, t, 0.12, 'sawtooth', 0.18)
    tone(660, t + 0.05, 0.18, 'sawtooth', 0.16)
    tone(880, t + 0.12, 0.32, 'sine', 0.22)
    noise(t, 0.2, 0.05, 1200)
  },
  portal() {
    if (!ensure() || !enabled || !ctx || !master) return
    const t = ctx.currentTime
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sawtooth'
    o.frequency.setValueAtTime(60, t)
    o.frequency.exponentialRampToValueAtTime(180, t + 1.4)
    o.connect(g); g.connect(master)
    envelope(g, t, 0.4, 0.5, 0.6, 0.3)
    o.start(t); o.stop(t + 1.6)
    noise(t + 0.1, 1.4, 0.08, 600)
    noise(t + 0.3, 1.2, 0.06, 3200)
  },
  chime() {
    if (!ensure() || !enabled || !ctx) return
    const t = ctx.currentTime
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((f, i) => {
      tone(f, t + i * 0.12, 0.55, 'sine', 0.28)
      tone(f * 2, t + i * 0.12, 0.35, 'sine', 0.08)
    })
  },
}
