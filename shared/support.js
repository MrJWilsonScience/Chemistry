/* Support options shared by every page of the hub: gentler question mix, quiz length, extra time in mocks,
   question size, read aloud and focus mode. One localStorage key ('qs:acc'), so a change in one page reaches the others.
   A page loads this script with optional data attributes:
     data-read-each="selector"  adds a small "Read aloud" button to each matching element (kept up as the page redraws)
     data-focus="selector"      elements hidden while focus mode is on
   API: window.QSSUP = {get, set, on, say, stop, panel(el), canSpeak} */
(() => {
'use strict';
const KEY = 'qs:acc';
const DEF = {mix: 'std', qlen: 10, xt: 0, zoom: 100, speak: 'on', focus: false, easy: false};
const me = document.currentScript;
const LSget = () => { try { return Object.assign({}, DEF, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { return Object.assign({}, DEF); } };
let O = LSget();
const subs = [];
const canSpeak = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;

function poke(w) { try { w.dispatchEvent(new w.StorageEvent('storage', {key: KEY})); } catch (e) {} }
function set(patch) {
  O = Object.assign(LSget(), patch);
  try { localStorage.setItem(KEY, JSON.stringify(O)); } catch (e) {}
  apply();
  /* the storage event skips the document that made the change, and some embeds drop it, so tell the others directly */
  for (let i = 0; i < window.frames.length; i++) poke(window.frames[i]);
  if (window.parent !== window) { poke(window.parent); try { const p = window.parent; for (let i = 0; i < p.frames.length; i++) if (p.frames[i] !== window) poke(p.frames[i]); } catch (e) {} }
}
const get = () => O;
const on = f => subs.push(f);
addEventListener('storage', e => { if (e.key === KEY || e.key == null) { O = LSget(); apply(); } });

/* ---------- styles ---------- */
const css = document.createElement('style');
css.textContent = `
button.qsr{display:inline-flex!important;align-items:center;justify-content:center;gap:4px;width:auto!important;max-width:max-content!important;min-width:36px;min-height:36px;height:auto;margin:0;padding:2px 10px!important;border-radius:999px!important;border:1px solid currentColor!important;background:transparent!important;color:inherit!important;opacity:.75;font:inherit;font-size:.82rem!important;font-weight:600;cursor:pointer;vertical-align:middle;line-height:1;box-shadow:none!important;transform:none!important}
.qsr:hover,.qsr:focus-visible{opacity:1!important}.qsr svg{width:16px;height:16px;flex:none}.qsr[aria-pressed=true]{opacity:1!important;background:color-mix(in srgb,currentColor 14%,transparent)!important}
.qsr.each{float:right;margin:0 0 4px 8px!important;justify-self:end!important;align-self:flex-end!important}
.qss{display:grid;gap:12px;font-size:.95rem}
.qss h4{margin:0 0 4px;font-size:.92rem}.qss p{margin:2px 0 0;font-size:.82rem;opacity:.75}
.qss .sg{display:flex;flex-wrap:wrap;border:1.5px solid color-mix(in srgb,currentColor 25%,transparent);border-radius:10px;overflow:hidden}
.qss .sg button{flex:1 1 auto;border:0;background:transparent;color:inherit;font:inherit;font-weight:700;font-size:.88rem;padding:8px 10px;min-height:40px;cursor:pointer}
.qss .sg button+button{border-left:1.5px solid color-mix(in srgb,currentColor 18%,transparent)}
.qss .sg button[aria-pressed=true]{background:var(--acc,var(--accent,#1f6fb2));color:var(--acc-ink,#fff)}
.qss .zr{display:flex;align-items:center;gap:10px}.qss input[type=range]{flex:1;accent-color:var(--acc,var(--accent,#1f6fb2));min-height:32px}
.qss .zr output{min-width:3.5em;font-weight:700;font-variant-numeric:tabular-nums}
.qss label.ck{display:flex;align-items:center;gap:8px;min-height:40px;cursor:pointer;font-weight:700}.qss label.ck input{width:20px;height:20px;accent-color:var(--acc,var(--accent,#1f6fb2))}
html[data-focus] .qs-fx{display:none!important}
html[data-easy] body{letter-spacing:.035em;word-spacing:.12em}
html[data-easy] :is(p,li,td,th,small,label,.qtext,.qtext *){line-height:1.75!important;text-align:left}
html[data-easy] .qtext,html[data-easy] .pvtext{letter-spacing:.04em;word-spacing:.16em;line-height:1.8!important}
html[data-easy] .qtext p{margin-bottom:1em!important}
html[data-easy] .qtext td,html[data-easy] .qtext th{text-align:center}`;
document.head.appendChild(css);
const focusSel = me && me.dataset.focus;
if (focusSel) { const s = document.createElement('style'); s.textContent = `html[data-focus] :is(${focusSel}){display:none!important}`; document.head.appendChild(s); }

function apply() {
  const r = document.documentElement;
  r.toggleAttribute('data-focus', !!O.focus);
  r.toggleAttribute('data-easy', !!O.easy);
  r.style.setProperty('--qz', String(Math.max(1, Math.min(2.5, (+O.zoom || 100) / 100))));
  r.toggleAttribute('data-qsspeak', canSpeak && O.speak !== 'off');
  if (O.speak === 'off') stop();
  subs.forEach(f => { try { f(O); } catch (e) {} });
}

/* ---------- read aloud (the device's own voice) ---------- */
const SPK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
let speaking = null;
/* make chemistry read sensibly: arrows, charges, units */
function tidy(t) {
  return String(t)
    .replace(/⇌/g, ' is in equilibrium with ').replace(/→|⟶|->/g, ' gives ')
    .replace(/ΔH/g, 'delta H ').replace(/ΔT/g, 'delta T ').replace(/ΔG/g, 'delta G ').replace(/ΔS/g, 'delta S ').replace(/Δ/g, 'delta ')
    .replace(/mol\s?l⁻¹/g, 'moles per litre').replace(/cm³/g, 'cubic centimetres').replace(/dm³/g, 'cubic decimetres')
    .replace(/kJ\s?mol⁻¹/g, 'kilojoules per mole').replace(/°C/g, ' degrees C').replace(/⁻¹/g, ' to the minus 1')
    .replace(/e⁻/g, 'electrons ').replace(/([A-Za-z0-9)\]])([²³⁴]?)⁺/g, '$1$2 plus ').replace(/([A-Za-z0-9)\]])([²³⁴]?)⁻/g, '$1$2 minus ')
    .replace(/[₀-₉]/g, c => String('₀₁₂₃₄₅₆₇₈₉'.indexOf(c))).replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, c => String('⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c)))
    .replace(/×/g, ' times ').replace(/÷/g, ' divided by ').replace(/−/g, ' minus ').replace(/_/g, ' ')
    .replace(/\s+/g, ' ').trim();
}
/* text of an element as a pupil sees it: drop-downs read as their choice or "blank", our own buttons skipped */
function textOf(el) {
  let out = '';
  const walk = n => {
    if (n.nodeType === 3) { out += n.nodeValue; return; }
    if (n.nodeType !== 1) return;
    if (n.classList.contains('qsr') || n.hidden || n.getAttribute('aria-hidden') === 'true') return;
    const tg = n.tagName;
    if (tg === 'SCRIPT' || tg === 'STYLE' || tg === 'BUTTON' || tg === 'svg' || tg === 'SVG') return;
    if (tg === 'SELECT') { const o = n.selectedOptions[0]; out += ' ' + (n.value && o ? o.textContent : 'blank') + ' '; return; }
    if (tg === 'INPUT' || tg === 'TEXTAREA') { out += ' ' + (n.value || 'blank') + ' '; return; }
    if (tg === 'SPAN' && n.classList.contains('fix')) return;
    if (tg === 'SUP') { out += '^'; }
    const block = /^(P|DIV|LI|H[1-6]|TR|BR|SECTION|TABLE|OL|UL)$/.test(tg);
    if (tg === 'TD' || tg === 'TH') out += ' , ';
    n.childNodes.forEach(walk);
    if (block) out += '. ';
  };
  walk(el);
  return out.replace(/\^/g, '').replace(/(\.\s*){2,}/g, '. ');
}
function stop() { if (canSpeak) speechSynthesis.cancel(); if (speaking) { speaking.setAttribute('aria-pressed', 'false'); speaking = null; } }
function say(text, btn) {
  if (!canSpeak) return;
  const again = btn && speaking === btn;
  stop(); if (again) return;
  const u = new SpeechSynthesisUtterance(tidy(text));
  u.lang = 'en-GB'; u.rate = O.speak === 'slow' ? 0.8 : 0.95;
  const v = speechSynthesis.getVoices().find(x => /en-GB/i.test(x.lang)); if (v) u.voice = v;
  if (btn) { speaking = btn; btn.setAttribute('aria-pressed', 'true'); u.onend = u.onerror = () => { if (speaking === btn) { btn.setAttribute('aria-pressed', 'false'); speaking = null; } }; }
  speechSynthesis.speak(u);
}
function readBtn(label, cls) {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'qsr' + (cls ? ' ' + cls : ''); b.setAttribute('aria-pressed', 'false');
  b.innerHTML = SPK + (label ? `<span>${label}</span>` : ''); b.title = 'Read this aloud'; b.setAttribute('aria-label', 'Read this aloud');
  return b;
}
const eachSel = me && me.dataset.readEach;
function addEach() {
  if (!eachSel || !canSpeak) return;
  const want = O.speak !== 'off';
  document.querySelectorAll(eachSel).forEach(el => {
    let b = el.querySelector(':scope > .qsr.each');
    if (!want) { if (b) b.remove(); return; }
    if (b || el.closest('[hidden]') || !el.textContent.trim()) return;
    b = readBtn('', 'each');
    b.onclick = e => { e.stopPropagation(); say(textOf(el), b); };
    el.prepend(b);
  });
}
if (eachSel && canSpeak) {
  let qd = false;
  new MutationObserver(() => { if (qd) return; qd = true; requestAnimationFrame(() => { qd = false; addEach(); }); }).observe(document.documentElement, {childList: true, subtree: true, attributes: true, attributeFilter: ['hidden']});
  on(addEach);
  addEventListener('pagehide', stop);
}
if (canSpeak) speechSynthesis.getVoices();

/* ---------- the settings panel (hub popover and the past papers page both use it) ---------- */
function panel(el) {
  const seg = (k, opts) => `<div class="sg" role="group">${opts.map(([v, l]) => `<button type="button" data-k="${k}" data-v="${v}" aria-pressed="${String(O[k]) === String(v)}">${l}</button>`).join('')}</div>`;
  const draw = () => {
    el.innerHTML = `<div class="qss">
      <div><h4>Question mix in past papers</h4>${seg('mix', [['std', 'All questions'], ['gentle', 'Gentler start']])}
        <p>Gentler start begins each topic with multiple choice and 1–2 mark questions. Longer questions join in once you score 70% on five short ones in that topic.</p></div>
      <div><h4>Quiz length</h4>${seg('qlen', [[5, '5'], [10, '10'], [15, '15']])}<p>For Today's quiz and quick quizzes. Any length counts towards your streak.</p></div>
      <div><h4>Extra time in mock papers</h4>${seg('xt', [[0, 'None'], [25, '+25%'], [50, '+50%'], [100, '+100%']])}<p>Match your exam arrangements. Mocks also have a rest break button that stops the clock.</p></div>
      <div><h4>Question size</h4><div class="zr"><input type="range" min="100" max="200" step="10" value="${O.zoom}" aria-label="Question size"><output>${O.zoom}%</output></div><p>Makes past paper questions and marking instructions bigger. Scroll sideways when they are wider than the screen.</p></div>
      ${canSpeak ? `<div><h4>Read aloud</h4>${seg('speak', [['off', 'Off'], ['on', 'On'], ['slow', 'On, slower']])}<p>Adds read-aloud buttons to topic practice, fill the gaps and flashcards, using this device's voice. Every past paper question has a read-aloud button too.</p></div>` : ''}
      <div><label class="ck"><input type="checkbox" ${O.easy ? 'checked' : ''} data-easy> Easier reading</label><p>Wider spacing between letters, words and lines, with text lined up on the left. Pair it with a question paper colour if tinted paper helps.</p></div>
      <div><label class="ck"><input type="checkbox" ${O.focus ? 'checked' : ''} data-focus> Focus mode</label><p>Hides timers, streaks, scores and the exam countdown. Your answers are still saved.</p></div>
    </div>`;
    el.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { const k = b.dataset.k, v = b.dataset.v; set({[k]: k === 'qlen' || k === 'xt' ? +v : v}); draw(); });
    const r = el.querySelector('input[type=range]'), out = el.querySelector('output');
    r.oninput = () => { out.textContent = r.value + '%'; set({zoom: +r.value}); };
    el.querySelector('[data-focus]').onchange = e => set({focus: e.target.checked});
    el.querySelector('[data-easy]').onchange = e => set({easy: e.target.checked});
  };
  draw();
  on(() => { if (!el.contains(document.activeElement)) draw(); });
}

window.QSSUP = {get, set, on, say, stop, panel, canSpeak, readBtn, textOf};
apply();
})();
