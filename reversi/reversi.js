import * as R from '../js/reversi-rules.js';
import {createBoard} from '../js/board3d.js';
import {sound,addMuteButton} from '../js/sound.js';
import {addLiteButton} from '../js/prefs.js';
addMuteButton();addLiteButton();
let state=R.initial(),history=[],timer=null,epoch=0,meshes=new Map(),frames=new Set();
const mode=document.getElementById('mode'),status=document.getElementById('status');
const board=createBoard(document.getElementById('view'),{onSquare:(c,r)=>play(r*8+c)}),T=board.THREE;
const coral=new T.MeshPhysicalMaterial({color:0xdf765c,roughness:.32,clearcoat:.65}),ivory=new T.MeshPhysicalMaterial({color:0xe6eedc,roughness:.32,clearcoat:.65}),edge=new T.MeshStandardMaterial({color:0xd7b86d,metalness:.65,roughness:.28});
const cylinder=new T.CylinderGeometry(.39,.39,.16,48),ring=new T.TorusGeometry(.31,.012,8,48);
function disc(p){const g=new T.Group(),m=new T.Mesh(cylinder,[edge,p.color===1?coral:ivory,p.color===1?ivory:coral]);m.position.y=.15;m.castShadow=m.receiveShadow=true;g.add(m);const rim=new T.Mesh(ring,edge);rim.rotation.x=Math.PI/2;rim.position.y=.235;g.add(rim);meshes.set(p.r*8+p.c,g);return g;}
function clearPending(){clearTimeout(timer);timer=null;epoch++;frames.forEach(cancelAnimationFrame);frames.clear();board.resetAnimation();}
function draw(){meshes=new Map();board.setPieces(state.board.flatMap((color,i)=>color?[{c:i%8,r:i>>3,color,side:color===1?'fire':'ice'}]:[]),disc);const moves=R.legal(state),done=R.over(state);board.setMarks({targets:done?[]:moves.map(i=>[i%8,i>>3]),last:state.last==null?[]:[[state.last%8,state.last>>3]]});const [a,b]=R.score(state);document.getElementById('coral-score').textContent=a;document.getElementById('ivory-score').textContent=b;status.textContent=done?(a===b?'Draw.':(a>b?'Coral':'Ivory')+' wins.')+` Final score ${a} - ${b}.`:(state.passed?'No legal move for '+(state.turn===1?'Ivory':'Coral')+'. Turn passes. ':'')+(state.turn===1?'Coral':'Ivory')+' to move'+(mode.value==='ai'&&state.turn===2?' · Computer thinking…':` · ${moves.length} legal moves`);document.getElementById('undo').disabled=!history.length;drawText(moves);}
function drawText(moves){const el=document.getElementById('accessible');el.replaceChildren();state.board.forEach((v,i)=>{const b=document.createElement('button'),name='abcdefgh'[i%8]+((i>>3)+1);b.textContent=v?(v===1?'●':'○'):name;b.className=v===1?'coral':v===2?'ivory':moves.includes(i)?'legal':'';b.setAttribute('aria-label',name+', '+(v===1?'Coral':v===2?'Ivory':moves.includes(i)?'legal move':'empty'));b.disabled=!!v||!moves.includes(i)||R.over(state)||(mode.value==='ai'&&state.turn===2);b.onclick=()=>play(i);el.append(b);});}
function animateFlips(indices){const start=performance.now(),token=epoch,items=indices.map(i=>meshes.get(i));function tick(now){if(token!==epoch)return;const t=Math.min(1,(now-start)/430);items.forEach(m=>{m.rotation.x=Math.PI*(1-t);m.position.y=.03+Math.sin(t*Math.PI)*.45;});if(t<1){const id=requestAnimationFrame(n=>{frames.delete(id);tick(n)});frames.add(id);}else items.forEach(m=>{m.rotation.x=0;m.position.y=.03;});}tick(start);}
function commit(i){history.push(structuredClone(state));state=R.apply(state,i);draw();animateFlips(state.flipped);sound.knock();if(R.over(state))sound.win();schedule();}
function play(i){if(R.over(state)||(mode.value==='ai'&&state.turn===2)||!R.flips(state,i).length)return;commit(i);}
function schedule(){clearTimeout(timer);timer=null;const token=epoch;if(mode.value==='ai'&&state.turn===2&&!R.over(state))timer=setTimeout(()=>{timer=null;if(token!==epoch||mode.value!=='ai'||state.turn!==2)return;const i=R.bestMove(state);if(i!==null)commit(i);},650);}
document.getElementById('new').onclick=()=>{clearPending();state=R.initial();history=[];draw();};
document.getElementById('undo').onclick=()=>{if(!history.length)return;clearPending();state=history.pop();if(mode.value==='ai'&&state.turn===2&&history.length)state=history.pop();draw();schedule();};
mode.onchange=()=>{clearPending();draw();schedule();};document.getElementById('reset-view').onclick=()=>board.resetView();document.getElementById('text-board').onclick=()=>{const el=document.getElementById('accessible');el.hidden=!el.hidden;document.getElementById('text-board').setAttribute('aria-expanded',String(!el.hidden));};
window.__reversi=()=>structuredClone(state);draw();
