import * as THREE from '../lib/three.module.js';
import { RoomEnvironment } from '../lib/RoomEnvironment.js';
import { createFx } from './fx.js';
import { prefs } from './prefs.js';
import { glowTexture } from './theme.js';

// Sculpted tabletop arena. Square (c, r): file 0..7, rank 0..7.
export function createBoard(container, { onSquare }) {
  const small = innerWidth < 700;
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  const pr = () => prefs.lite ? 1 : Math.min(devicePixelRatio, small ? 1.75 : 2); renderer.setPixelRatio(pr()); prefs.onChange(() => { renderer.setPixelRatio(pr()); resize(); });
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x243f52); scene.fog = new THREE.Fog(0x243f52,25,65);
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.22;
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 150);
  scene.add(new THREE.HemisphereLight(0xbcd8ef,0x142436,.45));
  const sun = new THREE.DirectionalLight(0xffe2b4,3.8); sun.position.set(-3,7,3);sun.castShadow=true;sun.shadow.bias=-.0004;sun.shadow.normalBias=.025;sun.shadow.radius=4;
  sun.shadow.mapSize.set(small?1024:2048,small?1024:2048);Object.assign(sun.shadow.camera,{left:-9,right:9,top:9,bottom:-9});scene.add(sun);
  const rimLight=new THREE.DirectionalLight(0xb1e5ff,1.6);rimLight.position.set(7,6,-7);scene.add(rimLight);
  // Rounded silhouettes and real bevels catch the key light, rather than painted edge lines.
  function roundedSlab(w,h,d,corner=.09,bevel=.025){
    const x=w/2-bevel,z=d/2-bevel,r=Math.min(corner,x,z),shape=new THREE.Shape();
    shape.moveTo(-x+r,-z);shape.lineTo(x-r,-z);shape.quadraticCurveTo(x,-z,x,-z+r);
    shape.lineTo(x,z-r);shape.quadraticCurveTo(x,z,x-r,z);shape.lineTo(-x+r,z);
    shape.quadraticCurveTo(-x,z,-x,z-r);shape.lineTo(-x,-z+r);shape.quadraticCurveTo(-x,-z,-x+r,-z);
    const g=new THREE.ExtrudeGeometry(shape,{depth:Math.max(.01,h-2*bevel),bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:bevel,bevelThickness:bevel,curveSegments:8});
    g.rotateX(-Math.PI/2);g.translate(0,-h/2+bevel,0);return g;
  }
  function block(w,h,d,color,x,y,z,rough=.4){const m=new THREE.Mesh(roundedSlab(w,h,d,.14,Math.min(.045,h/4)),new THREE.MeshStandardMaterial({color,roughness:rough}));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;}
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshStandardMaterial({color:0x243f52,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.y=-1.0;floor.receiveShadow=true;scene.add(floor);
  // A woven felt play mat separates the collectible board from the studio floor.
  const feltCanvas=document.createElement('canvas');feltCanvas.width=feltCanvas.height=256;const fg=feltCanvas.getContext('2d');fg.fillStyle='#858585';fg.fillRect(0,0,256,256);
  let seed=19;for(let i=0;i<18000;i++){seed=(seed*1664525+1013904223)>>>0;const x=seed%256;seed=(seed*1664525+1013904223)>>>0;const y=seed%256;fg.fillStyle=i%2?'#929292':'#747474';fg.fillRect(x,y,2,1);}
  const feltTexture=new THREE.CanvasTexture(feltCanvas);feltTexture.wrapS=feltTexture.wrapT=THREE.RepeatWrapping;feltTexture.repeat.set(5,5);
  const mat=new THREE.Mesh(roundedSlab(10.65,.055,10.65,.50,.012),new THREE.MeshStandardMaterial({color:0x173b46,roughness:.98,bumpMap:feltTexture,bumpScale:.018}));mat.position.y=-.963;mat.receiveShadow=true;mat.castShadow=true;scene.add(mat);
  // Fine physical stitched border, kept outside the board coordinates.
  const thread=new THREE.MeshStandardMaterial({color:0x799da0,roughness:.9});const stitchGeo=new THREE.CapsuleGeometry(.009,.055,3,6);stitchGeo.rotateZ(Math.PI/2);
  const stitchInstances=new THREE.InstancedMesh(stitchGeo,thread,192);const transform=new THREE.Object3D();let stitch=0;
  for(let side=0;side<4;side++)for(let i=0;i<48;i++){const along=-4.85+i*9.7/47;transform.position.set(side<2?along:(side===2?-5.13:5.13),-.928,side<2?(side===0?-5.13:5.13):along);transform.rotation.y=side<2?0:Math.PI/2;transform.updateMatrix();stitchInstances.setMatrixAt(stitch++,transform.matrix);}scene.add(stitchInstances);
  // Layered collectible-tabletop arena, not noisy texture maps.
  block(9.5,.26,9.5,0x173b55,0,-.44,0);block(9.3,.18,9.3,0x51b8bb,0,-.65,0);block(8.8,.25,8.8,0x245574,0,-.85,0);
  block(8.9,.14,8.9,0xd2b77d,0,-.24,0);
  // Inlaid brass perimeter and sculpted corner shoes replace floating corner beads.
  const brass=new THREE.MeshStandardMaterial({color:0xd9ae59,metalness:.72,roughness:.29});
  function detail(geo,mat,x,y,z){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;}
  for(const side of [-1,1]){
    detail(roundedSlab(8.66,.035,.045,.02,.008),brass,0,-.155,side*4.39);
    detail(roundedSlab(.045,.035,8.66,.02,.008),brass,side*4.39,-.155,0);
    // A dark inset between the gold deck and lower lacquered plinth.
    detail(roundedSlab(9.18,.045,.055,.02,.01),brass,0,-.535,side*4.64);
    detail(roundedSlab(.055,.045,9.18,.02,.01),brass,side*4.64,-.535,0);
  }
  const slotMat=new THREE.MeshStandardMaterial({color:0x39505a,metalness:.4,roughness:.5});
  for(const x of [-4.45,4.45])for(const z of [-4.45,4.45]){
    detail(roundedSlab(.44,.105,.44,.14,.025),brass,x,-.20,z);
    const screw=detail(new THREE.CylinderGeometry(.065,.065,.026,24),brass,x,-.13,z);
    const slot=detail(roundedSlab(.078,.008,.014,.006,.002),slotMat,x,-.114,z);slot.rotation.y=Math.PI/4;
  }
  const tileMat=[new THREE.MeshPhysicalMaterial({color:0x8ea9a3,roughness:.36,clearcoat:.65,clearcoatRoughness:.24}),new THREE.MeshPhysicalMaterial({color:0x234a60,roughness:.32,clearcoat:.65,clearcoatRoughness:.24})];
  // Fine kiln glaze: broad roughness variation and tiny ceramic pores, without painted noise.
  const glazeCanvas=document.createElement('canvas');glazeCanvas.width=glazeCanvas.height=256;const glaze=glazeCanvas.getContext('2d'),image=glaze.createImageData(256,256);let glazeSeed=57;
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){glazeSeed=(glazeSeed*1664525+1013904223)>>>0;const pore=(glazeSeed>>>24)/255;const cloud=Math.sin(x*.045+Math.sin(y*.03))*Math.cos(y*.052);const v=Math.round(170+cloud*24+(pore-.5)*14),i=(y*256+x)*4;image.data[i]=image.data[i+1]=image.data[i+2]=v;image.data[i+3]=255;}glaze.putImageData(image,0,0);
  const glazeMap=new THREE.CanvasTexture(glazeCanvas);glazeMap.wrapS=glazeMap.wrapT=THREE.RepeatWrapping;for(const material of tileMat){material.roughnessMap=glazeMap;material.bumpMap=glazeMap;material.bumpScale=.014;material.roughness=.62;material.clearcoat=.45;material.clearcoatRoughness=.38;}
  const tileEdge=[new THREE.MeshStandardMaterial({color:0x5e807f,roughness:.42}),new THREE.MeshStandardMaterial({color:0x153546,roughness:.4})];
  const squares=[],sqGeo=roundedSlab(.96,.18,.96,.07,.04);
  for(let c=0;c<8;c++)for(let r=0;r<8;r++){const m=new THREE.Mesh(sqGeo,[tileMat[(c+r)%2],tileEdge[(c+r)%2]]);m.position.set(c-3.5,-.025,3.5-r);m.receiveShadow=true;m.userData={c,r};scene.add(m);squares.push(m);}
  function label(text,x,z){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');g.fillStyle='#294e62';g.font='bold 42px sans-serif';g.textAlign='center';g.fillText(text,32,46);const m=new THREE.Mesh(new THREE.PlaneGeometry(.25,.25),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false}));m.rotation.x=-Math.PI/2;m.position.set(x,-.15,z);scene.add(m);}
  for(let i=0;i<8;i++){label('abcdefgh'[i],i-3.5,4.22);label(String(i+1),-4.22,3.5-i);}
  const pieceGroup = new THREE.Group(); scene.add(pieceGroup);
  const markGroup = new THREE.Group(); scene.add(markGroup);
  const haloTex = { ice: glowTexture('rgba(110,200,255,0.9)'), fire: glowTexture('rgba(255,110,40,0.9)') };

  let yaw = 0.22, pitch = 0.95, dist = 13;
  function placeCamera() { camera.position.set(Math.sin(yaw) * Math.cos(pitch) * dist, Math.sin(pitch) * dist, Math.cos(yaw) * Math.cos(pitch) * dist); camera.lookAt(0, 0.2, 0); }
  function resize() {
    const w = container.clientWidth || 600, h = container.clientHeight || 600;
    renderer.setSize(w, h, false); renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%';
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const corners = [[-5.35, -.95, -5.35], [5.35, -.95, -5.35], [-5.35, -.95, 5.35], [5.35, -.95, 5.35], [-4.8, 1.2, -4.8], [4.8, 1.2, -4.8]].map(a => new THREE.Vector3(...a));
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

  const contactCanvas=document.createElement('canvas');contactCanvas.width=contactCanvas.height=64;const cg=contactCanvas.getContext('2d');const grad=cg.createRadialGradient(32,32,6,32,32,32);grad.addColorStop(0,'rgba(9,30,42,.55)');grad.addColorStop(.5,'rgba(9,30,42,.25)');grad.addColorStop(1,'rgba(9,30,42,0)');cg.fillStyle=grad;cg.fillRect(0,0,64,64);const contactMap=new THREE.CanvasTexture(contactCanvas);
  const meshAt = new Map(), tweens = []; let selKey = null;
  function setPieces(list, makeMesh) {
    pieceGroup.clear(); meshAt.clear();
    for (const p of list) {
      const m = makeMesh(p); m.position.set(p.c - 3.5, 0.03, 3.5 - p.r); pieceGroup.add(m); meshAt.set(p.c + ',' + p.r, m);
      const contact=new THREE.Mesh(new THREE.PlaneGeometry(.96,.96),new THREE.MeshBasicMaterial({map:contactMap,transparent:true,depthWrite:false}));contact.name='contact';contact.rotation.x=-Math.PI/2;contact.position.set(0,.025,0);m.add(contact);
      const halo = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), new THREE.MeshBasicMaterial({ map: haloTex[p.side === 'fire' ? 'fire' : 'ice'], transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0.08 }));
      halo.rotation.x = -Math.PI / 2; halo.position.set(0, 0.06, 0); halo.name = 'halo'; m.add(halo);
    }
  }
  // Knights leap over pieces; other chess pieces glide while checkers keep their hop.
  function animateMove(fc, fr, tc, tr, dur = 0.32) {
    const m = meshAt.get(tc + ',' + tr); if (!m) return;
    const leap=m.userData.pieceType==='n',span=Math.hypot(tc-fc,tr-fr);
    tweens.push({ m, leap, span, baseRotation:m.rotation.z, x0: fc - 3.5, z0: 3.5 - fr, x1: tc - 3.5, z1: 3.5 - tr, t: 0, dur:leap?.58:Math.max(.32,Math.min(.5,span*.11)) }); m.position.set(fc - 3.5, 0.03, 3.5 - fr);
  }
  const ghosts = [];
  // call BEFORE the redraw: the captured piece shrinks, spins and rises away instead of vanishing
  function captureAt(c, r) {
    const m = meshAt.get(c + ',' + r); if (!m) return;
    const g = m.clone(); g.position.copy(m.position); scene.add(g); ghosts.push({ g, t: 0, dur: prefs.lite ? 0.25 : 0.5, y0: g.position.y });
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
  function resetView() { yaw=.22;pitch=.95;resize(); }
  function setSide() { resetView(); }
  function resetAnimation() { for(const w of ghosts)scene.remove(w.g);ghosts.length=0;tweens.length=0;fx.clear(); }
  const fx = createFx(scene); fx.setAmbient(false); const clock = new THREE.Clock();
  function project(c, r) { const v = new THREE.Vector3(c - 3.5, 0.1, 3.5 - r).project(camera); const b = el.getBoundingClientRect(); return [b.left + (v.x + 1) / 2 * b.width, b.top + (1 - v.y) / 2 * b.height]; }
  window.__project = project;
  window.__boardVisual=()=>({active:tweens.length,pieces:[...meshAt].map(([square,m])=>({square,type:m.userData.pieceType,y:m.position.y,z:m.position.z,x:m.position.x,tilt:m.rotation.z}))});
  function loop() {
    const dt = clock.getDelta(), t = clock.elapsedTime; fx.update(dt);
    for (let i = tweens.length - 1; i >= 0; i--) { const w = tweens[i]; w.t += dt; const k = Math.min(1, w.t / w.dur), e = k * k * (3 - 2 * k);
      const lift=Math.sin(k*Math.PI)*(w.leap?1.45:(w.m.userData.pieceType ? .065 : .55));
      w.m.position.set(w.x0 + (w.x1 - w.x0) * e, 0.03 + lift, w.z0 + (w.z1 - w.z0) * e);
      if(w.leap)w.m.rotation.z=w.baseRotation+Math.sin(k*Math.PI*2)*.13;
      const contact=w.m.getObjectByName('contact');if(contact){contact.position.y=.025-lift;contact.material.opacity=1-lift*.45;contact.scale.setScalar(1+lift*.2);}
      if (k >= 1) { w.m.position.y = 0.03;w.m.rotation.z=w.baseRotation;if(contact){contact.position.y=.025;contact.material.opacity=1;contact.scale.setScalar(1);} tweens.splice(i, 1); } }
    for (let i = ghosts.length - 1; i >= 0; i--) { const w = ghosts[i]; w.t += dt; const k = Math.min(1, w.t / w.dur);
      w.g.scale.setScalar(Math.max(0.001, 1 - k * k)); w.g.rotation.y += dt * 9; w.g.position.y = w.y0 + k * 0.9; if (k >= 1) { scene.remove(w.g); ghosts.splice(i, 1); } }
    const sm = selKey && meshAt.get(selKey); if (sm && !tweens.some(w => w.m === sm)) sm.position.y = 0.03 + 0.1 + Math.sin(t * 4) * 0.05;
    renderer.render(scene, camera);
  }
  renderer.setAnimationLoop(loop);
  return { THREE, fx, resetView, resetAnimation, project, setPieces, setMarks, setSide, animateMove, captureAt, canvas: el, renderer };
}
