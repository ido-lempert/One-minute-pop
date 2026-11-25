// app.js - screens, routing, daily challenge, progress storage.
import { buildSequence, bounds } from './engine.js';
import { MODELS, LEVELS, LEVEL_NAMES, getModel, dailyModel } from './models.js';
import { FoldViewer } from './viewer.js';

const $ = (sel) => document.querySelector(sel);
const STORE_KEY = 'origami-studio-v1';

function loadStore() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) || {};
  } catch {
    return {};
  }
}
function saveStore(s) {
  localStorage.setItem(STORE_KEY, JSON.stringify(s));
}
let store = loadStore();
store.completed ||= {};
store.progress ||= {};
store.daily ||= {};

const todayKey = () => new Date().toISOString().slice(0, 10);

function streak() {
  const days = Object.keys(store.daily).filter((d) => store.daily[d].done).sort();
  let n = 0;
  const d = new Date();
  for (;;) {
    const k = d.toISOString().slice(0, 10);
    if (store.daily[k]?.done) n++;
    else if (n > 0 || k === todayKey()) break;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

// ---------- routing ----------
let viewer = null;
function route() {
  const hash = location.hash || '#/';
  const [, page, arg] = hash.split('/');
  if (viewer) { viewer.dispose(); viewer = null; }
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  if (page === 'model' && getModel(arg)) showIntro(arg);
  else if (page === 'play' && getModel(arg)) showPlayer(arg, new URLSearchParams(hash.split('?')[1] || '').has('daily'));
  else showHome();
}
window.addEventListener('hashchange', route);

// ---------- home ----------
function thumbnail(model, size = 150) {
  const { states } = buildSequence(model);
  const state = model.display ? states[model.display.fromStep] : states[states.length - 1];
  const b = bounds(state);
  const c = document.createElement('canvas');
  c.width = c.height = size * 2;
  const ctx = c.getContext('2d');
  ctx.scale(2, 2);
  const pad = 0.08, w = b.w + pad * 2, h = b.h + pad * 2;
  const sc = size / Math.max(w, h);
  const ox = (size - w * sc) / 2, oy = (size - h * sc) / 2;
  const sorted = [...state.tris].sort((a, b2) => a.layer - b2.layer);
  for (const t of sorted) {
    const pts = t.v.map((i) => state.pts[i]);
    ctx.beginPath();
    pts.forEach((p, i) => {
      const x = ox + (p[0] - b.minX + pad) * sc;
      const y = size - (oy + (p[1] - b.minY + pad) * sc);
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = t.up ? model.color : model.back;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.12)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  if (model.details && !model.display) {
    const px = (p) => ox + (p[0] - b.minX + pad) * sc;
    const py = (p) => size - (oy + (p[1] - b.minY + pad) * sc);
    for (const d of model.details) {
      if (d.kind === 'eye') {
        ctx.fillStyle = '#22202a';
        ctx.beginPath(); ctx.arc(px(d.at), py(d.at), d.r * sc, 0, 7); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(px(d.at) + d.r * sc * 0.3, py(d.at) - d.r * sc * 0.3, d.r * sc * 0.35, 0, 7); ctx.fill();
      } else if (d.kind === 'dot') {
        ctx.fillStyle = d.color || '#22202a';
        ctx.beginPath(); ctx.arc(px(d.at), py(d.at), d.r * sc, 0, 7); ctx.fill();
      } else if (d.kind === 'line') {
        ctx.strokeStyle = d.color || '#22202a';
        ctx.lineWidth = (d.w || 0.006) * sc;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(px(d.pts[0]), py(d.pts[0])); ctx.lineTo(px(d.pts[1]), py(d.pts[1])); ctx.stroke();
      }
    }
  }
  return c.toDataURL();
}

const thumbs = {};
function showHome() {
  $('#screen-home').classList.add('active');
  const daily = dailyModel();
  const k = todayKey();
  const done = store.daily[k]?.done;
  $('#daily-title').textContent = daily.name;
  $('#daily-blurb').textContent = daily.blurb;
  $('#daily-level').textContent = 'Level ' + daily.level;
  $('#daily-status').textContent = done ? 'Done today - nice!' : 'Today’s challenge';
  $('#daily-img').src = thumbs[daily.id] ||= thumbnail(daily);
  $('#streak').textContent = streak();
  $('#daily-card').onclick = () => (location.hash = `#/play/${daily.id}?daily=1`);

  const cat = $('#catalog');
  cat.innerHTML = '';
  for (const lvl of LEVELS) {
    const models = MODELS.filter((m) => m.level === lvl);
    if (!models.length) continue;
    const sec = document.createElement('section');
    sec.className = 'level-section';
    sec.innerHTML = `<h2><span class="badge lvl-${lvl}">Level ${lvl}</span> ${LEVEL_NAMES[lvl]}</h2>`;
    const grid = document.createElement('div');
    grid.className = 'model-grid';
    for (const m of models) {
      const card = document.createElement('button');
      card.className = 'model-card';
      const pct = Math.round(((store.progress[m.id] || 0) / m.steps.length) * 100);
      card.innerHTML = `
        <img alt="" src="${thumbs[m.id] ||= thumbnail(m)}">
        <div class="model-name">${m.name}</div>
        <div class="model-meta">${m.steps.length} folds ${store.completed[m.id] ? '<span class="done-pill">folded ✓</span>' : pct > 0 ? `<span class="prog-pill">${pct}%</span>` : ''}</div>`;
      card.onclick = () => (location.hash = `#/model/${m.id}`);
      grid.appendChild(card);
    }
    sec.appendChild(grid);
    cat.appendChild(sec);
  }
}

// ---------- intro ----------
function showIntro(id) {
  const m = getModel(id);
  $('#screen-intro').classList.add('active');
  $('#intro-name').textContent = m.name;
  $('#intro-blurb').textContent = m.blurb;
  $('#intro-meta').textContent = `Level ${m.level} · ${m.steps.length} folds`;
  const host = $('#intro-canvas');
  host.innerHTML = '';
  viewer = new FoldViewer(host, m);
  window.__viewer = viewer;
  const { states } = buildSequence(m);
  viewer.showDisplay(states);
  $('#intro-start').onclick = () => (location.hash = `#/play/${id}`);
  $('#intro-back').onclick = () => (location.hash = '#/');
}

// ---------- player ----------
function showPlayer(id, isDaily) {
  const m = getModel(id);
  $('#screen-play').classList.add('active');
  const { states, steps } = buildSequence(m);
  let idx = store.progress[id] || 0; // how many steps done
  if (idx >= steps.length) idx = 0;
  let animating = false;

  $('#play-name').textContent = m.name + (isDaily ? ' · Daily' : '');
  const host = $('#play-canvas');
  host.innerHTML = '';
  viewer = new FoldViewer(host, m);
  window.__viewer = viewer;

  const dots = $('#step-dots');
  dots.innerHTML = steps.map((_, i) => `<span class="dot" data-i="${i}"></span>`).join('');

  function paint() {
    $('#step-title').textContent = idx < steps.length ? steps[idx].title : 'You did it!';
    $('#step-text').textContent = idx < steps.length ? steps[idx].text : `${m.name} is finished. Beautiful work!`;
    $('#step-count').textContent = idx < steps.length ? `Step ${idx + 1} of ${steps.length}` : 'Complete';
    $('#play-progress').style.width = `${(idx / steps.length) * 100}%`;
    $('#btn-prev').disabled = idx === 0 || animating;
    $('#btn-next').textContent = idx === steps.length - 1 ? 'Finish ✓' : 'Fold it →';
    $('#btn-next').disabled = idx >= steps.length || animating;
    $('#btn-replay').disabled = idx === 0 || animating;
    dots.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('done', i < idx);
      d.classList.toggle('now', i === idx);
    });
  }

  const showCurrentGuide = () => {
    if (idx < steps.length) viewer.showGuide(steps[idx].folds);
  };

  async function next() {
    if (idx >= steps.length || animating) return;
    animating = true; paint();
    for (const f of steps[idx].folds) {
      const ok = await viewer.animateFold(f.anim, f.state);
      if (!ok) { animating = false; paint(); return; }
    }
    idx++;
    store.progress[id] = idx;
    if (idx >= steps.length) {
      store.completed[id] = true;
      if (isDaily) store.daily[todayKey()] = { done: true, model: id };
      store.progress[id] = 0;
      saveStore(store);
      viewer.showDisplay(states);
      confetti();
      $('#finish-bar').classList.add('show');
    } else {
      saveStore(store);
      showCurrentGuide();
    }
    animating = false; paint();
  }

  function prev() {
    if (idx === 0 || animating) return;
    idx--;
    store.progress[id] = idx; saveStore(store);
    viewer.setState(states[idx]);
    $('#finish-bar').classList.remove('show');
    showCurrentGuide();
    paint();
  }
  function replay() {
    if (idx === 0 || animating) return;
    const stepIndex = idx - 1;
    (async () => {
      animating = true; paint();
      viewer.setState(states[stepIndex]);
      viewer.showGuide(steps[stepIndex].folds);
      await new Promise((r) => setTimeout(r, 1500)); // let the marks be seen again
      for (const f of steps[stepIndex].folds) {
        const r = await viewer.animateFold(f.anim, f.state);
        if (!r) break;
      }
      animating = false;
      showCurrentGuide();
      paint();
    })();
  }

  $('#btn-next').onclick = next;
  $('#btn-prev').onclick = prev;
  $('#btn-replay').onclick = replay;
  $('#play-back').onclick = () => (location.hash = '#/');
  $('#finish-home').onclick = () => (location.hash = '#/');
  $('#finish-next').onclick = () => {
    const same = MODELS.filter((x) => x.level === m.level && x.id !== m.id && !store.completed[x.id]);
    const pick = same[0] || MODELS.find((x) => x.level === m.level && x.id !== m.id) || m;
    location.hash = `#/model/${pick.id}`;
  };

  viewer.setState(states[idx]);
  showCurrentGuide();
  paint();
}

// ---------- confetti ----------
function confetti() {
  const c = $('#confetti');
  const ctx = c.getContext('2d');
  c.width = innerWidth; c.height = innerHeight;
  const colors = ['#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#a855f7', '#facc15'];
  const parts = Array.from({ length: 140 }, () => ({
    x: Math.random() * c.width,
    y: -20 - Math.random() * c.height * 0.4,
    w: 5 + Math.random() * 7,
    h: 8 + Math.random() * 8,
    vy: 90 + Math.random() * 160,
    vx: -40 + Math.random() * 80,
    rot: Math.random() * Math.PI,
    vr: -3 + Math.random() * 6,
    color: colors[(Math.random() * colors.length) | 0],
  }));
  const t0 = performance.now();
  (function tick(now) {
    const dt = Math.min(0.05, (now - t0) / 1000 / 60);
    ctx.clearRect(0, 0, c.width, c.height);
    let alive = false;
    for (const p of parts) {
      p.y += p.vy * dt; p.x += p.vx * dt; p.rot += p.vr * dt;
      if (p.y < c.height + 30) alive = true;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (alive) requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, c.width, c.height);
  })(t0);
}

route();
document.getElementById('splash')?.classList.add('hide');
