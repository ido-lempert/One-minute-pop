import * as THREE from '../lib/three.module.js';
import { RoomEnvironment } from '../lib/RoomEnvironment.js';
import { createFx } from './fx.js';
import { iceTexture, lavaTextures, frameTexture, skyTexture, glowTexture } from './theme.js';

// Shared 3D 8x8 board in a fire-vs-ice fantasy setting. Square (c, r): c = file 0..7, r = rank 0..7.
// Dark side (rank 8, far) is fire; light side (rank 1, near) is ice.
export function createBoard(container, { onSquare }) {
  const small = innerWidth < 700;
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.75 : 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const sky = new THREE.Mesh(new THREE.SphereGeometry(60, 24, 16), new THREE.MeshBasicMaterial({ map: skyTexture(), side: THREE.BackSide, fog: false }));
  scene.add(sky);
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.5;
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 150);
  scene.add(new THREE.HemisphereLight(0xaad4ff, 0x552211, 0.35));
  const sun = new THREE.DirectionalLight(0xfff0e0, 1.2); sun.position.set(4, 10, 6); sun.castShadow = true;
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 3;
  sun.shadow.mapSize.set(small ? 1024 : 2048, small ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7 }); scene.add(sun);
  const fireLight = new THREE.PointLight(0xff5a1a, 14, 16, 1.6); fireLight.position.set(0, 2.5, -6); scene.add(fireLight);
  const iceLight = new THREE.PointLight(0x4fb8ff, 14, 16, 1.6); iceLight.position.set(0, 2.5, 6); scene.add(iceLight);

  // frame, island, floating debris
  const frame = new THREE.Mesh(new THREE.BoxGeometry(9.5, 0.55, 9.5), new THREE.MeshPhysicalMaterial({ map: frameTexture(), roughness: 0.4, metalness: 0.2, clearcoat: 0.5, emissiveMap: frameTexture(), emissive: 0xffffff, emissiveIntensity: 0.25 }));
  frame.position.y = -0.33; frame.receiveShadow = true; frame.castShadow = true; scene.add(frame);
  const [lavaMap, lavaGlow] = lavaTextures(3), [lavaMap2, lavaGlow2] = lavaTextures(8);
  const island = new THREE.Mesh(new THREE.CylinderGeometry(5.6, 1.2, 4, 9, 1), new THREE.MeshStandardMaterial({ map: lavaMap, emissiveMap: lavaGlow, emissive: 0xffffff, emissiveIntensity: 0.5, roughness: 0.9, flatShading: true }));
  island.position.y = -2.65; scene.add(island);
  const debris = [];
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x2a2024, emissive: 0xff4a10, emissiveIntensity: 0.25, roughness: 0.8, flatShading: true });
  const crystalMat = new THREE.MeshPhysicalMaterial({ color: 0x9fe4ff, emissive: 0x2a8acc, emissiveIntensity: 0.7, roughness: 0.1, clearcoat: 1, flatShading: true });
  for (let i = 0; i < 9; i++) {
    const ice = i % 2 === 0, a = i * 0.7 + 0.4, d = 7 + (i % 3) * 1.8;
    const m = new THREE.Mesh(ice ? new THREE.OctahedronGeometry(0.5 + (i % 3) * 0.25) : new THREE.IcosahedronGeometry(0.5 + (i % 3) * 0.25, 0), ice ? crystalMat : rockMat);
    m.position.set(Math.cos(a) * d, -1 + (i % 4) * 0.9, Math.sin(a) * d - (ice ? -1 : 1)); m.userData = { spin: 0.2 + (i % 3) * 0.15, y0: m.position.y, ph: i }; scene.add(m); debris.push(m);
  }

  // squares
  const iceMats = [0, 1].map(i => new THREE.MeshPhysicalMaterial({ map: iceTexture(1 + i * 5), roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.1, emissive: 0x2b6a9a, emissiveIntensity: 0.28, metalness: 0.0 }));
  const lavaMats = [[lavaMap, lavaGlow], [lavaMap2, lavaGlow2]].map(([m, e]) => new THREE.MeshPhysicalMaterial({ map: m, emissiveMap: e, emissive: 0xffffff, emissiveIntensity: 0.55, roughness: 0.35, clearcoat: 0.6 }));
  const squares = [], sqGeo = new THREE.BoxGeometry(1, 0.12, 1);
  for (let c = 0; c < 8; c++) for (let r = 0; r < 8; r++) {
    const light = (c + r) % 2 === 1, m = new THREE.Mesh(sqGeo, (light ? iceMats : lavaMats)[(c * 3 + r * 5) % 2]);
    m.position.set(c - 3.5, -0.03, 3.5 - r); m.receiveShadow = true; m.userData = { c, r }; scene.add(m); squares.push(m);
  }
  const pieceGroup = new THREE.Group(); scene.add(pieceGroup);
  const markGroup = new THREE.Group(); scene.add(markGroup);
  const haloTex = { ice: glowTexture('rgba(110,200,255,0.9)'), fire: glowTexture('rgba(255,110,40,0.9)') };

  let yaw = 0, pitch = 0.95, dist = 13;
  function placeCamera() { camera.position.set(Math.sin(yaw) * Math.cos(pitch) * dist, Math.sin(pitch) * dist, Math.cos(yaw) * Math.cos(pitch) * dist); camera.lookAt(0, 0.2, 0); }
  function resize() {
    const w = container.clientWidth || 600, h = container.clientHeight || 600;
    renderer.setSize(w, h, false); renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%';
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const corners = [[-4.8, 0, -4.8], [4.8, 0, -4.8], [-4.8, 0, 4.8], [4.8, 0, 4.8], [-4.8, 1.2, -4.8], [4.8, 1.2, -4.8]].map(a => new THREE.Vector3(...a));
    for (dist = 8; dist < 60; dist += 0.25) {
      placeCamera(); camera.updateMatrixWorld();
      if (corners.every(v => { const q = v.clone().project(camera); return Math.abs(q.x) < 0.96 && Math.abs(q.y) < 0.96; })) break;
    }
  }
  new ResizeObserver(resize).observe(container); resize();

  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let down = null;
  const el = renderer.domElement; el.style.touchAction = 'none';
  el.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY, yaw, pitch, moved: false }; el.setPointerCapture(e.pointerId); });
  el.addEventListener('pointermove', e => {
    if (!down) return; const dx = e.clientX - down.x, dy = e.clientY - down.y;
    if (Math.abs(dx) + Math.abs(dy) > 8) down.moved = true;
    if (down.moved) { yaw = Math.max(-1.2, Math.min(1.2, down.yaw - dx * 0.006)); pitch = Math.max(0.35, Math.min(1.45, down.pitch + dy * 0.004)); placeCamera(); }
  });
  el.addEventListener('pointerup', e => {
    const d = down; down = null; if (!d || d.moved) return;
    const rect = el.getBoundingClientRect(); ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    ray.setFromCamera(ndc, camera); const hit = ray.intersectObjects(squares)[0]; if (hit) onSquare(hit.object.userData.c, hit.object.userData.r);
  });

  const meshAt = new Map(), tweens = []; let selKey = null;
  function setPieces(list, makeMesh) {
    pieceGroup.clear(); meshAt.clear();
    for (const p of list) {
      const m = makeMesh(p); m.position.set(p.c - 3.5, 0.03, 3.5 - p.r); pieceGroup.add(m); meshAt.set(p.c + ',' + p.r, m);
      const halo = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({ map: haloTex[p.side === 'fire' ? 'fire' : 'ice'], transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.3 }));
      halo.rotation.x = -Math.PI / 2; halo.position.set(0, 0.06, 0); halo.name = 'halo'; m.add(halo);
    }
  }
  // slide a piece (already placed at its new square) from the old square with a hop
  function animateMove(fc, fr, tc, tr, dur = 0.32) {
    const m = meshAt.get(tc + ',' + tr); if (!m) return;
    tweens.push({ m, x0: fc - 3.5, z0: 3.5 - fr, x1: tc - 3.5, z1: 3.5 - tr, t: 0, dur }); m.position.set(fc - 3.5, 0.03, 3.5 - fr);
  }
  function setMarks({ selected, targets = [], last = [] }) {
    markGroup.clear(); selKey = selected ? selected[0] + ',' + selected[1] : null;
    const add = (c, r, color, big, op) => {
      const m = new THREE.Mesh(new THREE.CylinderGeometry(big ? 0.47 : 0.2, big ? 0.47 : 0.2, 0.03, 32), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: op }));
      m.position.set(c - 3.5, 0.1, 3.5 - r); markGroup.add(m);
      if (big) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.47, 0.035, 8, 40), new THREE.MeshBasicMaterial({ color })); ring.rotation.x = Math.PI / 2; ring.position.set(c - 3.5, 0.12, 3.5 - r); markGroup.add(ring); }
    };
    for (const [c, r] of last) add(c, r, 0xffe27a, true, 0.28);
    for (const [c, r] of targets) add(c, r, 0x7dff6a, false, 0.95);
    if (selected) add(selected[0], selected[1], 0xffd23d, true, 0.45);
  }
  function setSide() { yaw = 0; placeCamera(); }
  const fx = createFx(scene); const clock = new THREE.Clock();
  function project(c, r) { const v = new THREE.Vector3(c - 3.5, 0.1, 3.5 - r).project(camera); const b = el.getBoundingClientRect(); return [b.left + (v.x + 1) / 2 * b.width, b.top + (1 - v.y) / 2 * b.height]; }
  window.__project = project;
  function loop() {
    const dt = clock.getDelta(), t = clock.elapsedTime; fx.update(dt);
    for (const m of lavaMats) m.emissiveIntensity = 0.5 + Math.sin(t * 2.1) * 0.08 + Math.sin(t * 5.3) * 0.04;
    fireLight.intensity = 13 + Math.sin(t * 7) * 1.5; for (const d of debris) { d.rotation.y += d.userData.spin * dt; d.rotation.x += d.userData.spin * 0.5 * dt; d.position.y = d.userData.y0 + Math.sin(t * 0.8 + d.userData.ph) * 0.2; }
    for (let i = tweens.length - 1; i >= 0; i--) { const w = tweens[i]; w.t += dt; const k = Math.min(1, w.t / w.dur), e = k * k * (3 - 2 * k);
      w.m.position.set(w.x0 + (w.x1 - w.x0) * e, 0.03 + Math.sin(k * Math.PI) * 0.55, w.z0 + (w.z1 - w.z0) * e); if (k >= 1) { w.m.position.y = 0.03; tweens.splice(i, 1); } }
    const sm = selKey && meshAt.get(selKey); if (sm && !tweens.some(w => w.m === sm)) sm.position.y = 0.03 + 0.1 + Math.sin(t * 4) * 0.05;
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(loop);
  return { THREE, fx, project, setPieces, setMarks, setSide, animateMove, canvas: el, renderer };
}
