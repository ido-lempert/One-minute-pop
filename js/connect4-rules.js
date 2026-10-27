// Connect Four: 7 columns x 6 rows. board[c][r], r=0 is the bottom. Players 1 and 2.
export const COLS = 7, ROWS = 6;
export const empty = () => Array.from({ length: COLS }, () => Array(ROWS).fill(0));
export const canDrop = (b, c) => c >= 0 && c < COLS && b[c][ROWS - 1] === 0;
export function drop(b, c, p) {
  if (!canDrop(b, c)) return null;
  const n = b.map(col => col.slice()); const r = n[c].indexOf(0); n[c][r] = p; return { board: n, row: r };
}
export function winLine(b) {
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) {
    const p = b[c][r]; if (!p) continue;
    for (const [dc, dr] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
      const cells = [[c, r]]; let ok = true;
      for (let k = 1; k < 4; k++) { const x = c + dc * k, y = r + dr * k; if (x < 0 || x >= COLS || y < 0 || y >= ROWS || b[x][y] !== p) { ok = false; break; } cells.push([x, y]); }
      if (ok) return { player: p, cells };
    }
  }
  return null;
}
export const isFull = b => b.every(col => col[ROWS - 1] !== 0);
function score(b, me) {
  let s = 0; const opp = me === 1 ? 2 : 1;
  for (let r = 0; r < ROWS; r++) if (b[3][r] === me) s += 3;
  for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) for (const [dc, dr] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
    let m = 0, o = 0, ok = true;
    for (let k = 0; k < 4; k++) { const x = c + dc * k, y = r + dr * k; if (x < 0 || x >= COLS || y < 0 || y >= ROWS) { ok = false; break; } if (b[x][y] === me) m++; else if (b[x][y] === opp) o++; }
    if (!ok) continue;
    if (m && !o) s += [0, 1, 4, 20][m] ?? 0; if (o && !m) s -= [0, 1, 4, 25][o] ?? 0;
  }
  return s;
}
export function bestColumn(b, me, depth = 5) {
  const opp = me === 1 ? 2 : 1, order = [3, 2, 4, 1, 5, 0, 6];
  const rec = (bd, d, a, bt, turn) => {
    const w = winLine(bd); if (w) return w.player === me ? 100000 + d : -100000 - d;
    if (isFull(bd)) return 0; if (d === 0) return score(bd, me);
    let best = turn === me ? -Infinity : Infinity;
    for (const c of order) { const n = drop(bd, c, turn); if (!n) continue;
      const v = rec(n.board, d - 1, a, bt, turn === 1 ? 2 : 1);
      if (turn === me) { best = Math.max(best, v); a = Math.max(a, v); } else { best = Math.min(best, v); bt = Math.min(bt, v); }
      if (bt <= a) break; }
    return best;
  };
  let pick = null, bv = -Infinity;
  for (const c of order) { const n = drop(b, c, me); if (!n) continue; const v = rec(n.board, depth - 1, -Infinity, Infinity, opp); if (v > bv) { bv = v; pick = c; } }
  return pick;
}
