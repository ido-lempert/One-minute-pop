import * as THREE from '../lib/three.module.js';
const mats = {
  w: new THREE.MeshStandardMaterial({ color: 0xf4efe6, roughness: 0.4 }),
  b: new THREE.MeshStandardMaterial({ color: 0x2b2b33, roughness: 0.35 }),
};
const lathe = pts => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 24);
const prof = {
  p: [[0, 0], [0.32, 0], [0.34, 0.08], [0.2, 0.2], [0.14, 0.4], [0.22, 0.46], [0.16, 0.54], [0.2, 0.62], [0.2, 0.7], [0.12, 0.78], [0, 0.8]],
  r: [[0, 0], [0.36, 0], [0.36, 0.1], [0.26, 0.2], [0.24, 0.6], [0.34, 0.66], [0.34, 0.86], [0.26, 0.86], [0.26, 0.8], [0, 0.8]],
  n: [[0, 0], [0.36, 0], [0.36, 0.1], [0.26, 0.2], [0.2, 0.5], [0, 0.5]],
  b: [[0, 0], [0.34, 0], [0.34, 0.1], [0.22, 0.2], [0.14, 0.5], [0.24, 0.58], [0.22, 0.78], [0.1, 1.0], [0.04, 1.06], [0, 1.06]],
  q: [[0, 0], [0.38, 0], [0.38, 0.1], [0.24, 0.2], [0.16, 0.6], [0.3, 0.72], [0.34, 0.95], [0.18, 0.9], [0.1, 1.1], [0, 1.15]],
  k: [[0, 0], [0.38, 0], [0.38, 0.1], [0.24, 0.2], [0.18, 0.6], [0.3, 0.74], [0.3, 0.92], [0.12, 0.96], [0, 0.96]],
};
export function chessMesh(type, color) {
  const g = new THREE.Group(), m = mats[color];
  const body = new THREE.Mesh(lathe(prof[type]), m); body.castShadow = true; g.add(body);
  if (type === 'n') {
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.5, 0.52), m);
    head.position.set(0, 0.68, 0.1); head.rotation.x = -0.35; head.castShadow = true; g.add(head);
    if (color === 'b') g.rotation.y = Math.PI; // knights face the opponent
    else g.rotation.y = Math.PI;
    g.rotation.y = color === 'w' ? Math.PI : 0;
  }
  if (type === 'k') {
    const a = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.34, 0.1), m), b = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.1, 0.1), m);
    a.position.y = 1.12; b.position.y = 1.14; a.castShadow = b.castShadow = true; g.add(a, b);
  }
  g.scale.setScalar(0.95);
  return g;
}
export function checkerMesh(color, king) {
  const g = new THREE.Group(), m = color === 'w' ? new THREE.MeshStandardMaterial({ color: 0xf0e6d2, roughness: 0.4 }) : new THREE.MeshStandardMaterial({ color: 0xb02a2a, roughness: 0.4 });
  const h = 0.16;
  for (let i = 0; i < (king ? 2 : 1); i++) {
    const d = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.4, h, 32), m);
    d.position.y = h / 2 + i * (h + 0.01); d.castShadow = true; g.add(d);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.025, 8, 32), new THREE.MeshStandardMaterial({ color: 0x00000, roughness: 0.6, transparent: true, opacity: 0.35 }));
    ring.rotation.x = Math.PI / 2; ring.position.y = h + i * (h + 0.01); g.add(ring);
  }
  return g;
}
