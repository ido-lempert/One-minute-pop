import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as Checkers from '../js/checkers-rules.js';
import * as C4 from '../js/connect4-rules.js';
import {Chess} from '../lib/chess.js';
let results=[];
function test(name, f){try{f();results.push({name,pass:true})}catch(e){results.push({name,pass:false,error:e.message})}}
const noop=()=>{};
function harness(name){
const els={status:{},mode:{value:'ai'},new:{},undo:{}};const timers=new Map();let nextTimer=1;
const board={fx:{burst:noop,clear:noop},resetAnimation:noop,setPieces:noop,setMarks:noop,captureAt:noop,animateMove:noop};
let code=fs.readFileSync(`${process.env.QA_ROOT||process.cwd()}/${name}/${name}.js`,'utf8').replace(/^import .*;\n/gm,'');
code+='\nwindow.__tap=onSquare;';
const ctx={Chess,R:Checkers,createBoard:()=>board,chessMesh:noop,checkerMesh:noop,sound:new Proxy({},{get:()=>noop}),addMuteButton:noop,addLiteButton:noop,document:{getElementById:id=>els[id]||{},body:{dataset:{}}},window:{},setTimeout:(f,ms)=>{const id=nextTimer++;timers.set(id,f);return id},clearTimeout:id=>{timers.delete(id)},Math};
vm.runInNewContext(code,ctx);return {ctx,els,timers,tap:ctx.window.__tap,flush:()=>{let n=0;while(timers.size&&n++<10){const [id,f]=timers.entries().next().value;timers.delete(id);f()}}};
}
test('chess opening legal move and AI response',()=>{const h=harness('chess');h.tap(4,1);h.tap(4,3);assert.equal(h.ctx.window.__chess.history().length,1);h.flush();assert.equal(h.ctx.window.__chess.history().length,2)});
test('chess New cancels pending AI',()=>{const h=harness('chess');h.tap(4,1);h.tap(4,3);h.els.new.onclick();h.flush();assert.equal(h.ctx.window.__chess.history().length,0)});
test('chess Undo cancels pending AI',()=>{const h=harness('chess');h.tap(4,1);h.tap(4,3);h.els.undo.onclick();h.flush();assert.equal(h.ctx.window.__chess.history().length,0)});
test('chess switching to two players cancels pending AI',()=>{const h=harness('chess');h.tap(4,1);h.tap(4,3);h.els.mode.value='two';h.els.mode.onchange?.();h.flush();assert.equal(h.ctx.window.__chess.history().length,1)});
test('chess switching two-player black turn to AI schedules response',()=>{const h=harness('chess');h.els.mode.value='two';h.tap(4,1);h.tap(4,3);h.els.mode.value='ai';h.els.mode.onchange?.();h.flush();assert.equal(h.ctx.window.__chess.turn(),'w')});
test('checkers opening legal move and AI response',()=>{const h=harness('checkers');h.tap(0,2);h.tap(1,3);assert.equal(h.ctx.window.__checkers().turn,'b');h.flush();assert.equal(h.ctx.window.__checkers().turn,'w')});
test('checkers New cancels pending AI',()=>{const h=harness('checkers');h.tap(0,2);h.tap(1,3);h.els.new.onclick();h.flush();assert.deepEqual(h.ctx.window.__checkers().board,Checkers.initial().board);assert.equal(h.ctx.window.__checkers().turn,'w')});
test('checkers switching to two players cancels pending AI',()=>{const h=harness('checkers');h.tap(0,2);h.tap(1,3);h.els.mode.value='two';h.els.mode.onchange?.();h.flush();assert.equal(h.ctx.window.__checkers().turn,'b')});
test('checkers switching two-player black turn to AI schedules response',()=>{const h=harness('checkers');h.els.mode.value='two';h.tap(0,2);h.tap(1,3);h.els.mode.value='ai';h.els.mode.onchange?.();h.flush();assert.equal(h.ctx.window.__checkers().turn,'w')});
test('checkers forced capture suppresses quiet moves',()=>{const s={board:Array(64).fill(null),turn:'w'};s.board[2*8+2]={color:'w',king:false};s.board[3*8+3]={color:'b',king:false};s.board[0]={color:'w',king:false};assert.equal(Checkers.legalMoves(s).length,1);assert.equal(Checkers.legalMoves(s)[0].captures.length,1)});
test('checkers multi-jump removes both pieces',()=>{const s={board:Array(64).fill(null),turn:'w'};s.board[0]={color:'w',king:false};s.board[9]={color:'b',king:false};s.board[27]={color:'b',king:false};const m=Checkers.legalMoves(s)[0];assert.equal(m.path.length,2);assert.equal(Checkers.apply(s,m).board.filter(Boolean).length,1)});
test('checkers promotion ends jump',()=>{const s={board:Array(64).fill(null),turn:'w'};s.board[5*8+1]={color:'w',king:false};s.board[6*8+2]={color:'b',king:false};s.board[6*8+4]={color:'b',king:false};const m=Checkers.legalMoves(s)[0];assert.equal(m.path.length,1);assert.equal(Checkers.apply(s,m).board[7*8+3].king,true)});
test('Connect Four all 4 win directions',()=>{for(const [dc,dr,start] of [[1,0,[0,0]],[0,1,[0,0]],[1,1,[0,0]],[1,-1,[0,4]]]){const b=C4.empty();for(let k=0;k<4;k++)b[start[0]+k*dc][start[1]+k*dr]=1;assert.equal(C4.winLine(b).player,1)}});
test('Connect Four full column rejects and board immutable',()=>{let b=C4.empty();for(let i=0;i<6;i++){const n=C4.drop(b,2,i%2+1);assert.equal(b[2][i],0);b=n.board}assert.equal(C4.drop(b,2,1),null)});
test('Connect Four AI takes immediate win and blocks threat',()=>{for(const p of [1,2]){const b=C4.empty();b[0][0]=b[1][0]=b[2][0]=p;assert.equal(C4.bestColumn(b,2,5),3)}});
test('chess illegal move does not change position',()=>{const h=harness('chess');h.els.mode.value='two';const fen=h.ctx.window.__chess.fen();h.tap(4,1);h.tap(4,4);assert.equal(h.ctx.window.__chess.fen(),fen)});
test('chess two-player Undo restores exactly one ply',()=>{const h=harness('chess');h.els.mode.value='two';h.tap(4,1);h.tap(4,3);h.tap(4,6);h.tap(4,4);h.els.undo.onclick();assert.equal(h.ctx.window.__chess.history().length,1);assert.equal(h.ctx.window.__chess.turn(),'b')});
test('chess checkmate stops further board input',()=>{const h=harness('chess');h.els.mode.value='two';const g=h.ctx.window.__chess;g.load('rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3');assert.equal(g.isCheckmate(),true);const fen=g.fen();h.tap(4,1);h.tap(4,3);assert.equal(g.fen(),fen)});
test('chess queen promotion works through controller',()=>{const h=harness('chess');h.els.mode.value='two';const g=h.ctx.window.__chess;g.load('7k/P7/8/8/8/8/8/7K w - - 0 1');h.tap(0,6);h.tap(0,7);assert.equal(g.get('a8').type,'q')});
test('checkers invalid square and forced-capture enforcement',()=>{const h=harness('checkers');h.els.mode.value='two';const s=h.ctx.window.__checkers();s.board=Array(64).fill(null);s.board[18]={color:'w',king:false};s.board[27]={color:'b',king:false};s.board[0]={color:'w',king:false};h.tap(0,0);h.tap(1,1);assert.equal(s.turn,'w');assert.equal(s.board[0].color,'w');h.tap(2,2);h.tap(4,4);assert.equal(h.ctx.window.__checkers().turn,'b');assert.equal(h.ctx.window.__checkers().board[27],null)});
test('checkers controller completes multi-jump only after last landing',()=>{const h=harness('checkers');h.els.mode.value='two';const s=h.ctx.window.__checkers();s.board=Array(64).fill(null);s.board[0]={color:'w',king:false};s.board[9]={color:'b',king:false};s.board[27]={color:'b',king:false};s.board[63]={color:'b',king:false};h.tap(0,0);h.tap(2,2);assert.equal(s.turn,'w');h.tap(4,4);assert.equal(h.ctx.window.__checkers().turn,'b');assert.equal(h.ctx.window.__checkers().board[36].color,'w')});
test('checkers no legal move awards opposite player win',()=>{const s={board:Array(64).fill(null),turn:'b'};s.board[0]={color:'b',king:false};s.board[63]={color:'w',king:false};assert.equal(Checkers.winner(s),'w')});
test('chess completed AI pair Undo restores opening and no callback',()=>{const h=harness('chess');h.tap(4,1);h.tap(4,3);h.flush();h.els.undo.onclick();h.flush();assert.equal(h.ctx.window.__chess.history().length,0)});
test('chess repeated AI/two toggles leave exactly one pending reply',()=>{const h=harness('chess');h.tap(4,1);h.tap(4,3);for(let i=0;i<5;i++){h.els.mode.value='two';h.els.mode.onchange?.();h.els.mode.value='ai';h.els.mode.onchange?.()}h.flush();assert.equal(h.ctx.window.__chess.history().length,2)});
test('checkers repeated AI/two toggles leave one reply',()=>{const h=harness('checkers');h.tap(0,2);h.tap(1,3);for(let i=0;i<5;i++){h.els.mode.value='two';h.els.mode.onchange?.();h.els.mode.value='ai';h.els.mode.onchange?.()}h.flush();assert.equal(h.ctx.window.__checkers().turn,'w');assert.equal(h.timers.size,0)});
console.log(JSON.stringify({source:'local controller and rules regression',passed:results.filter(x=>x.pass).length,failed:results.filter(x=>!x.pass).length,results},null,2));

if(results.some(x=>!x.pass))process.exitCode=1;
