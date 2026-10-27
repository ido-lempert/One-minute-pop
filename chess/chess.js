import { Chess } from '../lib/chess.js';
import { createBoard } from '../js/board3d.js';
import { chessMesh } from '../js/pieces.js';
import { sound, addMuteButton } from '../js/sound.js';
addMuteButton();
const game = new Chess();
let selected = null, last = [];
const sq = (c, r) => 'abcdefgh'[c] + (r + 1);
const unsq = s => [s.charCodeAt(0) - 97, +s[1] - 1];
const status = document.getElementById('status'), mode = document.getElementById('mode');
const board = createBoard(document.getElementById('view'), { onSquare });
window.__chess = game; window.__fx = board.fx;

const VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
function evalPos(g) {
  let v = 0;
  for (const row of g.board()) for (const p of row) if (p) v += (p.color === 'w' ? 1 : -1) * VAL[p.type];
  return v;
}
function search(g, d, a, b) {
  if (g.isCheckmate()) return g.turn() === 'w' ? -99999 - d : 99999 + d;
  if (g.isDraw()) return 0;
  if (d === 0) return evalPos(g);
  const ms = g.moves({ verbose: true }).sort((x, y) => (y.captured ? VAL[y.captured] : 0) - (x.captured ? VAL[x.captured] : 0));
  let best = g.turn() === 'w' ? -Infinity : Infinity;
  for (const m of ms) {
    g.move(m); const v = search(g, d - 1, a, b); g.undo();
    if (g.turn() === 'w') { best = Math.max(best, v); a = Math.max(a, v); } else { best = Math.min(best, v); b = Math.min(b, v); }
    if (b <= a) break;
  }
  return best;
}
function aiMove() {
  const ms = game.moves({ verbose: true }); if (!ms.length) return;
  let pick = null, bv = Infinity;
  for (const m of ms) { game.move(m); const v = search(game, 2, -Infinity, Infinity) + Math.random() * 10; game.undo(); if (v < bv) { bv = v; pick = m; } }
  play(pick);
}
function play(m) {
  const r = game.move(m); last = [unsq(r.from), unsq(r.to)]; selected = null; draw();
  const [tc, tr] = unsq(r.to), wx = tc - 3.5, wz = 3.5 - tr;
  if (r.captured) { const t = r.color === 'w' ? 'fire' : 'ice'; board.fx.burst(wx, 0.3, wz, t); t === 'fire' ? sound.fire() : sound.ice(); } else sound.knock();
  if (game.isCheckmate()) { sound.win(); board.fx.burst(wx, 0.3, wz, 'fire', 90); board.fx.burst(wx, 0.3, wz, 'ice', 90); } else if (game.inCheck()) sound.check();
}
function onSquare(c, r) {
  if (game.isGameOver()) return;
  if (mode.value === 'ai' && game.turn() === 'b') return;
  const s = sq(c, r);
  if (selected) {
    const mv = game.moves({ square: selected, verbose: true }).filter(m => m.to === s);
    if (mv.length) { play({ from: selected, to: s, promotion: 'q' }); if (mode.value === 'ai' && !game.isGameOver()) setTimeout(aiMove, 250); return; }
  }
  const p = game.get(s);
  selected = p && p.color === game.turn() ? s : null; draw();
}
function draw() {
  const list = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const p = game.get(sq(c, r)); if (p) list.push({ c, r, type: p.type, color: p.color }); }
  board.setPieces(list, p => chessMesh(p.type, p.color));
  board.setMarks({ selected: selected && unsq(selected), targets: selected ? game.moves({ square: selected, verbose: true }).map(m => unsq(m.to)) : [], last });
  let t;
  if (game.isCheckmate()) t = 'Checkmate. ' + (game.turn() === 'w' ? 'Black' : 'White') + ' wins.';
  else if (game.isStalemate()) t = 'Stalemate. Draw.';
  else if (game.isDraw()) t = 'Draw.';
  else t = (game.turn() === 'w' ? 'White' : 'Black') + ' to move' + (game.inCheck() ? ' - check!' : '');
  status.textContent = t; document.body.dataset.fen = game.fen();
}
document.getElementById('new').onclick = () => { game.reset(); selected = null; last = []; draw(); };
document.getElementById('undo').onclick = () => { game.undo(); if (mode.value === 'ai') game.undo(); selected = null; last = []; draw(); };
draw();
