import * as THREE from '../lib/three.module.js';
// Fire vs Ice theme: textures and materials. All procedural (canvas), no image files.
const cv = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export function iceTexture(seed = 1) {
  const r = rng(seed);
  return cv(256, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#d9f4ff'); gr.addColorStop(0.5, '#a9dcf7'); gr.addColorStop(1, '#cdeeff'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.lineCap = 'round';
    for (let i = 0; i < 26; i++) { g.strokeStyle = `rgba(255,255,255,${0.25 + r() * 0.5})`; g.lineWidth = 0.6 + r() * 1.6; g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 70; y += (r() - 0.5) * 70; g.lineTo(x, y); } g.stroke(); }
    for (let i = 0; i < 8; i++) { g.fillStyle = `rgba(90,170,220,${0.08 + r() * 0.1})`; g.beginPath(); const x = r() * w, y = r() * h; g.moveTo(x, y); g.lineTo(x + 40 + r() * 50, y + r() * 30); g.lineTo(x + r() * 40, y + 50 + r() * 40); g.fill(); }
  });
}
export function lavaTextures(seed = 1) {
  const r = rng(seed);
  const draw = (emissive) => cv(256, 256, (g, w, h) => {
    g.fillStyle = emissive ? '#000' : '#1b1012'; g.fillRect(0, 0, w, h);
    if (!emissive) for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(60,35,35,${r() * 0.4})`; g.beginPath(); g.arc(r() * w, r() * h, 2 + r() * 14, 0, 6.28); g.fill(); }
    const r2 = rng(seed * 7 + 3);
    for (let i = 0; i < 9; i++) { let x = r2() * w, y = r2() * h; const wd = 1.5 + r2() * 3;
      for (const [col, lw] of emissive ? [['#ff3d00', wd * 2.4], ['#ffb300', wd]] : [['#2a0d08', wd * 2]]) { g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round'; g.beginPath(); let px = x, py = y; g.moveTo(px, py); const r3 = rng(seed * 13 + i); for (let k = 0; k < 6; k++) { px += (r3() - 0.5) * 80; py += (r3() - 0.5) * 80; g.lineTo(px, py); } g.stroke(); } }
  });
  return [draw(false), draw(true)];
}
export function frameTexture() {
  return cv(256, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, '#2a6fa8'); gr.addColorStop(0.5, '#3a3550'); gr.addColorStop(1, '#8a2a10'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const r = rng(5); for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(0,0,0,${r() * 0.18})`; g.fillRect(r() * w, r() * h, 1 + r() * 6, 1 + r() * 3); }
    g.strokeStyle = 'rgba(255,230,160,.6)'; g.lineWidth = 3; g.strokeRect(10, 10, w - 20, h - 20);
  });
}
export function skyTexture() {
  return cv(512, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0a0f2c'); gr.addColorStop(0.45, '#27235a'); gr.addColorStop(0.62, '#7a2e6d'); gr.addColorStop(0.74, '#e0663a'); gr.addColorStop(1, '#1a0d1f'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const r = rng(9); for (let i = 0; i < 180; i++) { g.fillStyle = `rgba(255,255,255,${0.2 + r() * 0.8})`; const s = r() < 0.1 ? 2 : 1; g.fillRect(r() * w, r() * h * 0.5, s, s); }
  });
}
export const glowTexture = (color) => cv(128, 128, (g, w, h) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, color); gr.addColorStop(0.4, color.replace(/[\d.]+\)$/, '0.25)')); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
