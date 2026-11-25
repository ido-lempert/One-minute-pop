// engine.js - 2D origami fold simulation (no dependencies, runs in browser and node).
//
// The paper is a set of triangles lying on the table plane (x right, y up).
// Each triangle has a layer index (stacking order) and an `up` flag (true when
// the paper's colored side faces up). Layer index z = layer * T.
//
// A fold is specified the way origami instructions read: "move this point of
// the paper to that spot". The crease is the perpendicular bisector of the
// segment from `move` to `to`; everything on the `move` side folds over by
// reflection. Triangles crossed by the crease are split along it.
//
// applyFold returns the new state plus per-triangle animation data so a
// renderer can rotate the moved part around the crease axis in 3D.

export const T = 0.004; // paper layer thickness, in paper units (paper is ~1 wide)
const EPS = 1e-7;

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (a, s) => [a[0] * s, a[1] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const len = (a) => Math.hypot(a[0], a[1]);
const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l]; };
const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const centroid = (pts) => [(pts[0][0] + pts[1][0] + pts[2][0]) / 3, (pts[0][1] + pts[1][1] + pts[2][1]) / 3];

export function makePaper(w = 1, h = 1, up = true) {
  return {
    pts: [[0, 0], [w, 0], [w, h], [0, h]],
    tris: [
      { v: [0, 1, 2], layer: 0, up },
      { v: [0, 2, 3], layer: 0, up },
    ],
    w, h,
  };
}

// signed distance from point to crease line (point m, unit normal n)
const sd = (p, m, n) => dot(sub(p, m), n);

// Sutherland-Hodgman clip of a triangle (array of 3 pts) against a half-plane.
// keepPositive=true keeps the side with sd > -EPS.
function clipTri(poly, m, n, keepPositive) {
  const out = [];
  const side = (p) => (keepPositive ? sd(p, m, n) : -sd(p, m, n));
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const sa = side(a), sb = side(b);
    const ain = sa >= -EPS, bin = sb >= -EPS;
    if (ain) out.push(a);
    if (ain !== bin) {
      const t = sa / (sa - sb);
      out.push(add(a, mul(sub(b, a), t)));
    }
  }
  return out;
}

function fanTriangulate(poly) {
  const tris = [];
  for (let i = 1; i < poly.length - 1; i++) tris.push([poly[0], poly[i], poly[i + 1]]);
  return tris;
}

// drop degenerate slivers (duplicate/collinear points from clipping): they
// have no area, render nothing, and corrupt point-in-triangle tests
const degenerate = (t) => Math.abs(signedArea(t)) < 1e-9;

// ensure CCW winding so right-hand normal tracks the colored side consistently
function signedArea(p) {
  return (p[1][0] - p[0][0]) * (p[2][1] - p[0][1]) - (p[2][0] - p[0][0]) * (p[1][1] - p[0][1]);
}
const ccw = (t) => (signedArea(t) >= 0 ? t : [t[0], t[2], t[1]]);

function pointInTri(p, t) {
  const d0 = signedArea(t);
  if (Math.abs(d0) < 1e-9) return false; // degenerate triangle contains nothing
  const d1 = signedArea([t[0], t[1], p]);
  const d2 = signedArea([t[1], t[2], p]);
  const d3 = signedArea([t[2], t[0], p]);
  const s = d0 >= 0 ? 1 : -1;
  return d1 * s >= -1e-9 && d2 * s >= -1e-9 && d3 * s >= -1e-9;
}

// spec: { move:[x,y], to:[x,y], mode?: 'all' | 'top' }
// 'top' folds only the topmost layer(s) on the moving side (for flap folds).
export function applyFold(state, spec) {
  // crease normal points toward the moving side (the `move` point)
  const n = norm(sub(spec.move, spec.to));
  const m = mid(spec.move, spec.to);
  const mode = spec.mode || 'all';

  const stayed = [];   // {pts:[3], layer, up}
  let moving = [];     // {pts:[3], layer, up}
  for (const tri of state.tris) {
    const p = tri.v.map((i) => state.pts[i]);
    const sds = p.map((q) => sd(q, m, n));
    const maxS = Math.max(...sds), minS = Math.min(...sds);
    if (maxS <= EPS) {
      stayed.push({ pts: p, layer: tri.layer, up: tri.up });
    } else if (minS > EPS) {
      moving.push({ pts: p, layer: tri.layer, up: tri.up });
    } else {
      for (const poly of fanTriangulate(clipTri(p, m, n, false))) {
        if (poly.length === 3 && !degenerate(poly)) stayed.push({ pts: ccw(poly), layer: tri.layer, up: tri.up });
      }
      for (const poly of fanTriangulate(clipTri(p, m, n, true))) {
        if (poly.length === 3 && !degenerate(poly)) moving.push({ pts: ccw(poly), layer: tri.layer, up: tri.up });
      }
    }
  }

  if (mode === 'top') {
    const keep = [];
    moving = moving.filter((a) => {
      const c = centroid(a.pts);
      const covered = moving.some((b) => b !== a && b.layer > a.layer && pointInTri(c, b.pts));
      if (covered) { keep.push(a); return false; }
      return true;
    });
    stayed.push(...keep);
  }

  // Folded stack lands on top of everything; its internal order inverts.
  const oldLayers = [...new Set(moving.map((t) => t.layer))].sort((x, y) => y - x);
  const rank = new Map(oldLayers.map((l, i) => [l, i]));
  const base = Math.max(0, ...stayed.map((t) => t.layer), ...moving.map((t) => t.layer)) + 1;

  const tris = [];
  const anim = [];
  for (const t of stayed) {
    tris.push({ v: [tris.length * 3, tris.length * 3 + 1, tris.length * 3 + 2], pts: t.pts, layer: t.layer, up: t.up });
    anim.push({ moved: false, start: t.pts, zStart: t.layer * T, zEnd: t.layer * T });
  }
  for (const t of moving) {
    // reflection reverses winding; re-normalize to CCW so the renderer's
    // side colors stay consistent (CCW copy = colored side when up)
    const reflected = ccw(t.pts.map((p) => sub(p, mul(n, 2 * sd(p, m, n)))));
    const newLayer = base + rank.get(t.layer);
    tris.push({ v: [tris.length * 3, tris.length * 3 + 1, tris.length * 3 + 2], pts: reflected, layer: newLayer, up: !t.up });
    anim.push({
      moved: true,
      start: t.pts,
      axisPoint: m,
      axisDir: [-n[1], n[0]],
      zStart: t.layer * T,
      zEnd: newLayer * T,
    });
  }

  // store soup-style: pts per triangle (index v = own offset); consumers flatten
  const pts = [];
  for (const t of tris) pts.push(...t.pts);
  const newState = { pts, tris: tris.map((t, i) => ({ v: [i * 3, i * 3 + 1, i * 3 + 2], layer: t.layer, up: t.up })), w: state.w, h: state.h };
  return { state: newState, anim };
}

// Build the full step sequence for a model. Returns { states, steps } where
// states[i] is the table state before step i (states[steps.length] = final).
export function buildSequence(model) {
  const states = [makePaper(model.w || 1, model.h || 1, model.startUp !== false)];
  const steps = [];
  for (const step of model.steps) {
    let state = states[states.length - 1];
    const folds = [];
    for (const fold of step.folds) {
      const r = applyFold(state, fold);
      state = r.state;
      folds.push({ anim: r.anim, state, spec: fold });
    }
    states.push(state);
    steps.push({ title: step.title, text: step.text, folds, state });
  }
  return { states, steps };
}

// axis-aligned bounds of a state (for camera fitting / previews)
export function bounds(state) {
  let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
  for (const p of state.pts) {
    minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]);
    minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]);
  }
  return { minX, minY, maxX, maxY, cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, w: maxX - minX, h: maxY - minY };
}
