/* Revision planner. Page sets <html data-level> and loads meta.js, cards-data.js, then this. */
(() => {
'use strict';
const LV = document.documentElement.dataset.level;
const C = {n5: {title: 'National 5 Chemistry', exam: '2027-05-21', label: 'Fri 21 May 2027', skip: ['PS', 'OE']},
  higher: {title: 'Higher Chemistry', exam: '2027-05-21', label: 'Fri 21 May 2027', skip: ['APP', 'TECH', 'REP', 'NUM', 'OE']},
  ah: {title: 'Advanced Higher Chemistry', exam: '2027-05-21', label: 'Fri 21 May 2027', skip: ['OE']}}[LV];
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const LSget = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
const LSset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const META = window.QSMETA[LV].bank, CARDS = (window.QSCARDS || {})[LV] || {};
const TOPICS = Object.keys(META).filter(c => !C.skip.includes(c)).map(c => ({code: c, name: META[c].n}));
const KEY = 'plan:' + LV, ST = Object.assign({weak: [], spw: 3, mockWeeks: 3, plan: null, done: {}}, LSget(KEY, {}));
const save = () => LSset(KEY, ST);
const DAY = 864e5, EXAM = new Date(C.exam + 'T09:00:00');
const monday = d => { d = new Date(d.getFullYear(), d.getMonth(), d.getDate()); const w = (d.getDay() + 6) % 7; return new Date(d - w * DAY); };
const fmt = d => d.toLocaleDateString('en-GB', {day: 'numeric', month: 'short'});

function stats() {
  const r = (LSget('pp:' + LV, {}) || {}).r || {}, s = {};
  for (const k in r) { const v = r[k]; if (!v || !v.t) continue; const o = s[v.t] = s[v.t] || {g: 0, p: 0, n: 0}; o[v.r === 'got' ? 'g' : v.r === 'part' ? 'p' : 'n']++; }
  return s;
}
const score = o => { const n = o ? o.g + o.p + o.n : 0; return n < 3 ? null : Math.round(100 * (o.g + .5 * o.p) / n); };
function go(h) { try { if (parent && parent !== window && parent.HUB) return parent.HUB.go(h); } catch (e) {} location.href = '../../index.html#' + h; }

document.body.innerHTML = `
<main class="wrap">
  <h1>Revision planner: ${esc(C.title)}</h1>
  <p class="lead" id="lead"></p>
  <section class="card" id="setup">
    <h2>1. Which topics need the most work?</h2>
    <p class="muted small" style="margin:4px 0 10px">Ticked topics come up three times, spaced out. Others come up once. Your past paper scores are shown where you have tried at least 3 questions.</p>
    <div class="row" style="margin-bottom:8px"><button class="btn sm" id="pickWeak">Tick my weakest for me</button><button class="btn sm ghost" id="clearWeak">Clear ticks</button></div>
    <div class="tlist" id="tlist"></div>
    <h2 style="margin-top:18px">2. How much time do you have?</h2>
    <div class="sgrid">
      <div><label class="lb" for="spw">Revision sessions each week</label><select id="spw">${[2, 3, 4, 5, 6].map(n => `<option value="${n}">${n} sessions</option>`).join('')}</select></div>
      <div><label class="lb" for="mw">Final weeks for mock papers</label><select id="mw">${[2, 3, 4].map(n => `<option value="${n}">Last ${n} weeks</option>`).join('')}</select></div>
    </div>
    <div class="row" style="margin-top:14px"><button class="btn pri" id="make">Make my plan</button><span class="muted small" id="mkNote"></span></div>
  </section>
  <section id="planBox" hidden>
    <div class="card"><div class="row" style="justify-content:space-between"><h2>Your plan</h2><button class="btn sm ghost" id="edit">Change my plan</button></div>
      <div class="pbar" aria-hidden="true"><i id="pbar"></i></div><p class="muted small" id="ptxt" style="margin:0"></p></div>
    <div id="weeks"></div>
  </section>
</main>`;

function drawSetup() {
  const s = stats(), weak = new Set(ST.weak);
  $('#tlist').innerHTML = TOPICS.map(t => { const sc = score(s[t.code]);
    return `<label class="trow"><input type="checkbox" data-t="${esc(t.code)}" ${weak.has(t.code) ? 'checked' : ''}><span>${esc(t.name)}</span><small>${sc == null ? 'not enough tried' : sc + '% in past papers'}</small></label>`; }).join('');
  $$('#tlist input').forEach(i => i.onchange = () => { ST.weak = $$('#tlist input:checked').map(x => x.dataset.t); save(); note(); });
  $('#spw').value = ST.spw; $('#mw').value = ST.mockWeeks; note();
}
function weeksLeft() { const w0 = monday(new Date()), wE = monday(EXAM); return Math.max(0, Math.round((wE - w0) / (7 * DAY))); }
function note() {
  const W = weeksLeft(), topicWeeks = Math.max(0, W - ST.mockWeeks), slots = topicWeeks * ST.spw, need = TOPICS.length + 2 * ST.weak.length;
  $('#mkNote').textContent = W ? `${topicWeeks} weeks of topic revision · ${slots} sessions${slots < need ? ` · not enough for every repeat, so the weakest come first` : ''}` : '';
}
$('#spw').onchange = e => { ST.spw = +e.target.value; save(); note(); };
$('#mw').onchange = e => { ST.mockWeeks = +e.target.value; save(); note(); };
$('#pickWeak').onclick = () => {
  const s = stats(), scored = TOPICS.map(t => ({c: t.code, v: score(s[t.code])}));
  const known = scored.filter(x => x.v != null).sort((a, b) => a.v - b.v);
  let pick = known.filter(x => x.v < 60).slice(0, 5).map(x => x.c);
  if (pick.length < 3) pick = pick.concat(known.slice(pick.length, 3).map(x => x.c));
  if (!pick.length) { ST.weak = []; save(); drawSetup(); $('#mkNote').textContent = 'Try some past paper questions first, or tick topics yourself.'; return; }
  ST.weak = pick; save(); drawSetup();
};
$('#clearWeak').onclick = () => { ST.weak = []; save(); drawSetup(); };

function build() {
  const W = weeksLeft(), start = monday(new Date()), tw = Math.max(0, W - ST.mockWeeks), slots = tw * ST.spw;
  const order = TOPICS.map(t => t.code), weak = order.filter(c => ST.weak.includes(c)), rest = order.filter(c => !ST.weak.includes(c));
  // three rounds: learn every topic (weakest first), past papers on weak topics, then mixed recall on weak topics
  const rounds = [weak.concat(rest).map(c => [c, 'learn']), weak.map(c => [c, 'papers']), weak.map(c => [c, 'recall'])];
  let queue = rounds.flat();
  if (queue.length > slots) queue = weak.map(c => [c, 'learn']).concat(weak.map(c => [c, 'papers']), rest.map(c => [c, 'learn']), weak.map(c => [c, 'recall'])).slice(0, slots);
  while (queue.length < slots) { const extra = (weak.length ? weak : order).map(c => [c, 'papers']); if (!extra.length) break; queue = queue.concat(extra).slice(0, slots); }
  const weeks = [];
  for (let w = 0; w < W; w++) {
    const from = new Date(+start + w * 7 * DAY), mock = w >= tw;
    let ss;
    if (!mock) ss = queue.slice(w * ST.spw, (w + 1) * ST.spw).map(([c, k]) => ({c, k}));
    else { const m = w - tw + 1; ss = [{k: 'mock', m: Math.min(m, 4)}, {k: 'mistakes'}].concat(Array.from({length: Math.max(0, ST.spw - 2)}, () => ({k: 'daily'}))); }
    weeks.push({from: +from, mock, ss});
  }
  ST.plan = {made: Date.now(), weeks}; ST.done = {}; save();
}
$('#make').onclick = () => { if (!weeksLeft()) return; build(); drawPlan(); };
$('#edit').onclick = () => { $('#setup').hidden = false; $('#planBox').hidden = true; drawSetup(); scrollTo(0, 0); };

const NAME = c => (TOPICS.find(t => t.code === c) || {name: c}).name;
function sessionHTML(s, id) {
  const done = !!ST.done[id], L = [];
  let title = '', kind = '';
  if (s.k === 'learn') { title = NAME(s.c); kind = 'Learn and check';
    L.push(['Topic practice', `${LV}-notes`]); if (CARDS[s.c]) L.push(['Flashcards', `${LV}-cards-${s.c}`]); L.push(['Past papers', `${LV}-bank-topic-${s.c}`]); }
  else if (s.k === 'papers') { title = NAME(s.c); kind = 'Past paper questions'; L.push(['Past papers', `${LV}-bank-topic-${s.c}`]); L.push(['Fill the gaps', `${LV}-cloze`]); }
  else if (s.k === 'recall') { title = NAME(s.c); kind = 'Recall and retry'; if (CARDS[s.c]) L.push(['Flashcards', `${LV}-cards-${s.c}`]); L.push(['Mistakes', `${LV}-bank-mistakes`]); }
  else if (s.k === 'mock') { title = `Mock paper ${s.m}`; kind = 'Full paper under timed conditions'; L.push(['Open mock papers', `${LV}-bank-mocks`]); }
  else if (s.k === 'mistakes') { title = 'Go over your mock'; kind = 'Mark it, then work through your mistakes'; L.push(['Mistakes', `${LV}-bank-mistakes`]); }
  else { title = "Today's 10"; kind = 'Mixed questions, weighted to your weaker topics'; L.push(["Today's 10", `${LV}-bank-daily`]); }
  return `<div class="ss ${done ? 'done' : ''}"><input type="checkbox" data-id="${id}" ${done ? 'checked' : ''} aria-label="Done: ${esc(title)}"><div><span class="kind">${esc(kind)}</span><b>${esc(title)}</b>
    <div class="do">${L.map(([t, h]) => `<button type="button" class="btn sm" data-go="${esc(h)}">${esc(t)}</button>`).join('')}</div></div></div>`;
}
function drawPlan() {
  if (!ST.plan) { $('#setup').hidden = false; $('#planBox').hidden = true; return; }
  $('#setup').hidden = true; $('#planBox').hidden = false;
  const now = Date.now(), W = ST.plan.weeks;
  $('#weeks').innerHTML = W.map((w, i) => { const isNow = now >= w.from && now < w.from + 7 * DAY, past = now >= w.from + 7 * DAY;
    return `<div class="wk ${isNow ? 'now' : ''} ${w.mock ? 'mockwk' : ''}" id="w${i}"><h3><span>Week ${i + 1}${isNow ? ' · this week' : ''}${w.mock ? ' · mock papers' : ''}</span><small>from ${fmt(new Date(w.from))}${past ? ' (past)' : ''}</small></h3>
      ${w.ss.map((s, j) => sessionHTML(s, i + '.' + j)).join('')}</div>`; }).join('') + `<p class="muted small" style="margin-top:12px">Exam: ${esc(C.label)}. Tick each session when it is done. Your plan is saved in this browser.</p>`;
  $$('#weeks input[data-id]').forEach(i => i.onchange = () => { if (i.checked) ST.done[i.dataset.id] = 1; else delete ST.done[i.dataset.id]; save(); i.closest('.ss').classList.toggle('done', i.checked); prog(); });
  $$('#weeks [data-go]').forEach(b => b.onclick = () => go(b.dataset.go));
  prog();
  const cur = W.findIndex(w => now >= w.from && now < w.from + 7 * DAY); if (cur > 0) setTimeout(() => $('#w' + cur)?.scrollIntoView({block: 'start'}), 50);
}
function prog() { const total = ST.plan.weeks.reduce((s, w) => s + w.ss.length, 0), d = Object.keys(ST.done).length; $('#pbar').style.width = (total ? 100 * d / total : 0) + '%'; $('#ptxt').textContent = `${d} of ${total} sessions done`; }
const W = weeksLeft();
$('#lead').textContent = W ? `${W} week${W === 1 ? '' : 's'} until the exam on ${C.label}. Pick the topics you find hardest and the planner spreads your revision over the weeks left, finishing with mock papers.` : `The exam is this week. Use Today's 10 and your mistakes list.`;
drawSetup(); drawPlan();
})();
