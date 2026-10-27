import * as THREE from '../lib/three.module.js';
// Original toy-sculpted chess set. Clear silhouettes, glazed ceramic, warm metal details.
const mats={w:new THREE.MeshPhysicalMaterial({color:0xe2f2df,roughness:.22,metalness:.05,clearcoat:1}),b:new THREE.MeshPhysicalMaterial({color:0xc95038,roughness:.25,metalness:.05,clearcoat:1})};
const trim={w:new THREE.MeshStandardMaterial({color:0x19adc2,metalness:.45,roughness:.25}),b:new THREE.MeshStandardMaterial({color:0xffd16e,metalness:.55,roughness:.25})};
const dark=new THREE.MeshStandardMaterial({color:0x193b52,roughness:.3});
const geo={};const lathe=(key,points)=>geo[key]||(geo[key]=new THREE.LatheGeometry(points.map(([x,y])=>new THREE.Vector2(x,y)),48));
function mesh(g,geometry,material,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
const body=[[0,0],[.31,0],[.36,.04],[.37,.09],[.35,.16],[.29,.20],[.25,.24],[.21,.30],[.16,.48],[.14,.65],[.19,.71],[.25,.73],[.27,.78],[.23,.83],[0,.84]];
export function chessMesh(type,color){
 const g=new THREE.Group(),m=mats[color],t=trim[color];
 mesh(g,lathe('body',body),m);
 const ring=mesh(g,new THREE.TorusGeometry(.3,.025,8,40),t,0,.18,0);ring.rotation.x=Math.PI/2;
 if(type==='p'){mesh(g,new THREE.SphereGeometry(.22,28,18),m,0,.91);mesh(g,new THREE.SphereGeometry(.07,16,12),t,0,1.1);}
 if(type==='r'){
  mesh(g,new THREE.CylinderGeometry(.29,.23,.32,32),m,0,.91);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;const tooth=mesh(g,new THREE.BoxGeometry(.14,.18,.16),m,Math.cos(a)*.23,1.12,Math.sin(a)*.23);tooth.rotation.y=-a;}
  mesh(g,new THREE.CylinderGeometry(.18,.18,.04,28),t,0,1.06);
 }
 if(type==='b'){
  mesh(g,new THREE.SphereGeometry(.24,28,18),m,0,.98);const head=mesh(g,new THREE.ConeGeometry(.20,.43,32),m,0,1.16);head.rotation.z=-.1;
  mesh(g,new THREE.SphereGeometry(.065,16,12),t,0,1.4);
  const slash=mesh(g,new THREE.BoxGeometry(.035,.25,.025),t,.04,1.18,.165);slash.rotation.z=-.4;
 }
 if(type==='q'){
  mesh(g,new THREE.CylinderGeometry(.3,.2,.3,32),m,0,.97);
  for(let i=0;i<7;i++){const a=i*Math.PI*2/7;mesh(g,new THREE.SphereGeometry(.07,16,12),t,Math.cos(a)*.27,1.18,Math.sin(a)*.27);}
  mesh(g,new THREE.SphereGeometry(.13,24,16),m,0,1.18);mesh(g,new THREE.SphereGeometry(.065,16,12),t,0,1.34);
 }
 if(type==='k'){
  mesh(g,new THREE.CylinderGeometry(.25,.19,.33,32),m,0,1.0);
  mesh(g,new THREE.SphereGeometry(.18,24,16),m,0,1.18);
  mesh(g,new THREE.BoxGeometry(.09,.36,.09),t,0,1.44);mesh(g,new THREE.BoxGeometry(.29,.09,.09),t,0,1.48);
 }
 if(type==='n'){
  // Sculpted horse profile, bevelled for a soft, recognisable silhouette.
  const s=new THREE.Shape();s.moveTo(-.26,.73);s.lineTo(-.23,1.04);s.quadraticCurveTo(-.27,1.23,-.13,1.4);s.lineTo(-.1,1.56);s.lineTo(.02,1.43);s.lineTo(.15,1.4);s.lineTo(.35,1.2);s.quadraticCurveTo(.43,1.1,.29,1.04);s.lineTo(.1,1.1);s.quadraticCurveTo(.04,.86,.2,.73);s.closePath();
  const h=mesh(g,new THREE.ExtrudeGeometry(s,{depth:.22,bevelEnabled:true,bevelSize:.045,bevelThickness:.04,bevelSegments:3,steps:1}),m,0,0,-.11);
  for(const z of [-.165,.165])mesh(g,new THREE.SphereGeometry(.035,12,8),dark,.06,1.30,z);
  const mane=mesh(g,new THREE.BoxGeometry(.07,.42,.21),t,-.20,1.12);mane.rotation.z=-.12;
  g.rotation.y=color==='w'?.25:Math.PI-.25;
 }
 g.userData.side=color==='w'?'ice':'fire';g.scale.setScalar(.98);return g;
}
export function checkerMesh(color,king){const g=new THREE.Group(),m=mats[color],t=trim[color];mesh(g,lathe('checker',[[0,0],[.32,0],[.4,.05],[.42,.12],[.4,.22],[.34,.27],[0,.27]]),m);const rim=mesh(g,new THREE.TorusGeometry(.30,.035,10,40),t,0,.28);rim.rotation.x=Math.PI/2;mesh(g,new THREE.CylinderGeometry(.23,.23,.02,32),t,0,.275);if(king){for(let i=0;i<5;i++){const a=i*6.283/5;mesh(g,new THREE.SphereGeometry(.055,12,10),t,Math.cos(a)*.18,.4,Math.sin(a)*.18);}mesh(g,new THREE.CylinderGeometry(.19,.14,.12,24),m,0,.34);}return g;}
