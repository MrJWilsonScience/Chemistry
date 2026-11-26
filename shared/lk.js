/* Lab kit: experiment menus, predict-first, evaluation and topic links shared by every virtual lab. */
(function(){
const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
const esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const LV={n5:'National 5',higher:'Higher',ah:'Advanced Higher'};
const slug=t=>t.toLowerCase().replace(/[^a-z]+/g,'-');
let LEVEL=null;
const D=()=>window.LKD[LEVEL];
const key=id=>'lk:'+LEVEL+':'+id;
const rec=id=>LS.get(key(id),{});
const save=(id,o)=>LS.set(key(id),Object.assign(rec(id),o));
function list(){const out=[];D().units.forEach((u,ui)=>u.items.forEach(id=>out.push(id)));return out}
function href(id){const e=D().exp[id];return (e.page||'lab.html')+'#'+id}

/* ---- navigation to other tools through the hub ---- */
function hub(){let w=window;for(let i=0;i<6;i++){try{if(w.HUB)return w.HUB}catch(e){return null}if(w.parent===w)break;w=w.parent}return null}
function go(h){const H=hub();if(H){H.go(h);return}location.href='../../index.html#'+h}
function links(r){
  const M=window.QSMETA&&QSMETA[LEVEL];if(!M||!r)return[];const out=[];
  [].concat(r.bank||[]).forEach(c=>{const t=M.bank[c];if(t)out.push(['Past paper questions',t.n,LEVEL+'-bank-topic-'+c])});
  [].concat(r.notes||[]).forEach(c=>{const t=M.notes[c];if(t)out.push(['Topic practice',t,LEVEL+'-notes-'+c])});
  [].concat(r.cloze==null?[]:r.cloze).forEach(i=>{const t=M.cloze[i];if(t)out.push(['Fill the gaps',t,LEVEL+'-cloze-'+(LEVEL==='n5'?slug(t):'t'+i)])});
  return out}

/* ---- solo bar at the top of an experiment page ---- */
function bar(){
  if(document.getElementById('lkbar'))return;
  const b=document.createElement('nav');b.id='lkbar';b.className='lk-bar';b.setAttribute('aria-label','Experiment navigation');
  b.innerHTML=`<a class="lk-back" href="index.html">← All <span class="lk-lv">${LV[LEVEL]} </span>experiments</a><span class="lk-where" id="lkwhere"></span><span class="lk-pn"><a id="lkprev" class="lk-sm" href="#" aria-label="Previous experiment">← <span class="lk-lv">Previous</span></a><a id="lknext" class="lk-sm" href="#" aria-label="Next experiment"><span class="lk-lv">Next </span>→</a></span>`;
  document.body.prepend(b)}
function setNav(id){
  const L=list(),i=L.indexOf(id),e=D().exp[id];
  const w=document.getElementById('lkwhere');if(w)w.textContent=e?`${i+1} of ${L.length}`:'';
  const p=document.getElementById('lkprev'),n=document.getElementById('lknext');
  if(p){p.hidden=i<=0;if(i>0)p.href=href(L[i-1])}
  if(n){n.hidden=i<0||i>=L.length-1;if(i<L.length-1)n.href=href(L[i+1])}
  try{LS.set('lk:'+LEVEL+':last',id)}catch(e){}}

/* ---- predict, evaluate and practise cards ---- */
function predictCard(id,e){
  const p=e.p;if(!p)return null;const r=rec(id);
  const c=document.createElement('section');c.className='lk-card lk-predict';
  const draw=()=>{const r=rec(id),ch=r.pred;
    c.innerHTML=`<h3><span class="lk-step">1</span> Predict before you start</h3><p class="lk-q">${p.q}</p>
      <div class="lk-opts" role="group" aria-label="Your prediction">${p.o.map((o,i)=>`<button type="button" data-i="${i}" aria-pressed="${ch===i}" ${r.reveal?'disabled':''} class="${r.reveal?(i===p.a?'lk-right':ch===i?'lk-wrong':''):''}">${o}</button>`).join('')}</div>
      ${ch==null?'<p class="lk-note">Choose what you think will happen. You can check it after running the experiment.</p>':
        r.reveal?`<div class="lk-why ${ch===p.a?'ok':'no'}"><b>${ch===p.a?'Your prediction was right.':'Not quite — the experiment shows otherwise.'}</b> ${p.w}</div><button type="button" class="lk-btn lk-ghost" data-act="again">Predict again</button>`:
        `<p class="lk-note">Prediction saved. Now run the experiment, then check it.</p><button type="button" class="lk-btn" data-act="reveal">I've done it — check my prediction</button>`}`};
  c.addEventListener('click',ev=>{const b=ev.target.closest('button');if(!b)return;
    if(b.dataset.i!=null){save(id,{pred:+b.dataset.i,reveal:false});draw()}
    else if(b.dataset.act==='reveal'){save(id,{reveal:true,predOk:rec(id).pred===p.a});draw()}
    else if(b.dataset.act==='again'){save(id,{pred:null,reveal:false});draw()}});
  draw();return c}
function evalCard(id,e){
  if(!e.e||!e.e.length)return null;
  const c=document.createElement('section');c.className='lk-card lk-eval';
  const draw=()=>{const r=rec(id),got=r.got||{};
    c.innerHTML=`<h3><span class="lk-step">2</span> Evaluate your experiment</h3><p class="lk-note">Answer each question in your notebook or out loud, then compare with the model answer.</p>
    <ol class="lk-evq">${e.e.map(([q,a],i)=>`<li><p>${q}</p><details ${got[i]!=null?'open':''}><summary>Show model answer</summary><div class="lk-ans">${a}</div>
      <div class="lk-self" role="group" aria-label="How did you do?"><span>How did you do?</span><button type="button" data-q="${i}" data-v="1" aria-pressed="${got[i]===1}">Got it</button><button type="button" data-q="${i}" data-v="0" aria-pressed="${got[i]===0}">Not yet</button></div></details></li>`).join('')}</ol>
    <p class="lk-note">${Object.keys(got).length} of ${e.e.length} marked · ${Object.values(got).filter(v=>v===1).length} got it</p>`};
  c.addEventListener('click',ev=>{const b=ev.target.closest('button[data-q]');if(!b)return;const r=rec(id),got=r.got||{};got[b.dataset.q]=+b.dataset.v;save(id,{got});draw()});
  draw();return c}
function practiseCard(id,e){
  const L=links(e.r);if(!L.length)return null;
  const c=document.createElement('section');c.className='lk-card lk-practise';
  c.innerHTML=`<h3><span class="lk-step">3</span> Practise this topic</h3><div class="lk-links">${L.map(([k,t,h])=>`<button type="button" data-go="${esc(h)}"><small>${k}</small><b>${esc(t)}</b></button>`).join('')}</div>`;
  c.addEventListener('click',ev=>{const b=ev.target.closest('[data-go]');if(b)go(b.dataset.go)});
  return c}

function attach(id,o){
  o=o||{};const e=D().exp[id];const root=o.root;if(!e||!root)return;
  root.querySelectorAll(':scope .lk-card').forEach(n=>n.remove());
  const pc=predictCard(id,e);
  if(pc){if(o.after&&o.after.parentNode)o.after.after(pc);else root.prepend(pc)}
  const tail=[evalCard(id,e),practiseCard(id,e)].filter(Boolean);
  const host=o.end||root;tail.forEach(n=>host.append(n));
  save(id,{seen:Date.now()});setNav(id);
  document.title=(e.t||document.title);}

/* ---- experiment menu ---- */
function status(id){const r=rec(id),e=D().exp[id];let s=0,n=0;
  if(e.p){n++;if(r.reveal)s++}if(e.e&&e.e.length){n++;if(r.got&&Object.keys(r.got).length>=e.e.length)s++}
  return{seen:!!r.seen,done:n&&s===n,part:s>0||!!r.seen}}
function menu(level,host){
  LEVEL=level;const d=D();
  const want=location.hash.slice(1);if(want&&d.exp[want]){location.replace(href(want));return}
  const last=LS.get('lk:'+level+':last',null);
  const total=list().length,done=list().filter(id=>status(id).done).length;
  host.innerHTML=`<header class="lk-mhead"><div><h1>${LV[level]} virtual labs</h1><p>${total} experiments · pick one to open it. Each one starts with a prediction and ends with evaluation questions.</p></div>
    <div class="lk-mstats"><b>${done}</b><span>of ${total} completed</span>${last&&d.exp[last]?`<a class="lk-btn" href="${href(last)}">Continue: ${esc(d.exp[last].t)}</a>`:''}</div></header>
    ${d.units.map(u=>`<section class="lk-unit"><h2>${esc(u.t)}</h2><div class="lk-grid">${u.items.map(id=>{const e=d.exp[id],s=status(id);
      return `<a class="lk-exp ${s.done?'done':s.part?'part':''}" href="${href(id)}"><span class="lk-ico" aria-hidden="true">${esc(e.i||e.t.slice(0,2))}</span><span class="lk-txt"><b>${esc(e.t)}${e.n?' <em class="lk-new">New</em>':''}</b><span>${esc(e.s||'')}</span></span><span class="lk-st">${s.done?'Completed':s.part?'Started':''}</span></a>`}).join('')}</div></section>`).join('')}`;
  addEventListener('hashchange',()=>{const h=location.hash.slice(1);if(h&&d.exp[h])location.replace(href(h))});
}

window.LK={init(level){LEVEL=level;bar()},attach,menu,go,links,status:(l,id)=>{const o=LEVEL;LEVEL=l;const s=status(id);LEVEL=o;return s},rec:(l,id)=>LS.get('lk:'+l+':'+id,{})};
})();
