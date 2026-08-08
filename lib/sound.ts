"use client"

// Tiny 8-bit style sound helper using the Web Audio API. No assets required.

let ctx: AudioContext | null = null
let enabled = true

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!ctx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {})
  return ctx
}

export function setSoundEnabled(v: boolean) {
  enabled = v
}

export function isSoundEnabled() {
  return enabled
}

function beep(freq: number, start: number, duration: number, gain = 0.06) {
  const audio = getCtx()
  if (!audio) return
  const osc = audio.createOscillator()
  const g = audio.createGain()
  osc.type = "square"
  osc.frequency.setValueAtTime(freq, audio.currentTime + start)
  g.gain.setValueAtTime(gain, audio.currentTime + start)
  g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + start + duration)
  osc.connect(g)
  g.connect(audio.destination)
  osc.start(audio.currentTime + start)
  osc.stop(audio.currentTime + start + duration)
}

export function playMark() {
  if (!enabled) return
  beep(660, 0, 0.09)
}

export function playUnmark() {
  if (!enabled) return
  beep(330, 0, 0.08)
}

export function playCall() {
  if (!enabled) return
  beep(520, 0, 0.08)
  beep(780, 0.07, 0.1)
}

export function playWin() {
  if (!enabled) return
  beep(523, 0, 0.12)
  beep(659, 0.12, 0.12)
  beep(784, 0.24, 0.12)
  beep(1046, 0.36, 0.2)
}

export function playError() {
  if (!enabled) return
  beep(200, 0, 0.15, 0.05)
}

export function playClick() {
  if (!enabled) return
  beep(440, 0, 0.05, 0.04)
}
