import * as THREE from '../lib/three.module.js';
import * as R from '../js/connect4-rules.js';
import { createFx } from '../js/fx.js';
import { prefs } from '../js/prefs.js';
import { sound, addMuteButton } from '../js/sound.js';
import { addLiteButton } from '../js/prefs.js';
addMuteButton();
addLiteButton();
const view = document.getElementById('view'), status = document.getElementById('status'), mode = document.getElementById('mode');
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true }); view.appendChild(renderer.domElement);
const pr = () => prefs.lite ? 1 : Math.min(devicePixelRatio, 2); renderer.setPixelRatio(pr()); prefs.onChange(() => { renderer.setPixelRatio(pr()); fit(); }); renderer.domElement.style.touchAction = 'manipulation';
const scene = new THREE.Scene();
scene.background=new THREE.Color(0x304d5c);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
scene.add(new THREE.HemisphereLight(0xcfe5f5, 0x233543, .8));
const iceSun = new THREE.DirectionalLight(0xfff4df, 3.5); iceSun.position.set(-6, 8, 8); iceSun.castShadow=true;iceSun.shadow.mapSize.set(1024,1024);scene.add(iceSun);
const fireSun = new THREE.DirectionalLight(0xc0e9ff, 1.8); fireSun.position.set(6, 5, 8); scene.add(fireSun);
// Rounded tabletop rack with true cut-through holes and shaped supports.
const blue = new THREE.MeshStandardMaterial({ color: 0x32859a, roughness: 0.25, metalness: 0.05 });
function roundedShape(w,h,r,cy=0){const x=w/2,y=h/2,q=new THREE.Shape();q.moveTo(-x+r,-y);q.lineTo(x-r,-y);q.quadraticCurveTo(x,-y,x,-y+r);q.lineTo(x,y-r);q.quadraticCurveTo(x,y,x-r,y);q.lineTo(-x+r,y);q.quadraticCurveTo(-x,y,-x,y-r);q.lineTo(-x,-y+r);q.quadraticCurveTo(-x,-y,-x+r,-y);if(cy){for(const curve of q.curves){for(const key of ['v0','v1','v2','v3'])if(curve[key])curve[key].y+=cy;}}return q;}
const plate=roundedShape(7.3,6.2,.24,2.5);
for(let c=0;c<7;c++)for(let r=0;r<6;r++){const h=new THREE.Path();h.absarc(c-3,r,.40,0,Math.PI*2,true);plate.holes.push(h);}
const back=new THREE.Mesh(new THREE.ExtrudeGeometry(plate,{depth:.22,bevelEnabled:true,bevelThickness:.035,bevelSize:.035,bevelSegments:2,steps:1,curveSegments:28}),blue);back.position.z=-.20;back.castShadow=true;back.receiveShadow=true;scene.add(back);
const ringGeo = new THREE.TorusGeometry(0.4, 0.12, 12, 28);
for (let c = 0; c < 7; c++) for (let r = 0; r < 6; r++) { const m = new THREE.Mesh(ringGeo, blue); m.position.set(c - 3, r - 0.0, 0.1); m.castShadow=true;m.receiveShadow=true;scene.add(m); }
const metal=new THREE.MeshStandardMaterial({color:0xd6b46f,metalness:.65,roughness:.25});
for (const x of [-3.72,3.72]){
 const support=new THREE.Mesh(new THREE.CapsuleGeometry(.19,6.0,6,16),blue);support.position.set(x,2.5,-.02);support.castShadow=support.receiveShadow=true;scene.add(support);
 const footGeo=new THREE.ExtrudeGeometry(roundedShape(.8,2.2,.25),{depth:.19,bevelEnabled:true,bevelSize:.09,bevelThickness:.08,bevelSegments:4,steps:1});footGeo.rotateX(-Math.PI/2);const foot=new THREE.Mesh(footGeo,blue);foot.position.set(x,-.81,0);foot.castShadow=foot.receiveShadow=true;scene.add(foot);
 for(const y of [-.35,5.35]){const bolt=new THREE.Mesh(new THREE.CylinderGeometry(.085,.085,.045,24),metal);bolt.rotation.x=Math.PI/2;bolt.position.set(x,y,.2);bolt.castShadow=true;scene.add(bolt);const slit=new THREE.Mesh(new THREE.BoxGeometry(.08,.014,.012),new THREE.MeshStandardMaterial({color:0x36505a,roughness:.5}));slit.position.set(x,y,.23);scene.add(slit);}
}
const lavaMat = new THREE.MeshStandardMaterial({ color:0xf5d797,roughness:.4 });
const base = new THREE.Mesh(new THREE.ExtrudeGeometry(roundedShape(8,.38,.16),{depth:.95,bevelEnabled:true,bevelSize:.07,bevelThickness:.07,bevelSegments:4,steps:1}), lavaMat); base.position.set(0,-.91,-.48);base.castShadow=base.receiveShadow=true;scene.add(base);
// discs: player 1 = ice (frost-blue with a six-point star), player 2 = fire (dark ember with a flame ring). The face mark keeps them apart without relying on colour.
const face = (draw) => { const c = document.createElement('canvas'); c.width = c.height = 128; draw(c.getContext('2d')); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
const iceFace = face(g => { g.fillStyle = '#ecfff9'; g.fillRect(0, 0, 128, 128); g.strokeStyle = '#21869b'; g.lineWidth = 7; g.lineCap = 'round'; for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; g.beginPath(); g.moveTo(64 + Math.cos(a) * 44, 64 + Math.sin(a) * 44); g.lineTo(64 - Math.cos(a) * 44, 64 - Math.sin(a) * 44); g.stroke(); } g.strokeStyle = '#ffffff'; g.lineWidth = 3; g.strokeRect(0, 0, 128, 128); });
const fireFace = face(g => { g.fillStyle = '#ea7455'; g.fillRect(0, 0, 128, 128); g.strokeStyle = '#ffe294'; g.lineWidth = 9; g.beginPath(); g.arc(64, 64, 40, 0, 6.283); g.stroke(); g.fillStyle = '#fff0af'; g.beginPath(); g.moveTo(64, 34); g.quadraticCurveTo(88, 62, 64, 94); g.quadraticCurveTo(40, 62, 64, 34); g.fill(); });
fireFace.center.set(0.5, 0.5); fireFace.rotation = Math.PI / 2;
const sideIce = new THREE.MeshStandardMaterial({ color: 0xd5f8ee, roughness: 0.2 });
const sideFire = new THREE.MeshStandardMaterial({ color: 0xe96849, roughness: 0.3 });
const mat = {
  1: [sideIce, new THREE.MeshStandardMaterial({ map: iceFace, roughness: 0.25, emissive: 0x000000 }), new THREE.MeshStandardMaterial({ map: iceFace, roughness: 0.25 })],
  2: [sideFire, new THREE.MeshStandardMaterial({ map: fireFace, roughness: 0.35, emissive: 0x000000 }), new THREE.MeshStandardMaterial({ map: fireFace, roughness: 0.5 })],
};
const discs = new THREE.Group(); scene.add(discs);
const colHit = []; // invisible column pickers
for (let c = 0; c < 7; c++) { const m = new THREE.Mesh(new THREE.BoxGeometry(1, 6.4, 1.2), new THREE.MeshBasicMaterial({ visible: false })); m.position.set(c - 3, 2.5, 0.2); m.userData.c = c; scene.add(m); colHit.push(m); }
function fit() {
  const w = view.clientWidth || 600, h = view.clientHeight || 600; renderer.setSize(w, h, false);
  renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%';
  camera.aspect = w / h; camera.updateProjectionMatrix();
  const pts = [[-3.9, -1.2, 0.8], [3.9, -1.2, 0.8], [-3.9, 5.8, 0.8], [3.9, 5.8, 0.8]].map(a => new THREE.Vector3(...a));
  for (let d = 8; d < 60; d += 0.25) { camera.position.set(.6, 3.8, d); camera.lookAt(0, 2.4, 0); camera.updateMatrixWorld();
    if (pts.every(v => { const q = v.clone().project(camera); return Math.abs(q.x) < 0.95 && Math.abs(q.y) < 0.95; })) break; }
}
new ResizeObserver(fit).observe(view); fit(); const fx = createFx(scene); fx.setAmbient(false); const clock = new THREE.Clock(); window.__fx = fx;
renderer.setAnimationLoop(() => { fx.update(clock.getDelta()); renderer.render(scene, camera); });
let board = R.empty(), turn = 1, over = false, busy = false, aiTimer = null; window.__c4 = () => ({ board, turn, over });
function show() {
  discs.clear();
  for (let c = 0; c < 7; c++) for (let r = 0; r < 6; r++) if (board[c][r]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.25, 32), mat[board[c][r]]); m.rotation.x = Math.PI / 2; m.position.set(c - 3, r, 0); discs.add(m); }
  const w = R.winLine(board);
  if (w) { over = true; for (const [c, r] of w.cells) { const m = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.05, 8, 24), new THREE.MeshBasicMaterial({ color: 0xffffff })); m.position.set(c - 3, r, 0.2); discs.add(m); } }
  else if (R.isFull(board)) over = true;
  const name = p => p === 1 ? 'Ivory' : 'Coral';
  status.textContent = w ? name(w.player) + ' wins.' : over ? 'Draw - the board is full.' : name(turn) + ' to move';
  document.body.dataset.turn = String(turn); document.body.dataset.over = String(over);
  columnButtons.forEach((b,c) => { b.disabled = over || busy || (mode.value === 'ai' && turn === 2) || !R.canDrop(board,c); });
}
function play(c) {
  const n = R.drop(board, c, turn); if (!n) return false;
  board = n.board; const mover = turn; turn = turn === 1 ? 2 : 1; show(); sound.thud();
  const w = R.winLine(board); if (w) { sound.win(); for (const [wc, wr] of w.cells) fx.burst(wc - 3, wr, 0.4, mover === 1 ? 'ice' : 'fire', 25); }
  return true;
}
const columnButtons = Array.from({length:7},(_,c) => {
  const b = document.createElement('button'); b.textContent = '↓ ' + (c+1);
  b.setAttribute('aria-label','Drop in column ' + (c+1)); b.onclick = () => choose(c);
  document.getElementById('columns').appendChild(b); return b;
});
function scheduleAI(){
 clearTimeout(aiTimer);aiTimer=null;busy=false;
 if(mode.value==='ai' && turn===2 && !over){busy=true;aiTimer=setTimeout(()=>{aiTimer=null;busy=false;if(mode.value!=='ai'||turn!==2||over){show();return;}const c=R.bestColumn(board,2,5);if(c!==null)play(c);},300);}show();
}
function choose(c){if(over||busy||(mode.value==='ai'&&turn===2))return;if(play(c))scheduleAI();}
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
renderer.domElement.addEventListener('pointerup', e => {
  const b = renderer.domElement.getBoundingClientRect(); ndc.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
  ray.setFromCamera(ndc, camera); const hit = ray.intersectObjects(colHit)[0]; if (hit) choose(hit.object.userData.c);
});
window.__c4col = c => { const v = new THREE.Vector3(c - 3, 2.5, 0.2).project(camera); const b = renderer.domElement.getBoundingClientRect(); return [b.left + (v.x + 1) / 2 * b.width, b.top + (1 - v.y) / 2 * b.height]; };
function reset() { fx.clear(); clearTimeout(aiTimer); aiTimer = null; board = R.empty(); turn = 1; over = false; busy = false; show(); }
document.getElementById('new').onclick = reset; mode.onchange = scheduleAI;
show();
