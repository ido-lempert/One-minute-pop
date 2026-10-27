import * as THREE from '../lib/three.module.js';
import { RoomEnvironment } from '../lib/RoomEnvironment.js';
import { woodMaterial } from './wood.js';
import { createFx } from './fx.js';

// Shared 3D 8x8 board. Square (c, r): c = file 0..7 (a..h), r = rank 0..7 (1..8).
export function createBoard(container, { onSquare, lightColor = 0xe8d9b5, darkColor = 0x7a5230 }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 700 ? 1.75 : 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x151a24);
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.55;
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xfff2dd, 0x223344, 0.35));
  const sun = new THREE.DirectionalLight(0xffffff, 1.1);
  sun.position.set(5, 10, 6); sun.castShadow = true; sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 3;
  sun.shadow.mapSize.set(innerWidth < 700 ? 1024 : 2048, innerWidth < 700 ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7 });
  scene.add(sun);

  const frameMat = woodMaterial({ base: '#4a2c17', dark: '#24120a', seed: 7 }, { repeat: [2, 1], rough: 0.4, clearcoat: 0.8 });
  const frame = new THREE.Mesh(new THREE.BoxGeometry(9.4, 0.5, 9.4), frameMat);
  frame.position.y = -0.3; frame.receiveShadow = true; frame.castShadow = true; scene.add(frame);
  const table = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), woodMaterial({ base: '#6b4a2b', dark: '#3a2312', seed: 21, planks: 5 }, { repeat: [6, 6], rough: 0.6, clearcoat: 0.2 }));
  table.rotation.x = -Math.PI / 2; table.position.y = -0.56; table.receiveShadow = true; scene.add(table);
  const lightMats = [woodMaterial({ base: '#e4c48f', dark: '#b98d52', seed: 3 }, { rough: 0.38, clearcoat: 0.7 }), woodMaterial({ base: '#ebcf9c', dark: '#c19a5c', seed: 4 }, { rough: 0.38, clearcoat: 0.7 })];
  const darkMats = [woodMaterial({ base: '#6b3f21', dark: '#2e1708', seed: 5 }, { rough: 0.38, clearcoat: 0.7 }), woodMaterial({ base: '#5d3519', dark: '#28130a', seed: 6 }, { rough: 0.38, clearcoat: 0.7 })];
  const squares = [];
  const sqGeo = new THREE.BoxGeometry(1, 0.1, 1);
  for (let c = 0; c < 8; c++) for (let r = 0; r < 8; r++) {
    const m = new THREE.Mesh(sqGeo, ((c + r) % 2 ? lightMats : darkMats)[(c * 3 + r * 5) % 2]);
    m.position.set(c - 3.5, -0.03, 3.5 - r); m.receiveShadow = true;
    m.userData = { c, r, base: (c + r) % 2 ? lightColor : darkColor };
    scene.add(m); squares.push(m);
  }
  const pieceGroup = new THREE.Group(); scene.add(pieceGroup);
  const markGroup = new THREE.Group(); scene.add(markGroup);

  // view orientation: 'w' looks from white side, 'b' from black side
  let side = 'w', yaw = 0, pitch = 0.95, dist = 13;
  function placeCamera() {
    const s = side === 'w' ? 1 : -1;
    const a = yaw;
    camera.position.set(Math.sin(a) * Math.cos(pitch) * dist, Math.sin(pitch) * dist, s * Math.cos(a) * Math.cos(pitch) * dist);
    camera.lookAt(0, 0, 0);
  }
  function resize() {
    const w = container.clientWidth || 600, h = container.clientHeight || 600;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%';
    camera.aspect = w / h;
    camera.aspect = w / h; camera.updateProjectionMatrix();
    // grow the distance until the whole board frame is inside the view
    const corners = [[-4.6,0,-4.6],[4.6,0,-4.6],[-4.6,0,4.6],[4.6,0,4.6],[-4.6,0.9,-4.6],[4.6,0.9,-4.6],[-4.6,0.9,4.6],[4.6,0.9,4.6]].map(a => new THREE.Vector3(...a));
    for (dist = 8; dist < 60; dist += 0.25) {
      placeCamera(); camera.updateMatrixWorld(); let ok = true;
      for (const v of corners) { const q = v.clone().project(camera); if (Math.abs(q.x) > 0.96 || Math.abs(q.y) > 0.96) { ok = false; break; } }
      if (ok) break;
    }
    camera.updateProjectionMatrix(); placeCamera();
  }
  new ResizeObserver(resize).observe(container); resize();

  // picking vs drag-to-orbit
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  let down = null;
  const el = renderer.domElement; el.style.touchAction = 'none';
  el.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, yaw, pitch, moved: false }; el.setPointerCapture(e.pointerId); });
  el.addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - down.x, dy = e.clientY - down.y;
    if (Math.abs(dx) + Math.abs(dy) > 8) down.moved = true;
    if (down.moved) { yaw = Math.max(-1.2, Math.min(1.2, down.yaw - dx * 0.006)); pitch = Math.max(0.35, Math.min(1.45, down.pitch + dy * 0.004)); placeCamera(); }
  });
  el.addEventListener('pointerup', e => {
    const d = down; down = null;
    if (!d || d.moved) return;
    const rect = el.getBoundingClientRect();
    ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(squares)[0];
    if (hit) onSquare(hit.object.userData.c, hit.object.userData.r);
  });

  function setPieces(list, makeMesh) {
    pieceGroup.clear();
    for (const p of list) {
      const m = makeMesh(p);
      m.position.set(p.c - 3.5, 0.02, 3.5 - p.r);
      pieceGroup.add(m);
    }
  }
  function setMarks({ selected, targets = [], last = [] }) {
    markGroup.clear();
    const add = (c, r, color, big) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(big ? 0.46 : 0.18, big ? 0.46 : 0.18, 0.04, 28), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: big ? 0.55 : 0.85 }));
      m.position.set(c - 3.5, 0.05, 3.5 - r); markGroup.add(m);
    };
    for (const [c, r] of last) add(c, r, 0xf6e05e, true);
    if (selected) add(selected[0], selected[1], 0x4fd1c5, true);
    for (const [c, r] of targets) add(c, r, 0x68d391, false);
  }
  function setSide(s) { side = s; yaw = 0; placeCamera(); }
  function render() { renderer.render(scene, camera); }
  function project(c, r) { const v = new THREE.Vector3(c - 3.5, 0.1, 3.5 - r).project(camera); const b = el.getBoundingClientRect(); return [b.left + (v.x + 1) / 2 * b.width, b.top + (1 - v.y) / 2 * b.height]; }
  window.__project = project;
  const fx = createFx(scene); const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => { fx.update(clock.getDelta()); render(); });
  return { THREE, fx, project, setPieces, setMarks, setSide, canvas: el, renderer };
}
