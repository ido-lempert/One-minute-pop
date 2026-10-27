import * as THREE from '../lib/three.module.js';

// Shared 3D 8x8 board. Square (c, r): c = file 0..7 (a..h), r = rank 0..7 (1..8).
export function createBoard(container, { onSquare, lightColor = 0xe8d9b5, darkColor = 0x7a5230 }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1b2230);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x334455, 0.9));
  const sun = new THREE.DirectionalLight(0xffffff, 1.1);
  sun.position.set(5, 10, 6); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7 });
  scene.add(sun);

  const frame = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.4, 9.2), new THREE.MeshStandardMaterial({ color: 0x3b2a1a }));
  frame.position.y = -0.25; frame.receiveShadow = true; scene.add(frame);
  const squares = [];
  const sqGeo = new THREE.BoxGeometry(1, 0.1, 1);
  for (let c = 0; c < 8; c++) for (let r = 0; r < 8; r++) {
    const m = new THREE.Mesh(sqGeo, new THREE.MeshStandardMaterial({ color: (c + r) % 2 ? lightColor : darkColor }));
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
  renderer.setAnimationLoop(render);
  function project(c, r) { const v = new THREE.Vector3(c - 3.5, 0.1, 3.5 - r).project(camera); const b = el.getBoundingClientRect(); return [b.left + (v.x + 1) / 2 * b.width, b.top + (1 - v.y) / 2 * b.height]; }
  window.__project = project;
  return { THREE, project, setPieces, setMarks, setSide, canvas: el, renderer };
}
