import * as THREE from '../lib/three.module.js';
// Ice set (light pieces): faceted frosted crystal. Fire set (dark pieces): obsidian with glowing embers.
const iceMat = new THREE.MeshPhysicalMaterial({ color: 0x58b6ff, emissive: 0x1565b0, emissiveIntensity: 0.5, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.05, flatShading: true });
const fireMat = new THREE.MeshPhysicalMaterial({ color: 0x120708, emissive: 0xff3a08, emissiveIntensity: 0.16, roughness: 0.3, clearcoat: 0.8, flatShading: true });
const trim = { w: new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xaee6ff, emissiveIntensity: 1.2, roughness: 0.2 }), b: new THREE.MeshStandardMaterial({ color: 0xffb300, emissive: 0xff7a00, emissiveIntensity: 1.6, roughness: 0.3 }) };
const mats = { w: iceMat, b: fireMat };
const lathe = pts => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 9);
const prof = {
  p: [[0, 0], [0.36, 0], [0.38, 0.1], [0.22, 0.24], [0.17, 0.44], [0.27, 0.52], [0.2, 0.6], [0.24, 0.7], [0.24, 0.8], [0.13, 0.9], [0, 0.95]],
  r: [[0, 0], [0.4, 0], [0.4, 0.12], [0.3, 0.24], [0.27, 0.7], [0.38, 0.78], [0.4, 1.02], [0.3, 1.02], [0.3, 0.94], [0, 0.94]],
  n: [[0, 0], [0.4, 0], [0.4, 0.12], [0.3, 0.24], [0.24, 0.6], [0, 0.6]],
  b: [[0, 0], [0.38, 0], [0.38, 0.12], [0.25, 0.24], [0.16, 0.6], [0.28, 0.7], [0.25, 0.92], [0.12, 1.15], [0.05, 1.25], [0, 1.25]],
  q: [[0, 0], [0.42, 0], [0.42, 0.12], [0.27, 0.24], [0.18, 0.7], [0.34, 0.84], [0.4, 1.1], [0.2, 1.04], [0.12, 1.3], [0, 1.38]],
  k: [[0, 0], [0.42, 0], [0.42, 0.12], [0.27, 0.24], [0.2, 0.7], [0.34, 0.86], [0.34, 1.06], [0.14, 1.12], [0, 1.12]],
};
function gem(color, y, s = 0.12) { const g = new THREE.Mesh(new THREE.OctahedronGeometry(s), trim[color]); g.position.y = y; g.castShadow = false; return g; }
export function chessMesh(type, color) {
  const g = new THREE.Group(), m = mats[color];
  const body = new THREE.Mesh(lathe(prof[type]), m); body.castShadow = true; body.receiveShadow = true; g.add(body);
  if (type === 'n') {
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.62, 0.6), m); head.position.set(0, 0.85, 0.1); head.rotation.x = -0.4; head.castShadow = true; g.add(head);
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.3, 6), trim[color]); horn.position.set(0, 1.25, -0.08); horn.rotation.x = -0.5; g.add(horn);
    g.rotation.y = color === 'w' ? Math.PI : 0;
  }
  if (type === 'k') { const a = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.12), trim[color]), b = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.12), trim[color]); a.position.y = 1.35; b.position.y = 1.38; g.add(a, b); }
  if (type === 'q') g.add(gem(color, 1.5, 0.14));
  if (type === 'b') g.add(gem(color, 1.36, 0.09));
  if (type === 'r') for (let i = 0; i < 4; i++) { const t = gem(color, 1.08, 0.06); t.position.x = Math.cos(i * 1.57) * 0.3; t.position.z = Math.sin(i * 1.57) * 0.3; g.add(t); }
  g.userData.side = color === 'w' ? 'ice' : 'fire';
  g.scale.setScalar(0.92); return g;
}
export function checkerMesh(color, king) {
  const g = new THREE.Group(), m = mats[color], h = 0.2;
  const d = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.44, h, 10), m); d.position.y = h / 2; d.castShadow = true; d.receiveShadow = true; g.add(d);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.03, 8, 30), trim[color]); rim.rotation.x = Math.PI / 2; rim.position.y = h + 0.005; g.add(rim);
  if (king) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.34, 5), trim[color]); c.position.y = h + 0.17; c.castShadow = true; g.add(c); }
  return g;
}
