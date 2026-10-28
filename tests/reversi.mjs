import assert from 'node:assert/strict';import * as R from '../js/reversi-rules.js';
let n=0;function test(name,f){f();console.log('PASS',++n,name);}
test('opening four legal moves',()=>assert.deepEqual(R.legal(R.initial()),[19,26,37,44]));
test('opening flip and immutable input',()=>{const s=R.initial(),a=R.apply(s,19);assert.equal(s.board[27],2);assert.equal(a.board[27],1);assert.deepEqual(R.score(a),[4,1]);assert.equal(a.turn,2)});
test('illegal occupied/empty/outside rejected',()=>{for(const i of [27,0,-1,64])assert.throws(()=>R.apply(R.initial(),i));});
test('all eight directions flipped',()=>{const board=Array(64).fill(0);for(const [dx,dy] of [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]]){board[(3+dy)*8+3+dx]=2;board[(3+2*dy)*8+3+2*dx]=1;}assert.equal(R.flips({board,turn:1},27).length,8)});
test('row boundary does not wrap',()=>{const board=Array(64).fill(0);board[8]=2;board[9]=1;assert.deepEqual(R.flips({board,turn:1},7),[])});
test('unbracketed line not captured',()=>{const board=Array(64).fill(0);board[1]=2;assert.deepEqual(R.flips({board,turn:1},0),[])});
test('pass returns turn to same side',()=>{const board=Array(64).fill(1);board[0]=board[2]=0;board[8]=board[3]=2;const s=R.apply({board,turn:1},0);assert.equal(s.passed,true);assert.equal(s.turn,1);assert.deepEqual(R.legal(s),[2]);assert.equal(R.over(s),false)});
test('finished with empty squares',()=>{const board=Array(64).fill(1);board[0]=0;assert.equal(R.over({board,turn:2}),true)});
test('AI takes available corner',()=>{const board=Array(64).fill(0);board[1]=2;board[2]=1;board[27]=1;board[28]=2;assert.equal(R.bestMove({board,turn:1}),0)});
test('200 full deterministic selfplay games legal and terminate',()=>{for(let seed=1;seed<=200;seed++){let s=R.initial(),plies=0,r=seed;while(!R.over(s)){const moves=R.legal(s);assert.ok(moves.length);r=(r*1664525+1013904223)>>>0;const i=plies%2?R.bestMove(s):moves[r%moves.length];assert.ok(moves.includes(i));s=R.apply(s,i);assert.ok(++plies<=60);}assert.ok(R.score(s).reduce((a,b)=>a+b)<=64);}});
