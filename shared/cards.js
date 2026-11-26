/* Key-term flashcards. Page sets <html data-level> and loads meta.js, cards-data.js, then this. */
(() => {
'use strict';
const LV = document.documentElement.dataset.level;
const TITLE = {n5: 'National 5 Chemistry', higher: 'Higher Chemistry', ah: 'Advanced Higher Chemistry'}[LV];
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const LSget = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
const LSset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const DATA = (window.QSCARDS || {})[LV] || {}, META = window.QSMETA[LV].bank;
const TOPICS = Object.keys(META).filter(c => DATA[c]).map(c => ({code: c, name: META[c].n, cards: DATA[c].map(([t, d], i) => ({id: c + '|' + i, topic: c, t, d}))}));
const KEY = 'cards:' + LV, ST = Object.assign({k: {}, sel: [], learnOnly: false, flip: false, mode: 'flip'}, LSget(KEY, {}));
const save = () => LSset(KEY, ST);
const known = c => ST.k[c.id] === 1;

/* question paper colour, shared with the past papers */
const PAPERS = {white: '#ffffff', cream: '#f6eed3', pink: '#f7d3dc', yellow: '#fbf1a3', green: '#d3ecc8', purple: '#e0d4ee', blue: '#cfe4f5', orange: '#fbd7ad'};
function applyPaper() { document.documentElement.style.setProperty('--paper', PAPERS[LSget('qs:paper', 'white')] || '#fff'); document.documentElement.toggleAttribute('data-dim', !!LSget('qs:dim', false)); }
addEventListener('storage', e => { if (e.key === 'qs:paper' || e.key === 'qs:dim') applyPaper(); });
applyPaper();

document.body.innerHTML = `
<main class="wrap" data-screen="pick">
  <h1>Key terms: ${esc(TITLE)}</h1>
  <p class="lead">Flip the cards, pick from four, or type the term. Cards you are still learning come back first next time. Definitions written by Claude (AI) in course wording; check against your own notes.</p>
  <div class="card">
    <div class="row" style="justify-content:space-between"><h2>Choose topics</h2><span class="row"><button class="btn sm" id="covd" hidden>Topics covered so far</button><button class="btn sm ghost" id="all">Select all</button></span></div>
    <div class="chips2" id="tops" style="margin-top:10px"></div>
    <div class="opts"><label class="tog"><input type="checkbox" id="learnOnly"> Only cards I'm still learning</label>
      <label class="tog" id="flipRow"><input type="checkbox" id="flipOpt"> Show the definition first</label></div>
    <div class="fcmode"><span class="lb">How to practise</span><div class="seg" id="modeSeg" role="group" aria-label="How to practise">
      <button type="button" data-m="flip">Flip cards</button><button type="button" data-m="mc">Multiple choice</button><button type="button" data-m="type">Type the term</button></div>
      <p class="muted small" id="modeTxt"></p></div>
    <div class="row"><button class="btn pri" id="go">Start</button><span class="muted small" id="cnt"></span></div>
  </div>
  <p class="muted small" style="margin-top:12px" id="sum"></p>
  <div class="row" style="margin-top:4px"><button class="btn sm ghost" id="reset">Reset my flashcards</button></div>
</main>
<main class="wrap q-wrap" data-screen="study" hidden>
  <div class="qtop"><button class="btn sm" id="back">← Topics</button><span class="prog2" id="pos"></span></div>
  <button type="button" class="fc" id="fc" aria-pressed="false" aria-live="polite"><div class="in"><div class="face front"><span class="tag" id="tagF"></span><div id="front"></div><span class="hint">Tap or press Space to flip</span></div><div class="face back"><span class="tag" id="tagB"></span><div id="backTxt"></div></div></div></button>
  <div class="fcq" id="fcq" hidden><div class="face"><span class="tag" id="tagQ"></span><p class="def" id="qDef"></p></div><div id="qAct"></div><div class="fcfb" id="qFb" aria-live="polite"></div></div>
  <div class="fcread" id="fcread"></div>
  <div class="fcbar" id="fcbar"><button class="btn learn" id="learn">Still learning <small class="muted">(1)</small></button><button class="btn know" id="know">Know it <small class="muted">(2)</small></button></div>
</main>
<main class="wrap" data-screen="end" hidden>
  <div class="card panel"><h2>Set finished</h2><p class="score" id="eScore"></p><p class="muted" id="eMsg"></p>
  <div class="row"><button class="btn pri" id="again">Go again with the ones I'm still learning</button><button class="btn" id="eBack">Back to topics</button></div></div>
</main>`;
function show(n) { $$('[data-screen]').forEach(s => s.hidden = s.dataset.screen !== n); scrollTo(0, 0); }

function drawPick() {
  const sel = new Set(ST.sel);
  $('#tops').innerHTML = TOPICS.map(t => { const k = t.cards.filter(known).length;
    return `<button type="button" data-t="${esc(t.code)}" aria-pressed="${sel.has(t.code)}">${esc(t.name)} <small>${k}/${t.cards.length}</small></button>`; }).join('');
  $$('#tops [data-t]').forEach(b => b.onclick = () => { const c = b.dataset.t; ST.sel = sel.has(c) ? ST.sel.filter(x => x !== c) : ST.sel.concat(c); save(); drawPick(); });
  $('#learnOnly').checked = ST.learnOnly; $('#flipOpt').checked = ST.flip;
  $$('#modeSeg [data-m]').forEach(b => b.setAttribute('aria-pressed', b.dataset.m === ST.mode));
  $('#flipRow').hidden = ST.mode !== 'flip';
  $('#modeTxt').textContent = {flip: 'Think of the answer, flip the card, then say whether you knew it.', mc: 'Read the definition and pick the matching term from four. A good place to start on a new topic.', type: 'Read the definition and type the term from memory. Small spelling slips are allowed.'}[ST.mode];
  const deck = makeDeck(); $('#cnt').textContent = ST.sel.length ? `${deck.length} card${deck.length === 1 ? '' : 's'}` : 'Pick at least one topic';
  $('#go').disabled = !deck.length;
  $('#all').textContent = ST.sel.length === TOPICS.length ? 'Clear all' : 'Select all';
  const all = TOPICS.flatMap(t => t.cards), k = all.filter(known).length;
  $('#sum').textContent = `You know ${k} of ${all.length} key terms for ${TITLE}. Saved in this browser.`;
}
function makeDeck() {
  const cards = TOPICS.filter(t => ST.sel.includes(t.code)).flatMap(t => t.cards).filter(c => !ST.learnOnly || !known(c));
  const learning = shuffle(cards.filter(c => ST.k[c.id] === 0)), fresh = shuffle(cards.filter(c => ST.k[c.id] == null)), done = shuffle(cards.filter(known));
  return learning.concat(fresh, done);
}
const covSet = () => { const a = LSget('qs:covered:' + LV, null); return Array.isArray(a) && a.length ? a : null; };
$('#covd').hidden = !covSet();
$('#covd').onclick = () => { ST.sel = TOPICS.map(t => t.code).filter(c => covSet().includes(c)); save(); drawPick(); };
$('#all').onclick = () => { ST.sel = ST.sel.length === TOPICS.length ? [] : TOPICS.map(t => t.code); save(); drawPick(); };
$('#learnOnly').onchange = e => { ST.learnOnly = e.target.checked; save(); drawPick(); };
$('#flipOpt').onchange = e => { ST.flip = e.target.checked; save(); };
$$('#modeSeg [data-m]').forEach(b => b.onclick = () => { ST.mode = b.dataset.m; save(); drawPick(); });
$('#reset').onclick = () => { const b = $('#reset'); if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = 'Tap again to reset'; setTimeout(() => { delete b.dataset.sure; b.textContent = 'Reset my flashcards'; }, 4000); return; } ST.k = {}; save(); delete b.dataset.sure; b.textContent = 'Reset my flashcards'; drawPick(); };

let deck = [], pos = 0, res = [];
function start(list) { deck = list; pos = 0; res = []; if (!deck.length) return; show('study'); drawCard(); }
$('#go').onclick = () => start(makeDeck());
/* multiple choice and typing modes */
const norm = s => String(s).toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/\(.*?\)/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
function lev(a, b) { const m = a.length, n = b.length, d = Array.from({length: m + 1}, (_, i) => [i]); for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[m][n]; }
function closeEnough(typed, term) {
  const a = norm(typed), alts = [term].concat(String(term).split(/\s*(?:\/|\bor\b)\s*/)).map(norm).filter(Boolean);
  if (!a) return 0;
  let best = 9; alts.forEach(b => { const d = lev(a, b); best = Math.min(best, d <= Math.max(1, Math.floor(b.length / 8)) ? 0 : d <= Math.max(2, Math.floor(b.length / 4)) ? 1 : 9); });
  return best === 0 ? 2 : best === 1 ? 1 : 0; /* 2 right, 1 nearly, 0 wrong */
}
function options(c) {
  const same = TOPICS.find(t => t.code === c.topic).cards.filter(x => x.id !== c.id && norm(x.t) !== norm(c.t));
  let pool = shuffle(same).slice(0, 3);
  if (pool.length < 3) pool = pool.concat(shuffle(TOPICS.flatMap(t => t.cards).filter(x => x.topic !== c.topic && !pool.includes(x))).slice(0, 3 - pool.length));
  return shuffle(pool.concat(c));
}
let answered = false;
function drawQuizCard(c, t) {
  answered = false;
  $('#tagQ').textContent = t.name; $('#qDef').textContent = c.d; $('#qFb').innerHTML = '';
  if (ST.mode === 'mc') {
    const ops = options(c);
    $('#qAct').innerHTML = `<div class="fcops" role="group" aria-label="Which term matches this definition?">${ops.map((o, i) => `<button type="button" class="btn" data-o="${esc(o.id)}"><b>${i + 1}</b> ${esc(o.t)}</button>`).join('')}</div>`;
    $$('#qAct [data-o]').forEach(b => b.onclick = () => pickOpt(b));
  } else {
    $('#qAct').innerHTML = `<form class="fctype" id="tForm" autocomplete="off"><label class="lb" for="tIn">Type the term</label><div class="row"><input type="text" id="tIn" autocapitalize="off" spellcheck="false"><button class="btn pri">Check</button></div><button type="button" class="btn sm ghost" id="tSkip">I don't know</button></form>`;
    $('#tForm').onsubmit = e => { e.preventDefault(); checkTyped(); };
    $('#tSkip').onclick = () => { $('#tIn').value = ''; checkTyped(true); };
    setTimeout(() => $('#tIn') && $('#tIn').focus({preventScroll: true}), 50);
  }
}
function after(ok, html) {
  answered = true; const c = deck[pos];
  $('#qFb').innerHTML = `<p class="verdict ${ok ? 'ok' : 'no'}">${html}</p><div class="row"><button class="btn pri" id="qNext">${pos < deck.length - 1 ? 'Next card →' : 'Finish'}</button>${ok ? '' : '<button class="btn sm ghost" id="qOver">I was right</button>'}</div>`;
  ST.k[c.id] = ok ? 1 : 0; save(); res[pos] = ok;
  $('#qNext').onclick = next; $('#qNext').focus({preventScroll: true});
  if ($('#qOver')) $('#qOver').onclick = () => { ST.k[c.id] = 1; res[pos] = true; save(); next(); };
  drawPos();
}
function pickOpt(b) {
  if (answered) return; const c = deck[pos], ok = b.dataset.o === c.id;
  $$('#qAct [data-o]').forEach(x => { x.disabled = true; if (x.dataset.o === c.id) x.classList.add('right'); else if (x === b) x.classList.add('wrong'); });
  after(ok, ok ? 'Correct.' : `Not this time. The answer is <b>${esc(c.t)}</b>.`);
}
function checkTyped(skip) {
  if (answered) return; const c = deck[pos], v = $('#tIn').value, r = skip ? 0 : closeEnough(v, c.t);
  if (!skip && !v.trim()) return $('#tIn').focus();
  $('#tIn').disabled = true; $$('#tForm button').forEach(x => x.disabled = true);
  if (r === 2) after(true, norm(v) === norm(c.t) ? 'Correct.' : `Correct. Check the spelling: <b>${esc(c.t)}</b>.`);
  else if (r === 1) after(false, `Nearly. The term is <b>${esc(c.t)}</b>.`);
  else after(false, skip ? `The term is <b>${esc(c.t)}</b>.` : `Not quite. The term is <b>${esc(c.t)}</b>.`);
}
function next() { if (pos < deck.length - 1) { pos++; drawCard(); } else end(); }
function drawPos() { $('#pos').innerHTML = `<span>${pos + 1} of ${deck.length}</span><span>${res.filter(x => x).length} known</span>`; }
function drawRead(c) {
  const el = $('#fcread'); el.innerHTML = '';
  const S = window.QSSUP; if (!S || !S.canSpeak || S.get().speak === 'off') return;
  const b = S.readBtn('Read aloud'); el.appendChild(b);
  b.onclick = () => { const flipped = $('#fc').getAttribute('aria-pressed') === 'true', F = ST.flip;
    const txt = ST.mode !== 'flip' ? c.d + (answered ? '. The term is ' + c.t : '') : flipped ? c.t + '. ' + c.d : F ? c.d : c.t;
    S.say(txt, b); };
}
if (window.QSSUP) QSSUP.on(() => { if (!$('[data-screen=study]').hidden && deck[pos]) drawRead(deck[pos]); });
function drawCard() {
  const c = deck[pos], t = TOPICS.find(x => x.code === c.topic), F = ST.flip;
  if (window.QSSUP) QSSUP.stop();
  const quizMode = ST.mode !== 'flip';
  $('#fc').hidden = quizMode; $('#fcbar').hidden = quizMode; $('#fcq').hidden = !quizMode;
  drawRead(c);
  if (quizMode) { drawQuizCard(c, t); drawPos(); return; }
  $('#fc').setAttribute('aria-pressed', 'false');
  $('#front').innerHTML = F ? `<p class="def">${esc(c.d)}</p>` : `<p class="term">${esc(c.t)}</p>`;
  $('#backTxt').innerHTML = F ? `<p class="term">${esc(c.t)}</p>` : `<p class="term" style="font-size:1.1rem;margin:0 0 10px">${esc(c.t)}</p><p class="def">${esc(c.d)}</p>`;
  $('#tagF').textContent = $('#tagB').textContent = t.name;
  $('#fc').setAttribute('aria-label', `Card ${pos + 1} of ${deck.length}. ${F ? 'Definition' : 'Term'}: ${F ? c.d : c.t}. Tap to flip.`);
  $('#pos').innerHTML = `<span>${pos + 1} of ${deck.length}</span><span>${res.filter(x => x).length} known</span>`;
}
function flip() { const f = $('#fc'), on = f.getAttribute('aria-pressed') !== 'true'; f.setAttribute('aria-pressed', on); const c = deck[pos]; f.setAttribute('aria-label', on ? `${c.t}: ${c.d}` : `Card ${pos + 1} of ${deck.length}. Tap to flip.`); }
$('#fc').onclick = flip;
function mark(k) {
  const c = deck[pos]; ST.k[c.id] = k ? 1 : 0; save(); res[pos] = k;
  if (pos < deck.length - 1) { pos++; drawCard(); } else end();
}
$('#learn').onclick = () => mark(false); $('#know').onclick = () => mark(true);
function end() {
  const k = res.filter(Boolean).length, miss = deck.filter((_, i) => !res[i]);
  show('end'); if (window.QSSUP) QSSUP.stop(); $('#eScore').textContent = `${k} / ${deck.length} known`;
  $('#eMsg').textContent = miss.length ? `${miss.length} still to learn. They will come up first next time.` : 'You knew every card in this set.';
  $('#again').hidden = !miss.length; $('#again').onclick = () => start(shuffle(miss));
}
$('#back').onclick = () => { show('pick'); drawPick(); };
$('#eBack').onclick = () => { show('pick'); drawPick(); };
document.addEventListener('keydown', e => {
  if ($('[data-screen=study]').hidden || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
  if (ST.mode === 'mc') { const b = $$('#qAct [data-o]')[+e.key - 1]; if (b && !answered) pickOpt(b); else if (answered && e.key === 'Enter' && e.target.tagName !== 'BUTTON') next(); return; }
  if (ST.mode === 'type') return;
  if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); flip(); }
  else if (e.key === '1') mark(false); else if (e.key === '2') mark(true);
});
function fromHash() { const c = decodeURIComponent(location.hash.slice(1)); if (TOPICS.some(t => t.code === c)) { ST.sel = [c]; save(); drawPick(); start(makeDeck()); } }
addEventListener('hashchange', fromHash);
if (!ST.sel.length) ST.sel = TOPICS.map(t => t.code).filter(c => !covSet() || covSet().includes(c));
drawPick(); fromHash();
})();
