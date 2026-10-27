import * as R from '../js/checkers-rules.js';
import { createBoard } from '../js/board3d.js';
import { checkerMesh } from '../js/pieces.js';
let state = R.initial(), selected = null, path = [], last = [];
const status = document.getElementById('status'), mode = document.getElementById('mode');
const board = createBoard(document.getElementById('view'), { onSquare, lightColor: 0xe8d9b5, darkColor: 0x3d2b1f });
window.__checkers = () => state;
const eq = (a, b) => a[0] === b[0] && a[1] === b[1];
function candidates() {
  // moves consistent with the squares clicked so far
  return R.legalMoves(state).filter(m => eq(m.from, selected) && path.every((p, i) => eq(m.path[i], p)));
}
function onSquare(c, r) {
  const w = R.winner(state); if (w) return;
  if (mode.value === 'ai' && state.turn === 'b') return;
  const all = R.legalMoves(state);
  if (selected) {
    const nextStep = candidates().find(m => m.path.length > path.length && eq(m.path[path.length], [c, r]));
    if (nextStep) {
      path.push([c, r]);
      const done = candidates().find(m => m.path.length === path.length);
      if (done && !candidates().some(m => m.path.length > path.length)) { commit(done); return; }
      draw(); return;
    }
  }
  const p = state.board[r * 8 + c];
  if (p && p.color === state.turn && all.some(m => eq(m.from, [c, r]))) { selected = [c, r]; path = []; } else { selected = null; path = []; }
  draw();
}
function commit(m) {
  state = R.apply(state, m); last = [m.from, m.path[m.path.length - 1]]; selected = null; path = []; draw();
  if (mode.value === 'ai' && state.turn === 'b' && !R.winner(state)) setTimeout(() => { const a = R.bestMove(state, 5); if (a) commit(a); }, 350);
}
function draw() {
  const list = [];
  state.board.forEach((p, i) => { if (p) list.push({ c: i % 8, r: (i / 8) | 0, color: p.color, king: p.king }); });
  board.setPieces(list, p => checkerMesh(p.color, p.king));
  const targets = selected ? [...new Set(candidates().filter(m => m.path.length > path.length).map(m => m.path[path.length].join()))].map(s => s.split(',').map(Number)) : [];
  board.setMarks({ selected: path.length ? path[path.length - 1] : selected, targets, last });
  const w = R.winner(state), forced = R.legalMoves(state).some(m => m.captures.length);
  status.textContent = w ? (w === 'w' ? 'White' : 'Red') + ' wins.' : (state.turn === 'w' ? 'White' : 'Red') + ' to move' + (forced ? ' - you must capture' : '');
  document.body.dataset.turn = state.turn;
}
document.getElementById('new').onclick = () => { state = R.initial(); selected = null; path = []; last = []; draw(); };
draw();
