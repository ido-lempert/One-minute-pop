import * as THREE from '../lib/three.module.js';
// Original toy-sculpted chess set. Clear silhouettes, glazed ceramic, warm metal details.
const mats={w:new THREE.MeshPhysicalMaterial({color:0xe2f2df,roughness:.22,metalness:.05,clearcoat:1}),b:new THREE.MeshPhysicalMaterial({color:0xc95038,roughness:.25,metalness:.05,clearcoat:1})};
const trim={w:new THREE.MeshStandardMaterial({color:0x19adc2,metalness:.45,roughness:.25}),b:new THREE.MeshStandardMaterial({color:0xffd16e,metalness:.55,roughness:.25})};
const dark=new THREE.MeshStandardMaterial({color:0x193b52,roughness:.3});
const geo={};const lathe=(key,points)=>{if(geo[key])return geo[key];const shape=new THREE.LatheGeometry(points.map(([x,y])=>new THREE.Vector2(x,y)),key==='body'?64:48);
 // Broad ceramic flutes are sculpted into the shared chess stem, tapering out before collars.
 if(key==='body'){const p=shape.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),r=Math.hypot(x,z);if(y>.24&&y<.70&&r>0){const envelope=Math.sin((y-.24)/.46*Math.PI),delta=.018*envelope*Math.cos(8*Math.atan2(z,x));p.setXYZ(i,x*(r+delta)/r,y,z*(r+delta)/r);}}shape.computeVertexNormals();const n=shape.attributes.normal;for(let j=0;j<points.length;j++){const a=j,b=64*points.length+j,v=new THREE.Vector3(n.getX(a)+n.getX(b),n.getY(a)+n.getY(b),n.getZ(a)+n.getZ(b)).normalize();n.setXYZ(a,v.x,v.y,v.z);n.setXYZ(b,v.x,v.y,v.z);}}return geo[key]=shape;};
function mesh(g,geometry,material,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
const body=[[0,0],[.30,0],[.34,.018],[.365,.045],[.37,.075],[.365,.105],[.35,.125],[.34,.145],[.30,.165],[.29,.19],[.27,.21],[.245,.25],[.22,.30],[.195,.36],[.173,.43],[.153,.51],[.145,.58],[.145,.63],[.157,.67],[.18,.70],[.21,.72],[.25,.73],[.266,.75],[.27,.78],[.25,.81],[.22,.83],[0,.84]];
export function chessMesh(type,color){
 const g=new THREE.Group(),m=mats[color],t=trim[color];
 mesh(g,lathe(type==='r'?'rookBody':'body',type==='r'?[[0,0],[.31,0],[.37,.04],[.38,.10],[.35,.18],[.28,.23],[.25,.27],[.23,.76],[.28,.81],[.31,.85],[0,.85]]:body),m);
 // Fine turned metal footrail and neck ring make the ceramic pedestal read as built, not extruded.
 for(const [radius,y,tube] of [[.36,.068,.011],[.294,.183,.014],[type==='r'?.247:.148,.63,.010]]){const ring=mesh(g,new THREE.TorusGeometry(radius,tube,12,64),t,0,y);ring.rotation.x=Math.PI/2;}
 if(type==='p'){
  // A turned collar supports the pawn orb; an inlaid equator and crest replace a bead.
  mesh(g,lathe('pawnCollar',[[0,0],[.16,0],[.22,.035],[.23,.065],[.20,.095],[.15,.115],[0,.115]]),m,0,.76);
  const collar=mesh(g,new THREE.TorusGeometry(.215,.018,12,48),t,0,.81);collar.rotation.x=Math.PI/2;
  // A six-lobed ceramic calyx replaces the pawn's flat supporting collar.
  if(!geo.pawnCalyx){const pos=[],uv=[],indices=[],n=64,rings=12;for(let j=0;j<=rings;j++){const u=j/rings,y=.81+u*.13;const radius=.21-.065*u+.055*Math.sin(u*Math.PI);for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,r=radius+Math.sin(u*Math.PI)*.018*Math.cos(6*a);pos.push(Math.cos(a)*r,y,Math.sin(a)*r);uv.push(i/n,u);}}for(let j=0;j<rings;j++)for(let i=0;i<n;i++){const k=j*(n+1)+i;indices.push(k,k+n+1,k+1,k+1,k+n+1,k+n+2);}geo.pawnCalyx=new THREE.BufferGeometry();geo.pawnCalyx.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.pawnCalyx.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.pawnCalyx.setIndex(indices);geo.pawnCalyx.computeVertexNormals();}
  mesh(g,geo.pawnCalyx,m);
  mesh(g,new THREE.SphereGeometry(.215,40,28),m,0,1.005);
  const equator=mesh(g,new THREE.TorusGeometry(.211,.012,10,48),t,0,1.005);equator.rotation.x=Math.PI/2;
  mesh(g,lathe('pawnCrest',[[0,0],[.045,0],[.065,.025],[.053,.055],[.028,.085],[0,.095]]),t,0,1.205);
 }
 if(type==='r'){
  // A real hollow tower crown, bevelled battlements and recessed courtyard.
  if(!geo.rookCrown){const outer=new THREE.Shape();outer.absarc(0,0,.31,0,Math.PI*2,false);const hole=new THREE.Path();hole.absarc(0,0,.21,0,Math.PI*2,true);outer.holes.push(hole);geo.rookCrown=new THREE.ExtrudeGeometry(outer,{depth:.22,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:3,curveSegments:32,steps:1});geo.rookCrown.rotateX(-Math.PI/2);}
  mesh(g,geo.rookCrown,m,0,.84);
  mesh(g,new THREE.CylinderGeometry(.205,.205,.02,40),dark,0,.865);
  // Curved annular merlons follow the tower wall, with bevelled sloping shoulders.
  if(!geo.rookTooth){const q=new THREE.Shape(),outer=.325,inner=.205,half=.24;q.moveTo(Math.cos(-half)*outer,Math.sin(-half)*outer);q.absarc(0,0,outer,-half,half,false);q.lineTo(Math.cos(half)*inner,Math.sin(half)*inner);q.absarc(0,0,inner,half,-half,true);q.closePath();geo.rookTooth=new THREE.ExtrudeGeometry(q,{depth:.17,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:4,curveSegments:16,steps:1});geo.rookTooth.rotateX(-Math.PI/2);}
  for(let i=0;i<6;i++){const tooth=mesh(g,geo.rookTooth,m,0,1.055,0);tooth.rotation.y=i*Math.PI/3;}
  for(const y of [.32,.77]){const collar=mesh(g,new THREE.TorusGeometry(y===.32?.249:.258,.017,10,48),t,0,y);collar.rotation.x=Math.PI/2;}
  // Four swept ceramic buttresses give the rook a supported castle-tower silhouette.
  if(!geo.rookButtress){const s=new THREE.Shape();s.moveTo(.22,.25);s.lineTo(.30,.25);s.quadraticCurveTo(.31,.34,.285,.43);s.quadraticCurveTo(.265,.60,.285,.79);s.lineTo(.235,.80);s.closePath();geo.rookButtress=new THREE.ExtrudeGeometry(s,{depth:.075,bevelEnabled:true,bevelSize:.014,bevelThickness:.014,bevelSegments:4,curveSegments:16,steps:1});geo.rookButtress.translate(0,0,-.0375);}
  for(let i=0;i<4;i++){const rib=mesh(g,geo.rookButtress,m);rib.rotation.y=Math.PI/4+i*Math.PI/2;}
  // Four inset metal shield accents break up the tower shaft without noisy texture.
  for(let i=0;i<4;i++){const a=i*Math.PI/2;const shield=mesh(g,new THREE.SphereGeometry(.055,16,10),t,Math.cos(a)*.235,.54,Math.sin(a)*.235);shield.scale.set(.7,1.35,.7);}
 }
 if(type==='b'){
  // Bevelled mitre with a genuine diagonal opening, visible from either side.
  if(!geo.bishopMitre){const s=new THREE.Shape();s.moveTo(-.12,.83);s.bezierCurveTo(-.28,.94,-.28,1.12,-.19,1.28);s.quadraticCurveTo(-.10,1.43,0,1.53);s.lineTo(.10,1.39);s.lineTo(-.055,1.15);s.lineTo(.01,1.10);s.lineTo(.16,1.32);s.bezierCurveTo(.28,1.15,.29,.97,.12,.83);s.closePath();geo.bishopMitre=new THREE.ExtrudeGeometry(s,{depth:.21,bevelEnabled:true,bevelSize:.026,bevelThickness:.055,bevelSegments:5,curveSegments:24,steps:4});
   // Subdivide cap triangles before shaping the rounded lens, avoiding planar facets.
   const base=geo.bishopMitre.toNonIndexed(),points=[];const pos=base.attributes.position;
   function split(a,b,c,n){if(!n){points.push(...a,...b,...c);return;}const mid=(u,v)=>u.map((x,i)=>(x+v[i])/2),ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);split(a,ab,ca,n-1);split(ab,b,bc,n-1);split(ca,bc,c,n-1);split(ab,bc,ca,n-1);}
   for(let i=0;i<pos.count;i+=3)split([pos.getX(i),pos.getY(i),pos.getZ(i)],[pos.getX(i+1),pos.getY(i+1),pos.getZ(i+1)],[pos.getX(i+2),pos.getY(i+2),pos.getZ(i+2)],2);
   geo.bishopMitre.dispose();geo.bishopMitre=new THREE.BufferGeometry();geo.bishopMitre.setAttribute('position',new THREE.Float32BufferAttribute(points,3));const p=geo.bishopMitre.attributes.position;
   for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),bulge=.055*Math.max(0,1-(x/.30)**2)*Math.max(0,Math.sin((y-.80)/.78*Math.PI));p.setZ(i,z+(z-.105)/.16*bulge);}geo.bishopMitre.computeVertexNormals();
   const normal=geo.bishopMitre.attributes.normal,shared=new Map(),key=i=>[p.getX(i),p.getY(i),p.getZ(i)].map(v=>v.toFixed(5)).join(',');for(let i=0;i<p.count;i++){const k=key(i),v=shared.get(k)||new THREE.Vector3();v.add(new THREE.Vector3(normal.getX(i),normal.getY(i),normal.getZ(i)));shared.set(k,v);}for(let i=0;i<p.count;i++){const v=shared.get(key(i)).normalize();normal.setXYZ(i,v.x,v.y,v.z);}base.dispose();}

  mesh(g,geo.bishopMitre,m,0,0,-.105);
  for(const y of [.82,.87]){const collar=mesh(g,new THREE.TorusGeometry(.20,.018,10,40),t,0,y);collar.rotation.x=Math.PI/2;}
  for(const z of [-.225,.225]){const jewel=mesh(g,new THREE.SphereGeometry(.06,20,12),t,-.065,1.025,z);jewel.scale.set(.7,1,.45);}
  // Twin swept ceremonial stole ribbons lie over the bishop's turned shoulders.
  if(!geo.bishopStole){const profile=[[.27,.23],[.222,.32],[.184,.44],[.16,.57],[.197,.69],[.284,.77],[.23,.81]],pos=[],uv=[],indices=[];for(let j=0;j<profile.length;j++){const [radius,y]=profile[j];for(const a of [-.14,.14]){pos.push(Math.sin(a)*radius,y,Math.cos(a)*radius+.012);uv.push(a,j/profile.length);}}for(let j=0;j<profile.length-1;j++){const k=j*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}geo.bishopStole=new THREE.BufferGeometry();geo.bishopStole.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.bishopStole.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.bishopStole.setIndex(indices);geo.bishopStole.computeVertexNormals();}
  for(const side of [-1,1])for(const facing of [0,Math.PI]){const ribbon=mesh(g,geo.bishopStole,t);ribbon.rotation.y=facing+side*.48;const jewel=mesh(g,new THREE.SphereGeometry(.024,16,10),t,Math.sin(facing+side*.48)*.275,.24,Math.cos(facing+side*.48)*.275);jewel.scale.set(1,.8,.4);}
  g.rotation.y=color==='w'?.20:Math.PI+.20;
 }
 if(type==='q'){
  // Open royal crown: a scalloped band, rising gold prongs and inset stones.
  mesh(g,lathe('queenMantle',[[0,0],[.19,0],[.21,.08],[.19,.16],[.24,.24],[.26,.29],[.21,.32],[0,.32]]),m,0,.76);
  // Eight softly overlapping ceramic petals support the queen's open crown.
  if(!geo.queenPetal){const s=new THREE.Shape();s.moveTo(-.046,0);s.quadraticCurveTo(-.09,.095,-.052,.19);s.quadraticCurveTo(0,.265,.052,.19);s.quadraticCurveTo(.09,.095,.046,0);s.closePath();geo.queenPetal=new THREE.ExtrudeGeometry(s,{depth:.024,bevelEnabled:true,bevelSize:.016,bevelThickness:.014,bevelSegments:4,curveSegments:16,steps:1});}
  for(let i=0;i<8;i++){const a=i*Math.PI/4,petal=mesh(g,geo.queenPetal,m,Math.cos(a)*.207,.82,Math.sin(a)*.207);petal.rotation.y=Math.PI/2-a;}
  if(!geo.queenCrown){const n=64,points=[];for(let i=0;i<=n;i++){const a=i/n*Math.PI*2,r=.258;points.push(new THREE.Vector3(Math.cos(a)*r,1.105+.035*Math.cos(8*a),Math.sin(a)*r));}geo.queenCrown=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),96,.023,8,true);}
  mesh(g,geo.queenCrown,t);
  mesh(g,new THREE.CylinderGeometry(.205,.19,.035,40),dark,0,1.075);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;const s=new THREE.Shape();s.moveTo(-.042,1.04);s.quadraticCurveTo(-.05,1.17,-.02,1.29);s.quadraticCurveTo(0,1.36,.02,1.29);s.quadraticCurveTo(.05,1.17,.042,1.04);s.closePath();if(!geo.queenProng)geo.queenProng=new THREE.ExtrudeGeometry(s,{depth:.026,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:3,steps:1});const prong=mesh(g,geo.queenProng,t,Math.cos(a)*.245,0,Math.sin(a)*.245);prong.rotation.y=Math.PI/2-a;mesh(g,new THREE.SphereGeometry(.048,20,12),m,Math.cos(a)*.255,1.30,Math.sin(a)*.255);}
  const band=mesh(g,new THREE.TorusGeometry(.245,.022,10,48),t,0,1.025);band.rotation.x=Math.PI/2;
  for(let i=0;i<8;i++){const a=i*Math.PI/4;const gem=mesh(g,new THREE.OctahedronGeometry(.037),t,Math.cos(a)*.252,1.065,Math.sin(a)*.252);gem.scale.y=1.3;}
 }
 if(type==='k'){
  // Turned royal mantle, fluted dome and a softly bevelled heraldic cross.
  mesh(g,lathe('kingMantle',[[0,0],[.19,0],[.24,.045],[.26,.10],[.23,.17],[.21,.29],[.24,.33],[0,.33]]),m,0,.76);
  const dome=mesh(g,new THREE.SphereGeometry(.215,40,24,0,Math.PI*2,0,Math.PI/2),m,0,1.085);dome.scale.y=.7;
  for(const y of [1.02,1.10]){const band=mesh(g,new THREE.TorusGeometry(y===1.02?.235:.218,.019,12,48),t,0,y);band.rotation.x=Math.PI/2;}
  // Four raised crown arches follow the dome from the royal band to the cross seat.
  if(!geo.kingArch){const points=[];for(let j=0;j<=20;j++){const a=j/20*Math.PI/2;points.push(new THREE.Vector3(Math.cos(a)*.224,1.085+Math.sin(a)*.159,0));}geo.kingArch=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),28,.014,10,false);}
  for(let i=0;i<4;i++){const arch=mesh(g,geo.kingArch,t);arch.rotation.y=Math.PI/4+i*Math.PI/2;}
  const crossSeat=mesh(g,new THREE.TorusGeometry(.050,.013,10,32),t,0,1.241);crossSeat.rotation.x=Math.PI/2;

  for(let i=0;i<8;i++){const a=i*Math.PI/4;const flute=mesh(g,new THREE.SphereGeometry(.032,16,12),t,Math.cos(a)*.223,.96,Math.sin(a)*.223);flute.scale.set(.65,2.5,.65);}
  if(!geo.kingCross){const s=new THREE.Shape();const pts=[[-.045,1.20],[.045,1.20],[.045,1.37],[.15,1.37],[.15,1.45],[.045,1.45],[.045,1.57],[-.045,1.57],[-.045,1.45],[-.15,1.45],[-.15,1.37],[-.045,1.37]];pts.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();geo.kingCross=new THREE.ExtrudeGeometry(s,{depth:.065,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:4,steps:1});}
  mesh(g,geo.kingCross,t,0,0,-.0325);
  for(const z of [-.06,.06]){const gem=mesh(g,new THREE.OctahedronGeometry(.037),m,0,1.41,z);gem.scale.set(.85,1.2,.5);}
 }
 if(type==='n'){
  // Sculpted horse profile, bevelled for a soft, recognisable silhouette.
  const s=new THREE.Shape();s.moveTo(-.26,.73);s.lineTo(-.23,1.04);s.quadraticCurveTo(-.27,1.23,-.13,1.4);s.quadraticCurveTo(-.1,1.47,.02,1.43);s.lineTo(.15,1.4);s.lineTo(.35,1.2);s.quadraticCurveTo(.43,1.1,.29,1.04);s.lineTo(.1,1.1);s.quadraticCurveTo(.04,.86,.2,.73);s.closePath();
  const h=mesh(g,new THREE.ExtrudeGeometry(s,{depth:.22,bevelEnabled:true,bevelSize:.045,bevelThickness:.04,bevelSegments:3,steps:1}),m,0,0,-.11);
  for(const z of [-.165,.165])mesh(g,new THREE.SphereGeometry(.035,12,8),dark,.06,1.30,z);
  // Paired, separated sculpted ears and a rounded muzzle replace the single flat spike.
  if(!geo.knightEar){const ear=new THREE.Shape();ear.moveTo(-.065,0);ear.quadraticCurveTo(-.09,.13,-.032,.255);ear.quadraticCurveTo(.025,.16,.06,.035);ear.closePath();geo.knightEar=new THREE.ExtrudeGeometry(ear,{depth:.035,bevelEnabled:true,bevelSize:.014,bevelThickness:.014,bevelSegments:4,curveSegments:16,steps:1});}
  for(const z of [-.13,.13]){const ear=mesh(g,geo.knightEar,m,-.09,1.37,z-.018);ear.rotation.z=-.12;const inset=mesh(g,new THREE.SphereGeometry(.042,16,12),t,-.12,1.49,z+Math.sign(z)*.038);inset.scale.set(.36,1.35,.22);}
  const muzzle=mesh(g,new THREE.SphereGeometry(.13,32,20),m,.27,1.15,0);muzzle.scale.set(1.05,.72,1.35);
  // Swept mane follows the neck instead of a floating rectangular block.
  if(!geo.knightMane){const s=new THREE.Shape();s.moveTo(-.24,.78);s.quadraticCurveTo(-.31,.99,-.28,1.20);s.quadraticCurveTo(-.23,1.36,-.13,1.42);s.lineTo(-.08,1.36);s.quadraticCurveTo(-.20,1.22,-.19,1.06);s.quadraticCurveTo(-.19,.91,-.16,.79);s.closePath();geo.knightMane=new THREE.ExtrudeGeometry(s,{depth:.235,bevelEnabled:true,bevelSize:.018,bevelThickness:.015,bevelSegments:3,curveSegments:16,steps:1});}
  mesh(g,geo.knightMane,t,0,0,-.1175);
  // Swept overlapping mane locks break the plain rear edge into a flowing silhouette.
  if(!geo.knightLocks){geo.knightLocks=[];for(let i=0;i<7;i++){const u=i/6,y=.84+u*.47,x=-.265+.09*u*u,lock=new THREE.Shape();lock.moveTo(x+.025,y+.085);lock.quadraticCurveTo(x-.065,y+.055,x-.095,y-.025);lock.quadraticCurveTo(x-.025,y-.012,x+.035,y+.015);lock.closePath();const geometry=new THREE.ExtrudeGeometry(lock,{depth:.245,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:3,curveSegments:14,steps:1});geo.knightLocks.push(geometry);}}
  for(const lock of geo.knightLocks)mesh(g,lock,t,0,0,-.1225);
  // Paired nostrils, rounded cheeks and bridle straps give the horse a real face.
  for(const z of [-.163,.163]){
   const cheek=mesh(g,new THREE.SphereGeometry(.075,24,16),m,-.005,1.205,z);cheek.scale.set(.9,1.2,.35);
   const nostril=mesh(g,new THREE.SphereGeometry(.023,16,10),dark,.29,1.14,z);nostril.scale.set(1,.65,.45);
   const strap=new THREE.CatmullRomCurve3([new THREE.Vector3(-.06,1.38,z),new THREE.Vector3(-.04,1.23,z+.008*Math.sign(z)),new THREE.Vector3(.08,1.12,z)]);
   mesh(g,new THREE.TubeGeometry(strap,20,.012,8,false),t);
   const buckle=mesh(g,new THREE.TorusGeometry(.034,.009,8,20),t,-.025,1.225,z+.018*Math.sign(z));buckle.scale.y=1.15;
  }
  // Rounded nose band wraps the bevelled muzzle on both sides.
  const nose=new THREE.CatmullRomCurve3([new THREE.Vector3(.24,1.235,-.16),new THREE.Vector3(.30,1.20,-.17),new THREE.Vector3(.35,1.14,0),new THREE.Vector3(.30,1.20,.17),new THREE.Vector3(.24,1.235,.16)]);
  mesh(g,new THREE.TubeGeometry(nose,32,.012,8,false),t);
  g.rotation.y=color==='w'?.25:Math.PI-.25;
 }
 g.userData.pieceType=type;g.userData.side=color==='w'?'ice':'fire';g.scale.setScalar(.98);return g;
}
export function checkerMesh(color,king){
 const g=new THREE.Group(),m=mats[color],t=trim[color];
 mesh(g,lathe('checkerSculpt',[[0,0],[.32,0],[.39,.025],[.415,.065],[.415,.10],[.388,.125],[.415,.15],[.415,.18],[.39,.21],[.35,.25],[.31,.265],[.28,.245],[0,.245]]),m);
 // Rounded vertical reeds form a tactile grip around the disc's stepped edge.
 if(!geo.checkerGrip){const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(.394,.040,0),new THREE.Vector3(.419,.073,0),new THREE.Vector3(.405,.123,0),new THREE.Vector3(.419,.168,0),new THREE.Vector3(.388,.213,0)]);geo.checkerGrip=new THREE.TubeGeometry(curve,12,.012,8,false);}
 const reeds=new THREE.InstancedMesh(geo.checkerGrip,m,32),pose=new THREE.Object3D();for(let i=0;i<32;i++){pose.rotation.y=i*Math.PI/16;pose.updateMatrix();reeds.setMatrixAt(i,pose.matrix);}reeds.castShadow=true;reeds.receiveShadow=true;g.add(reeds);
 for(const y of [.035,.20]){const belt=mesh(g,new THREE.TorusGeometry(y===.035?.397:.398,.009,10,64),t,0,y);belt.rotation.x=Math.PI/2;}
 const rim=mesh(g,new THREE.TorusGeometry(.315,.024,12,48),t,0,.258);rim.rotation.x=Math.PI/2;
 // An inset ceramic face, a raised geometric rosette and eight metal inlays.
 mesh(g,new THREE.CylinderGeometry(.276,.276,.018,48),m,0,.249);
 // Eight open teardrop petals form a raised metal rosette with real cut-through centers.
 if(!geo.checkerPetal){const petal=new THREE.Shape();petal.moveTo(0,.032);petal.bezierCurveTo(-.075,.085,-.060,.16,0,.183);petal.bezierCurveTo(.060,.16,.075,.085,0,.032);const opening=new THREE.Path();opening.moveTo(0,.075);opening.bezierCurveTo(.028,.102,.025,.135,0,.151);opening.bezierCurveTo(-.025,.135,-.028,.102,0,.075);petal.holes.push(opening);geo.checkerPetal=new THREE.ExtrudeGeometry(petal,{depth:.018,bevelEnabled:true,bevelSize:.006,bevelThickness:.006,bevelSegments:3,curveSegments:16,steps:1});geo.checkerPetal.rotateX(-Math.PI/2);}
 for(let i=0;i<8;i++){const petal=mesh(g,geo.checkerPetal,t,0,.268);petal.rotation.y=i*Math.PI/4;}
 const heart=mesh(g,new THREE.SphereGeometry(.042,20,12),t,0,.286);heart.scale.y=.45;
 for(let i=0;i<8;i++){const a=i*Math.PI/4;const stud=mesh(g,new THREE.SphereGeometry(.022,12,8),t,Math.cos(a)*.22,.271,Math.sin(a)*.22);stud.scale.y=.45;}
 if(king){
  // A second sculpted disc and an open five-point crown make promotion readable by silhouette.
  mesh(g,lathe('kingDisc',[[0,0],[.30,0],[.35,.03],[.36,.08],[.34,.14],[.29,.18],[0,.18]]),m,0,.27);
  // Scalloped ceramic lobes shape the promoted disc into a raised royal tier.
  if(!geo.checkerRoyalLobe){const profile=[[0,0],[.026,0],[.040,.035],[.044,.075],[.036,.115],[.020,.145],[0,.15]];geo.checkerRoyalLobe=new THREE.LatheGeometry(profile.map(([r,y])=>new THREE.Vector2(r,y)),16);}
  for(let i=0;i<12;i++){const a=i*Math.PI/6,lobe=mesh(g,geo.checkerRoyalLobe,m,Math.cos(a)*.337,.292,Math.sin(a)*.337);}
  const belt=mesh(g,new THREE.TorusGeometry(.335,.023,12,48),t,0,.365);belt.rotation.x=Math.PI/2;
  mesh(g,new THREE.CylinderGeometry(.225,.225,.02,40),dark,0,.455);
  const band=mesh(g,new THREE.TorusGeometry(.235,.025,10,48),t,0,.46);band.rotation.x=Math.PI/2;
  if(!geo.checkerCrownPoint){const s=new THREE.Shape();s.moveTo(-.062,0);s.lineTo(.062,0);s.lineTo(.035,.16);s.quadraticCurveTo(0,.235,-.035,.16);s.closePath();geo.checkerCrownPoint=new THREE.ExtrudeGeometry(s,{depth:.027,bevelEnabled:true,bevelSize:.013,bevelThickness:.012,bevelSegments:3,steps:1});}
  for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const point=mesh(g,geo.checkerCrownPoint,t,Math.cos(a)*.225,.455,Math.sin(a)*.225);point.rotation.y=Math.PI/2-a;mesh(g,new THREE.SphereGeometry(.034,16,12),m,Math.cos(a)*.225,.66,Math.sin(a)*.225);}
 }

 return g;
}
