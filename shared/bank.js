/* Shared past paper question bank: one app for N5, Higher and AH.
   Each level page sets <html data-level="n5|higher|ah"> and loads this script.
   Level adapters below turn each course's data files into one common shape:
   topic {code,name,unit,sym,count,subs:[{id,name,n}]}
   item  {id,topic,year,kind:'mc'|'s2',label,short,paper,marks,qimg,key,why,mi,oe,cur,notes,subs} */
(() => {
'use strict';
const LV = document.documentElement.dataset.level;
const FORM_URL = 'https://forms.cloud.microsoft/e/6s21bbcSFP';
const SITE = (() => { try { return top.location.href.split('#')[0]; } catch (e) { return location.href.split('#')[0]; } })();
const SECS_PER_MARK = 90;
const $ = s => document.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
const J = p => fetch(p).then(r => { if (!r.ok) throw new Error(p); return r.json(); });
const LSget = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
const LSset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const qnum = s => { const m = String(s).match(/(\d+)/); return m ? +m[1] : 0; };
const shortOf = label => String(label).replace(/^Question\s*/, 'Q');
const RN = {g: 'got', p: 'part', n: 'not', got: 'got', part: 'part', not: 'not'};
const AHchem = s => esc(s).replace(/_(\d+|x2−y2|z2)/g, '<sub>$1</sub>').replace(/_(xy|xz|yz|In|a|w|l|s|r|f|b)(?![A-Za-z])/g, '<sub>$1</sub>').replace(/\^([0-9+\-−δ]+)/g, '<sup>$1</sup>');
const groupsOf = (o, spec) => spec.map(([h, k]) => [h, o[k] || []]).filter(([, a]) => a.length);
const latest = y => y >= 2024;

/* ---------------- level adapters ---------------- */
const AD = {
  n5: {
    title: 'National 5 Chemistry', short: 'N5',
    exam: {at: '2027-05-21T13:00:00+01:00', label: 'Fri 21 May 2027, 1 pm'},
    paper: {mc: 20, wr: 60, mins: 120},
    units: {1: 'Unit 1 · Chemical changes and structure', 2: 'Unit 2 · Nature’s chemistry', 3: 'Unit 3 · Chemistry in society', 0: 'Skills'},
    papers: [['all', 'All papers', () => true], ['2015', '2015 onwards', y => y >= 2015], ['2022', '2022 onwards', y => y >= 2022],
      ['last3', 'Most recent (2024 onwards + specimen)', latest], ['spec', 'Specimen paper only', y => y === 2027]],
    yname: y => y === 2020 ? '2020*' : y === 2027 ? 'Specimen' : String(y),
    foot: '2020* is the undated 2020 paper. Specimen is the QS specimen question paper for the 2027 exam.',
    fmt: esc,
    async index() {
      const [ix, st] = await Promise.all([J('index.json'), J('subtopics.json').catch(() => ({defs: [], items: {}}))]);
      this.st = st; this.defs = Object.fromEntries(st.defs.map(d => [d.id, d.name]));
      const cnt = {}; for (const ids of Object.values(st.items)) ids.forEach(i => cnt[i] = (cnt[i] || 0) + 1);
      return ix.map(t => ({code: t.code, name: t.name, unit: this.units[t.unit] || 'Other', sym: t.code, count: (t.mc || 0) + (t.s2 || 0),
        files: [].concat(t.file), subs: st.defs.filter(d => d.area === t.code).map(d => ({id: d.id, name: d.name, n: cnt[d.id] || 0}))}));
    },
    async topic(t) {
      const ds = await Promise.all(t.files.map(f => J(f)));
      return ds.flatMap(d => d.items).map(q => this.one(t, q));
    },
    one(t, q) {
      return ({
        id: `${q.t}|${q.y}|${q.label}`, topic: t.code, year: +q.y, kind: q.t === 'mc' ? 'mc' : 's2', label: q.label, short: shortOf(q.label),
        marks: q.marks || 1, qimg: q.img, txt: q.txt, key: q.ans, why: q.why, mi: q.mi,
        subs: (this.st.items[`${t.code}|${q.t}|${q.y}|${q.label}`] || []).map(i => this.defs[i]).filter(Boolean),
        oe: q.oe ? {title: q.oe.title, groups: groupsOf(q.oe, [['Core National 5 points', 'n5'], ['Equations and worked formulae', 'eqns'], ['Diagrams worth sketching', 'diagrams']])} : null
      });
    },
    legacy() { const R = LSget('qbR', {}), o = {}; for (const k in R) { const v = R[k]; if (v && v.r && v.c) o[k] = {r: RN[v.r], t: v.c, at: v.at || 0}; } return o; }
  },
  higher: {
    title: 'Higher Chemistry', short: 'Higher',
    exam: {at: '2027-05-21T09:00:00+01:00', label: 'Fri 21 May 2027, 9 am'},
    paper: {mc: 20, wr: 80, mins: 150},
    units: {'Unit 1': 'Unit 1 · Chemical changes and structure', 'Unit 2': 'Unit 2 · Nature’s chemistry', 'Unit 3': 'Unit 3 · Chemistry in society', 'Researching Chemistry': 'Researching chemistry', 'Other': 'Skills'},
    papers: [['all', 'All papers', () => true], ['2015', 'Current course (2015 onwards)', y => y >= 2015], ['2020', '2020 onwards', y => y >= 2020],
      ['last3', 'Most recent (2024 onwards + specimen)', latest], ['spec', 'Specimen paper only', y => y === 2027]],
    yname: y => y === 2027 ? 'Specimen' : String(y),
    foot: 'Papers before 2015 are from the old Higher course; most questions still fit. Specimen is the QS specimen question paper for the 2027 exam.',
    fmt: esc,
    sym: {PER: 'Pe', SB: 'Sb', RED: 'Rx', SCC: 'Cc', AAEF: 'Es', SDE: 'Sd', PRO: 'Pr', OOF: 'Ox', FRAG: 'Fr', SKIN: 'Sk', RATE: 'Ra', GMR: 'Gm', EQ: 'Eq', CE: 'Ce', CA: 'An', APP: 'Ap', TECH: 'Te', REP: 'Rp', NUM: 'Nu', OE: 'Oe'},
    async index() {
      const ix = await J('index.json');
      return ix.map(t => ({code: t.key, name: t.name, unit: this.units[t.unit] || t.unit, sym: this.sym[t.key] || t.key.slice(0, 2), count: t.count, slug: t.slug,
        subs: (t.subs || []).map((s, i) => ({id: String(i), name: s.name, n: (s.k || s.n || []).length, k: s.k || []}))}));
    },
    async topic(t) {
      const d = await J('data/' + t.slug + '.json');
      return d.map(q => this.one(t, q));
    },
    one(t, q) {
      if (!t.subOf) { t.subOf = {}; t.subs.forEach(s => s.k.forEach(k => (t.subOf[k] = t.subOf[k] || []).push(s.name))); }
      const subOf = t.subOf;
      return ({
        id: `${t.slug}|${q.year}|${q.label}`, topic: t.code, year: +q.year, kind: q.kind === 'Multiple choice' ? 'mc' : 's2', label: q.label, short: shortOf(q.label),
        marks: q.marks || 1, qimg: q.q, txt: q.txt, key: q.ans, why: q.exp, mi: q.ms, subs: subOf[`${q.year}|${q.label}`] || [],
        oe: q.oe ? {title: q.oe.title, groups: (q.oe.groups || []).filter(([h]) => !/advanced higher|\bAH\b|going further|beyond higher/i.test(h))} : null,
        cur: (q.cur || []).map(c => ({title: 'Current data booklet answer · ' + c.q, lines: c.lines}))
      });
    },
    legacy(topics) {
      const S = LSget('hcqb', {}), r = S.r || {}, by = {}, o = {};
      topics.forEach(t => by[t.slug] = t.code);
      for (const k in r) { const c = by[k.split('|')[0]]; if (c && RN[r[k]]) o[k] = {r: RN[r[k]], t: c, at: 0}; }
      return o;
    }
  },
  ah: {
    title: 'Advanced Higher Chemistry', short: 'AH',
    exam: {at: '2027-05-21T09:00:00+01:00', label: 'Fri 21 May 2027, 9 am'},
    paper: {mc: 25, wr: 75, mins: 150},
    units: {Inorganic: 'Inorganic chemistry', Physical: 'Physical chemistry', Organic: 'Organic chemistry and instrumental analysis', Researching: 'Researching chemistry', 'Open-ended': 'Open-ended questions'},
    papers: [['all', 'All papers', () => true], ['2016', '2016 onwards', y => y >= 2016], ['2020', 'Current course (2020 onwards)', y => y >= 2020],
      ['last3', 'Most recent (2024 onwards + specimen)', latest], ['spec', 'Specimen paper only', y => y === 2027]],
    yname: y => y === 2027 ? 'Specimen' : String(y),
    foot: 'Answers to older questions are updated where the data booklet has changed. Specimen is the QS specimen question paper for the 2027 exam.',
    fmt: AHchem,
    async index() {
      const ix = await J('data/index.json');
      return ix.map(t => {
        const c = {}; t.items.forEach(it => { if (it[4]) c[it[4]] = (c[it[4]] || 0) + 1; });
        return {code: t.code, name: t.name, unit: this.units[t.unit] || t.unit, sym: t.code, count: t.count || t.items.length, file: t.file, ids: t.items.map(i => i[0]),
          subs: Object.entries(c).map(([name, n], i) => ({id: String(i), name, n}))};
      });
    },
    async topic(t) {
      const d = await J('data/' + t.file), arr = Array.isArray(d) ? d : (d.items || []);
      return arr.map(r => this.one(t, r));
    },
    one(t, r) {
      {
        const a = r.ans || {};
        return {
          id: r.id, topic: t.code, year: +r.year, kind: a.kind === 'mc' ? 'mc' : 's2', label: 'Question ' + r.q, short: 'Q' + r.q, paper: r.paper,
          marks: +r.marks || 1, qimg: r.qimg, txt: r.txt, key: a.key, why: a.why, mi: a.img, subs: r.sub ? [r.sub] : [],
          oe: a.oe ? {title: a.oe.title, groups: groupsOf(a.oe, [['Key chemistry', 'points'], ['Equations and worked examples', 'equations'], ['Diagrams that would help', 'diagrams']])} : null,
          notes: (a.notes || []).map(n => 'Data booklet update: ' + n)
        };
      }
    },
    legacy(topics) {
      const S = LSget('ahqb3', {}), r = S.r || {}, by = {}, o = {};
      topics.forEach(t => t.ids.forEach(i => by[i] = by[i] || t.code));
      for (const k in r) if (by[k] && RN[r[k]]) o[k] = {r: RN[r[k]], t: by[k], at: 0};
      return o;
    }
  }
};
const A = AD[LV];
const F = A.fmt;
const yname = y => A.yname(+y);
const paperOf = q => q.paper || (q.year === 2027 ? 'Specimen question paper' : `${yname(q.year)} paper`);
const KIND = {mc: 'Multiple choice', s2: 'Written answer'};

/* ---------------- state ---------------- */
const SKEY = 'pp:' + LV;
const ST = Object.assign({r: {}, o: {papers: 'all', type: 'all', hide: false, timer: true}, set: [], setName: '', building: false, mig: false}, LSget(SKEY, {}));
ST.o = Object.assign({papers: 'all', type: 'all', hide: false, timer: true}, ST.o);
const save = () => LSset(SKEY, ST);
let TOPICS = [], CACHE = {};
let view = {screen: 'home'}, seq = [], pos = 0, cur = null, from = 'home', quiz = null;
let DB = null, USER = null, TEACHER = !!LSget('qs:teacher', false) /* turned on per browser */, SHARED = [];

const ratingOf = q => (ST.r[q.id] || {}).r;
function rate(q, r) {
  ST.r[q.id] = {r, t: q.topic, s: q.subs, at: Date.now()}; save();
}
const papersTest = () => (A.papers.find(p => p[0] === ST.o.papers) || A.papers[0])[2];
function passes(q, ignoreHide) {
  if (!papersTest()(q.year)) return false;
  if (ST.o.type !== 'all' && q.kind !== ST.o.type) return false;
  if (!ignoreHide && ST.o.hide && ratingOf(q) === 'got') return false;
  return true;
}
const sortQs = (a, b) => a.year - b.year || (a.kind === b.kind ? 0 : a.kind === 'mc' ? -1 : 1) || qnum(a.label) - qnum(b.label) || a.label.localeCompare(b.label);
async function load(code) {
  if (CACHE[code]) return CACHE[code];
  const t = TOPICS.find(x => x.code === code);
  const items = (await A.topic(t)).sort(sortQs);
  return CACHE[code] = items;
}
const loadMany = codes => Promise.all(codes.map(load)).then(a => a.flat());

/* ---------------- tiny UI helpers ---------------- */
function toast(m) { const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = m; document.body.appendChild(t); setTimeout(() => t.remove(), 2600); }
function show(name) {
  $$('[data-screen]').forEach(s => s.hidden = s.dataset.screen !== name);
  view.screen = name; stopTimer(); drawSetbar();
  window.scrollTo(0, 0);
}
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const weight = q => ({got: .4, part: 2, not: 3}[ratingOf(q)] ?? 2.5);
function weightedSample(list, n) {
  const pool = list.slice(), out = [];
  while (out.length < n && pool.length) {
    const tot = pool.reduce((s, q) => s + weight(q), 0); let x = Math.random() * tot, i = 0;
    for (; i < pool.length - 1; i++) { x -= weight(pool[i]); if (x <= 0) break; }
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
}
function subStats(code, sub) {
  const s = {g: 0, p: 0, n: 0};
  for (const id in ST.r) { const v = ST.r[id]; if (v.t === code && (!sub || (v.s || []).includes(sub))) s[v.r === 'got' ? 'g' : v.r === 'part' ? 'p' : 'n']++; }
  return s;
}
function statsFor(code) {
  const s = {g: 0, p: 0, n: 0};
  for (const id in ST.r) { const v = ST.r[id]; if (v.t === code) s[v.r === 'got' ? 'g' : v.r === 'part' ? 'p' : 'n']++; }
  return s;
}
const bar = (s, total) => { const pc = x => total ? Math.min(100, 100 * x / total).toFixed(1) + '%' : '0%';
  return `<div class="bar" aria-hidden="true"><i class="g" style="width:${pc(s.g)}"></i><i class="p" style="width:${pc(s.p)}"></i><i class="n" style="width:${pc(s.n)}"></i></div>`; };

/* ---------------- topics covered so far (shared with flashcards through localStorage) ---------------- */
const COVKEY = 'qs:covered:' + LV;
const covSet = () => { const a = LSget(COVKEY, null); return Array.isArray(a) && a.length ? new Set(a) : null; };
const inCov = code => { const c = covSet(); return !c || c.has(code); };

/* ---------------- support options (shared/support.js) ---------------- */
const SUP = () => (window.QSSUP ? QSSUP.get() : {mix: 'std', qlen: 10, xt: 0, zoom: 100, speak: 'on', focus: false});
const QN = () => [5, 10, 15].includes(+SUP().qlen) ? +SUP().qlen : 10;
const XT = () => 1 + (+SUP().xt || 0) / 100;
/* gentler start: short questions first in each topic, longer ones join once the pupil scores 70% on their last five or more short ones */
const isShort = q => q.kind === 'mc' || q.marks <= 2;
function mastery(code) {
  const done = (CACHE[code] || []).filter(isShort).map(q => ST.r[q.id]).filter(Boolean).sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, 8);
  const s = done.reduce((t, v) => t + (v.r === 'got' ? 1 : v.r === 'part' ? .5 : 0), 0);
  return {n: done.length, pc: done.length ? s / done.length : 0, open: done.length >= 5 && s / done.length >= .7};
}
function gentle(pool) {
  if (SUP().mix !== 'gentle') return pool;
  const by = {}; pool.forEach(q => (by[q.topic] = by[q.topic] || []).push(q));
  /* a topic with no short questions at all (open-ended, say) waits until the pupil asks for all questions, unless nothing else is left */
  const out = Object.keys(by).flatMap(c => { const l = by[c], sh = l.filter(isShort); return mastery(c).open ? l : sh; });
  return out.length ? out : pool;
}
const gentleLine = code => { if (SUP().mix !== 'gentle') return ''; const m = mastery(code);
  return m.open ? 'Gentler start: longer questions are now included for this topic.' : `Gentler start: multiple choice and 1–2 mark questions first. Longer questions join in when you score 70% on five short ones (${m.n ? `${m.n} done, ${Math.round(m.pc * 100)}%` : 'none done yet'}).`; };

/* ---------------- page skeleton ---------------- */
document.body.innerHTML = `
<main class="wrap" data-screen="home">
  <div class="countdown" id="cd" role="timer" aria-label="Time until the ${esc(A.title)} exam"></div>
  <header class="hd">
    <div><h1>${esc(A.title)}: past papers</h1><p class="muted small" id="lead"></p></div>
  </header>
  <div class="card" id="sharedSets" hidden></div>
  <details class="card settings cov" id="covBox">
    <summary>Topics covered so far <span class="sumline" id="covLine"></span></summary>
    <p class="muted small" style="margin:8px 0">Tick the topics your class has covered. Today's 10, Quiz of 10 and Random question then only use these topics. Saved in this browser.</p>
    <div class="row" style="margin-bottom:6px"><button type="button" class="btn sm" id="covAll">Tick all</button><button type="button" class="btn sm ghost" id="covNone">Clear all</button></div>
    <div id="covList"></div>
  </details>
  <details class="card settings" id="settings">
    <summary>Questions to show <span class="sumline" id="sumline"></span></summary>
    <div class="sgrid">
      <div><label class="lb" for="papers">Papers</label><select id="papers">${A.papers.map(p => `<option value="${p[0]}">${esc(p[1])}</option>`).join('')}</select></div>
      <div><span class="lb">Question type</span><div class="seg" id="typeSeg" role="group" aria-label="Question type">
        <button type="button" data-v="all">All</button><button type="button" data-v="mc">Multiple choice</button><button type="button" data-v="s2">Written</button></div></div>
      <div><label class="tog"><input type="checkbox" id="hide"> Hide questions I got right</label>
        <label class="tog"><input type="checkbox" id="timerOpt"> Show a timer (1½ minutes a mark)</label></div>
      <div class="paperpick"><span class="lb">Question paper colour</span><div class="sw" id="paperSw" role="group" aria-label="Question paper colour"></div>
        <label class="tog"><input type="checkbox" id="dimOpt"> Dim bright question sheets</label>
        <p class="muted small" style="margin:4px 0 0">The QS standard colours for adapted papers. Shades on screen are close matches, not exact.</p></div>
    </div>
  </details>
  <details class="card settings" id="supBox">
    <summary>Support options <span class="sumline" id="supLine"></span></summary>
    <div id="supPanel" style="margin-top:10px"></div>
  </details>
  <div class="daily card" id="dailyCard"></div>
  <div class="acts">
    <button class="btn" id="goMist">Mistakes</button>
    <button class="btn" id="goMocks">Mock papers</button>
    <button class="btn" id="goQuiz">Quiz of 10</button>
    <button class="btn" id="goRandom">Random question</button>
    <button class="btn" id="goDoNow" title="Five short questions from covered topics, shown on the board">Do Now starter</button>
    <button class="btn" id="goTeach" hidden>Teacher tools</button>
  </div>
  <div class="legend"><span style="--c:var(--got)">Got it</span><span style="--c:var(--part)">Partly</span><span style="--c:var(--not)">Not yet</span></div>
  <div class="srch"><input type="search" id="srch" placeholder="Search all questions, e.g. titration or ester" aria-label="Search all questions" autocomplete="off"><button type="button" class="btn sm ghost" id="srchX" hidden>Clear</button></div>
  <div id="srchRes" hidden></div>
  <div class="tabs" role="tablist"><button role="tab" id="tabT" data-tab="topics">Topics</button><button role="tab" id="tabS" data-tab="subs">Sub-topics</button></div>
  <div id="topics"><p class="muted">Loading topics…</p></div>
  <section class="card panel" id="mine">
    <h2>Your progress</h2>
    <p class="muted small">Your answers are saved in this browser only. To move them to another device, make a code here and load it there.</p>
    <div class="row"><button class="btn sm" id="mkCode">Make my progress code</button><button class="btn sm" id="cpCode" hidden>Copy code</button><button class="btn sm ghost" id="hubProg">See all my progress</button></div>
    <div class="codebox" id="code" hidden></div>
    <div class="row" style="margin-top:8px"><input type="text" id="codeIn" placeholder="Paste a progress code" aria-label="Progress code"><button class="btn sm" id="ldCode">Load</button></div>
    <div class="row" style="margin-top:8px"><button class="btn sm ghost" id="reset">Reset my progress</button></div>
    <label class="tog" style="margin-top:8px"><input type="checkbox" id="teachOpt"> Show teacher tools in this browser (question sets and printable worksheets)</label>
  </section>
  <p class="muted small">${esc(A.foot)} Questions and marking instructions are from QS past papers. Multiple choice explanations and suggested points were written by Claude (AI).</p>
</main>

<main class="wrap" data-screen="list" hidden>
  <div class="lhead"><button class="btn sm" id="lBack">← Topics</button><h1 id="lTitle"></h1></div>
  <div class="lacts">
    <select id="lSub" aria-label="Sub-topic"></select>
    <button class="btn pri sm" id="lStart">Start</button><button class="btn sm" id="lShuffle">Shuffle</button><button class="btn sm" id="lQuiz">Quiz of 10</button>
  </div>
  <p class="muted small" id="lCount"></p>
  <div id="lItems"></div>
</main>

<main class="wrap q-wrap" data-screen="q" hidden>
  <div class="qtop"><button class="btn sm" id="qBack">← Back</button><span class="zm" data-zm></span><span class="meta" id="qPos"></span></div>
  <div class="meta" id="qMeta"></div>
  <div class="sheet qtext" id="qTxt" hidden></div>
  <div class="sheet" style="margin-top:8px" id="qSheet"><img id="qImg" alt=""></div>
  <button type="button" class="btn sm ghost origbtn" id="qOrig" hidden></button>
  <div id="qAct"></div>
  <div class="ans" id="qAns"></div>
  <div class="extras">
    <button class="btn sm" id="qPresent">Present on the board</button>
    <button class="btn sm" id="qAdd" hidden>Add to set</button>
    <a class="btn sm ghost" id="qReport" target="_blank" rel="noopener">Report a problem</a>
  </div>
  <nav class="dock" aria-label="Question navigation">
    <button class="btn" id="qPrev">← Prev</button>
    <div class="mid"><button class="btn ghost timer" id="timer" title="Tap to pause or restart the timer" hidden></button></div>
    <button class="btn pri" id="qNext">Next →</button>
  </nav>
</main>

<main class="wrap" data-screen="done" hidden>
  <button class="btn sm" id="dBack">← Topics</button>
  <div class="card panel"><h2>Quiz finished</h2><p class="score" id="dScore"></p><p class="muted" id="dMsg"></p>
    <div class="row"><button class="btn pri" id="dAgain">Another quiz</button><button class="btn" id="dRetry">Retry the ones I missed</button></div></div>
  <div class="qlist panel" id="dList"></div>
</main>

<main class="wrap" data-screen="teach" hidden>
  <button class="btn sm" id="tBack">← Topics</button>
  <div class="card panel">
    <h2>Build a question set</h2>
    <p class="muted small">Turn on set building, then open any topic and tap <b>Add</b> next to the questions you want.</p>
    <label class="tog"><input type="checkbox" id="building"> Set building on</label>
    <label class="lb" for="setName" style="margin-top:8px">Set name</label><input type="text" id="setName" placeholder="e.g. S4 homework week 3">
    <div class="qlist" id="tItems" style="margin-top:10px"></div>
    <div class="row" style="margin-top:10px">
      <button class="btn pri sm" id="tSave">Share with class</button><button class="btn sm" id="tLink">Copy link</button>
      <button class="btn sm" id="tSheet">Printable worksheet</button><button class="btn sm" id="tSheetA">Worksheet with answers</button>
      <button class="btn sm ghost" id="tPdf">PDF (scans)</button><button class="btn sm ghost" id="tPdfA">PDF (scans) with answers</button>
      <button class="btn sm" id="tTry">Try the set</button><button class="btn sm ghost" id="tClear">Clear</button>
    </div>
  </div>
  <div class="card panel" id="tShared"><h2>Shared sets</h2><div id="tSharedList" class="qlist"></div></div>
  <div class="card panel"><h2>Offline copy</h2><p class="muted small">Download the large question files for this level as zip files, for a standalone copy of the hub.</p><button class="btn sm" id="tOff">Download offline data</button></div>
  <div class="card panel"><h2>Suggested answers</h2><p class="muted small">Download every suggested answer for open-ended questions at this level as one file, to review or edit.</p><button class="btn sm" id="tOE">Download suggested answers</button></div>
  <div class="card panel"><h2>Problem reports</h2><p class="muted small">Pupils report problems through the <a href="${FORM_URL}" target="_blank" rel="noopener">Past Paper Question Bank Problems form</a>. Check the responses in Microsoft Forms.</p></div>
</main>
<main class="wrap" data-screen="mist" hidden>
  <button class="btn sm" id="mBack">← Topics</button>
  <h1 style="margin:12px 0 4px">Mistakes</h1>
  <p class="muted" style="margin:0 0 12px">Questions you marked <b>Not yet</b> or <b>Partly</b> come back two days later. Get one right and it leaves the list. Miss it again and it comes back in another two days.</p>
  <div class="card panel" id="mSum"></div>
  <div id="mList"></div>
</main>

<main class="wrap" data-screen="mocks" hidden>
  <button class="btn sm" id="kBack">← Topics</button>
  <h1 style="margin:12px 0 4px">Mock papers</h1>
  <p class="muted" style="margin:0 0 12px" id="kLead"></p>
  <div class="card xtbox" id="kXt"></div>
  <div class="mocks" id="kList"></div>
  <p class="muted small">Each mock is built from QS past paper questions from ${LV === 'ah' ? '2016' : '2015'} to 2026, spread across the course topics in proportion. No question appears in more than one mock. The specimen paper is left out so you can sit it on its own.</p>
</main>

<main class="wrap q-wrap" data-screen="mockq" hidden>
  <div class="qtop"><button class="btn sm" id="kqExit">← Save and leave</button><span class="zm" data-zm></span><span class="row" style="gap:6px"><button class="btn sm" id="kRest">Rest break</button><button class="btn ghost timer" id="kTimer" title="Tap to pause or restart"></button></span></div>
  <div class="meta" id="kqMeta"></div>
  <details class="palw"><summary id="kPalS"></summary><div class="pal" id="kPal" aria-label="Questions"></div></details>
  <div class="sheet qtext" id="kqTxt" hidden></div>
  <div class="sheet" style="margin-top:8px" id="kqSheet"><img id="kqImg" alt=""></div>
  <button type="button" class="btn sm ghost origbtn" id="kqOrig" hidden></button>
  <div id="kqAct"></div>
  <nav class="dock" aria-label="Mock navigation">
    <button class="btn" id="kqPrev">← Prev</button>
    <div class="mid"><button class="btn" id="kqFinish">Finish and mark</button></div>
    <button class="btn pri" id="kqNext">Next →</button>
  </nav>
</main>

<main class="wrap" data-screen="mockm" hidden>
  <h1 style="margin:12px 0 4px" id="kmTitle"></h1>
  <p class="muted" style="margin:0 0 12px">Section 1 is marked for you. For each Section 2 question, compare your written answer with the marking instructions and tap the marks you earned.</p>
  <div class="card panel" id="kmMC"></div>
  <div id="kmWr"></div>
  <div class="kmbar"><span id="kmTot"></span><button class="btn pri" id="kmDone">See my result</button></div>
</main>

<main class="wrap" data-screen="mockr" hidden>
  <button class="btn sm" id="krBack">← Mock papers</button>
  <div class="card panel"><h2 id="krTitle"></h2><p class="score" id="krScore"></p><div id="krSecs"></div><p class="muted" id="krMsg"></p>
    <button class="btn" id="krShow" hidden>Show my score</button><div class="row"><button class="btn pri" id="krMist">Go to my mistakes</button><button class="btn" id="krHome">Back to topics</button></div></div>
</main>
<div class="rest" id="rest" hidden role="dialog" aria-modal="true" aria-labelledby="restH"><div class="card panel"><h2 id="restH">Rest break</h2><p>The clock has stopped and your paper is hidden. Stretch, have a drink, rest your eyes.</p><p class="muted">Break so far: <b id="restT">0:00</b></p><button class="btn pri" id="restBack">Back to the paper</button></div></div>
<div class="setbar" id="setbar" hidden><span id="setbarTxt"></span><button class="btn sm" id="setbarOpen">Open set</button></div>`;

/* ---------------- exam countdown (one slim line) ---------------- */
function examTick() {
  let t = Math.max(0, Math.floor((Date.parse(A.exam.at) - Date.now()) / 1000));
  const el = $('#cd');
  if (!t) { el.innerHTML = `<span class="cdl">The ${esc(A.title)} exam is today or has finished. Good luck!</span>`; return; }
  const d = Math.floor(t / 86400), h = Math.floor(t % 86400 / 3600), m = Math.floor(t % 3600 / 60), sec = t % 60, p = n => String(n).padStart(2, '0');
  el.innerHTML = `<span class="cdl">${esc(A.title)} exam · ${esc(A.exam.label)}</span><span class="cdt"><span><b>${d}</b><small>days</small></span><span><b>${p(h)}</b><small>hrs</small></span><span><b>${p(m)}</b><small>min</small></span><span><b>${p(sec)}</b><small>sec</small></span></span>`;
  setTimeout(examTick, 1000 - Date.now() % 1000);
}
examTick();

/* ---------------- settings ---------------- */
function drawSettings() {
  $('#papers').value = ST.o.papers;
  $$('#typeSeg button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === ST.o.type));
  $('#hide').checked = ST.o.hide; $('#timerOpt').checked = ST.o.timer;
  const p = A.papers.find(x => x[0] === ST.o.papers) || A.papers[0];
  $('#sumline').textContent = [p[1], {all: 'all question types', mc: 'multiple choice', s2: 'written answers'}[ST.o.type], ST.o.hide ? 'hiding “got it”' : ''].filter(Boolean).join(' · ');
}
$('#papers').onchange = e => { ST.o.papers = e.target.value; save(); drawSettings(); drawHome(); };
$$('#typeSeg button').forEach(b => b.onclick = () => { ST.o.type = b.dataset.v; save(); drawSettings(); drawHome(); });
$$('.tabs [data-tab]').forEach(b => b.onclick = () => { ST.tab = b.dataset.tab; save(); drawHome(); });
$('#hide').onchange = e => { ST.o.hide = e.target.checked; save(); drawSettings(); drawHome(); };
$('#timerOpt').onchange = e => { ST.o.timer = e.target.checked; save(); };

/* ---------------- home ---------------- */
function drawHome() {
  const total = TOPICS.reduce((s, t) => s + t.count, 0);
  drawCov(); drawDaily();
  $('#lead').textContent = `${total.toLocaleString()} QS past paper questions sorted into ${TOPICS.length} topics, with marking instructions.`;
  const units = [...new Set(TOPICS.map(t => t.unit))];
  const tab = ST.tab === 'subs' ? 'subs' : 'topics';
  $$('.tabs [data-tab]').forEach(b => b.setAttribute('aria-selected', b.dataset.tab === tab));
  if (tab === 'subs') {
    $('#topics').innerHTML = units.map(u => `<h2 class="unit">${esc(u)}</h2>${TOPICS.filter(t => t.unit === u).map(t => `
      <h3 class="ka"><span>${esc(t.name)}</span><small>${t.count} questions</small></h3>
      <div class="subs">${(t.subs.length ? t.subs : [{name: '', n: t.count}]).map(sb => { const st = subStats(t.code, sb.name);
        return `<button class="sub" data-t="${esc(t.code)}" data-s="${esc(sb.name)}"><span>${esc(sb.name || 'All questions')}${bar(st, sb.n)}</span><small>${sb.n} Qs</small></button>`; }).join('')}</div>`).join('')}`).join('');
    $$('#topics .sub').forEach(b => b.onclick = () => openTopic(b.dataset.t, b.dataset.s));
    $('#goTeach').hidden = !TEACHER; drawShared(); return;
  }
  $('#topics').innerHTML = units.map(u => `<h2 class="unit">${esc(u)}</h2><div class="topics">${TOPICS.filter(t => t.unit === u).map(t => {
    const s = statsFor(t.code), done = s.g + s.p + s.n;
    const nc = !inCov(t.code);
    return `<button class="tp${nc ? ' nc' : ''}" data-t="${esc(t.code)}"><span class="sym" aria-hidden="true">${esc(t.sym)}</span><b>${esc(t.name)}</b>
      <small>${nc ? '<span class="nctag">Not covered yet</span> · ' : ''}${t.count} questions${done ? ` · ${done} tried` : ''}${t.subs.length ? ` · ${t.subs.length} sub-topics` : ''}</small>${bar(s, t.count)}</button>`;
  }).join('')}</div>`).join('');
  $$('#topics .tp').forEach(b => b.onclick = () => openTopic(b.dataset.t));
  $('#goTeach').hidden = !TEACHER;
  drawShared();
}

/* ---------------- topic list ---------------- */
let LIST = {code: null, sub: ''};
async function openTopic(code, sub = '') {
  const t = TOPICS.find(x => x.code === code); if (!t) return;
  LIST = {code, sub};
  $('#lTitle').textContent = t.name;
  $('#lSub').innerHTML = `<option value="">All sub-topics</option>` + t.subs.map(s => `<option value="${esc(s.name)}">${esc(s.name)} (${s.n})</option>`).join('');
  $('#lSub').hidden = !t.subs.length; $('#lSub').value = sub;
  $('#lItems').innerHTML = '<p class="muted">Loading questions…</p>'; $('#lCount').textContent = '';
  show('list');
  try { await load(code); } catch (e) { $('#lItems').innerHTML = '<p class="muted">These questions could not be loaded. Check your connection and try again.</p>'; return; }
  drawList();
}
function listItems(all) {
  const items = CACHE[LIST.code] || [];
  return items.filter(q => (!LIST.sub || q.subs.includes(LIST.sub)) && (all || passes(q)));
}
const multiSub = c => ((TOPICS.find(t => t.code === c) || {}).subs || []).length > 1;
function qRow(q, n) {
  const r = ratingOf(q), inSet = ST.set.some(s => s[1] === q.id);
  return `<div class="qi" data-id="${esc(q.id)}" role="button" tabindex="0">
    <span class="dot ${r || ''}" aria-label="${r ? {got: 'Got it', part: 'Partly', not: 'Not yet'}[r] : 'Not tried'}"></span>
    <span class="t"><b>${esc(yname(q.year))} · ${esc(q.short)}</b><small>${view.screen === 'list' ? '' : KIND[q.kind] + ' · '}${q.marks} mark${q.marks === 1 ? '' : 's'}${q.subs.length && !LIST.sub && multiSub(q.topic) ? ' · ' + esc(q.subs.join(', ')) : ''}</small></span>
    ${ST.building && TEACHER ? `<button class="btn sm add" data-add="${esc(q.id)}" aria-pressed="${inSet}">${inSet ? 'Added' : 'Add'}</button>` : `<span class="muted" aria-hidden="true">›</span>`}
  </div>`;
}
function drawList() {
  const shown = listItems(), all = listItems(true);
  $('#lCount').textContent = (shown.length === all.length ? `${all.length} questions` : `${shown.length} of ${all.length} questions match your settings`) + (SUP().mix === 'gentle' ? '. ' + gentleLine(LIST.code) + ' Start, Shuffle and Quiz follow this; you can still tap any question.' : '');
  $('#lQuiz').textContent = `Quiz of ${QN()}`;
  const mc = shown.filter(q => q.kind === 'mc'), s2 = shown.filter(q => q.kind === 's2');
  const order = mc.concat(s2), building = ST.building && TEACHER;
  const chip = q => { const r = ratingOf(q), inSet = ST.set.some(x => x[1] === q.id);
    return `<button type="button" class="chip ${r || ''}${building && inSet ? ' inset' : ''}" data-id="${esc(q.id)}" title="${esc(paperOf(q) + ', ' + q.label + ', ' + q.marks + ' mark' + (q.marks === 1 ? '' : 's'))}${r ? ' · ' + {got: 'Got it', part: 'Partly', not: 'Not yet'}[r] : ''}">${esc(q.short.replace(/^Q/, ''))}${building ? (inSet ? ' ✓' : ' +') : ''}</button>`; };
  const sec = (h, l) => {
    if (!l.length) return '';
    const years = [...new Set(l.map(q => q.year))];
    return `<h2 class="sech">${h} <small>${l.length} question${l.length === 1 ? '' : 's'}</small></h2><div class="years">${years.map(y => `<div class="yr"><b>${esc(yname(y))}</b><div class="chips">${l.filter(q => q.year === y).map(chip).join('')}</div></div>`).join('')}</div>`;
  };
  $('#lItems').innerHTML = shown.length ? `<p class="muted small" style="margin:0">Tap a question number.${building ? ' Set building is on: tapping adds or removes a question from your set.' : ''}</p>` + sec('Section 1 · Multiple choice', mc) + sec('Section 2 · Written answers', s2) : '<p class="muted">No questions match your settings. Change “Questions to show” on the topics page.</p>';
  $$('#lItems .chip').forEach(b => b.onclick = () => {
    const q = order.find(x => x.id === b.dataset.id);
    if (building) { toggleSet(q); drawList(); return; }
    quiz = null; startSeq(order, order.indexOf(q), 'list');
  });
}
function bindRows(el, list, origin) {
  $$('.qi', el).forEach(row => {
    const go = () => { const i = list.findIndex(q => q.id === row.dataset.id); quiz = null; startSeq(list, i, origin); };
    row.onclick = e => { if (e.target.closest('[data-add]')) return; go(); };
    row.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } };
  });
  $$('[data-add]', el).forEach(b => b.onclick = () => { toggleSet(list.find(q => q.id === b.dataset.add)); b.setAttribute('aria-pressed', ST.set.some(s => s[1] === b.dataset.add)); b.textContent = b.getAttribute('aria-pressed') === 'true' ? 'Added' : 'Add'; });
}
const listOrder = () => { const l = listItems(); return l.filter(q => q.kind === 'mc').concat(l.filter(q => q.kind === 's2')); };
$('#lSub').onchange = e => { LIST.sub = e.target.value; drawList(); };
$('#lBack').onclick = () => { show('home'); drawHome(); };
$('#lStart').onclick = () => { const l = gentle(listOrder()); if (l.length) { quiz = null; startSeq(l, 0, 'list'); } };
$('#lShuffle').onclick = () => { const l = shuffle(gentle(listOrder())); if (l.length) { quiz = null; startSeq(l, 0, 'list'); } };
$('#lQuiz').onclick = () => startQuiz(listItems(), 'list');

/* ---------------- question view ---------------- */
function startSeq(list, i, origin) { seq = list; pos = Math.max(0, i); from = origin; show('q'); drawQ(); }
let revealed = false;
function drawQ() {
  cur = seq[pos]; if (!cur) return;
  revealed = false;
  const t = TOPICS.find(x => x.code === cur.topic);
  $('#qPos').textContent = quiz ? `Quiz · ${pos + 1} of ${seq.length}` : `${pos + 1} of ${seq.length}`;
  $('#qMeta').innerHTML = `<b>${esc(paperOf(cur))} · ${esc(cur.label)}</b> · ${cur.marks} mark${cur.marks === 1 ? '' : 's'} · ${KIND[cur.kind]}<br>${esc(t ? t.name : '')}${cur.subs.length ? ' › ' + esc(cur.subs.join(', ')) : ''}`;
  $('#qImg').src = cur.qimg || ''; $('#qImg').alt = `${paperOf(cur)}, ${cur.label}`;
  showText('q', cur);
  $('#qAns').innerHTML = '';
  if (cur.kind === 'mc') {
    $('#qAct').innerHTML = `<p class="muted small" style="margin:10px 0 0">Choose your answer:</p><div class="abcd" role="group" aria-label="Answer">${'ABCD'.split('').map(l => `<button type="button" data-l="${l}">${l}</button>`).join('')}</div>`;
    $$('#qAct [data-l]').forEach(b => b.onclick = () => answerMC(b.dataset.l));
  } else {
    $('#qAct').innerHTML = `<p class="muted small" style="margin:10px 0 6px">Write your answer on paper, then check it against the marking instructions.</p><button class="btn pri" id="showMI" style="width:100%">Show marking instructions</button>`;
    $('#showMI').onclick = revealS2;
  }
  $('#qPrev').disabled = pos === 0 || !!quiz;
  $('#qNext').textContent = quiz && pos === seq.length - 1 ? 'Finish' : 'Next →';
  $('#qNext').disabled = !!quiz;
  $('#qAdd').hidden = !(TEACHER && ST.building);
  $('#qAdd').textContent = ST.set.some(s => s[1] === cur.id) ? 'Remove from set' : 'Add to set';
  $('#qReport').href = FORM_URL;
  $('#qReport').title = `Mention: ${A.short}, ${paperOf(cur)}, ${cur.label}`;
  window.scrollTo(0, 0);
  startTimer();
}
function answerMC(L) {
  if (revealed) return; revealed = true;
  const right = L === cur.key;
  $$('#qAct [data-l]').forEach(b => { if (b.dataset.l === cur.key) b.classList.add('right'); else if (b.dataset.l === L) b.classList.add('wrong'); b.disabled = true; });
  rate(cur, right ? 'got' : 'not');
  if (quiz) { quiz.res[pos] = right ? 1 : 0; $('#qNext').disabled = false; }
  stopTimer(true);
  $('#qAns').innerHTML = `<div class="card"><p class="verdict ${right ? 'ok' : 'no'}" style="margin:0 0 8px">${right ? 'Correct!' : `Not quite: you chose ${esc(L)}.`}</p>
    <div class="key"><span class="l" aria-label="Answer">${esc(cur.key || '?')}</span><p>${F(cur.why || '')}</p></div>
    <p class="muted small" style="margin:8px 0 0">Answer from the QS marking instructions. Explanation written by Claude (AI).</p></div>${extrasHTML()}`;
}
function extrasHTML() {
  let h = '';
  if (cur.oe && cur.oe.groups.length) h += `<div class="card oe"><h3>Suggested points: ${F(cur.oe.title)}</h3><p class="muted small" style="margin:0">Written by Claude (AI), not an official QS answer. Any correct, relevant chemistry can gain credit.</p>
    ${cur.oe.groups.map(([g, its]) => `<h4>${esc(g)}</h4><ul>${its.map(x => `<li>${F(x)}</li>`).join('')}</ul>`).join('')}</div>`;
  (cur.cur || []).forEach(c => h += `<div class="card oe"><h3>${esc(c.title)}</h3><ul>${c.lines.map(l => l.startsWith('B:') ? `<li><b>${F(l.slice(2))}</b></li>` : `<li>${F(l)}</li>`).join('')}</ul></div>`);
  (cur.notes || []).forEach(n => h += `<div class="note">${F(n)}</div>`);
  return h;
}
function revealS2() {
  if (revealed) return; revealed = true; stopTimer(true);
  $('#qAct').innerHTML = '';
  $('#qAns').innerHTML = `<h2>Marking instructions</h2>${cur.mi ? `<div class="sheet"><img src="${cur.mi}" alt="QS marking instructions for ${esc(cur.label)}"></div>` : '<p class="muted">Marking instructions are not available for this question.</p>'}
    ${extrasHTML()}
    <div class="card"><p style="margin:0 0 8px;font-weight:700">How did you do?</p><div class="rate" role="group" aria-label="How did you do?">
    ${[['got', 'Got it'], ['part', 'Partly'], ['not', 'Not yet']].map(([r, l]) => `<button type="button" data-r="${r}" aria-pressed="${ratingOf(cur) === r}">${l}</button>`).join('')}</div></div>`;
  $$('#qAns [data-r]').forEach(b => b.onclick = () => {
    rate(cur, b.dataset.r); $$('#qAns [data-r]').forEach(x => x.setAttribute('aria-pressed', x === b));
    if (quiz) { quiz.res[pos] = {got: 1, part: .5, not: 0}[b.dataset.r]; $('#qNext').disabled = false; }
  });
}
$('#qPrev').onclick = () => { if (pos > 0) { pos--; drawQ(); } };
$('#qNext').onclick = () => {
  if (quiz && pos === seq.length - 1) return finishQuiz();
  if (pos < seq.length - 1) { pos++; drawQ(); } else { toast('That was the last question.'); }
};
$('#qBack').onclick = () => { quiz = null; if (from === 'mist') { openMist(); return; } if (from === 'list') { show('list'); drawList(); } else if (from === 'teach') { openTeach(); } else if (from === 'search') { show('home'); drawHome(); $('#srch').focus(); } else { show('home'); drawHome(); } };
$('#qAdd').onclick = () => { toggleSet(cur); $('#qAdd').textContent = ST.set.some(s => s[1] === cur.id) ? 'Remove from set' : 'Add to set'; };
$('#qPresent').onclick = () => present(true);

/* ---------------- text version of a question, with the original scan one tap away ---------------- */
function showText(p, q) {
  const has = !!q.txt, orig = !has || !!ST.orig;
  $('#' + p + 'Txt').hidden = orig; $('#' + p + 'Sheet').hidden = !orig; $('#' + p + 'Orig').hidden = !has;
  if (has) { $('#' + p + 'Txt').innerHTML = q.txt; $('#' + p + 'Orig').textContent = orig ? 'Show as text' : 'Show original'; }
  $('#' + p + 'Orig').onclick = () => { ST.orig = !ST.orig; save(); showText(p, q); };
}

/* ---------------- timer ---------------- */
let TM = null;
function startTimer() {
  stopTimer();
  const el = $('#timer'); el.hidden = !ST.o.timer; if (!ST.o.timer) return;
  TM = {total: Math.round(cur.marks * SECS_PER_MARK * XT()), t0: Date.now(), used: 0, run: true, id: setInterval(drawTimer, 500)};
  el.onclick = () => { if (!TM) { startTimer(); return; } if (TM.run) { TM.used += Date.now() - TM.t0; TM.run = false; } else { TM.t0 = Date.now(); TM.run = true; } drawTimer(); };
  drawTimer();
}
function stopTimer(keep) { if (TM) { clearInterval(TM.id); if (keep && TM.run) { TM.used += Date.now() - TM.t0; TM.run = false; drawTimer(); } if (!keep) TM = null; } }
const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
function drawTimer() {
  if (!TM) return;
  const s = (TM.used + (TM.run ? Date.now() - TM.t0 : 0)) / 1000, el = $('#timer'), pv = $('#pvTimer');
  const txt = `${mmss(s)} / ${mmss(TM.total)}`;
  el.textContent = txt; el.classList.toggle('over', s > TM.total); el.classList.toggle('paused', !TM.run); el.setAttribute('aria-label', `Timer ${txt}${TM.run ? '' : ', paused'}. Tap to ${TM.run ? 'pause' : 'restart'}.`);
  if (pv) { pv.textContent = txt; pv.classList.toggle('over', s > TM.total); }
}

/* ---------------- quiz, random, retry ---------------- */
async function poolFromTopics(codes) { return (await loadMany(codes)).filter(q => passes(q)); }
function weightedTopics(n) {
  const ts = TOPICS.filter(t => inCov(t.code)), out = [];
  while (out.length < n && ts.length) { const tot = ts.reduce((s, t) => s + t.count, 0); let x = Math.random() * tot, i = 0; for (; i < ts.length - 1; i++) { x -= ts[i].count; if (x <= 0) break; } out.push(ts.splice(i, 1)[0].code); }
  return out;
}
async function startQuiz(pool, origin) {
  const list = weightedSample(gentle(pool), QN());
  if (!list.length) return toast('No questions match your settings.');
  quiz = {res: [], origin}; startSeq(list, 0, origin);
}
$('#goQuiz').onclick = async () => { toast(`Picking ${QN()} questions…`); try { await startQuiz(await poolFromTopics(weightedTopics(3)), 'home'); } catch (e) { toast('Could not load questions. Try again.'); } };
$('#goRandom').onclick = async () => {
  try { const pool = await poolFromTopics(weightedTopics(1)); if (!pool.length) return toast('No questions match your settings.'); quiz = null; startSeq(weightedSample(gentle(pool), 1), 0, 'home'); } catch (e) { toast('Could not load a question. Try again.'); }
};
function finishQuiz() {
  const res = quiz.res, list = seq, score = res.reduce((s, x) => s + (x || 0), 0);
  $('#dScore').textContent = SUP().focus ? '' : `${score % 1 ? score.toFixed(1) : score} / ${list.length}`;
  $('#dMsg').textContent = SUP().focus ? 'Well done for finishing. Look back over any you were unsure of.' : score >= list.length * .8 ? 'Excellent work.' : score >= list.length * .5 ? 'Good effort. Retry the ones you missed.' : 'Keep going: work through the ones you missed with the marking instructions.';
  const origin = quiz.origin; quiz = null;
  if (origin === 'daily') dailyDone();
  show('done');
  if (origin === 'daily' || origin === 'daily+') $('#dMsg').textContent += !SUP().focus && ST.streak && ST.streak.n > 1 ? ` Today's quiz done: that's ${ST.streak.n} days in a row.` : ` Today's quiz done.`;
  $('#dList').innerHTML = list.map(qRow).join(''); bindRows($('#dList'), list, 'home');
  const missed = list.filter((q, i) => (res[i] || 0) < 1);
  $('#dRetry').hidden = !missed.length;
  $('#dRetry').onclick = () => startSeq(missed, 0, 'home');
  $('#dAgain').onclick = () => origin === 'list' ? $('#lQuiz').onclick() : origin.startsWith('daily') ? startDaily(true) : $('#goQuiz').onclick();
}
$('#dBack').onclick = () => { show('home'); drawHome(); };

/* ---------------- present mode ---------------- */
let PV = false, pvRev = false, pvZ = (() => { try { return +localStorage.getItem('pvZ') || 1; } catch (e) { return 1; } })();
function present(on) {
  PV = on; let el = $('#pv');
  if (!on) { if (el) el.remove(); try { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); } catch (e) {} return; }
  if (!el) { el = document.createElement('div'); el.id = 'pv'; el.className = 'pv'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Presenting question'); document.body.appendChild(el); }
  try { if (!document.fullscreenElement && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {}); } catch (e) {}
  pvRev = false; drawPV();
}
function drawPV() {
  const el = $('#pv'); if (!el || !cur) return;
  const mc = cur.kind === 'mc';
  let stage = cur.txt ? `<div class="sheet qtext pvtext" style="--pz:${pvZ}">${cur.txt}</div>` : `<div class="sheet"><img src="${cur.qimg}" alt="${esc(paperOf(cur) + ', ' + cur.label)}"></div>`;
  if (pvRev) stage = mc ? stage + `<div class="card" style="margin-top:12px;color:var(--ink)"><div class="key"><span class="l">${esc(cur.key)}</span><p><b>Answer ${esc(cur.key)}.</b> ${F(cur.why || '')}</p></div></div>`
    : (cur.mi ? `<div class="sheet"><img src="${cur.mi}" alt="Marking instructions"></div>` : '<p>Marking instructions not available.</p>');
  el.innerHTML = `<header><span class="ttl">${seq.length > 1 ? `${pos + 1} of ${seq.length} · ` : ''}${esc(paperOf(cur))} · ${esc(cur.label)}</span><span>${cur.marks} mark${cur.marks === 1 ? '' : 's'} · ${pvRev && !mc ? 'Marking instructions' : KIND[cur.kind]}</span><span class="timer" id="pvTimer"></span></header>
    <div class="stage"><div style="width:100%;max-width:1400px">${stage}</div></div>
    <footer><button class="btn" id="pvPrev" ${pos === 0 ? 'disabled' : ''}>← Prev</button>
      <button class="btn pri" id="pvRev">${mc ? (pvRev ? 'Hide answer' : 'Reveal answer') : (pvRev ? 'Show question' : 'Show marking instructions')}</button>
      <button class="btn" id="pvNext" ${pos >= seq.length - 1 ? 'disabled' : ''}>Next →</button><span class="pvz"><button class="btn sm" id="pvZm" aria-label="Smaller text">A−</button><button class="btn sm" id="pvZp" aria-label="Larger text">A+</button></span><button class="btn" id="pvExit">Exit</button></footer>`;
  const setZ = d => { pvZ = Math.min(2.5, Math.max(0.6, Math.round((pvZ + d) * 10) / 10)); try { localStorage.setItem('pvZ', pvZ); } catch (e) {} const t = el.querySelector('.pvtext'); if (t) t.style.setProperty('--pz', pvZ); };
  $('#pvZm').onclick = () => setZ(-0.1); $('#pvZp').onclick = () => setZ(0.1);
  $('#pvPrev').onclick = () => { if (pos > 0) { pos--; drawQ(); pvRev = false; drawPV(); } };
  $('#pvNext').onclick = () => { if (pos < seq.length - 1) { pos++; drawQ(); pvRev = false; drawPV(); } };
  $('#pvRev').onclick = () => { pvRev = !pvRev; drawPV(); };
  $('#pvExit').onclick = () => present(false);
  drawTimer();
}

/* ---------------- keyboard ---------------- */
document.addEventListener('keydown', e => {
  if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
  if (PV) {
    if (e.key === 'Escape') present(false);
    else if (e.key === 'ArrowRight') $('#pvNext')?.click();
    else if (e.key === 'ArrowLeft') $('#pvPrev')?.click();
    else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); $('#pvRev')?.click(); }
    else if (e.key === '+' || e.key === '=') $('#pvZp')?.click();
    else if (e.key === '-') $('#pvZm')?.click();
    return;
  }
  if (view.screen !== 'q') return;
  const k = e.key.toUpperCase();
  if (cur.kind === 'mc' && 'ABCD'.includes(k) && k.length === 1) answerMC(k);
  else if (e.key === 'ArrowRight' && !$('#qNext').disabled) $('#qNext').click();
  else if (e.key === 'ArrowLeft' && !$('#qPrev').disabled) $('#qPrev').click();
  else if (k === 'M' && cur.kind === 's2') revealS2();
});

/* ---------------- question paper colour (QS standard colours for adapted papers) ---------------- */
const PAPERS = [['white', 'White', '#ffffff'], ['cream', 'Cream', '#f6eed3'], ['pink', 'Pink', '#f7d3dc'], ['yellow', 'Yellow', '#fbf1a3'],
  ['green', 'Green', '#d3ecc8'], ['purple', 'Purple', '#e0d4ee'], ['blue', 'Blue', '#cfe4f5'], ['orange', 'Orange', '#fbd7ad']];
function applyPaper() {
  const k = LSget('qs:paper', 'white'), p = PAPERS.find(x => x[0] === k) || PAPERS[0], root = document.documentElement;
  root.style.setProperty('--paper', p[2]);
  root.toggleAttribute('data-dim', !!LSget('qs:dim', false));
  const sw = $('#paperSw');
  if (sw) {
    sw.innerHTML = PAPERS.map(([id, name, c]) => `<button type="button" data-p="${id}" aria-pressed="${id === p[0]}" style="--c:${c}"><i aria-hidden="true"></i>${name}</button>`).join('');
    $$('#paperSw [data-p]').forEach(b => b.onclick = () => { LSset('qs:paper', b.dataset.p); applyPaper(); });
  }
  if ($('#dimOpt')) $('#dimOpt').checked = !!LSget('qs:dim', false);
}
$('#dimOpt').onchange = e => { LSset('qs:dim', e.target.checked); applyPaper(); };
addEventListener('storage', e => { if (e.key === 'qs:paper' || e.key === 'qs:dim') applyPaper(); });
applyPaper();

function drawCov() {
  const c = covSet(), units = [...new Set(TOPICS.map(t => t.unit))];
  $('#covLine').textContent = c ? `${TOPICS.filter(t => c.has(t.code)).length} of ${TOPICS.length} topics` : `All ${TOPICS.length} topics`;
  $('#covList').innerHTML = units.map(u => `<h3 class="covu">${esc(u)}</h3><div class="covg">${TOPICS.filter(t => t.unit === u).map(t =>
    `<label class="covr"><input type="checkbox" data-c="${esc(t.code)}" ${!c || c.has(t.code) ? 'checked' : ''}><span>${esc(t.name)}</span><small>${t.count} Qs</small></label>`).join('')}</div>`).join('');
  $$('#covList input').forEach(i => i.onchange = () => setCov($$('#covList input:checked').map(x => x.dataset.c)));
}
function setCov(codes) {
  /* every topic ticked, or none, means no limit */
  LSset(COVKEY, codes.length && codes.length < TOPICS.length ? codes : null);
  if (ST.daily && !ST.daily.done && ST.daily.date === dayKey()) { ST.daily = null; save(); }
  const open = $('#covBox').open; drawHome(); $('#covBox').open = open;
}
$('#covAll').onclick = () => setCov(TOPICS.map(t => t.code));
$('#covNone').onclick = () => { $$('#covList input').forEach(i => i.checked = false); LSset(COVKEY, []); $('#covLine').textContent = 'none ticked yet: tick at least one topic'; };
addEventListener('storage', e => { if (e.key === COVKEY && TOPICS.length && view.screen === 'home') drawHome(); });

/* ---------------- Today's 10: a daily mixed quiz weighted towards weaker topics ---------------- */
const DAYMS = 864e5;
const dayKey = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
function weakness(t) { const s = statsFor(t.code), n = s.g + s.p + s.n; return n < 3 ? .6 : 1 - (s.g + .5 * s.p) / n; }
function weakTopics(n) {
  const ts = TOPICS.filter(t => t.count > 0 && inCov(t.code)).map(t => ({c: t.code, w: .15 + weakness(t)})), out = [];
  while (out.length < n && ts.length) { const tot = ts.reduce((s, t) => s + t.w, 0); let x = Math.random() * tot, i = 0; for (; i < ts.length - 1; i++) { x -= ts[i].w; if (x <= 0) break; } out.push(ts.splice(i, 1)[0].c); }
  return out;
}
function streakNow() { const s = ST.streak; if (!s) return 0; return s.last === dayKey() || s.last === dayKey(Date.now() - DAYMS) ? s.n : 0; }
function dailyDone() {
  const td = dayKey(), y = dayKey(Date.now() - DAYMS);
  if (ST.daily && ST.daily.date === td) ST.daily.done = true;
  const s = ST.streak || {last: '', n: 0};
  if (s.last !== td) ST.streak = {last: td, n: s.last === y ? s.n + 1 : 1};
  save();
}
async function startDaily(again) {
  const td = dayKey(); let list = [];
  const N = QN();
  toast(again ? `Picking ${N} more questions…` : `Getting today's ${N}…`);
  try {
    if (!again && ST.daily && ST.daily.date === td && !ST.daily.done && ST.daily.ids.length === N) list = await setItems(ST.daily.ids);
    if (!list.length) {
      const codes = weakTopics(N > 10 ? 4 : 3);
      let pool = gentle((await loadMany(codes)).filter(q => passes(q, true)));
      list = weightedSample(pool, N);
      if (list.length < N) { const more = weakTopics(8).filter(c => !codes.includes(c)).slice(0, 3); pool = gentle((await loadMany(more)).filter(q => passes(q, true))); list = list.concat(weightedSample(pool, N - list.length)); }
      list = shuffle(list);
      if (!again) { ST.daily = {date: td, ids: list.map(q => [q.topic, q.id]), done: false}; save(); }
    }
  } catch (e) { return toast('Could not load questions. Check your connection and try again.'); }
  if (!list.length) return toast('No questions match your settings.');
  quiz = {res: [], origin: again ? 'daily+' : 'daily'}; startSeq(list, 0, 'home');
}
function drawDaily() {
  const td = dayKey(), done = ST.daily && ST.daily.date === td && ST.daily.done, st = streakNow();
  const weak = TOPICS.filter(t => { if (!inCov(t.code)) return false; const s = statsFor(t.code); return s.g + s.p + s.n >= 3; }).sort((a, b) => weakness(b) - weakness(a)).slice(0, 2);
  const N = QN(), NW = {5: 'Five', 10: 'Ten', 15: 'Fifteen'}[N];
  $('#dailyCard').innerHTML = `<div class="dtxt"><h2>Today's ${N}</h2><p class="muted small">${done ? 'Done for today. You can do another set if you want more practice.' : `${NW} mixed questions, picked more often from topics where you have scored lowest.`}${SUP().mix === 'gentle' ? ' Gentler start is on.' : ''}${covSet() ? ` Only from your ${TOPICS.filter(t => inCov(t.code)).length} covered topics.` : ''}${weak.length ? ` Focus now: ${weak.map(t => esc(t.name)).join(' and ')}.` : ''}</p></div>
    <div class="dgo">${st ? `<span class="streak"><b>${st}</b> day${st === 1 ? '' : 's'} in a row</span>` : ''}<span class="qlen" role="group" aria-label="Number of questions">${[5, 10, 15].map(n => `<button type="button" data-n="${n}" aria-pressed="${n === N}">${n}</button>`).join('')}</span><button class="btn pri" id="goDaily">${done ? `Another ${N}` : (ST.daily && ST.daily.date === td && ST.daily.ids.length === N ? `Carry on with today's ${N}` : `Start today's ${N}`)}</button></div>`;
  $$('#dailyCard [data-n]').forEach(b => b.onclick = () => window.QSSUP ? QSSUP.set({qlen: +b.dataset.n}) : null);
  $('#goQuiz').textContent = `Quiz of ${N}`;
  $('#goDaily').onclick = () => startDaily(done);
  const m = mistakeList(), due = m.filter(x => x.due <= Date.now()).length;
  $('#goMist').textContent = due ? `Mistakes · ${due} due` : 'Mistakes';
}

/* ---------------- mistakes, spaced two days apart ---------------- */
const GAP = 2 * DAYMS;
const mistakeList = () => Object.entries(ST.r).filter(([, v]) => v.r === 'not' || v.r === 'part').map(([id, v]) => ({id, t: v.t, r: v.r, due: (v.at || 0) + GAP}))
  .filter(x => TOPICS.some(t => t.code === x.t));
const when = t => t <= Date.now() ? 'due now' : 'back ' + new Date(t).toLocaleDateString('en-GB', {weekday: 'short', day: 'numeric', month: 'short'});
function openMist() {
  show('mist');
  const L = mistakeList(), now = Date.now(), due = L.filter(x => x.due <= now);
  $('#mSum').innerHTML = L.length ? `<p class="score" style="margin:0">${due.length} <small>due now</small></p><p class="muted" style="margin:4px 0 12px">${L.length - due.length} more waiting to come back.</p>
    <div class="row"><button class="btn pri" id="mDue" ${due.length ? '' : 'disabled'}>Practise the ${due.length} due</button><button class="btn" id="mAll">Practise all ${L.length} now</button></div>`
    : `<p style="margin:0">No mistakes waiting. Questions you mark <b>Not yet</b> or <b>Partly</b> will appear here.</p>`;
  const by = {}; L.forEach(x => (by[x.t] = by[x.t] || []).push(x));
  $('#mList').innerHTML = Object.keys(by).length ? `<div class="qlist">${TOPICS.filter(t => by[t.code]).map(t => { const a = by[t.code], d = a.filter(x => x.due <= now).length, next = Math.min(...a.map(x => x.due));
    return `<div class="qi" data-t="${esc(t.code)}" role="button" tabindex="0"><span class="dot ${d ? 'not' : 'part'}"></span><span class="t"><b>${esc(t.name)}</b><small>${a.length} question${a.length === 1 ? '' : 's'} · ${d ? d + ' due now' : when(next)}</small></span><span class="muted" aria-hidden="true">›</span></div>`; }).join('')}</div>` : '';
  const run = async ids => {
    if (!ids.length) return;
    toast('Loading questions…');
    try { const items = await loadMany([...new Set(ids.map(x => x.t))]); const want = new Set(ids.map(x => x.id)); const list = shuffle(items.filter(q => want.has(q.id))); if (list.length) { quiz = null; startSeq(list, 0, 'mist'); } }
    catch (e) { toast('Could not load questions. Try again.'); }
  };
  if ($('#mDue')) $('#mDue').onclick = () => run(due);
  if ($('#mAll')) $('#mAll').onclick = () => run(L);
  $$('#mList .qi').forEach(row => { const go = () => run(by[row.dataset.t]); row.onclick = go; row.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }; });
}
$('#goMist').onclick = openMist;
$('#mBack').onclick = () => { show('home'); drawHome(); };

/* ---------------- mock papers ---------------- */
const P = A.paper, NMOCK = 4;
let MK = null;
const hm = m => m >= 60 ? `${Math.floor(m / 60)} hour${m >= 120 ? 's' : ''}${m % 60 ? ' ' + (m % 60) + ' minute' + (m % 60 === 1 ? '' : 's') : ''}` : `${m} minute${m === 1 ? '' : 's'}`;
const clock = s => { s = Math.max(0, Math.round(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0'); };
function openMocks() {
  show('mocks');
  $('#kLead').textContent = `Full practice papers in the 2027 exam format: Section 1 is ${P.mc} marks of multiple choice and Section 2 is ${P.wr} marks of written questions, ${P.mc + P.wr} marks in ${hm(P.mins)}. Have your data booklet and some paper ready.`;
  const xt = +SUP().xt || 0;
  $('#kXt').innerHTML = `<div><b>Extra time</b><small>${xt ? `${hm(Math.round(P.mins * XT()))} in total (${hm(P.mins)} plus ${xt}%).` : `Set this to match your exam arrangements.`} You can take a rest break at any time: the clock stops until you come back.</small></div>
    <div class="seg" role="group" aria-label="Extra time">${[0, 25, 50, 100].map(v => `<button type="button" data-xt="${v}" aria-pressed="${v === xt}">${v ? '+' + v + '%' : 'None'}</button>`).join('')}</div>`;
  $$('#kXt [data-xt]').forEach(b => b.onclick = () => { if (window.QSSUP) QSSUP.set({xt: +b.dataset.xt}); openMocks(); });
  const M = ST.mocks || {}, run = ST.mockrun;
  $('#kList').innerHTML = Array.from({length: NMOCK}, (_, i) => {
    const k = i + 1, r = M[k], live = run && run.k === k;
    return `<div class="card mk"><div class="mkn" aria-hidden="true">${k}</div><div><b>Mock paper ${k}</b><small>${P.mc + P.wr} marks · ${hm(Math.round(P.mins * XT()))}${XT() > 1 ? ' with extra time' : ''}</small>
      <small>${r && SUP().focus ? `Last sat on ${new Date(r.at).toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})}` : r ? `Best ${r.best}% · last ${r.last}% on ${new Date(r.at).toLocaleDateString('en-GB', {day: 'numeric', month: 'short'})}` : 'Not tried yet'}</small></div>
      <button class="btn ${live ? 'pri' : ''}" data-k="${k}">${live ? 'Carry on' : r ? 'Sit again' : 'Start'}</button></div>`;
  }).join('');
  $$('#kList [data-k]').forEach(b => b.onclick = () => startMock(+b.dataset.k));
}
$('#goMocks').onclick = openMocks;
$('#kBack').onclick = () => { show('home'); drawHome(); };
async function startMock(k) {
  toast('Loading mock paper ' + k + '…');
  let d; try { d = await J('mock' + k + '.json'); } catch (e) { return toast('Could not load the mock paper. Check your connection and try again.'); }
  const items = d.items.map(({t, r}) => A.one(TOPICS.find(x => x.code === t) || {code: t, subs: []}, r));
  items.forEach(q => q.marks = +q.marks || 1);
  const live = ST.mockrun && ST.mockrun.k === k ? ST.mockrun : {k, ans: {}, used: 0, pos: 0, marks: {}, stage: 'q'};
  MK = {k, items, mins: d.mins || P.mins, st: live, t0: Date.now(), run: true, tid: null};
  ST.mockrun = live; save();
  if (live.stage === 'm') return mockMark();
  MK.rest = 0; $('#rest').hidden = true;
  show('mockq'); MK.tid = setInterval(drawMockTimer, 1000); drawMockQ();
}
const mockMins = () => Math.round(MK.mins * XT());
const mockUsed = () => MK.st.used + (MK.run ? (Date.now() - MK.t0) / 1000 : 0);
function bankTime() { if (MK && MK.run) { MK.st.used = mockUsed(); MK.t0 = Date.now(); } save(); }
function drawMockTimer() {
  if (!MK) return;
  const left = mockMins() * 60 - mockUsed(), el = $('#kTimer');
  el.textContent = left >= 0 ? `${clock(left)} left` : `${clock(-left)} over time`;
  if (SUP().focus && !(MK.peek > Date.now())) el.textContent = 'Show time';
  if (MK.rest) $('#restT').textContent = clock((Date.now() - MK.rest) / 1000);
  el.classList.toggle('over', left < 0); el.classList.toggle('paused', !MK.run);
  el.setAttribute('aria-label', `${el.textContent}${MK.run ? '' : ', paused'}. Tap to ${MK.run ? 'pause' : 'restart'} the timer.`);
  if (Date.now() % 15000 < 1000) bankTime();
}
$('#kTimer').onclick = () => { if (!MK) return; if (SUP().focus) { MK.peek = MK.peek > Date.now() ? 0 : Date.now() + 6000; drawMockTimer(); return; } if (MK.run) { MK.st.used = mockUsed(); MK.run = false; } else { MK.t0 = Date.now(); MK.run = true; } save(); drawMockTimer(); };
function drawMockQ() {
  const S = MK.st, q = MK.items[S.pos], n = MK.items.length, nmc = MK.items.filter(x => x.kind === 'mc').length;
  const sec = q.kind === 'mc' ? `Section 1 · question ${S.pos + 1} of ${nmc}` : `Section 2 · question ${S.pos - nmc + 1} of ${n - nmc}`;
  $('#kqMeta').innerHTML = `<b>Mock paper ${MK.k} · ${sec}</b> · ${q.marks} mark${q.marks === 1 ? '' : 's'}<br><span class="muted">${esc(paperOf(q))}, ${esc(q.label)}</span>`;
  $('#kqImg').src = q.qimg || ''; $('#kqImg').alt = `${paperOf(q)}, ${q.label}`;
  showText('kq', q);
  if (q.kind === 'mc') {
    $('#kqAct').innerHTML = `<p class="muted small" style="margin:10px 0 0">Choose your answer. You can change it until you finish.</p><div class="abcd" role="group" aria-label="Answer">${'ABCD'.split('').map(l => `<button type="button" data-l="${l}" aria-pressed="${S.ans[S.pos] === l}">${l}</button>`).join('')}</div>`;
    $$('#kqAct [data-l]').forEach(b => b.onclick = () => { S.ans[S.pos] = S.ans[S.pos] === b.dataset.l ? undefined : b.dataset.l; if (!S.ans[S.pos]) delete S.ans[S.pos]; bankTime(); drawMockQ(); });
  } else {
    $('#kqAct').innerHTML = `<p class="muted small" style="margin:10px 0 6px">Write your answer on paper. You mark it against the marking instructions when you finish.</p>
      <button type="button" class="btn sm" id="kqDone" aria-pressed="${!!S.ans[S.pos]}">${S.ans[S.pos] ? 'Answered ✓' : 'Mark as answered'}</button>`;
    $('#kqDone').onclick = () => { if (S.ans[S.pos]) delete S.ans[S.pos]; else S.ans[S.pos] = 'w'; bankTime(); drawMockQ(); };
  }
  $('#kPal').innerHTML = MK.items.map((x, i) => `${i === nmc ? '<span class="pals" aria-hidden="true">Section 2</span>' : ''}<button type="button" data-i="${i}" class="${S.ans[i] ? 'done' : ''}" aria-current="${i === S.pos}" aria-label="Question ${i < nmc ? i + 1 : i - nmc + 1}${i < nmc ? '' : ' of Section 2'}${S.ans[i] ? ', answered' : ''}">${i < nmc ? i + 1 : i - nmc + 1}</button>`).join('');
  $$('#kPal [data-i]').forEach(b => b.onclick = () => { S.pos = +b.dataset.i; bankTime(); drawMockQ(); });
  $('#kPalS').textContent = `Jump to a question · ${Object.keys(S.ans).length} of ${n} answered`;
  $('#kqPrev').disabled = S.pos === 0; $('#kqNext').disabled = S.pos === n - 1;
  drawMockTimer(); window.scrollTo(0, 0);
}
$('#kqPrev').onclick = () => { if (MK.st.pos > 0) { MK.st.pos--; bankTime(); drawMockQ(); } };
$('#kqNext').onclick = () => { if (MK.st.pos < MK.items.length - 1) { MK.st.pos++; bankTime(); drawMockQ(); } };
$('#kqExit').onclick = () => { bankTime(); clearInterval(MK.tid); MK = null; openMocks(); toast('Saved. Carry on later from Mock papers.'); };
$('#kqFinish').onclick = () => {
  const b = $('#kqFinish'), left = MK.items.filter((_, i) => !MK.st.ans[i]).length;
  if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = left ? `${left} not answered. Tap to finish` : 'Tap again to finish'; setTimeout(() => { if (b) { delete b.dataset.sure; b.textContent = 'Finish and mark'; } }, 4000); return; }
  delete b.dataset.sure; b.textContent = 'Finish and mark';
  bankTime(); clearInterval(MK.tid); MK.run = false; MK.st.stage = 'm'; save(); mockMark();
};
function mockMark() {
  const S = MK.st, its = MK.items, mc = its.map((q, i) => [q, i]).filter(([q]) => q.kind === 'mc'), wr = its.map((q, i) => [q, i]).filter(([q]) => q.kind !== 'mc');
  const mcScore = mc.filter(([q, i]) => S.ans[i] === q.key).length;
  show('mockm');
  $('#kmTitle').textContent = `Mock paper ${MK.k}: marking`;
  $('#kmMC').innerHTML = `<h2>Section 1 · ${mcScore} / ${mc.length}</h2><div class="mcg">${mc.map(([q, i], j) => { const a = S.ans[i], ok = a === q.key;
    return `<button type="button" class="${ok ? 'ok' : 'no'}" data-i="${i}" title="${esc(paperOf(q) + ', ' + q.label)}"><b>${j + 1}</b><span>${a || '–'}${ok ? '' : ' → ' + esc(q.key)}</span></button>`; }).join('')}</div>
    <p class="muted small" style="margin:8px 0 0">Tap a question to see it with its explanation.</p><div id="kmMCq"></div>`;
  $$('#kmMC [data-i]').forEach(b => b.onclick = () => { const q = its[+b.dataset.i];
    $('#kmMCq').innerHTML = `<div class="card" style="margin-top:10px"><p class="meta" style="margin:0 0 6px"><b>${esc(paperOf(q))} · ${esc(q.label)}</b></p><div class="sheet"><img src="${q.qimg}" alt="${esc(paperOf(q) + ', ' + q.label)}"></div><div class="key" style="margin-top:8px"><span class="l">${esc(q.key)}</span><p>${F(q.why || '')}</p></div></div>`; });
  $('#kmWr').innerHTML = `<h2 style="margin:18px 0 8px">Section 2</h2>` + wr.map(([q, i], j) => `<div class="card kmq" id="km${i}"><p class="meta" style="margin:0 0 6px"><b>Question ${j + 1}</b> · ${q.marks} mark${q.marks === 1 ? '' : 's'} · ${esc(paperOf(q))}, ${esc(q.label)}${S.ans[i] ? '' : ' · <span class="nt">not answered</span>'}</p>
    <details><summary>Show the question</summary><div class="sheet"><img loading="lazy" src="${q.qimg}" alt="${esc(paperOf(q) + ', ' + q.label)}"></div></details>
    ${q.mi ? `<div class="sheet" style="margin-top:8px"><img loading="lazy" src="${q.mi}" alt="QS marking instructions for ${esc(q.label)}"></div>` : '<p class="muted">Marking instructions are not available for this question.</p>'}
    ${(q.oe && q.oe.groups.length) ? `<details style="margin-top:6px"><summary>Suggested points (written by Claude, AI)</summary><ul>${q.oe.groups.flatMap(([, a]) => a).map(x => `<li>${F(x)}</li>`).join('')}</ul></details>` : ''}
    <div class="mkr" role="group" aria-label="Marks for question ${j + 1}">${Array.from({length: q.marks + 1}, (_, m) => `<button type="button" data-i="${i}" data-m="${m}" aria-pressed="${S.marks[i] === m}">${m}</button>`).join('')}</div></div>`).join('');
  $$('#kmWr [data-m]').forEach(b => b.onclick = () => { S.marks[b.dataset.i] = +b.dataset.m; save(); $$(`#kmWr [data-i="${b.dataset.i}"]`).forEach(x => x.setAttribute('aria-pressed', x === b)); mockTotal(); });
  mockTotal(); window.scrollTo(0, 0);
}
function mockTotal() {
  const S = MK.st, wr = MK.items.map((q, i) => [q, i]).filter(([q]) => q.kind !== 'mc'), left = wr.filter(([, i]) => S.marks[i] == null).length;
  const mcScore = MK.items.filter((q, i) => q.kind === 'mc' && S.ans[i] === q.key).length, w = wr.reduce((s, [, i]) => s + (S.marks[i] || 0), 0);
  $('#kmTot').textContent = `${mcScore + w} / ${P.mc + P.wr} so far${left ? ` · ${left} to mark` : ''}`;
  $('#kmDone').textContent = left ? `Finish (${left} unmarked count as 0)` : 'See my result';
}
$('#kmDone').onclick = () => {
  const S = MK.st, its = MK.items;
  let s1 = 0, s2 = 0;
  its.forEach((q, i) => {
    if (q.kind === 'mc') { const ok = S.ans[i] === q.key; s1 += ok ? 1 : 0; rate(q, ok ? 'got' : 'not'); }
    else { const m = S.marks[i] || 0; s2 += m; rate(q, m >= q.marks ? 'got' : m > 0 ? 'part' : 'not'); }
  });
  const pct = Math.round(100 * (s1 + s2) / (P.mc + P.wr)), M = ST.mocks = ST.mocks || {}, old = M[MK.k];
  M[MK.k] = {best: Math.max(pct, old ? old.best : 0), last: pct, at: Date.now()};
  const mins = Math.round(S.used / 60);
  delete ST.mockrun; save();
  show('mockr');
  $('#krTitle').textContent = `Mock paper ${MK.k}`;
  $('#krScore').textContent = `${s1 + s2} / ${P.mc + P.wr} · ${pct}%`;
  $('#krScore').hidden = $('#krSecs').hidden = !!SUP().focus; $('#krShow').hidden = !SUP().focus;
  $('#krSecs').innerHTML = `<div class="kr"><span>Section 1 · multiple choice</span>${bar({g: s1, p: 0, n: P.mc - s1}, P.mc)}<b>${s1} / ${P.mc}</b></div><div class="kr"><span>Section 2 · written</span>${bar({g: s2, p: 0, n: P.wr - s2}, P.wr)}<b>${s2} / ${P.wr}</b></div>`;
  $('#krMsg').textContent = `Time used: ${hm(mins || 1)} of ${hm(mockMins())}. Every question you dropped marks on is now in your mistakes list, ready to come back in two days.${old ? ` Your best before this was ${old.best}%.` : ''}`;
  MK = null;
};
$('#krBack').onclick = openMocks;
$('#krShow').onclick = () => { $('#krScore').hidden = $('#krSecs').hidden = false; $('#krShow').hidden = true; };
/* rest break: the paper is covered and the clock stops */
$('#kRest').onclick = () => { if (!MK) return; if (MK.run) { MK.st.used = mockUsed(); MK.run = false; save(); } MK.rest = Date.now(); $('#rest').hidden = false; $('#restBack').focus(); drawMockTimer(); };
$('#restBack').onclick = () => { if (!MK) return; MK.rest = 0; MK.t0 = Date.now(); MK.run = true; $('#rest').hidden = true; drawMockTimer(); };
$('#krMist').onclick = openMist;
$('#krHome').onclick = () => { show('home'); drawHome(); };

/* ---------------- progress code ---------------- */
const b64e = s => btoa(unescape(encodeURIComponent(s))), b64d = s => decodeURIComponent(escape(atob(s)));
$('#mkCode').onclick = () => {
  const compact = Object.entries(ST.r).map(([k, v]) => [k, v.r[0], v.t]);
  const code = `QS-${LV}-` + b64e(JSON.stringify({v: 2, r: compact, s: ST.streak || null, m: ST.mocks || null}));
  $('#code').hidden = false; $('#code').textContent = code; $('#cpCode').hidden = false;
};
$('#cpCode').onclick = () => { navigator.clipboard?.writeText($('#code').textContent).then(() => toast('Code copied.'), () => toast('Select the code and copy it.')); };
$('#ldCode').onclick = () => {
  const v = $('#codeIn').value.trim(), m = v.match(/^QS-(n5|higher|ah)-(.+)$/);
  if (!m) return toast('That code did not work. Check it was copied in full.');
  if (m[1] !== LV) return toast(`That code is for ${AD[m[1]].title}. Load it on that course's past papers page.`);
  try {
    const d = JSON.parse(b64d(m[2])), arr = Array.isArray(d) ? d : d.r || []; let n = 0;
    arr.forEach(([k, r, t]) => { const rr = {g: 'got', p: 'part', n: 'not'}[r]; if (rr) { ST.r[k] = {r: rr, t, at: Date.now()}; n++; } });
    let extra = '';
    if (!Array.isArray(d)) {
      if (d.s && (!ST.streak || (d.s.last || '') > (ST.streak.last || ''))) { ST.streak = d.s; extra += ', your streak'; }
      if (d.m) { const M = ST.mocks = ST.mocks || {}; let k2 = 0; for (const k in d.m) { const a = d.m[k], b = M[k]; M[k] = b ? {best: Math.max(a.best, b.best), last: a.at > b.at ? a.last : b.last, at: Math.max(a.at, b.at)} : a; k2++; } if (k2) extra += ` and ${k2} mock result${k2 === 1 ? '' : 's'}`; }
    }
    save(); drawHome(); $('#codeIn').value = ''; toast(`Loaded ${n} answers${extra}.`);
  }
  catch (e) { toast('That code did not work. Check it was copied in full.'); }
};
$('#reset').onclick = () => {
  const b = $('#reset');
  if (b.dataset.sure) { ST.r = {}; save(); drawHome(); b.textContent = 'Reset my progress'; delete b.dataset.sure; toast('Progress reset.'); return; }
  b.dataset.sure = 1; b.textContent = 'Tap again to reset everything'; setTimeout(() => { delete b.dataset.sure; b.textContent = 'Reset my progress'; }, 4000);
};
$('#hubProg').onclick = () => { try { if (parent && parent.HUB) return parent.HUB.go(LV + '-progress'); } catch (e) {} toast('Open “My progress” from the menu.'); };

/* ---------------- teacher: sets ---------------- */
function toggleSet(q) {
  if (!q) return;
  const i = ST.set.findIndex(s => s[1] === q.id);
  if (i >= 0) ST.set.splice(i, 1); else ST.set.push([q.topic, q.id]);
  save(); drawSetbar();
}
function drawSetbar() {
  const on = TEACHER && ST.building && ST.set.length && view.screen !== 'teach';
  $('#setbar').hidden = !on;
  if (on) $('#setbarTxt').textContent = `Set: ${ST.set.length} question${ST.set.length === 1 ? '' : 's'}`;
}
$('#setbarOpen').onclick = () => openTeach();
$('#goTeach').onclick = () => openTeach();
$('#tBack').onclick = () => { show('home'); drawHome(); };
$('#building').onchange = e => { ST.building = e.target.checked; save(); };
$('#setName').oninput = e => { ST.setName = e.target.value; save(); };
async function setItems(set) {
  const items = await loadMany([...new Set(set.map(s => s[0]))].filter(c => TOPICS.some(t => t.code === c)));
  return set.map(([, id]) => items.find(q => q.id === id)).filter(Boolean);
}
async function openTeach() {
  show('teach');
  $('#building').checked = ST.building; $('#setName').value = ST.setName || '';
  $('#tItems').innerHTML = ST.set.length ? '<p class="muted">Loading…</p>' : '<p class="muted">No questions in the set yet.</p>';
  const list = await setItems(ST.set).catch(() => []);
  if (list.length) {
    $('#tItems').innerHTML = list.map((q, i) => `<div class="qi"><span class="muted">${i + 1}</span><span class="t"><b>${esc(yname(q.year))} · ${esc(q.short)}</b><small>${esc((TOPICS.find(t => t.code === q.topic) || {}).name || '')} · ${q.marks} mark${q.marks === 1 ? '' : 's'}</small></span>
      <span class="row" style="gap:4px"><button class="btn sm" data-up="${i}" aria-label="Move up" ${i ? '' : 'disabled'}>↑</button><button class="btn sm" data-x="${i}">Remove</button></span></div>`).join('')
      + `<p class="muted small">${list.length} questions · ${list.reduce((s, q) => s + q.marks, 0)} marks</p>`;
    $$('#tItems [data-x]').forEach(b => b.onclick = () => { ST.set.splice(+b.dataset.x, 1); save(); openTeach(); });
    $$('#tItems [data-up]').forEach(b => b.onclick = () => { const i = +b.dataset.up; [ST.set[i - 1], ST.set[i]] = [ST.set[i], ST.set[i - 1]]; save(); openTeach(); });
  }
  drawTeachShared();
}
function setToken(set) {
  return 'set-' + set.map(([c, id]) => { const i = (CACHE[c] || []).findIndex(q => q.id === id); return i < 0 ? null : `${c}.${i.toString(36)}`; }).filter(Boolean).join('_');
}
$('#tLink').onclick = async () => {
  if (!ST.set.length) return toast('Add some questions first.');
  await setItems(ST.set);
  const link = `${SITE}#${LV}-bank-${setToken(ST.set)}`;
  navigator.clipboard?.writeText(link).then(() => toast('Link copied. Pupils who open it go straight to this set.'), () => prompt('Copy this link:', link));
};
$('#tTry').onclick = async () => { const l = await setItems(ST.set); if (l.length) { quiz = null; startSeq(l, 0, 'teach'); } };
$('#tClear').onclick = () => { ST.set = []; ST.setName = ''; save(); openTeach(); drawSetbar(); };
$('#tSave').onclick = async () => {
  if (!ST.set.length) return toast('Add some questions first.');
  if (!DB) return toast('Sharing needs the online version of this page. Use “Copy link” instead.');
  try { await DB.collection('sets').add({lv: LV, name: ST.setName || 'Question set', items: ST.set.map(s => s.slice()), at: Date.now()}); toast('Shared. Pupils see it at the top of the past papers page.'); }
  catch (e) { toast('Could not share the set.'); }
};
const legacyItem = s => s.length === 4 ? [s[0], `${s[1]}|${s[2]}|${s[3]}`] : s;
const mySets = () => SHARED.filter(s => s.lv === LV || (!s.lv && LV === 'n5'));
function drawShared() {
  const sets = mySets(), el = $('#sharedSets');
  el.hidden = !sets.length;
  if (!sets.length) return;
  el.innerHTML = `<h2 style="margin-bottom:6px">Sets from your teacher</h2><div class="qlist">${sets.slice(0, 6).map((s, i) => `<div class="qi" data-s="${i}" role="button" tabindex="0"><span class="dot"></span><span class="t"><b>${esc(s.name)}</b><small>${s.items.length} questions · ${new Date(s.at).toLocaleDateString()}</small></span><span class="muted">›</span></div>`).join('')}</div>`;
  $$('#sharedSets [data-s]').forEach(r => r.onclick = async () => { const s = sets[+r.dataset.s]; const l = await setItems(s.items.map(legacyItem)); if (l.length) { quiz = null; startSeq(l, 0, 'home'); } });
}
function drawTeachShared() {
  const sets = mySets();
  $('#tShared').hidden = !DB;
  $('#tSharedList').innerHTML = sets.length ? sets.map((s, i) => `<div class="qi"><span class="dot"></span><span class="t"><b>${esc(s.name)}</b><small>${s.items.length} questions · ${new Date(s.at).toLocaleDateString()}</small></span>
    <span class="row" style="gap:4px"><button class="btn sm" data-e="${i}">Edit</button><button class="btn sm" data-d="${i}">Delete</button></span></div>`).join('') : '<p class="muted">None shared yet.</p>';
  $$('#tSharedList [data-e]').forEach(b => b.onclick = () => { const s = sets[+b.dataset.e]; ST.set = s.items.map(legacyItem); ST.setName = s.name; ST.building = true; save(); openTeach(); });
  $$('#tSharedList [data-d]').forEach(b => b.onclick = async () => { try { await DB.doc('sets/' + sets[+b.dataset.d].id).delete(); } catch (e) { toast('Could not delete that set.'); } });
}
async function openSetToken(tok) {
  const parts = tok.slice(4).split('_').map(p => p.split('.')).filter(p => p.length === 2);
  try { await loadMany([...new Set(parts.map(p => p[0]))].filter(c => TOPICS.some(t => t.code === c))); } catch (e) { return; }
  const list = parts.map(([c, i]) => (CACHE[c] || [])[parseInt(i, 36)]).filter(Boolean);
  if (list.length) { quiz = null; startSeq(list, 0, 'home'); toast(`Question set: ${list.length} questions`); }
}

/* ---------------- PDF (minimal writer: JPEG images + Helvetica) ---------------- */
function pdfText(s) {
  const map = {'₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9', '₊': '+', '₋': '-', 'ₙ': 'n', '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁺': '+', '⁻': '-',
    '→': '->', '⇌': '<=>', 'Δ': 'delta ', '–': '-', '—': '-', '−': '-', '‘': "'", '’': "'", '“': '"', '”': '"', '≥': '>=', '≤': '<=', '…': '...', '·': '.'};
  return String(s).replace(/./gu, c => map[c] ?? (c.charCodeAt(0) < 256 ? c : '?'));
}
function jpegInfo(b) { for (let i = 2; i < b.length;) { if (b[i] !== 0xFF) { i++; continue; } const m = b[i + 1], len = (b[i + 2] << 8) | b[i + 3]; if (m >= 0xC0 && m <= 0xC3) return {h: (b[i + 5] << 8) | b[i + 6], w: (b[i + 7] << 8) | b[i + 8], n: b[i + 9]}; i += 2 + len; } return null; }
function b64bytes(uri) { const s = atob(uri.split(',')[1]); const a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; }
function toJpeg(src) {
  if (/^data:image\/jpe?g/.test(src)) return Promise.resolve(src);
  return new Promise(res => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0); res(c.toDataURL('image/jpeg', .88)); }; im.onerror = () => res(null); im.src = src; });
}
function buildPdf(blocks, title) {
  const W = 595.28, H = 841.89, M = 40, CW = W - 2 * M, pages = []; let ops = [], y = H - M; const imgs = [];
  const newPage = () => { if (ops.length) pages.push(ops); ops = []; y = H - M; };
  const e2 = s => pdfText(s).replace(/[\\()]/g, '\\$&');
  const wrap = (s, size) => { const per = Math.floor(CW / (size * .5)), out = []; let line = ''; for (const w of pdfText(s).split(/\s+/)) { if ((line + ' ' + w).trim().length > per) { out.push(line); line = w; } else line = (line + ' ' + w).trim(); } if (line) out.push(line); return out; };
  for (const b of blocks) {
    if (b.type === 'break') { newPage(); continue; }
    if (b.type === 'text') { for (const ln of wrap(b.text, b.size)) { if (y - b.size * 1.3 < M) newPage(); y -= b.size * 1.3; ops.push(`BT /${b.bold ? 'F2' : 'F1'} ${b.size} Tf ${M} ${y.toFixed(2)} Td (${e2(ln)}) Tj ET`); } y -= b.gap || 2; continue; }
    if (b.type === 'img') {
      const bytes = b64bytes(b.src), info = jpegInfo(bytes); if (!info) continue;
      let w = info.w * 72 / 200, h = info.h * 72 / 200;
      if (w > CW) { h *= CW / w; w = CW; } if (h > H - 2 * M - 20) { w *= (H - 2 * M - 20) / h; h = H - 2 * M - 20; }
      if (y - h < M) newPage(); y -= h;
      ops.push(`q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${M} ${y.toFixed(2)} cm /Im${imgs.length} Do Q`); imgs.push({bytes, ...info}); y -= 12;
    }
  }
  newPage();
  const enc = s => { const a = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) a[i] = s.charCodeAt(i) & 255; return a; };
  const chunks = [], offs = []; let len = 0;
  const put = x => { const a = typeof x === 'string' ? enc(x) : x; chunks.push(a); len += a.length; };
  const nImg = imgs.length, first = 5 + nImg, nObj = 4 + nImg + pages.length * 2;
  const obj = (n, body) => { offs[n] = len; put(`${n} 0 obj\n`); for (const p of [].concat(body)) put(p); put('\nendobj\n'); };
  put('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, `<< /Type /Pages /Count ${pages.length} /Kids [${pages.map((_, i) => `${first + i * 2} 0 R`).join(' ')}] >>`);
  obj(3, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  obj(4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
  imgs.forEach((im, i) => obj(5 + i, [`<< /Type /XObject /Subtype /Image /Width ${im.w} /Height ${im.h} /ColorSpace /${im.n === 3 ? 'DeviceRGB' : im.n === 4 ? 'DeviceCMYK' : 'DeviceGray'} /BitsPerComponent 8 /Filter /DCTDecode /Length ${im.bytes.length} >>\nstream\n`, im.bytes, '\nendstream']));
  const xo = imgs.map((_, i) => `/Im${i} ${5 + i} 0 R`).join(' ');
  pages.forEach((p, i) => {
    const n = first + i * 2, content = p.concat(`BT /F1 8 Tf ${M} 22 Td (${e2(title)} - page ${i + 1} of ${pages.length}) Tj ET`).join('\n');
    obj(n, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /XObject << ${xo} >> >> /Contents ${n + 1} 0 R >>`);
    obj(n + 1, [`<< /Length ${enc(content).length} >>\nstream\n`, content, '\nendstream']);
  });
  const xref = len;
  put(`xref\n0 ${nObj + 1}\n0000000000 65535 f \n` + Array.from({length: nObj}, (_, i) => String(offs[i + 1]).padStart(10, '0') + ' 00000 n \n').join(''));
  put(`trailer\n<< /Size ${nObj + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  return new Blob(chunks, {type: 'application/pdf'});
}
async function saveFile(name, blob) {
  if (window.claude && claude.use) { try { const dl = await claude.use('downloads'); if (dl) { await dl.save({filename: name, data: blob}); return; } } catch (e) { if (e && e.code === 'declined') return; } }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
}
const plain = s => String(s || '').replace(/_(\w+)/g, '$1').replace(/\^([0-9+\-−δ]+)/g, '$1');
async function makePdf(withAns) {
  const list = await setItems(ST.set);
  if (!list.length) return toast('Add some questions first.');
  toast('Making your PDF…');
  const title = `${A.title}: ${ST.setName || 'Question set'}`, B = [{type: 'text', text: title, size: 16, bold: true, gap: 4},
    {type: 'text', text: `${list.length} questions · ${list.reduce((s, q) => s + q.marks, 0)} marks. Questions from QS past papers.`, size: 9, gap: 10}];
  for (const [i, q] of list.entries()) {
    B.push({type: 'text', text: `${i + 1}. ${paperOf(q)}, ${q.label} (${q.marks} mark${q.marks === 1 ? '' : 's'})`, size: 11, bold: true, gap: 4});
    const j = q.qimg && await toJpeg(q.qimg); if (j) B.push({type: 'img', src: j});
  }
  if (withAns) {
    B.push({type: 'break'}, {type: 'text', text: 'Answers', size: 16, bold: true, gap: 8});
    for (const [i, q] of list.entries()) {
      if (q.kind === 'mc') B.push({type: 'text', text: `${i + 1}. Answer ${q.key}. ${plain(q.why)}`, size: 10, gap: 6});
      else { B.push({type: 'text', text: `${i + 1}. ${paperOf(q)}, ${q.label}: marking instructions`, size: 11, bold: true, gap: 4}); const j = q.mi && await toJpeg(q.mi); if (j) B.push({type: 'img', src: j}); }
    }
    B.push({type: 'text', text: 'Multiple choice explanations were written by Claude (AI) and are not part of the official QS marking instructions.', size: 8, gap: 2});
  }
  await saveFile(title.replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '_') + (withAns ? '_with_answers' : '') + '.pdf', buildPdf(B, title));
}
$('#tPdf').onclick = () => makePdf(false);
$('#tOE').onclick = async () => {
  toast('Collecting suggested answers…');
  const out = [];
  for (const t of TOPICS) {
    let raw = [];
    try {
      if (LV === 'n5') raw = (await Promise.all(t.files.map(f => J(f)))).flatMap(d => d.items).filter(q => q.oe).map(q => ({id: `${q.t}|${q.y}|${q.label}`, oe: q.oe}));
      else if (LV === 'higher') raw = (await J('data/' + t.slug + '.json')).filter(q => q.oe).map(q => ({id: `${t.slug}|${q.year}|${q.label}`, oe: q.oe}));
      else raw = [].concat((d => Array.isArray(d) ? d : d.items || [])(await J('data/' + t.file))).filter(r => r.ans && r.ans.oe).map(r => ({id: r.id, oe: r.ans.oe}));
    } catch (e) {}
    raw.forEach(r => out.push({t: t.code, ...r}));
  }
  const name = c => (TOPICS.find(t => t.code === c) || {}).name || c;
  const lists = o => LV === 'n5' ? [['Core National 5 points', o.n5], ['Going further (Higher)', o.higher], ['Equations and worked formulae', o.eqns], ['Diagrams worth sketching', o.diagrams]]
    : LV === 'higher' ? (o.groups || []) : [['Key chemistry', o.points], ['Equations and worked examples', o.equations], ['Diagrams that would help', o.diagrams]];
  const body = out.map(r => `<section data-id="${esc(r.id)}" data-t="${esc(r.t)}"><h2>${esc(name(r.t))} · ${esc(r.id)}</h2><h3>${esc(r.oe.title || '')}</h3>${lists(r.oe).filter(g => g[1] && g[1].length).map(([h, its]) => `<h4>${esc(h)}</h4><ul>${its.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`).join('')}</section>`).join('\n');
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${esc(A.title)}: suggested answers</title><style>body{font:15px/1.5 system-ui,sans-serif;max-width:900px;margin:20px auto;padding:0 16px}section{border-top:1px solid #ccc;padding:8px 0}h2{font-size:1rem;margin:0}h3{font-size:.95rem;margin:4px 0;color:#0f6e74}h4{font-size:.85rem;margin:8px 0 2px}</style></head><body><h1>${esc(A.title)}: suggested answers (${out.length})</h1>\n${body}\n</body></html>`;
  await saveFile(`${LV}_suggested_answers.html`, new Blob([html], {type: 'text/html'}));
  toast(`Exported ${out.length} suggested answers.`);
};
$('#tPdfA').onclick = () => makePdf(true);
const BIG = {n5: ['a1','ab1','c1','ca1','e1','f1','f2','h1','m1','n1','oe1','ps1','ps2','r1'].map(x => x + '.json'),
  higher: ['chemical-analysis','chemical-energy','getting-the-most-from-reactants','open-ended-questions','oxidising-and-reducing-agents','structure-and-bonding'].map(x => 'data/' + x + '.json'),
  ah: ['EQ','OE','PS','SC','SY'].map(x => 'data/' + x + '.json')};
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = t[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }; })();
function zipStore(files) {
  const parts = [], cen = []; let off = 0;
  const u16 = v => [v & 255, (v >>> 8) & 255], u32 = v => [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255];
  for (const f of files) {
    const nm = new TextEncoder().encode(f.name), crc = CRC(f.data), sz = f.data.length;
    const head = [...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(33), ...u32(crc), ...u32(sz), ...u32(sz), ...u16(nm.length), ...u16(0)];
    parts.push(new Uint8Array([0x50, 0x4b, 3, 4, ...head]), nm, f.data);
    cen.push(new Uint8Array([0x50, 0x4b, 1, 2, ...u16(20), ...head, ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(off)]), nm);
    off += 30 + nm.length + sz;
  }
  const cl = cen.reduce((s, c) => s + c.length, 0);
  return new Blob([...parts, ...cen, new Uint8Array([0x50, 0x4b, 5, 6, 0, 0, 0, 0, ...u16(files.length), ...u16(files.length), ...u32(cl), ...u32(off), 0, 0])], {type: 'application/zip'});
}
$('#tOff').onclick = async () => {
  const list = BIG[LV] || [], groups = [[]]; let size = 0;
  toast('Collecting files… this can take a minute.');
  try {
    for (const p of list) {
      const data = new Uint8Array(await (await fetch(p)).arrayBuffer());
      if (size + data.length > 60e6 && groups[groups.length - 1].length) { groups.push([]); size = 0; }
      groups[groups.length - 1].push({name: `${LV}/bank/${p}`, data}); size += data.length;
    }
    for (const [i, g] of groups.entries()) await saveFile(`${LV}_offline_data_${i + 1}.zip`, zipStore(g));
    toast(`Saved ${groups.length} zip file${groups.length === 1 ? '' : 's'}.`);
  } catch (e) { toast('Could not collect the files. Try again.'); }
};



/* ---------------- teacher tools switch (per browser) ---------------- */
function setTeacher(on) {
  TEACHER = !!on; LSset('qs:teacher', TEACHER);
  if (!TEACHER) { ST.building = false; save(); }
  $('#teachOpt').checked = TEACHER; drawSetbar();
  if (view.screen === 'home' && TOPICS.length) drawHome();
}
$('#teachOpt').checked = TEACHER;
$('#teachOpt').onchange = e => { setTeacher(e.target.checked); toast(TEACHER ? 'Teacher tools are on in this browser. Open them with the Teacher tools button.' : 'Teacher tools turned off.'); };

/* ---------------- printable worksheet (text version of each question) ---------------- */
async function makeSheet(withAns) {
  const list = await setItems(ST.set);
  if (!list.length) return toast('Add some questions first.');
  toast('Making your worksheet…');
  let css = '';
  try { css = (await fetch('../../shared/bank.css').then(r => r.text())).split('\n').filter(l => l.startsWith('.qtext')).join('\n'); } catch (e) {}
  const name = ST.setName || 'Question set', title = `${A.title}: ${name}`, marks = list.reduce((s, q) => s + q.marks, 0);
  const body = q => q.txt ? `<div class="qtext">${q.txt.replace(/^(\s*<p>)\s*<b>\s*\d+\.\s*<\/b>\s*/, '$1')}</div>` : `<img class="scan" src="${q.qimg}" alt="${esc(paperOf(q) + ', ' + q.label)}">`;
  const qs = list.map((q, i) => `<section class="wq"><div class="wh"><b>${i + 1}.</b><span class="src">${esc(paperOf(q))}, ${esc(q.label)}</span><span class="wm">${q.marks} mark${q.marks === 1 ? '' : 's'}</span></div>${body(q)}
    ${q.kind === 's2' ? `<div class="lines" style="height:${Math.min(16, 2 + q.marks * 2) * 2.1}em" aria-hidden="true"></div>` : '<p class="mcans">Answer: <span></span></p>'}</section>`).join('');
  const ans = !withAns ? '' : `<section class="answers"><h2>Answers</h2>${list.map((q, i) => q.kind === 'mc'
    ? `<div class="wa"><p><b>${i + 1}.</b> Answer <b>${esc(q.key)}</b>. ${F(q.why || '')}</p></div>`
    : `<div class="wa"><p><b>${i + 1}.</b> ${esc(paperOf(q))}, ${esc(q.label)}: marking instructions</p>${q.mi ? `<img class="scan" src="${q.mi}" alt="Marking instructions">` : '<p>Marking instructions not available.</p>'}</div>`).join('')}
    <p class="note">Multiple choice explanations were written by Claude (AI) and are not part of the official QS marking instructions.</p></section>`;
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${esc(title)}</title><style>
${css}
:root{color-scheme:light}body{margin:0;background:#fff;color:#111;font:15px/1.5 "Trebuchet MS",sans-serif}
.page{max-width:820px;margin:0 auto;padding:24px 28px}
h1{font-size:1.35rem;margin:0 0 4px}.sub{color:#555;margin:0 0 14px}
.who{display:flex;gap:24px;margin:0 0 18px}.who span{flex:1;border-bottom:1px solid #333;padding-bottom:2px}
.wq{break-inside:avoid-page;margin:0 0 22px;border-top:1.5px solid #333;padding-top:8px}
.wh{display:flex;gap:10px;align-items:baseline}.wh .src{color:#555;font-size:.85rem;flex:1}.wh .wm{font-weight:700;font-size:.9rem}
.qtext{margin:4px 0 6px;padding:0;color:#111;font-size:1.02rem;--qz:1}.qtext img.qf{mix-blend-mode:normal}
img.scan{display:block;max-width:100%;margin:6px auto}
.lines{background:repeating-linear-gradient(to bottom,transparent 0,transparent calc(2.1em - 1px),#999 calc(2.1em - 1px),#999 2.1em);margin-top:6px}
.mcans span{display:inline-block;width:3em;border-bottom:1px solid #333}
.answers{break-before:page}.answers h2{font-size:1.2rem}.wa{break-inside:avoid-page;margin:0 0 14px}.note{color:#666;font-size:.8rem}
.bar{position:sticky;top:0;background:#f3f3f3;border-bottom:1px solid #ccc;padding:8px 28px;display:flex;gap:10px;align-items:center}
.bar button{font:inherit;padding:6px 14px;border-radius:8px;border:1px solid #888;background:#fff;cursor:pointer}
@page{margin:14mm}@media print{.bar{display:none}.page{padding:0;max-width:none}}
</style></head><body><div class="bar"><button onclick="print()">Print or save as PDF</button><span>${list.length} questions · ${marks} marks</span></div><div class="page">
<h1>${esc(title)}</h1><p class="sub">${list.length} questions · ${marks} marks · Questions from QS past papers</p>
<div class="who"><span>Name</span><span>Class</span><span>Date</span></div>
${qs}${ans}</div></body></html>`;
  await saveFile(name.replace(/[^\w\- ]+/g, '').trim().replace(/\s+/g, '_') + (withAns ? '_worksheet_with_answers' : '_worksheet') + '.html', new Blob([html], {type: 'text/html'}));
}
$('#tSheet').onclick = () => makeSheet(false);
$('#tSheetA').onclick = () => makeSheet(true);

/* ---------------- search across every question at this level ---------------- */
let SIX = null, SHITS = [], srchT = 0;
const getSix = () => SIX || (SIX = J('search.json').catch(e => { SIX = null; throw e; }));
const tname = c => (TOPICS.find(t => t.code === c) || {}).name || c;
const normT = s => String(s).toLowerCase().replace(/[‐-―−]/g, '-');
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function snippet(text, words) {
  const low = normT(text); let at = low.indexOf(words[0]); if (at < 0) at = 0;
  const a = Math.max(0, at - 70), b = Math.min(text.length, at + 150);
  let sn = esc((a ? '…' : '') + text.slice(a, b) + (b < text.length ? '…' : ''));
  words.forEach(w => { const e = reEsc(esc(w)); if (e) sn = sn.replace(new RegExp(`(${e})`, 'gi'), '<mark>$1</mark>'); });
  return sn;
}
async function doSearch() {
  const raw = $('#srch').value.trim(), on = raw.length >= 2;
  $('#srchX').hidden = !raw; $('#srchRes').hidden = !on; $('#topics').hidden = on; $('.tabs').hidden = on;
  if (!on) return;
  if (!SIX) $('#srchRes').innerHTML = '<p class="muted">Searching…</p>';
  let rows; try { rows = await getSix(); } catch (e) { $('#srchRes').innerHTML = '<p class="muted">Search could not load. Reload the page to try again.</p>'; return; }
  if ($('#srch').value.trim() !== raw) return;
  const words = normT(raw).split(/\s+/).filter(Boolean), test = papersTest();
  SHITS = rows.filter(r => test(r[2]) && (ST.o.type === 'all' || r[3] === ST.o.type) && (w => words.every(x => w.includes(x)))(normT(r[5]) + ' ' + normT(tname(r[0]))))
    .sort((a, b) => b[2] - a[2] || qnum(a[1]) - qnum(b[1]));
  const MAX = 80, building = ST.building && TEACHER;
  $('#srchRes').innerHTML = `<p class="muted small" aria-live="polite">${SHITS.length ? `${SHITS.length} question${SHITS.length === 1 ? '' : 's'} found${SHITS.length > MAX ? `, showing the newest ${MAX}` : ''}. Paper and question-type settings apply.` : 'No questions found. Try fewer or different words.'}</p>
    <div class="qlist">${SHITS.slice(0, MAX).map((r, i) => { const q = {id: r[1]}, rt = ratingOf(q), inSet = ST.set.some(s => s[1] === r[1]), lab = r[1].split('|').pop();
      return `<div class="qi" data-i="${i}" role="button" tabindex="0"><span class="dot ${rt || ''}"></span><span class="t"><b>${esc(yname(r[2]))} · ${esc(LV === 'ah' ? 'Q' + (r[5].match(/^(\d+)/) || [, ''])[1] : shortOf(lab))} · ${esc(tname(r[0]))}</b><small>${snippet(r[5], words)}</small></span>
      ${building ? `<button class="btn sm add" data-sadd="${i}" aria-pressed="${inSet}">${inSet ? 'Added' : 'Add'}</button>` : '<span class="muted" aria-hidden="true">›</span>'}</div>`; }).join('')}</div>`;
  $$('#srchRes [data-i]').forEach(el => { el.onclick = () => openHit(+el.dataset.i); el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openHit(+el.dataset.i); } }; });
  $$('#srchRes [data-sadd]').forEach(b => b.onclick = e => { e.stopPropagation(); const r = SHITS[+b.dataset.sadd]; toggleSet({topic: r[0], id: r[1]}); const inSet = ST.set.some(s => s[1] === r[1]); b.setAttribute('aria-pressed', inSet); b.textContent = inSet ? 'Added' : 'Add'; });
}
async function openHit(i) {
  const r = SHITS[i]; if (!r) return;
  let list; try { list = await load(r[0]); } catch (e) { return toast('Could not open that question. Try again.'); }
  const same = SHITS.filter(h => h[0] === r[0]).map(h => list.find(q => q.id === h[1])).filter(Boolean), q = list.find(x => x.id === r[1]);
  if (!q) return toast('Could not open that question.');
  quiz = null; startSeq(same, same.indexOf(q), 'search');
}
$('#srch').oninput = () => { clearTimeout(srchT); srchT = setTimeout(doSearch, 220); };
$('#srch').onkeydown = e => { if (e.key === 'Escape') { $('#srch').value = ''; doSearch(); } };
$('#srchX').onclick = () => { $('#srch').value = ''; doSearch(); $('#srch').focus(); };

/* ---------------- Do Now starter: five short questions from covered topics, straight onto the board ---------------- */
async function doNow() {
  toast('Picking a Do Now starter…');
  try {
    const out = [];
    for (const c of weightedTopics(5)) {
      const pool = (await load(c)).filter(q => passes(q, true) && isShort(q)), tx = pool.filter(q => q.txt);
      if ((tx.length ? tx : pool).length) out.push(pick(tx.length ? tx : pool));
    }
    if (!out.length) return toast('No questions match your settings.');
    quiz = null; startSeq(out, 0, 'home'); present(true);
  } catch (e) { toast('Could not load questions. Try again.'); }
}
$('#goDoNow').onclick = doNow;

/* ---------------- online: teacher check and shared sets ---------------- */
async function initOnline() {
  return; /* standalone pupil copy: no sign-in, no teacher tools */
  try { USER = await claude.use('user'); } catch (e) {}
  try { if (USER) TEACHER = !!((await USER.isOwner()) || (USER.canEdit && await USER.canEdit())); } catch (e) {}
  try { DB = await claude.use('db'); } catch (e) {}
  if (DB) DB.collection('sets').onSnapshot(s => { SHARED = s.docs.map(d => ({id: d.id, ...d.data()})).sort((a, b) => b.at - a.at); if (view.screen === 'home') drawShared(); if (view.screen === 'teach') drawTeachShared(); }, () => {});
  if (view.screen === 'home') drawHome();
}

/* ---------------- support options: panel, question size buttons, redraws ---------------- */
function supLine() { const o = SUP(), bits = [];
  if (o.mix === 'gentle') bits.push('gentler start'); if (+o.qlen !== 10) bits.push(o.qlen + ' questions'); if (+o.xt) bits.push('+' + o.xt + '% in mocks');
  if (+o.zoom > 100) bits.push(o.zoom + '% size'); if (o.easy) bits.push('easier reading'); if (o.focus) bits.push('focus mode');
  $('#supLine').textContent = bits.length ? bits.join(' · ') : 'none on'; }
function drawZoom() {
  const z = +SUP().zoom || 100;
  $$('[data-zm]').forEach(el => { el.innerHTML = `<button type="button" class="btn sm ghost" data-zd="-10" aria-label="Smaller question" ${z <= 100 ? 'disabled' : ''}>A−</button><span class="zv" aria-live="polite">${z}%</span><button type="button" class="btn sm ghost" data-zd="10" aria-label="Bigger question" ${z >= 200 ? 'disabled' : ''}>A+</button>`; });
  $$('[data-zd]').forEach(b => b.onclick = () => { const n = Math.max(100, Math.min(200, z + +b.dataset.zd)); if (window.QSSUP) QSSUP.set({zoom: n}); });
}
if (window.QSSUP) {
  QSSUP.panel($('#supPanel'));
  let last = JSON.stringify(SUP());
  QSSUP.on(o => {
    supLine(); drawZoom();
    const k = JSON.stringify(o); if (k === last) return; last = k;
    if (view.screen === 'home' && TOPICS.length) { const a = $('#covBox').open, b = $('#settings').open, c = $('#supBox').open; drawHome(); $('#covBox').open = a; $('#settings').open = b; $('#supBox').open = c; }
    if (view.screen === 'list') drawList();
    if (view.screen === 'mocks') openMocks();
    if (view.screen === 'mockq') drawMockTimer();
  });
} else $('#supBox').hidden = true;
supLine(); drawZoom();

/* ---------------- start ---------------- */
function fromHash() {
  const h = decodeURIComponent(location.hash.slice(1));
  let m = h.match(/^topic-([A-Z]+)$/); if (m) return openTopic(m[1]);
  if (/^set-/.test(h)) return openSetToken(h);
  if (h === 'teacher') { setTeacher(true); return openTeach(); }
  if (h === 'teach' && TEACHER) return openTeach();
  if (h === 'donow') return doNow();
  if (h === 'daily') return startDaily(false);
  if (h === 'covered') { show('home'); drawHome(); $('#covBox').open = true; $('#covBox').scrollIntoView({block: 'start'}); return; }
  if (h === 'mistakes') return openMist();
  if (h === 'mocks') return openMocks();
  m = h.match(/^mock-(\d)$/); if (m) return startMock(+m[1]);
}
window.QSBANK = {go: h => { if (TOPICS.length) { if (location.hash.slice(1) === h) fromHash(); else location.hash = h; } else location.hash = h; }};
addEventListener('hashchange', fromHash);
drawSettings();
A.index().then(ts => {
  TOPICS = ts;
  if (!ST.mig) { try { const old = A.legacy(ts); for (const k in old) if (!ST.r[k]) ST.r[k] = old[k]; } catch (e) {} ST.mig = true; save(); }
  drawHome(); fromHash();
}).catch(() => { $('#topics').innerHTML = '<p class="muted">The topic list could not be loaded. Reload the page to try again.</p>'; });
initOnline();
})();
