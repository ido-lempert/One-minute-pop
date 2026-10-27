// American checkers (English draughts). 8x8, play on dark squares (c + r) even, a1 dark.
// Board: array of 64, index r*8+c. Piece: {color:'w'|'b', king:bool} or null. White moves up (r+1).
export function initial() {
  const b = Array(64).fill(null);
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    if ((c + r) % 2) continue;
    if (r < 3) b[r * 8 + c] = { color: 'w', king: false };
    if (r > 4) b[r * 8 + c] = { color: 'b', king: false };
  }
  return { board: b, turn: 'w' };
}
const dirs = p => p.king ? [[1, 1], [-1, 1], [1, -1], [-1, -1]] : p.color === 'w' ? [[1, 1], [-1, 1]] : [[1, -1], [-1, -1]];
const inside = (c, r) => c >= 0 && c < 8 && r >= 0 && r < 8;
function jumpsFrom(board, c, r, piece, taken) {
  const out = [];
  for (const [dc, dr] of dirs(piece)) {
    const mc = c + dc, mr = r + dr, lc = c + 2 * dc, lr = r + 2 * dr;
    if (!inside(lc, lr)) continue;
    const mid = board[mr * 8 + mc];
    if (!mid || mid.color === piece.color || taken.includes(mr * 8 + mc)) continue;
    if (board[lr * 8 + lc]) continue;
    out.push({ over: [mc, mr], to: [lc, lr] });
  }
  return out;
}
// Returns list of moves: {from:[c,r], path:[[c,r],...], captures:[[c,r],...]}
export function legalMoves(state) {
  const { board, turn } = state;
  const caps = [], steps = [];
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = board[r * 8 + c];
    if (!p || p.color !== turn) continue;
    // capture sequences (DFS). Board is not mutated; the moving piece's origin counts as empty.
    const walk = (cc, cr, king, path, taken) => {
      const piece = { color: p.color, king };
      const view = board.slice(); view[r * 8 + c] = null;
      const js = jumpsFrom(view, cc, cr, piece, taken);
      if (!js.length) { if (path.length) caps.push({ from: [c, r], path, captures: taken.map(i => [i % 8, (i / 8) | 0]) }); return; }
      for (const j of js) {
        const becomesKing = king || (p.color === 'w' ? j.to[1] === 7 : j.to[1] === 0);
        const t2 = [...taken, j.over[1] * 8 + j.over[0]];
        if (becomesKing && !king) caps.push({ from: [c, r], path: [...path, j.to], captures: t2.map(i => [i % 8, (i / 8) | 0]) }); // promotion ends the move
        else walk(j.to[0], j.to[1], king, [...path, j.to], t2);
      }
    };
    walk(c, r, p.king, [], []);
    for (const [dc, dr] of dirs(p)) {
      const nc = c + dc, nr = r + dr;
      if (inside(nc, nr) && !board[nr * 8 + nc]) steps.push({ from: [c, r], path: [[nc, nr]], captures: [] });
    }
  }
  return caps.length ? caps : steps;
}
export function apply(state, move) {
  const board = state.board.slice();
  const [c, r] = move.from, p = { ...board[r * 8 + c] };
  board[r * 8 + c] = null;
  for (const [cc, cr] of move.captures) board[cr * 8 + cc] = null;
  const [ec, er] = move.path[move.path.length - 1];
  if ((p.color === 'w' && er === 7) || (p.color === 'b' && er === 0)) p.king = true;
  board[er * 8 + ec] = p;
  const quiet = move.captures.length || !state.board[r * 8 + c].king ? 0 : (state.quiet || 0) + 1;
  return { board, turn: state.turn === 'w' ? 'b' : 'w', quiet };
}
// Draw: 40 plies in a row with no capture and no man move (kings only shuffling).
export function isDraw(state) { return (state.quiet || 0) >= 40; }
export function winner(state) {
  if (isDraw(state)) return 'draw';
  return legalMoves(state).length ? null : (state.turn === 'w' ? 'b' : 'w');
}
// Simple AI: depth-limited minimax with alpha-beta on material (+ advancement).
export function evaluate(s) {
  let v = 0;
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const p = s.board[r * 8 + c]; if (!p) continue;
    const x = p.king ? 3 : 1 + (p.color === 'w' ? r : 7 - r) * 0.05;
    v += p.color === 'w' ? x : -x;
  }
  return v;
}
export function bestMove(state, depth = 4) {
  const search = (s, d, a, b) => {
    const ms = legalMoves(s);
    if (isDraw(s)) return { v: 0 };
    if (!ms.length) return { v: s.turn === 'w' ? -1000 - d : 1000 + d };
    if (d === 0) return { v: evaluate(s) };
    let best = null;
    for (const m of ms) {
      const { v } = search(apply(s, m), d - 1, a, b);
      if (s.turn === 'w') { if (best === null || v > best.v) best = { v, m }; a = Math.max(a, v); }
      else { if (best === null || v < best.v) best = { v, m }; b = Math.min(b, v); }
      if (b <= a) break;
    }
    return best;
  };
  return search(state, depth, -Infinity, Infinity).m;
}
