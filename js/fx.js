import * as THREE from '../lib/three.module.js';
import { prefs } from './prefs.js';
// Particle effects: fire (rising embers) and ice (frost shards spraying out and falling). Additive, no full-screen flashes.
function spriteTex() {
  const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
}
export function createFx(scene, { max = 600, size = 0.26 } = {}) {
  const pos = new Float32Array(max * 3), col = new Float32Array(max * 3), parts = [];
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ size, map: spriteTex(), vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true }));
  pts.frustumCulled = false; scene.add(pts);
  const lights = [];
  function burst(x, y, z, type, n = 70) {
    if (prefs.lite) n = Math.ceil(n * 0.4);
    for (let i = 0; i < n && parts.length < max; i++) {
      const a = Math.random() * 6.283;
      if (type === 'fire') parts.push({ p: [x + Math.cos(a) * 0.25 * Math.random(), y, z + Math.sin(a) * 0.25 * Math.random()], v: [Math.cos(a) * 0.5 * Math.random(), 1.6 + Math.random() * 2.2, Math.sin(a) * 0.5 * Math.random()], life: 0.7 + Math.random() * 0.7, age: 0, type });
      else parts.push({ p: [x, y + 0.2, z], v: [Math.cos(a) * (0.8 + Math.random() * 1.8), 1.2 + Math.random() * 2.2, Math.sin(a) * (0.8 + Math.random() * 1.8)], life: 0.8 + Math.random() * 0.8, age: 0, type });
    }
  }
  function update(dt) {
    dt = Math.min(dt, 0.05);
    for (let i = parts.length - 1; i >= 0; i--) {
      const q = parts[i]; q.age += dt; if (q.age >= q.life) { parts.splice(i, 1); continue; }
      if (q.type === 'snow' || q.type === 'ember') { /* drift */ } else if (q.type === 'fire') { q.v[1] += 0.6 * dt; q.v[0] += (Math.random() - 0.5) * 3 * dt; q.v[2] += (Math.random() - 0.5) * 3 * dt; } else q.v[1] -= 4.5 * dt;
      q.p[0] += q.v[0] * dt; q.p[1] += q.v[1] * dt; q.p[2] += q.v[2] * dt;
    }
    for (let i = 0; i < max; i++) {
      const q = parts[i];
      if (!q) { col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = 0; continue; }
      pos[i * 3] = q.p[0]; pos[i * 3 + 1] = q.p[1]; pos[i * 3 + 2] = q.p[2];
      const t = 1 - q.age / q.life;
      if (q.type === 'snow') { const f = Math.min(1, t * 3, (1 - t) * 4) * 0.5; col[i * 3] = f * 0.7; col[i * 3 + 1] = f * 0.9; col[i * 3 + 2] = f; }
      else if (q.type === 'ember') { const f = Math.min(1, t * 3, (1 - t) * 4) * 0.7; col[i * 3] = f; col[i * 3 + 1] = f * 0.35; col[i * 3 + 2] = 0; }
      else if (q.type === 'fire') { col[i * 3] = t * 0.7; col[i * 3 + 1] = t * t * 0.14; col[i * 3 + 2] = 0; }
      else { col[i * 3] = 0; col[i * 3 + 1] = t * 0.38; col[i * 3 + 2] = t * 0.8; }
    }
    geo.attributes.position.needsUpdate = geo.attributes.color.needsUpdate = true;
  }
  let acc = 0, ambient = true;
  function ambientUpdate(dt) {
    if (!ambient || prefs.lite) return; acc += dt * (innerWidth < 700 ? 6 : 12);
    while (acc >= 1 && parts.length < max - 140) { acc -= 1;
      const ice = Math.random() < 0.5, x = (Math.random() - 0.5) * 12, z = ice ? 2 + Math.random() * 4 : -2 - Math.random() * 4;
      if (ice) parts.push({ p: [x, 4 + Math.random() * 2, z], v: [(Math.random() - 0.5) * 0.3, -0.5 - Math.random() * 0.4, (Math.random() - 0.5) * 0.3], life: 5, age: 0, type: 'snow' });
      else parts.push({ p: [x, -0.4, z], v: [(Math.random() - 0.5) * 0.3, 0.5 + Math.random() * 0.7, (Math.random() - 0.5) * 0.3], life: 4, age: 0, type: 'ember' }); }
  }
  return { clear: () => { parts.length=0; update(0); }, burst, update: dt => { ambientUpdate(dt); update(dt); }, setAmbient: v => { ambient = v; }, count: () => parts.length };
}
