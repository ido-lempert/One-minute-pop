import * as THREE from '../lib/three.module.js';
import * as R from '../js/connect4-rules.js';
import { createFx } from '../js/fx.js';
import { iceTexture, lavaTextures, skyTexture } from '../js/theme.js';
import { prefs } from '../js/prefs.js';
import { sound, addMuteButton } from '../js/sound.js';
import { addLiteButton } from '../js/prefs.js';
addMuteButton();
addLiteButton();
const view = document.getElementById('view'), status = document.getElementById('status'), mode = document.getElementById('mode');
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); view.appendChild(renderer.domElement);
const pr = () => prefs.lite ? 1 : Math.min(devicePixelRatio, 2); renderer.setPixelRatio(pr()); prefs.onChange(() => { renderer.setPixelRatio(pr()); fit(); }); renderer.domElement.style.touchAction = 'manipulation';
const scene = new THREE.Scene();
const sky = new THREE.Mesh(new THREE.SphereGeometry(60, 24, 16), new THREE.MeshBasicMaterial({ map: skyTexture(), side: THREE.BackSide, fog: false })); scene.add(sky);
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
scene.add(new THREE.HemisphereLight(0xbfd8ff, 0x3a1a18, 0.9));
const iceSun = new THREE.DirectionalLight(0x9fd8ff, 1.2); iceSun.position.set(-6, 8, 8); scene.add(iceSun);
const fireSun = new THREE.DirectionalLight(0xff8a4a, 1.1); fireSun.position.set(6, 5, 8); scene.add(fireSun);
// frame: frosted ice board on a lava base. 7x6 holes (rings), discs sit behind.
const iceMap = iceTexture(3);
const blue = new THREE.MeshStandardMaterial({ color: 0x7fb8e6, map: iceMap, roughness: 0.3, metalness: 0.1, emissive: 0x143a63, emissiveIntensity: 0.5 });
const back = new THREE.Mesh(new THREE.BoxGeometry(7.4, 6.4, 0.3), blue); back.position.set(0, 2.5, -0.35); scene.add(back);
const ringGeo = new THREE.TorusGeometry(0.4, 0.12, 12, 28);
for (let c = 0; c < 7; c++) for (let r = 0; r < 6; r++) { const m = new THREE.Mesh(ringGeo, blue); m.position.set(c - 3, r - 0.0, 0.1); scene.add(m); }
for (const x of [-3.7, 3.7]) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 6.4, 0.9), blue); m.position.set(x, 2.5, 0); scene.add(m); }
const [lavaDark, lavaGlow] = lavaTextures(4);
const lavaMat = new THREE.MeshStandardMaterial({ map: lavaDark, emissiveMap: lavaGlow, emissive: 0xffffff, emissiveIntensity: 0.6, roughness: 0.9 });
const base = new THREE.Mesh(new THREE.BoxGeometry(8, 0.5, 1.6), lavaMat); base.position.set(0, -0.95, 0); scene.add(base);
// discs: player 1 = ice (frost-blue with a six-point star), player 2 = fire (dark ember with a flame ring). The face mark keeps them apart without relying on colour.
const face = (draw) => { const c = document.createElement('canvas'); c.width = c.height = 128; draw(c.getContext('2d')); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
const iceFace = face(g => { g.fillStyle = '#bfe8ff'; g.fillRect(0, 0, 128, 128); g.strokeStyle = '#2a7fc0'; g.lineWidth = 7; g.lineCap = 'round'; for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; g.beginPath(); g.moveTo(64 + Math.cos(a) * 44, 64 + Math.sin(a) * 44); g.lineTo(64 - Math.cos(a) * 44, 64 - Math.sin(a) * 44); g.stroke(); } g.strokeStyle = '#ffffff'; g.lineWidth = 3; g.strokeRect(0, 0, 128, 128); });
const fireFace = face(g => { g.fillStyle = '#6a1c0e'; g.fillRect(0, 0, 128, 128); g.strokeStyle = '#ffb300'; g.lineWidth = 9; g.beginPath(); g.arc(64, 64, 40, 0, 6.283); g.stroke(); g.fillStyle = '#ffb300'; g.beginPath(); g.moveTo(64, 34); g.quadraticCurveTo(88, 62, 64, 94); g.quadraticCurveTo(40, 62, 64, 34); g.fill(); });
fireFace.center.set(0.5, 0.5); fireFace.rotation = Math.PI / 2;
const sideIce = new THREE.MeshStandardMaterial({ color: 0x9fdcff, roughness: 0.2, emissive: 0x1b5f95, emissiveIntensity: 0.6 });
const sideFire = new THREE.MeshStandardMaterial({ color: 0x3a1410, roughness: 0.6, emissive: 0xff4a10, emissiveIntensity: 0.55 });
const mat = {
  1: [sideIce, new THREE.MeshStandardMaterial({ map: iceFace, roughness: 0.25, emissive: 0x2a78b8, emissiveIntensity: 0.35 }), new THREE.MeshStandardMaterial({ map: iceFace, roughness: 0.25 })],
  2: [sideFire, new THREE.MeshStandardMaterial({ map: fireFace, roughness: 0.5, emissive: 0xff5a10, emissiveIntensity: 0.5 }), new THREE.MeshStandardMaterial({ map: fireFace, roughness: 0.5 })],
};
const discs = new THREE.Group(); scene.add(discs);
const colHit = []; // invisible column pickers
for (let c = 0; c < 7; c++) { const m = new THREE.Mesh(new THREE.BoxGeometry(1, 6.4, 1.2), new THREE.MeshBasicMaterial({ visible: false })); m.position.set(c - 3, 2.5, 0.2); m.userData.c = c; scene.add(m); colHit.push(m); }
function fit() {
  const w = view.clientWidth || 600, h = view.clientHeight || 600; renderer.setSize(w, h, false);
  renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%';
  camera.aspect = w / h; camera.updateProjectionMatrix();
  const pts = [[-3.9, -1.2, 0.8], [3.9, -1.2, 0.8], [-3.9, 5.8, 0.8], [3.9, 5.8, 0.8]].map(a => new THREE.Vector3(...a));
  for (let d = 8; d < 60; d += 0.25) { camera.position.set(0, 3.2, d); camera.lookAt(0, 2.4, 0); camera.updateMatrixWorld();
    if (pts.every(v => { const q = v.clone().project(camera); return Math.abs(q.x) < 0.95 && Math.abs(q.y) < 0.95; })) break; }
}
new ResizeObserver(fit).observe(view); fit(); const fx = createFx(scene); const clock = new THREE.Clock(); window.__fx = fx;
renderer.setAnimationLoop(() => { fx.update(clock.getDelta()); renderer.render(scene, camera); });
let board = R.empty(), turn = 1, over = false, busy = false; window.__c4 = () => ({ board, turn, over });
function show() {
  discs.clear();
  for (let c = 0; c < 7; c++) for (let r = 0; r < 6; r++) if (board[c][r]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.25, 32), mat[board[c][r]]); m.rotation.x = Math.PI / 2; m.position.set(c - 3, r, 0); discs.add(m); }
  const w = R.winLine(board);
  if (w) { over = true; for (const [c, r] of w.cells) { const m = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.05, 8, 24), new THREE.MeshBasicMaterial({ color: 0xffffff })); m.position.set(c - 3, r, 0.2); discs.add(m); } }
  else if (R.isFull(board)) over = true;
  const name = p => p === 1 ? 'Ice' : 'Fire';
  status.textContent = w ? name(w.player) + ' wins.' : over ? 'Draw - the board is full.' : name(turn) + ' to move';
  document.body.dataset.turn = String(turn); document.body.dataset.over = String(over);
}
function play(c) {
  const n = R.drop(board, c, turn); if (!n) return false;
  board = n.board; const mover = turn; turn = turn === 1 ? 2 : 1; show(); sound.thud();
  const w = R.winLine(board); if (w) { sound.win(); for (const [wc, wr] of w.cells) fx.burst(wc - 3, wr, 0.4, mover === 1 ? 'ice' : 'fire', 25); }
  return true;
}
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
renderer.domElement.addEventListener('pointerup', e => {
  if (over || busy || (mode.value === 'ai' && turn === 2)) return;
  const b = renderer.domElement.getBoundingClientRect(); ndc.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
  ray.setFromCamera(ndc, camera); const hit = ray.intersectObjects(colHit)[0]; if (!hit) return;
  if (play(hit.object.userData.c) && mode.value === 'ai' && !over) { busy = true; setTimeout(() => { play(R.bestColumn(board, 2, 5)); busy = false; }, 300); }
});
window.__c4col = c => { const v = new THREE.Vector3(c - 3, 2.5, 0.2).project(camera); const b = renderer.domElement.getBoundingClientRect(); return [b.left + (v.x + 1) / 2 * b.width, b.top + (1 - v.y) / 2 * b.height]; };
document.getElementById('new').onclick = () => { board = R.empty(); turn = 1; over = false; busy = false; show(); };
show();
