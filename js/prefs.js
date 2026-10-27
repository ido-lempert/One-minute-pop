// Effects preference shared by all games: full or lite. Lite turns off ambient snow/embers, halves bursts and caps pixel ratio at 1.
const KEY = 'games-lite';
const stored = localStorage.getItem(KEY);
let lite = stored === null ? !!(matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) : stored === '1';
const subs = new Set();
export const prefs = {
  get lite() { return lite; },
  set(v) { lite = !!v; localStorage.setItem(KEY, lite ? '1' : '0'); subs.forEach(f => f(lite)); },
  onChange(f) { subs.add(f); },
};
export function addLiteButton() {
  const h = document.querySelector('header'); if (!h) return null;
  const b = document.createElement('button'); b.id = 'lite'; b.style.padding = '6px 10px';
  const paint = () => { b.textContent = lite ? 'Effects: lite' : 'Effects: full'; b.setAttribute('aria-pressed', String(lite)); };
  b.onclick = () => { prefs.set(!lite); paint(); }; paint(); h.appendChild(b); return b;
}
