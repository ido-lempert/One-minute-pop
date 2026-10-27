// Synthesised sound with Web Audio (no audio files). Starts after the first user gesture. Mute is remembered.
let ctx = null, muted = localStorage.getItem('games-muted') === '1';
function ensure() { if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return null; ctx = new A(); } if (ctx.state === 'suspended') ctx.resume(); return ctx; }
function noise(c, dur) { const b = c.createBuffer(1, c.sampleRate * dur, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; const s = c.createBufferSource(); s.buffer = b; return s; }
function env(c, g, t, a, d, peak) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
function tone(c, f, t, d, type = 'sine', peak = 0.2, f2) { const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d); env(c, g, t, 0.005, d, peak); o.connect(g).connect(c.destination); o.start(t); o.stop(t + d + 0.05); }
export const sound = {
  get muted() { return muted; },
  unlock() { ensure(); },
  setMuted(m) { muted = m; localStorage.setItem('games-muted', m ? '1' : '0'); },
  knock() { if (muted) return; const c = ensure(); if (!c) return; const t = c.currentTime; tone(c, 220, t, 0.12, 'sine', 0.35, 90); const n = noise(c, 0.05), f = c.createBiquadFilter(), g = c.createGain(); f.type = 'bandpass'; f.frequency.value = 1400; env(c, g, t, 0.002, 0.04, 0.25); n.connect(f).connect(g).connect(c.destination); n.start(t); },
  fire() { if (muted) return; const c = ensure(); if (!c) return; const t = c.currentTime; this.knock(); const n = noise(c, 0.7), f = c.createBiquadFilter(), g = c.createGain(); f.type = 'highpass'; f.frequency.value = 1800; env(c, g, t, 0.01, 0.6, 0.18); n.connect(f).connect(g).connect(c.destination); n.start(t); tone(c, 110, t, 0.5, 'sawtooth', 0.08, 55); },
  ice() { if (muted) return; const c = ensure(); if (!c) return; const t = c.currentTime; this.knock(); [1568, 2093, 2637, 3136].forEach((f, i) => tone(c, f, t + i * 0.045, 0.5, 'sine', 0.07)); },
  check() { if (muted) return; const c = ensure(); if (!c) return; const t = c.currentTime; tone(c, 440, t, 0.18, 'triangle', 0.16); tone(c, 554, t + 0.12, 0.25, 'triangle', 0.16); },
  win() { if (muted) return; const c = ensure(); if (!c) return; const t = c.currentTime; [523, 659, 784, 1047].forEach((f, i) => tone(c, f, t + i * 0.13, 0.5, 'triangle', 0.18)); },
  thud() { if (muted) return; const c = ensure(); if (!c) return; const t = c.currentTime; tone(c, 160, t, 0.18, 'sine', 0.4, 60); },
};
export function addMuteButton() {
  const h = document.querySelector('header'); const b = document.createElement('button'); b.id = 'mute'; b.style.padding = '6px 10px';
  const paint = () => { b.textContent = sound.muted ? 'Sound: off' : 'Sound: on'; b.setAttribute('aria-pressed', String(!sound.muted)); };
  b.onclick = () => { sound.setMuted(!sound.muted); if (!sound.muted) sound.unlock(); paint(); }; paint(); h.appendChild(b);
  addEventListener('pointerdown', () => sound.unlock(), { once: true });
}
