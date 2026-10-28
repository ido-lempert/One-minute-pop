import * as THREE from '../lib/three.module.js';
import { RoomEnvironment } from '../lib/RoomEnvironment.js';
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
scene.background=new THREE.Color(0x304d5c);scene.fog=new THREE.Fog(0x304d5c,17,45);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;
// Soft studio reflection cards give glazed ceramic and metal a real environment.
const pmrem=new THREE.PMREMGenerator(renderer),studio=new RoomEnvironment();
const reflection=pmrem.fromScene(studio,.06);scene.environment=reflection.texture;scene.environmentIntensity=.18;studio.dispose();pmrem.dispose();
const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
scene.add(new THREE.HemisphereLight(0xcfe5f5, 0x233543, .8));
const iceSun = new THREE.DirectionalLight(0xfff4df, 3.5); iceSun.position.set(-6, 8, 8); iceSun.castShadow=true;iceSun.shadow.mapSize.set(1024,1024);Object.assign(iceSun.shadow.camera,{left:-8,right:8,top:8,bottom:-8,near:.5,far:30});iceSun.shadow.normalBias=.025;iceSun.shadow.bias=-.00015;iceSun.shadow.radius=3;scene.add(iceSun);
// A physical matte tabletop receives the rack and token shadows, grounding the toy.
const table=new THREE.Mesh(new THREE.PlaneGeometry(2000,2000),new THREE.MeshStandardMaterial({color:0x304d5c,roughness:.93}));table.rotation.x=-Math.PI/2;table.position.y=-1.19;table.receiveShadow=true;scene.add(table);
const fireSun = new THREE.DirectionalLight(0xc0e9ff, 1.8); fireSun.position.set(6, 5, 8); scene.add(fireSun);
// Rounded tabletop rack with true cut-through holes and shaped supports.
const blue = new THREE.MeshStandardMaterial({ color: 0x32859a, roughness: 0.25, metalness: 0.05 });
function roundedShape(w,h,r,cy=0){const x=w/2,y=h/2,q=new THREE.Shape();q.moveTo(-x+r,-y);q.lineTo(x-r,-y);q.quadraticCurveTo(x,-y,x,-y+r);q.lineTo(x,y-r);q.quadraticCurveTo(x,y,x-r,y);q.lineTo(-x+r,y);q.quadraticCurveTo(-x,y,-x,y-r);q.lineTo(-x,-y+r);q.quadraticCurveTo(-x,-y,-x+r,-y);if(cy){for(const curve of q.curves){for(const key of ['v0','v1','v2','v3'])if(curve[key])curve[key].y+=cy;}}return q;}
// A woven felt runner cushions the ceramic rack and catches its contact shadows.
const feltCanvas=document.createElement('canvas');feltCanvas.width=feltCanvas.height=128;const fg=feltCanvas.getContext('2d');fg.fillStyle='#858585';fg.fillRect(0,0,128,128);let feltSeed=27;for(let i=0;i<4500;i++){feltSeed=(feltSeed*1664525+1013904223)>>>0;const x=feltSeed%128;feltSeed=(feltSeed*1664525+1013904223)>>>0;fg.fillStyle=i%2?'#929292':'#747474';fg.fillRect(x,feltSeed%128,2,1);}const feltMap=new THREE.CanvasTexture(feltCanvas);feltMap.wrapS=feltMap.wrapT=THREE.RepeatWrapping;feltMap.repeat.set(6,2);
const runnerGeo=new THREE.ExtrudeGeometry(roundedShape(9.05,3.2,.38),{depth:.035,bevelEnabled:true,bevelSize:.022,bevelThickness:.012,bevelSegments:3,steps:1,curveSegments:20});runnerGeo.rotateX(-Math.PI/2);const runner=new THREE.Mesh(runnerGeo,new THREE.MeshStandardMaterial({color:0x173b46,roughness:.98,bumpMap:feltMap,bumpScale:.018}));runner.position.set(0,-1.175,.30);runner.castShadow=runner.receiveShadow=true;scene.add(runner);
const thread=new THREE.MeshStandardMaterial({color:0x799da0,roughness:.9}),stitchGeo=new THREE.CapsuleGeometry(.009,.07,3,6);stitchGeo.rotateZ(Math.PI/2);const stitches=new THREE.InstancedMesh(stitchGeo,thread,140),stitchPose=new THREE.Object3D();let stitch=0;for(const side of [-1,1]){for(let i=0;i<52;i++){stitchPose.position.set(-4.14+i*8.28/51,-1.124,.30+side*1.42);stitchPose.rotation.y=0;stitchPose.updateMatrix();stitches.setMatrixAt(stitch++,stitchPose.matrix);}for(let i=0;i<18;i++){stitchPose.position.set(side*4.35,-1.124,-.90+i*2.4/17);stitchPose.rotation.y=Math.PI/2;stitchPose.updateMatrix();stitches.setMatrixAt(stitch++,stitchPose.matrix);}}scene.add(stitches);
const plate=roundedShape(7.3,6.2,.24,2.5);
for(let c=0;c<7;c++)for(let r=0;r<6;r++){const h=new THREE.Path();h.absarc(c-3,r,.40,0,Math.PI*2,true);plate.holes.push(h);}
const back=new THREE.Mesh(new THREE.ExtrudeGeometry(plate,{depth:.22,bevelEnabled:true,bevelThickness:.035,bevelSize:.035,bevelSegments:2,steps:1,curveSegments:28}),blue);back.position.z=-.20;back.castShadow=true;back.receiveShadow=true;scene.add(back);
// Turned ceramic aperture surrounds replace inflated donut rings.
const apertureProfile=[[.398,-.09],[.465,-.09],[.505,-.055],[.516,-.015],[.510,.025],[.49,.06],[.45,.085],[.405,.085],[.388,.06],[.388,-.05],[.398,-.09]];
const ringGeo=new THREE.LatheGeometry(apertureProfile.map(([r,y])=>new THREE.Vector2(r,y)),64);ringGeo.rotateX(Math.PI/2);
for (let c = 0; c < 7; c++) for (let r = 0; r < 6; r++) { const m = new THREE.Mesh(ringGeo, blue); m.position.set(c - 3, r - 0.0, 0.1); m.castShadow=true;m.receiveShadow=true;scene.add(m); }
const metal=new THREE.MeshStandardMaterial({color:0xd6b46f,metalness:.65,roughness:.25});
for (const x of [-3.72,3.72]){
 // Turned ceramic uprights: broad foot and capital collars taper into a slender shaft.
 const postProfile=[[0,-.69],[.20,-.69],[.27,-.62],[.28,-.50],[.24,-.40],[.20,-.32],[.17,-.08],[.165,4.85],[.19,5.05],[.25,5.16],[.27,5.28],[.25,5.40],[.18,5.51],[0,5.54]];
 const support=new THREE.Mesh(new THREE.LatheGeometry(postProfile.map(([r,y])=>new THREE.Vector2(r,y)),48),blue);support.position.set(x,0,-.02);support.castShadow=support.receiveShadow=true;scene.add(support);
 for(const y of [-.49,5.27]){const collar=new THREE.Mesh(new THREE.TorusGeometry(.272,.018,12,48),metal);collar.rotation.x=Math.PI/2;collar.position.set(x,y,-.02);collar.castShadow=true;scene.add(collar);}
 // Sculpted sled footprint: narrow waist, broad rounded toes and a crowned top surface.
 const footShape=new THREE.Shape();footShape.moveTo(-.18,-1.10);footShape.quadraticCurveTo(-.43,-1.09,-.40,-.80);footShape.quadraticCurveTo(-.28,0,-.40,.80);footShape.quadraticCurveTo(-.43,1.09,-.18,1.10);footShape.lineTo(.18,1.10);footShape.quadraticCurveTo(.43,1.09,.40,.80);footShape.quadraticCurveTo(.28,0,.40,-.80);footShape.quadraticCurveTo(.43,-1.09,.18,-1.10);footShape.closePath();
 const footGeo=new THREE.ExtrudeGeometry(footShape,{depth:.17,bevelEnabled:true,bevelSize:.065,bevelThickness:.065,bevelSegments:5,curveSegments:24,steps:1});footGeo.rotateX(-Math.PI/2);
 // Crown the ceramic upper surface towards the waist, leaving the underside level.
 const fp=footGeo.attributes.position;for(let i=0;i<fp.count;i++){const y=fp.getY(i),z=fp.getZ(i);if(y>-.07)fp.setY(i,y+.095*Math.max(0,1-z*z/1.5)*Math.max(0,(y+.07)/.14));}fp.needsUpdate=true;footGeo.computeVertexNormals();
 const weltGeo=new THREE.ExtrudeGeometry(footShape,{depth:.025,bevelEnabled:true,bevelSize:.075,bevelThickness:.012,bevelSegments:3,curveSegments:24,steps:1});weltGeo.rotateX(-Math.PI/2);const welt=new THREE.Mesh(weltGeo,metal);welt.position.set(x,-.99,0);welt.castShadow=welt.receiveShadow=true;scene.add(welt);
 const foot=new THREE.Mesh(footGeo,blue);foot.position.set(x,-.81,0);foot.castShadow=foot.receiveShadow=true;scene.add(foot);
 for(const y of [-.35,5.35]){const bolt=new THREE.Mesh(new THREE.CylinderGeometry(.085,.085,.045,24),metal);bolt.rotation.x=Math.PI/2;bolt.position.set(x,y,.2);bolt.castShadow=true;scene.add(bolt);const slit=new THREE.Mesh(new THREE.BoxGeometry(.08,.014,.012),new THREE.MeshStandardMaterial({color:0x36505a,roughness:.5}));slit.position.set(x,y,.23);scene.add(slit);}
}
// Swept ceramic braces join each upright to its foot, giving the rack real side depth.
const braceShape=new THREE.Shape();braceShape.moveTo(-.02,-.66);braceShape.lineTo(.96,-.66);braceShape.quadraticCurveTo(.86,-.48,.62,-.27);braceShape.quadraticCurveTo(.22,.16,.08,.75);braceShape.lineTo(-.02,.75);braceShape.closePath();
const braceGeo=new THREE.ExtrudeGeometry(braceShape,{depth:.18,bevelEnabled:true,bevelSize:.045,bevelThickness:.035,bevelSegments:4,curveSegments:20,steps:1});braceGeo.rotateY(Math.PI/2);
for(const x of [-3.72,3.72])for(const side of [-1,1]){const brace=new THREE.Mesh(braceGeo,blue);brace.position.set(x-.09,0,0);brace.scale.z=side;brace.castShadow=brace.receiveShadow=true;scene.add(brace);}
// Seven open loading funnels show where each disc enters its column.
const funnelProfile=[[.27,-.16],[.27,-.015],[.29,.10],[.35,.25],[.38,.29],[.40,.28],[.405,.255],[.38,.22],[.32,.07],[.30,-.015],[.30,-.16],[.27,-.16]];
const funnelGeo=new THREE.LatheGeometry(funnelProfile.map(([r,y])=>new THREE.Vector2(r,y)),48);
for(let c=0;c<7;c++){const funnel=new THREE.Mesh(funnelGeo,blue);funnel.scale.set(1.18,1,.5);funnel.position.set(c-3,5.58,0);funnel.castShadow=funnel.receiveShadow=true;scene.add(funnel);const lip=new THREE.Mesh(new THREE.TorusGeometry(.39,.014,12,48),metal);lip.rotation.x=Math.PI/2;lip.scale.set(1.18,.5,1);lip.position.set(c-3,5.86,0);scene.add(lip);}
const lavaMat = new THREE.MeshStandardMaterial({ color:0xf5d797,roughness:.4 });
// Open, recessed ceramic catch tray: floor, rounded perimeter and a dark inset bed.
const trayShape=roundedShape(7.95,1.48,.24),trayOpening=roundedShape(7.55,1.08,.17);trayShape.holes.push(new THREE.Path(trayOpening.getPoints(48).reverse()));
const trayRimGeo=new THREE.ExtrudeGeometry(trayShape,{depth:.23,bevelEnabled:true,bevelSize:.045,bevelThickness:.045,bevelSegments:4,steps:1,curveSegments:20});trayRimGeo.rotateX(-Math.PI/2);
const trayRim=new THREE.Mesh(trayRimGeo,lavaMat);trayRim.position.set(0,-1.04,.38);trayRim.castShadow=trayRim.receiveShadow=true;scene.add(trayRim);
const trayBedGeo=new THREE.ExtrudeGeometry(roundedShape(7.70,1.23,.20),{depth:.065,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:3,steps:1});trayBedGeo.rotateX(-Math.PI/2);
const trayBed=new THREE.Mesh(trayBedGeo,new THREE.MeshStandardMaterial({color:0x335b65,roughness:.82}));trayBed.position.set(0,-1.105,.38);trayBed.castShadow=trayBed.receiveShadow=true;scene.add(trayBed);
// Fine radial ribs catch the key light along the inset rather than a flat painted stripe.
const ribGeo=new THREE.CapsuleGeometry(.012,.70,3,6);ribGeo.rotateX(Math.PI/2);const ribs=new THREE.InstancedMesh(ribGeo,blue,29),ribPose=new THREE.Object3D();for(let i=0;i<29;i++){ribPose.position.set(-3.5+i*.25,-1.026,.38);ribPose.updateMatrix();ribs.setMatrixAt(i,ribPose.matrix);}ribs.receiveShadow=true;scene.add(ribs);
// Bevelled ceramic tokens with recessed faces and raised, genuinely lit symbols.
const tokenMat={1:new THREE.MeshPhysicalMaterial({color:0xe5fff4,roughness:.24,clearcoat:.7}),2:new THREE.MeshPhysicalMaterial({color:0xe96e4b,roughness:.28,clearcoat:.65})};
const tokenTrim={1:new THREE.MeshStandardMaterial({color:0x20859a,roughness:.3,metalness:.5}),2:new THREE.MeshStandardMaterial({color:0xffd379,roughness:.3,metalness:.5})};
const tokenGeo=new THREE.LatheGeometry([[0,-.125],[.31,-.125],[.36,-.12],[.39,-.09],[.397,-.045],[.397,.045],[.39,.09],[.36,.12],[.31,.125],[0,.125]].map(([x,y])=>new THREE.Vector2(x,y)),48);tokenGeo.rotateX(Math.PI/2);
const rimGeo=new THREE.TorusGeometry(.31,.018,10,48);
const snowPaths=[];for(let i=0;i<3;i++){const a=i*Math.PI/3;snowPaths.push(new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(Math.cos(a)*.22,Math.sin(a)*.22,0),new THREE.Vector3(-Math.cos(a)*.22,-Math.sin(a)*.22,0)),1,.014,8,false));}
// Sculpted forked crystal branches replace the plain six-spoke ivory token emblem.
for(let i=0;i<6;i++){const a=i*Math.PI/3,axis=new THREE.Vector3(Math.cos(a),Math.sin(a),0),across=new THREE.Vector3(-Math.sin(a),Math.cos(a),0);for(const side of [-1,1]){const root=axis.clone().multiplyScalar(.115),tip=axis.clone().multiplyScalar(.18).addScaledVector(across,.053*side);snowPaths.push(new THREE.TubeGeometry(new THREE.LineCurve3(root,tip),1,.011,8,false));}}

const flame=new THREE.Shape();flame.moveTo(0,-.22);flame.bezierCurveTo(-.25,-.07,-.09,.09,0,.23);flame.bezierCurveTo(.10,.09,.23,-.08,0,-.22);const flameHeart=new THREE.Path();flameHeart.moveTo(0,-.12);flameHeart.bezierCurveTo(.08,-.065,.03,.005,0,.075);flameHeart.bezierCurveTo(-.035,.005,-.075,-.065,0,-.12);flame.holes.push(flameHeart);const flameGeo=new THREE.ExtrudeGeometry(flame,{depth:.012,bevelEnabled:true,bevelSize:.012,bevelThickness:.009,bevelSegments:3,curveSegments:18,steps:1});
function token(player){const g=new THREE.Group();const add=(geo,mat,z=0)=>{const m=new THREE.Mesh(geo,mat);m.position.z=z;m.castShadow=m.receiveShadow=true;g.add(m);return m;};add(tokenGeo,tokenMat[player]);
 for(const sign of [-1,1]){add(rimGeo,tokenTrim[player],sign*.13);if(player===1){for(const geo of snowPaths)add(geo,tokenTrim[player],sign*.14);}else{const mark=add(flameGeo,tokenTrim[player],sign*.133);if(sign<0)mark.rotation.y=Math.PI;}}
 return g;
}
const discs = new THREE.Group(); scene.add(discs);
const colHit = []; // invisible column pickers
for (let c = 0; c < 7; c++) { const m = new THREE.Mesh(new THREE.BoxGeometry(1, 6.4, 1.2), new THREE.MeshBasicMaterial({ visible: false })); m.position.set(c - 3, 2.5, 0.2); m.userData.c = c; scene.add(m); colHit.push(m); }
function fit() {
  const w = view.clientWidth || 600, h = view.clientHeight || 600; renderer.setSize(w, h, false);
  renderer.domElement.style.width = '100%'; renderer.domElement.style.height = '100%';
  camera.aspect = w / h; camera.updateProjectionMatrix();
  const pts = [[-4.65, -1.2, 1.95], [4.65, -1.2, 1.95], [-3.9, 5.96, 0.8], [3.9, 5.96, 0.8]].map(a => new THREE.Vector3(...a));
  for (let d = 8; d < 60; d += 0.25) { camera.position.set(.6, 3.8, d); camera.lookAt(0, 2.4, 0); camera.updateMatrixWorld();
    if (pts.every(v => { const q = v.clone().project(camera); return Math.abs(q.x) < 0.95 && Math.abs(q.y) < 0.95; })) break; }
}
new ResizeObserver(fit).observe(view); fit(); const fx = createFx(scene); fx.setAmbient(false); const clock = new THREE.Clock(); window.__fx = fx;
const dropAnimations=new Map();let tokenKeys=new Set();
renderer.setAnimationLoop(() => {
 const dt=Math.min(clock.getDelta(),.05);fx.update(dt);
 for(const m of discs.children){const a=dropAnimations.get(m.userData.cell);if(!a)continue;a.t=(performance.now()-a.start)/1000;const u=Math.min(1,a.t/.62);const fall=Math.min(1,u/.72);let y=a.y+(6.1-a.y)*(1-fall*fall);
  if(u>.72){const b=(u-.72)/.28;y=a.y+Math.sin(b*Math.PI)*.20*(1-b);}
  m.position.y=y;a.currentY=y;if(u>=1){m.position.y=a.y;dropAnimations.delete(m.userData.cell);}
 }
 renderer.render(scene,camera);
});
function decorateWin(w){
    const winning=new Set(w.cells.map(([c,r])=>c+','+r));
    for(const disc of discs.children){if(!disc.userData.cell)continue;const won=winning.has(disc.userData.cell);for(const child of disc.children){child.material=child.material.clone();if(won){child.material.emissive=new THREE.Color(w.player===1?0x166e86:0xb54a19);child.material.emissiveIntensity=.24;}else{child.material.color.multiplyScalar(.58);child.material.roughness=.7;child.material.clearcoat=0;}}}
    // Sculpted victory laurels: warm metal leaves surround the actual winning discs.
    for (const [c, r] of w.cells) {
      const laurel=new THREE.Group();laurel.userData.winner=c+','+r;laurel.position.set(c-3,r,.19);
      const gold=new THREE.MeshStandardMaterial({color:0xffd379,metalness:.75,roughness:.25,emissive:0xa54f0b,emissiveIntensity:.16});
      for(const side of [-1,1])for(let i=0;i<6;i++){const a=(-.85+i*.34)+(side<0?Math.PI:0),leaf=new THREE.Mesh(new THREE.SphereGeometry(.055,12,8),gold);leaf.scale.set(.55,1.5,.3);leaf.position.set(Math.cos(a)*.32,Math.sin(a)*.32,0);leaf.rotation.z=-a+.6*side;laurel.add(leaf);}
      const ring=new THREE.Mesh(new THREE.TorusGeometry(.327,.009,10,64),gold);laurel.add(ring);discs.add(laurel);
    }
}
let board = R.empty(), turn = 1, over = false, busy = false, aiTimer = null; window.__c4 = () => ({ board, turn, over });window.__c4Visual=()=>({active:dropAnimations.size,tokens:discs.children.filter(m=>m.userData.cell).map(m=>({cell:m.userData.cell,y:m.position.y}))});
function show() {
  discs.clear();
  const nextKeys=new Set();
  for (let c = 0; c < 7; c++) for (let r = 0; r < 6; r++) if (board[c][r]) { const key=c+','+r;nextKeys.add(key);if(!tokenKeys.has(key))dropAnimations.set(key,{t:0,start:performance.now(),y:r,currentY:6.1});const m = token(board[c][r]);m.userData.cell=key;m.position.set(c - 3,dropAnimations.has(key)?dropAnimations.get(key).currentY:r,0);discs.add(m); }
  tokenKeys=nextKeys;
  const w = R.winLine(board);
  if (w) { over = true;
    decorateWin(w);
  }
  else if (R.isFull(board)) over = true;
  const name = p => p === 1 ? 'Ivory' : 'Coral';
  status.textContent = w ? name(w.player) + ' wins.' : over ? 'Draw - the board is full.' : name(turn) + ' to move';
  document.body.dataset.turn = String(w ? w.player : turn); document.body.dataset.over = String(over);
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
function reset() { dropAnimations.clear();tokenKeys.clear();fx.clear(); clearTimeout(aiTimer); aiTimer = null; board = R.empty(); turn = 1; over = false; busy = false; show(); }
document.getElementById('new').onclick = reset; mode.onchange = scheduleAI;
show();
