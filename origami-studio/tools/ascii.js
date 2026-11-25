// ascii.js - quick text rendering of a model's fold sequence for iteration.
// usage: node tools/ascii.js <model-id> [stepIndex|-1 for final]
// The final state is shown in display orientation (finalRotate applied).
import { MODELS } from '../src/models.js';
import { buildSequence, bounds } from '../src/engine.js';

const id = process.argv[2];
const onlyStep = process.argv[3] !== undefined ? parseInt(process.argv[3]) : null;
const m = MODELS.find((x) => x.id === id);
if (!m) { console.error('no model', id); process.exit(1); }
const { states } = buildSequence(m);

const inTri = (p, t) => {
  const s = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]);
  const sg = s(t[0], t[1], t[2]) >= 0 ? 1 : -1;
  return sg * s(t[0], t[1], p) >= -1e-9 && sg * s(t[1], t[2], p) >= -1e-9 && sg * s(t[2], t[0], p) >= -1e-9;
};

function render(state, label, rotDeg = 0) {
  const b0 = bounds(state);
  const cx = (b0.minX + b0.maxX) / 2, cy = (b0.minY + b0.maxY) / 2;
  const th = (rotDeg * Math.PI) / 180;
  const rot = (p) => {
    const x = p[0] - cx, y = p[1] - cy;
    return [cx + x * Math.cos(th) - y * Math.sin(th), cy + x * Math.sin(th) + y * Math.cos(th)];
  };
  const tris = state.tris.map((t) => ({ pts: t.v.map((i) => rot(state.pts[i])), layer: t.layer, up: t.up }));
  let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
  for (const t of tris) for (const p of t.pts) {
    minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]);
    minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]);
  }
  const W = 56, H = 24;
  const sc = Math.max((maxX - minX) / W, (maxY - minY) / H) || 1;
  const grid = Array.from({ length: H }, () => Array(W).fill(' '));
  for (let gy = 0; gy < H; gy++) {
    for (let gx = 0; gx < W; gx++) {
      const p = [minX + (gx + 0.5) * sc, maxY - (gy + 0.5) * sc];
      let best = null;
      for (const t of tris) {
        const a = t.pts;
        if (Math.abs((a[1][0]-a[0][0])*(a[2][1]-a[0][1])-(a[2][0]-a[0][0])*(a[1][1]-a[0][1])) < 1e-9) continue;
        if (inTri(p, t.pts) && (!best || t.layer > best.layer)) best = t;
      }
      if (best) grid[gy][gx] = best.up ? '#' : '.';
    }
  }
  console.log(`--- ${label}`);
  console.log(grid.map((r) => r.join('')).join('\n'));
}

const idxs = onlyStep === null ? states.map((_, i) => i) : [onlyStep < 0 ? states.length - 1 : onlyStep];
for (const i of idxs) {
  const isFinal = i === states.length - 1;
  render(states[i], `${id} state ${i}${isFinal ? ' (final, display orientation)' : ''}`, isFinal ? (m.finalRotate || 0) : 0);
}
