// tools/render.js - render each step of each model to SVG (top view), for
// visual verification without a browser. Usage: node tools/render.js
import { buildSequence } from '../src/engine.js';
import { MODELS } from '../src/models.js';
import { mkdirSync, writeFileSync } from 'node:fs';

mkdirSync(new URL('../out/', import.meta.url), { recursive: true });
const outDir = new URL('../out/', import.meta.url).pathname;

for (const model of MODELS) {
  const { states, steps } = buildSequence(model);
  let svgRows = [];
  states.forEach((state, si) => {
    const sorted = [...state.tris].sort((a, b) => a.layer - b.layer);
    let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    for (const p of state.pts) {
      minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]);
      minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]);
    }
    const pad = 0.06, S = 160;
    const w = maxX - minX + pad * 2, h = maxY - minY + pad * 2;
    const sc = S / Math.max(w, h);
    const ox = (S - w * sc) / 2, oy = (S - h * sc) / 2;
    const polys = sorted.map((t) => {
      const pts = t.v.map((i) => state.pts[i]);
      const s = pts.map((p) => `${(ox + (p[0] - minX + pad) * sc).toFixed(1)},${(S - oy - (p[1] - minY + pad) * sc).toFixed(1)}`).join(' ');
      const fill = t.up ? model.color : model.back;
      return `<polygon points="${s}" fill="${fill}" stroke="#333" stroke-width="0.8"/>`;
    }).join('\n');
    const label = si === 0 ? `${model.id} start` : si === states.length - 1 ? `${model.id} FINAL` : `${model.id} step ${si}`;
    svgRows.push(`<div style="display:inline-block;margin:6px;text-align:center;font:12px sans-serif">
<svg width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" style="background:#eef">${polys}</svg><br>${label}</div>`);
    // per-step text
    if (si > 0) svgRows[svgRows.length - 1] += `<!-- ${steps[si - 1].title} -->`;
  });
  writeFileSync(`${outDir}${model.id}.html`, `<!doctype html><meta charset=utf-8><body style="background:#ddd">${svgRows.join('\n')}`);
  console.log(`${model.id}: ${states.length - 1} steps -> out/${model.id}.html`);
}
