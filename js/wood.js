import * as THREE from '../lib/three.module.js';
// Procedural wood: grain lines with ring waviness, plank-like colour variation, drawn on a canvas.
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
export function woodCanvas({ base, dark, seed = 1, size = 512, rings = 22, planks = 1 }) {
  const cv = document.createElement('canvas'); cv.width = cv.height = size; const g = cv.getContext('2d'), r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, size, size);
  const bump = document.createElement('canvas'); bump.width = bump.height = size; const bg = bump.getContext('2d'); bg.fillStyle = '#808080'; bg.fillRect(0, 0, size, size);
  const ph = size / planks;
  for (let p = 0; p < planks; p++) {
    g.fillStyle = `rgba(0,0,0,${(r() * 0.12).toFixed(3)})`; g.fillRect(0, p * ph, size, ph);
    const wob = 6 + r() * 14, f1 = 2 + r() * 3, f2 = 5 + r() * 6, ph1 = r() * 6.28;
    for (let i = 0; i < rings * 6; i++) {
      const y0 = p * ph + (i / (rings * 6)) * ph, a = r(), w = 0.4 + r() * 1.6;
      g.strokeStyle = a > 0.55 ? dark : base; g.globalAlpha = 0.08 + r() * 0.3; g.lineWidth = w; g.beginPath();
      for (let x = 0; x <= size; x += 8) { const y = y0 + Math.sin(x / size * f1 * 6.28 + ph1 + i * 0.07) * wob * 0.35 + Math.sin(x / size * f2 * 6.28 + i) * 2.2; x ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.stroke();
      bg.strokeStyle = a > 0.55 ? '#303030' : '#c0c0c0'; bg.globalAlpha = 0.25; bg.lineWidth = w; bg.beginPath();
      for (let x = 0; x <= size; x += 8) { const y = y0 + Math.sin(x / size * f1 * 6.28 + ph1 + i * 0.07) * wob * 0.35 + Math.sin(x / size * f2 * 6.28 + i) * 2.2; x ? bg.lineTo(x, y) : bg.moveTo(x, y); }
      bg.stroke();
    }
    for (let k = 0; k < 3; k++) { // a knot-ish swirl
      if (r() < 0.5) continue; const cx = r() * size, cy = p * ph + r() * ph; g.globalAlpha = 0.25;
      for (let q = 1; q < 6; q++) { g.strokeStyle = dark; g.lineWidth = 1; g.beginPath(); g.ellipse(cx, cy, q * 5, q * 2.2, 0, 0, 6.28); g.stroke(); }
    }
  }
  g.globalAlpha = 1; bg.globalAlpha = 1; return [cv, bump];
}
export function woodMaterial(opts, { repeat = [1, 1], rough = 0.45, clearcoat = 0.6, rotate = 0 } = {}) {
  const [c, b] = woodCanvas(opts), map = new THREE.CanvasTexture(c), bump = new THREE.CanvasTexture(b);
  map.colorSpace = THREE.SRGBColorSpace;
  for (const t of [map, bump]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...repeat); t.anisotropy = 4; t.rotation = rotate; }
  return new THREE.MeshPhysicalMaterial({ map, bumpMap: bump, bumpScale: 1.2, roughness: rough, clearcoat, clearcoatRoughness: 0.25, metalness: 0 });
}
