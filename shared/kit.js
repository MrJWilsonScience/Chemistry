/* Realistic lab apparatus kit for the virtual labs.
   Every builder returns an SVG string for a 460 × 260 bench scene. The bench top is at y = BENCH.
   Gradients and filters live in one hidden <svg> so every experiment can share them. */
(() => {
const K = window.K = {};
const BENCH = K.BENCH = 232;
const f1 = n => (+n).toFixed(1);
const R = (a, b) => a + Math.random() * (b - a);
/* a small seeded random so things like marble chips keep their shape between frames */
K.seed = s => () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };

const GL = K.GL = '#7d9aa1';                 /* glass edge */
K.WATER = 'rgba(160,205,226,.5)';
const liq = K.liq = f => !f || f === 'var(--acid)' ? K.WATER : f;

const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<linearGradient id="kGlass" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset=".14" stop-color="#fff" stop-opacity=".1"/><stop offset=".72" stop-color="#fff" stop-opacity=".05"/><stop offset=".9" stop-color="#fff" stop-opacity=".32"/><stop offset="1" stop-color="#d4e6ea" stop-opacity=".55"/></linearGradient>
<linearGradient id="kShade" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".26"/><stop offset=".22" stop-color="#000" stop-opacity="0"/><stop offset=".68" stop-color="#fff" stop-opacity=".14"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>
<linearGradient id="kDepth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".15"/><stop offset="1" stop-color="#000" stop-opacity=".18"/></linearGradient>
<linearGradient id="kMetal" x1="0" x2="1"><stop offset="0" stop-color="#5f676b"/><stop offset=".32" stop-color="#e9edef"/><stop offset=".58" stop-color="#9ba4a9"/><stop offset="1" stop-color="#4f565a"/></linearGradient>
<linearGradient id="kMetalV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f676b"/><stop offset=".32" stop-color="#e9edef"/><stop offset=".58" stop-color="#9ba4a9"/><stop offset="1" stop-color="#4f565a"/></linearGradient>
<linearGradient id="kCopper" x1="0" x2="1"><stop offset="0" stop-color="#6e3412"/><stop offset=".33" stop-color="#eaa26b"/><stop offset=".58" stop-color="#b8693a"/><stop offset="1" stop-color="#5e2c10"/></linearGradient>
<linearGradient id="kCarbon" x1="0" x2="1"><stop offset="0" stop-color="#151515"/><stop offset=".35" stop-color="#5b5b5b"/><stop offset=".6" stop-color="#2c2c2c"/><stop offset="1" stop-color="#0d0d0d"/></linearGradient>
<linearGradient id="kBench" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a666a"/><stop offset=".06" stop-color="#323b3f"/><stop offset="1" stop-color="#1d2326"/></linearGradient>
<linearGradient id="kWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--panel)"/><stop offset="1" style="stop-color:var(--bg)"/></linearGradient>
<linearGradient id="kPlastic" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d4549"/><stop offset="1" stop-color="#1f2427"/></linearGradient>
<linearGradient id="kCase" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2f0ea"/><stop offset="1" stop-color="#cfcbc1"/></linearGradient>
<linearGradient id="kLCD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9d6b3"/><stop offset="1" stop-color="#a9b993"/></linearGradient>
<linearGradient id="kRubber" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a3a2a"/><stop offset="1" stop-color="#4a1f15"/></linearGradient>
<linearGradient id="kWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c99a62"/><stop offset="1" stop-color="#94673a"/></linearGradient>
<linearGradient id="kFoam" x1="0" x2="1"><stop offset="0" stop-color="#d9d6cf"/><stop offset=".35" stop-color="#ffffff"/><stop offset="1" stop-color="#cfcac0"/></linearGradient>
<linearGradient id="kPorcelain" x1="0" x2="1"><stop offset="0" stop-color="#d8d8d2"/><stop offset=".35" stop-color="#ffffff"/><stop offset="1" stop-color="#c9c9c2"/></linearGradient>
<linearGradient id="kBrown" x1="0" x2="1"><stop offset="0" stop-color="#3d1e08"/><stop offset=".35" stop-color="#8a4b1c"/><stop offset="1" stop-color="#2e1606"/></linearGradient>
<linearGradient id="kFlameB" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#2f5cf0" stop-opacity=".95"/><stop offset=".55" stop-color="#6f9bff" stop-opacity=".55"/><stop offset="1" stop-color="#a9c6ff" stop-opacity="0"/></linearGradient>
<linearGradient id="kFlameY" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#3b6cf2" stop-opacity=".8"/><stop offset=".18" stop-color="#ff9d1c"/><stop offset=".6" stop-color="#ffd447"/><stop offset="1" stop-color="#fff1a8" stop-opacity="0"/></linearGradient>
<linearGradient id="kSootFade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121212" stop-opacity="0"/><stop offset="1" stop-color="#121212"/></linearGradient>
<radialGradient id="kGlow" r=".5"><stop offset="0" stop-color="#fff7c7" stop-opacity=".95"/><stop offset=".4" stop-color="#ffd23f" stop-opacity=".5"/><stop offset="1" stop-color="#ffd23f" stop-opacity="0"/></radialGradient>
<radialGradient id="kBub" cx=".35" cy=".32" r=".7"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".45" stop-color="#fff" stop-opacity=".2"/><stop offset="1" stop-color="#bfe0ea" stop-opacity=".55"/></radialGradient>
<radialGradient id="kChip" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fdfcf8"/><stop offset=".65" stop-color="#ddd5c6"/><stop offset="1" stop-color="#a89d88"/></radialGradient>
<radialGradient id="kRed" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#ff8a80"/><stop offset=".6" stop-color="#d32f2f"/><stop offset="1" stop-color="#8e1b1b"/></radialGradient>
<radialGradient id="kBall" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#c9ced4"/><stop offset="1" stop-color="#6d747a"/></radialGradient>
<pattern id="kGauze" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 0H5M0 0V5" stroke="#7b8287" stroke-width=".7"/></pattern>
<pattern id="kTiles" width="46" height="26" patternUnits="userSpaceOnUse"><path d="M0 0H46M0 0V26" style="stroke:var(--line)" stroke-width="1" opacity=".55"/></pattern>
<filter id="kBlur" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3.2"/></filter>
<filter id="kSoft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.3"/></filter>
<filter id="kHaze" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2"/></filter>
<clipPath id="kLens" clipPathUnits="objectBoundingBox"><circle cx=".5" cy=".5" r=".5"/></clipPath>
</defs></svg>`;
document.body.insertAdjacentHTML('afterbegin', DEFS);

/* ---------- scene ---------- */
K.back = () => `<rect width="460" height="${BENCH}" fill="url(#kWall)"/><rect width="460" height="${BENCH}" fill="url(#kTiles)"/>
<rect y="${BENCH}" width="460" height="${260 - BENCH}" fill="url(#kBench)"/><rect y="${BENCH}" width="460" height="1.5" fill="#fff" opacity=".25"/>`;
K.shadow = (cx, w, y = BENCH) => `<ellipse cx="${f1(cx)}" cy="${f1(y + 1.5)}" rx="${f1(w / 2 + 3)}" ry="3.2" fill="#000" opacity=".35" filter="url(#kSoft)"/>`;
/* labels: on the wall use T, on the dark bench use TB */
K.T = (x, y, s, o = {}) => `<text x="${f1(x)}" y="${f1(y)}" font-size="${o.s || 10.5}" text-anchor="${o.a || 'middle'}" style="fill:${o.f || 'var(--muted)'}" font-family="IBM Plex Mono,monospace"${o.w ? ` font-weight="${o.w}"` : ''}>${s}</text>`;
K.TB = (x, s, o = {}) => K.T(x, BENCH + 18, s, Object.assign({f: '#dfe8e6', s: 10}, o));
K.tag = (x, y, s, o = {}) => { const w = Math.max(30, s.length * (o.s || 10.5) * .62 + 14); const ax = o.a === 'start' ? x : o.a === 'end' ? x - w : x - w / 2;
  return `<rect x="${f1(ax)}" y="${f1(y - 13)}" width="${f1(w)}" height="18" rx="4" style="fill:var(--panel);stroke:var(--line)"/>${K.T(ax + w / 2, y, s, Object.assign({f: 'var(--ink)'}, o, {a: 'middle'}))}`; };

/* ---------- liquids ---------- */
/* surface: shaded body, lighter meniscus band and a thin contact line */
function surface(x0, x1, y, fill) {
  const w = x1 - x0;
  return `<path d="M${f1(x0)} ${f1(y)} Q${f1(x0 + w / 2)} ${f1(y + 3.2)} ${f1(x1)} ${f1(y)}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.2"/>
  <path d="M${f1(x0)} ${f1(y - .6)} Q${f1(x0 + w / 2)} ${f1(y + 2.4)} ${f1(x1)} ${f1(y - .6)}" fill="none" stroke="#000" stroke-opacity=".18" stroke-width=".8"/>`;
}
K.liquidPath = (d, fill, x0, x1, y, o = {}) => `<path d="${d}" fill="${liq(fill)}"${o.op ? ` fill-opacity="${o.op}"` : ''}/><path d="${d}" fill="url(#kShade)"/><path d="${d}" fill="url(#kDepth)"/>${o.noSurf ? '' : surface(x0 + 1, x1 - 1, y, fill)}`;

/* ---------- glassware ---------- */
/* beaker: x, y = top-left of the body; same signature as the old builder */
K.beaker = (x, y, w, h, fill, lvl = .6, o = {}) => {
  const b = y + h, r = 6, ly = b - (h - 8) * lvl;
  const L = lvl > 0 ? K.liquidPath(`M${f1(x + 1.5)} ${f1(ly)} V${f1(b - r)} Q${f1(x + 1.5)} ${f1(b - 1)} ${f1(x + r)} ${f1(b - 1)} H${f1(x + w - r)} Q${f1(x + w - 1.5)} ${f1(b - 1)} ${f1(x + w - 1.5)} ${f1(b - r)} V${f1(ly)} Z`, fill, x + 1.5, x + w - 1.5, ly, o) : '';
  let g = ''; if (!o.noMarks) for (let i = 1; i <= 4; i++) { const yy = b - h * .18 * i; if (yy > y + 10) g += `<path d="M${f1(x + w * .62)} ${f1(yy)} h${f1(w * .16)}" stroke="#fff" stroke-opacity=".75" stroke-width="1"/>`; }
  const body = `M${f1(x - 4)} ${f1(y)} Q${f1(x)} ${f1(y)} ${f1(x)} ${f1(y + 4)} V${f1(b - r)} Q${f1(x)} ${f1(b)} ${f1(x + r)} ${f1(b)} H${f1(x + w - r)} Q${f1(x + w)} ${f1(b)} ${f1(x + w)} ${f1(b - r)} V${f1(y + 4)} Q${f1(x + w)} ${f1(y)} ${f1(x + w + 3)} ${f1(y - 1)}`;
  return `${o.noShadow ? '' : K.shadow(x + w / 2, w, b)}${L}${o.inside || ''}<path d="${body}" fill="url(#kGlass)" stroke="${GL}" stroke-width="1.6" stroke-linejoin="round"/>${g}
  <rect x="${f1(x + w * .1)}" y="${f1(y + 8)}" width="3" height="${f1(h - 20)}" rx="1.5" fill="#fff" opacity=".5"/>`;
};
/* test tube or boiling tube: x, y = top-left; w wide; h tall */
K.tube = (x, y, h, fill, lvl = .5, w = 30, o = {}) => {
  const r = w / 2, b = y + h, ly = b - (h - 6) * lvl;
  const d = `M${f1(x + 1.5)} ${f1(ly)} V${f1(b - r)} A${f1(r - 1.5)} ${f1(r - 1.5)} 0 0 0 ${f1(x + w - 1.5)} ${f1(b - r)} V${f1(ly)} Z`;
  const L = lvl > 0 ? K.liquidPath(d, fill, x + 1.5, x + w - 1.5, ly, o) : '';
  return `${L}${o.inside || ''}<path d="M${f1(x)} ${f1(y + 2)} V${f1(b - r)} A${f1(r)} ${f1(r)} 0 0 0 ${f1(x + w)} ${f1(b - r)} V${f1(y + 2)}" fill="url(#kGlass)" stroke="${GL}" stroke-width="1.5"/>
  <ellipse cx="${f1(x + r)}" cy="${f1(y + 2)}" rx="${f1(r + 1.5)}" ry="2.4" fill="none" stroke="${GL}" stroke-width="1.6"/>
  <rect x="${f1(x + w * .18)}" y="${f1(y + 8)}" width="2.4" height="${f1(h - r - 12)}" rx="1.2" fill="#fff" opacity=".55"/>`;
};
/* conical flask: centre x, base y, height h, body width w */
K.flask = (cx, base, h, w, fill, lvl = .3, o = {}) => {
  const nw = o.nw || w * .24, nh = o.nh || h * .3, sh = base - (h - nh), top = base - h;
  const xl = y => cx - (nw / 2 + (w / 2 - nw / 2) * (y - sh) / (base - sh)), xr = y => 2 * cx - xl(y);
  const ly = base - 4 - (base - 4 - sh) * lvl;
  const d = `M${f1(xl(ly) + 1.5)} ${f1(ly)} L${f1(cx - w / 2 + 6)} ${f1(base - 4)} Q${f1(cx - w / 2 + 3)} ${f1(base - 1.5)} ${f1(cx - w / 2 + 9)} ${f1(base - 1.5)} H${f1(cx + w / 2 - 9)} Q${f1(cx + w / 2 - 3)} ${f1(base - 1.5)} ${f1(cx + w / 2 - 6)} ${f1(base - 4)} L${f1(xr(ly) - 1.5)} ${f1(ly)} Z`;
  const L = lvl > 0 ? K.liquidPath(d, fill, xl(ly) + 1.5, xr(ly) - 1.5, ly, o) : '';
  const body = `M${f1(cx - nw / 2 - 2)} ${f1(top)} H${f1(cx - nw / 2)} V${f1(sh)} L${f1(cx - w / 2 + 4)} ${f1(base - 5)} Q${f1(cx - w / 2)} ${f1(base)} ${f1(cx - w / 2 + 8)} ${f1(base)} H${f1(cx + w / 2 - 8)} Q${f1(cx + w / 2)} ${f1(base)} ${f1(cx + w / 2 - 4)} ${f1(base - 5)} L${f1(cx + nw / 2)} ${f1(sh)} V${f1(top)} H${f1(cx + nw / 2 + 2)}`;
  return `${K.shadow(cx, w, base)}${L}${o.inside || ''}<path d="${body}" fill="url(#kGlass)" stroke="${GL}" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M${f1(cx - w * .3)} ${f1(base - 8)} L${f1(cx - nw / 2 + 3)} ${f1(sh + 6)}" stroke="#fff" stroke-width="2.6" stroke-linecap="round" opacity=".45"/>`;
};
/* rubber bung for a neck of width w, top at y */
K.bung = (cx, y, w, h = 12) => `<path d="M${f1(cx - w / 2 - 3)} ${f1(y)} H${f1(cx + w / 2 + 3)} L${f1(cx + w / 2)} ${f1(y + h)} H${f1(cx - w / 2)} Z" fill="url(#kRubber)"/><rect x="${f1(cx - w / 2 - 3)}" y="${f1(y)}" width="${f1(w + 6)}" height="2" fill="#fff" opacity=".18"/>`;
/* glass delivery tube along a path */
K.dtube = d => `<path d="${d}" fill="none" stroke="${GL}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#eef6f7" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`;
/* bubbles that look like bubbles */
K.bub = (n, x0, x1, y0, y1, big = 2.8) => { let s = ''; for (let i = 0; i < n; i++) { const r = R(.9, big); s += `<circle cx="${f1(R(x0, x1))}" cy="${f1(R(y0, y1))}" r="${f1(r)}" fill="url(#kBub)" stroke="#fff" stroke-opacity=".7" stroke-width=".5"/>`; } return s; };
/* froth on a surface */
K.froth = (x0, x1, y, n = 14) => { let s = ''; for (let i = 0; i < n; i++) s += `<circle cx="${f1(R(x0, x1))}" cy="${f1(y - R(0, 6))}" r="${f1(R(1.5, 3.5))}" fill="url(#kBub)" stroke="#fff" stroke-opacity=".8" stroke-width=".5"/>`; return s; };

/* ---------- supports and heat ---------- */
/* retort stand: base centre x, rod at rx, top y; clamps is a list of [y, toX] */
K.stand = (rx, top, clamps = [], o = {}) => {
  let s = `<rect x="${f1(rx - 34)}" y="${BENCH - 8}" width="78" height="8" rx="2" fill="url(#kPlastic)"/><rect x="${f1(rx - 34)}" y="${BENCH - 8}" width="78" height="1.4" fill="#fff" opacity=".25"/>
  <rect x="${f1(rx - 2.5)}" y="${f1(top)}" width="5" height="${f1(BENCH - 8 - top)}" fill="url(#kMetal)"/>`;
  clamps.forEach(([y, to]) => { const dir = to > rx ? 1 : -1, x1 = to - dir * 8;
    s += `<rect x="${f1(Math.min(rx, x1))}" y="${f1(y - 2)}" width="${f1(Math.abs(x1 - rx))}" height="4" fill="url(#kMetalV)"/>
    <rect x="${f1(rx - 6)}" y="${f1(y - 6)}" width="12" height="12" rx="2" fill="#3a4246"/><circle cx="${f1(rx + 8 * dir)}" cy="${f1(y)}" r="2.4" fill="#c7cdd0"/>
    <path d="M${f1(x1)} ${f1(y - 7)} h${f1(dir * 14)} M${f1(x1)} ${f1(y + 7)} h${f1(dir * 14)}" stroke="#c43c2c" stroke-width="4" stroke-linecap="round"/>`; });
  return s;
};
/* Bunsen burner on the bench; flame: null | 'blue' | 'yellow' | colour for a flame test */
K.bunsen = (cx, flame, o = {}) => {
  const top = BENCH - 58;
  let s = `${K.shadow(cx, 34)}<path d="M${cx - 17} ${BENCH} L${cx - 13} ${BENCH - 9} H${cx + 13} L${cx + 17} ${BENCH} Z" fill="url(#kPlastic)"/>
  <rect x="${cx - 5}" y="${top}" width="10" height="${BENCH - 9 - top}" fill="url(#kMetal)"/><rect x="${cx - 6.5}" y="${BENCH - 26}" width="13" height="9" rx="1.5" fill="url(#kMetal)"/><rect x="${cx - 2}" y="${BENCH - 24}" width="4" height="5" fill="#262b2e"/>
  <path d="M${cx + 13} ${BENCH - 5} q22 2 30 12" fill="none" stroke="#d9772f" stroke-width="4.5" stroke-linecap="round"/>`;
  if (flame) s += K.flame(cx, top, flame, o);
  return s;
};
K.flame = (cx, top, flame, o = {}) => {
  const big = o.h || 64;
  if (flame === 'blue') return `<ellipse cx="${cx}" cy="${top - big * .35}" rx="12" ry="${big * .4}" fill="#6f9bff" opacity=".25" filter="url(#kBlur)"/>
    <path d="M${cx - 5} ${top} C${cx - 10} ${top - big * .3} ${cx - 3} ${top - big * .6} ${cx} ${top - big * .8} C${cx + 3} ${top - big * .6} ${cx + 10} ${top - big * .3} ${cx + 5} ${top} Z" fill="url(#kFlameB)"/>
    <path d="M${cx - 3.5} ${top} C${cx - 5} ${top - big * .18} ${cx - 1.5} ${top - big * .3} ${cx} ${top - big * .38} C${cx + 1.5} ${top - big * .3} ${cx + 5} ${top - big * .18} ${cx + 3.5} ${top} Z" fill="#9fd0ff" opacity=".9"/>`;
  if (flame === 'yellow') return `<ellipse cx="${cx}" cy="${top - big * .45}" rx="16" ry="${big * .5}" fill="#ffb02e" opacity=".35" filter="url(#kBlur)"/>
    <path d="M${cx - 6} ${top} C${cx - 14} ${top - big * .35} ${cx - 4} ${top - big * .75} ${cx + 1} ${top - big} C${cx + 3} ${top - big * .7} ${cx + 13} ${top - big * .35} ${cx + 6} ${top} Z" fill="url(#kFlameY)"/>`;
  /* coloured flame for a flame test: coloured mantle round a small blue cone */
  return `<ellipse cx="${cx}" cy="${top - big * .45}" rx="18" ry="${big * .5}" fill="${flame}" opacity=".45" filter="url(#kBlur)"/>
    <path d="M${cx - 7} ${top} C${cx - 15} ${top - big * .35} ${cx - 5} ${top - big * .75} ${cx} ${top - big * .98} C${cx + 5} ${top - big * .75} ${cx + 15} ${top - big * .35} ${cx + 7} ${top} Z" fill="${flame}" opacity=".88"/>
    <path d="M${cx - 3.5} ${top} C${cx - 5} ${top - big * .16} ${cx - 1.5} ${top - big * .28} ${cx} ${top - big * .34} C${cx + 1.5} ${top - big * .28} ${cx + 5} ${top - big * .16} ${cx + 3.5} ${top} Z" fill="#9fd0ff" opacity=".85"/>`;
};
/* tripod with gauze: top surface at y (gauze) */
K.tripod = (cx, y, w = 70, gauze = true) => `<path d="M${f1(cx - w / 2 + 6)} ${f1(y + 3)} L${f1(cx - w / 2 - 4)} ${BENCH} M${f1(cx + w / 2 - 6)} ${f1(y + 3)} L${f1(cx + w / 2 + 4)} ${BENCH} M${f1(cx)} ${f1(y + 3)} L${f1(cx + 2)} ${BENCH - 4}" stroke="#3a4246" stroke-width="3.5" stroke-linecap="round"/>
  <rect x="${f1(cx - w / 2)}" y="${f1(y)}" width="${w}" height="4" rx="1" fill="#3a4246"/>${gauze ? `<rect x="${f1(cx - w / 2 - 4)}" y="${f1(y - 2)}" width="${w + 8}" height="3" fill="url(#kGauze)" stroke="#7b8287" stroke-width=".6"/><rect x="${f1(cx - w * .22)}" y="${f1(y - 2.4)}" width="${f1(w * .44)}" height="3.4" rx="1.5" fill="#e9e6de"/>` : ''}${K.shadow(cx, w + 10)}`;
/* heatproof mat */
K.mat = (cx, w = 90) => `<rect x="${f1(cx - w / 2)}" y="${BENCH - 3}" width="${w}" height="4" rx="1" fill="#e6e0d2"/><rect x="${f1(cx - w / 2)}" y="${BENCH - 3}" width="${w}" height="1" fill="#fff" opacity=".6"/>`;

/* ---------- measuring ---------- */
K.thermo = (x, y, h, frac, o = {}) => { const f = Math.max(0, Math.min(1, frac)), cap = (h - 10) * f + 4;
  let t = ''; for (let i = 1; i < 10; i++) t += `<path d="M${x + 6.5} ${f1(y + 4 + (h - 8) * i / 10)} h${i % 5 ? 2.5 : 4}" stroke="#4a4a4a" stroke-width=".6"/>`;
  return `<rect x="${x}" y="${y}" width="9" height="${h}" rx="4.5" fill="#f7fbfb" fill-opacity=".85" stroke="${GL}" stroke-width="1.2"/>${t}<rect x="${x + 3.3}" y="${f1(y + h - cap)}" width="2.4" height="${f1(cap)}" fill="#d32f2f"/>
  <circle cx="${x + 4.5}" cy="${y + h + 4}" r="6" fill="url(#kRed)" stroke="${GL}" stroke-width="1"/><rect x="${x + 1.5}" y="${y + 4}" width="1.6" height="${h - 12}" fill="#fff" opacity=".7"/>`; };
/* digital meter: body, LCD with value, label */
K.meter = (x, y, w, h, val, label, o = {}) => `<rect x="${x + 2}" y="${y + 3}" width="${w}" height="${h}" rx="8" fill="#000" opacity=".25" filter="url(#kSoft)"/>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${o.light ? 'url(#kCase)' : 'url(#kPlastic)'}"/><rect x="${x + 7}" y="${y + 7}" width="${w - 14}" height="${Math.min(30, h * .48)}" rx="3" fill="url(#kLCD)" stroke="#0005"/>
  <text x="${x + w - 12}" y="${y + 7 + Math.min(30, h * .48) * .74}" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="${o.fs || 17}" font-weight="500" fill="#1f2a18">${val}</text>
  <text x="${x + w / 2}" y="${y + h - (o.terms ? 18 : 9)}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" fill="${o.light ? '#3a3a3a' : '#d8e0de'}">${label}</text>
  ${o.terms ? `<circle cx="${x + w * .32}" cy="${y + h - 8}" r="4" fill="#c0392b"/><circle cx="${x + w * .68}" cy="${y + h - 8}" r="4" fill="#1d1d1d" stroke="#555"/>` : ''}`;
/* insulated lead along a path: colour red / black / blue */
K.wire = (d, c = '#c0392b') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1" stroke-linecap="round"/>`;
K.croc = (x, y, c = '#c0392b') => `<path d="M${x - 6} ${y - 4} L${x + 4} ${y - 2} L${x + 4} ${y + 2} L${x - 6} ${y + 4} Z" fill="${c}"/><path d="M${x + 4} ${y - 2} l5 2 l-5 2" fill="#c7cdd0"/>`;
/* gas syringe lying horizontally: x, y = left end of barrel centre line; len px for 100 cm³ */
K.syringe = (x, y, len, vol, max = 100) => {
  const px = Math.min(vol, max) / max * len; let t = '';
  for (let v = 0; v <= max; v += 5) { const xx = x + 10 + v / max * len; t += `<path d="M${f1(xx)} ${y - 9} v${v % 10 ? 4 : 7}" stroke="#2b2b2b" stroke-width=".7"/>`; if (v % 20 === 0) t += `<text x="${f1(xx)}" y="${y - 12}" text-anchor="middle" font-size="8.5" font-family="IBM Plex Mono,monospace" fill="#2b2b2b">${v}</text>`; }
  return `<rect x="${x}" y="${y - 10}" width="${len + 22}" height="20" rx="3" fill="url(#kGlass)" stroke="${GL}" stroke-width="1.5"/>${t}
  <rect x="${f1(x + 10 + px)}" y="${y - 8}" width="7" height="16" rx="1" fill="#dfe8ea" stroke="${GL}"/><rect x="${f1(x + 17 + px)}" y="${y - 3}" width="${f1(len + 12 - px)}" height="6" fill="url(#kGlass)" stroke="${GL}"/>
  <rect x="${f1(x + 29 + len)}" y="${y - 9}" width="6" height="18" rx="1" fill="#dfe8ea" stroke="${GL}"/><rect x="${x + 4}" y="${y - 7}" width="${len + 14}" height="2" fill="#fff" opacity=".55"/>`;
};
/* burette with scale 0–50 cm³ from top: x = left edge, y0 = 0 mark, y1 = 50 mark, read = current reading */
K.burette = (x, y0, y1, read, fill, o = {}) => {
  const k = (y1 - y0) / 50, ly = y0 + read * k, w = 14; let t = '';
  for (let v = 0; v <= 50; v++) { const yy = y0 + v * k; const L = v % 5 ? 3 : v % 10 ? 5 : 8; t += `<path d="M${x + 2} ${f1(yy)} h${L}" stroke="#202020" stroke-width="${v % 10 ? .5 : .8}"/>`; if (v % 10 === 0) t += `<text x="${x + 12}" y="${f1(yy + 3)}" font-size="7" font-family="IBM Plex Mono,monospace" fill="#202020">${v}</text>`; }
  const bot = y1 + 14;
  return `<rect x="${x}" y="${y0 - 16}" width="${w}" height="${f1(bot - y0 + 16)}" rx="2" fill="url(#kGlass)" stroke="${GL}" stroke-width="1.4"/>
  ${read < 50.5 ? `<rect x="${x + 1.5}" y="${f1(ly)}" width="${w - 3}" height="${f1(bot - ly)}" fill="${liq(fill)}"/><rect x="${x + 1.5}" y="${f1(ly)}" width="${w - 3}" height="${f1(bot - ly)}" fill="url(#kShade)"/><path d="M${x + 1.5} ${f1(ly)} Q${x + w / 2} ${f1(ly + 3)} ${x + w - 1.5} ${f1(ly)}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width=".9"/>` : ''}${t}
  <path d="M${x + 3} ${bot} h${w - 6} l-1.5 8 h${-(w - 9)} z" fill="url(#kGlass)" stroke="${GL}"/><rect x="${x - 7}" y="${bot + 7}" width="${w + 14}" height="6" rx="2" fill="#e8eef2" stroke="#8aa"/>${o.tap === 'closed' ? `<rect x="${x + w + 2}" y="${bot + 8}" width="14" height="5" rx="1.5" fill="#2d6fd2"/>` : `<rect x="${x + w + 4}" y="${bot + 4}" width="5" height="12" rx="1.5" fill="#2d6fd2"/>`}
  <path d="M${x + w / 2 - 2} ${bot + 13} h4 l-.8 14 h-2.4 z" fill="url(#kGlass)" stroke="${GL}"/>${o.drip ? `<ellipse cx="${x + w / 2}" cy="${bot + 31}" rx="1.6" ry="2.3" fill="${liq(fill)}" stroke="${GL}" stroke-width=".4"/>` : ''}
  <rect x="${x + 3}" y="${y0 - 12}" width="2" height="${f1(bot - y0 + 6)}" fill="#fff" opacity=".55"/>`;
};
/* magnifier showing a burette scale near the reading */
K.lens = (cx, cy, r, read, fill) => {
  const k = 32, y = v => cy + (v - read) * k; let t = '';
  for (let i = Math.floor((read - r / k) * 10) - 1; i <= Math.ceil((read + r / k) * 10) + 1; i++) { if (i < 0 || i > 500) continue; const vv = i / 10, whole = i % 10 === 0, half = i % 5 === 0;
    t += `<path d="M${cx - 34} ${f1(y(vv))} h${whole ? 30 : half ? 20 : 12}" stroke="#202020" stroke-width="${whole ? 1.4 : .8}"/>`; if (whole) t += `<text x="${cx + 1}" y="${f1(y(vv) + 4.5)}" font-size="13" font-family="IBM Plex Mono,monospace" fill="#202020">${i / 10}</text>`; }
  const ly = cy;
  return `<g clip-path="url(#kLens)"><rect x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" fill="#f3f8f9"/>
    <rect x="${cx - r}" y="${f1(ly)}" width="${2 * r}" height="${r + 2}" fill="${liq(fill)}"/><path d="M${cx - r} ${f1(ly - 7)} Q${cx} ${f1(ly + 4)} ${cx + r} ${f1(ly - 7)}" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="2"/>${t}
    <path d="M${cx - r} ${f1(ly - 1.5)} H${cx + r}" stroke="#c0392b" stroke-width=".9" stroke-dasharray="3 3"/></g>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#2d3438" stroke-width="5"/><circle cx="${cx}" cy="${cy}" r="${r - 3}" fill="none" stroke="#fff" stroke-opacity=".5"/>
    <path d="M${f1(cx + r * .7)} ${f1(cy + r * .7)} l18 18" stroke="#2d3438" stroke-width="7" stroke-linecap="round"/>`;
};
/* ruler: vertical, mm from y0 upwards, pxmm */
K.ruler = (x, y0, top, pxmm, o = {}) => { let s = `<rect x="${x}" y="${f1(top - 4)}" width="${o.w || 30}" height="${f1(y0 - top + 14)}" rx="2" fill="#f6efd9" stroke="#b8a77a"/>`;
  for (let mm = 0; ; mm++) { const y = y0 - mm * pxmm; if (y < top) break; s += `<path d="M${x} ${f1(y)} h${mm % 10 ? mm % 5 ? 4 : 7 : 11}" stroke="#3b3b3b" stroke-width="${mm % 10 ? .5 : .8}"/>`; if (mm % 10 === 0) s += `<text x="${x + 13}" y="${f1(y + 3)}" font-size="7.5" font-family="IBM Plex Mono,monospace" fill="#3b3b3b">${mm / 10}</text>`; }
  return s + `<text x="${x + (o.w || 30) - 4}" y="${f1(top + 6)}" text-anchor="end" font-size="6.5" font-family="IBM Plex Mono,monospace" fill="#3b3b3b">cm</text>`; };

/* ---------- other everyday apparatus ---------- */
/* marble chips: seeded irregular lumps */
K.chips = (n, x0, x1, base, size, seed = 7) => { const r = K.seed(seed); let s = '';
  for (let i = 0; i < n; i++) { const cx = x0 + r() * (x1 - x0), sz = size * (.75 + r() * .5), cy = base - sz * .7 - r() * size * .5; let d = '';
    for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283 + r() * .5, rr = sz * (.75 + r() * .35); d += (k ? 'L' : 'M') + f1(cx + Math.cos(a) * rr) + ' ' + f1(cy + Math.sin(a) * rr * .8); }
    s += `<path d="${d}Z" fill="url(#kChip)" stroke="#8d8573" stroke-width=".5" stroke-linejoin="round"/>`; }
  return s; };
/* dropping bottle */
K.dropper = (x, y, fill, label, o = {}) => `${K.shadow(x + 18, 36, y + 62)}<rect x="${x}" y="${y + 14}" width="36" height="48" rx="6" fill="${o.brown ? 'url(#kBrown)' : 'url(#kGlass)'}" stroke="${GL}" stroke-width="1.3"/>
  ${o.brown ? '' : `<rect x="${x + 2}" y="${y + 26}" width="32" height="34" rx="4" fill="${liq(fill)}"/><rect x="${x + 2}" y="${y + 26}" width="32" height="34" rx="4" fill="url(#kShade)"/>`}
  <rect x="${x + 11}" y="${y + 6}" width="14" height="9" fill="url(#kGlass)" stroke="${GL}"/><path d="M${x + 12} ${y + 6} q6 -14 12 0 z" fill="#2b2b2b"/>
  <rect x="${x + 5}" y="${y + 34}" width="26" height="14" rx="2" fill="#fbfaf5" opacity=".92"/><text x="${x + 18}" y="${y + 44}" text-anchor="middle" font-size="6.5" font-family="IBM Plex Mono,monospace" fill="#222">${label}</text>`;
/* test-tube rack front rail with holes at the given x positions */
K.rack = (x, w, holes = [], y = BENCH - 46) => `${K.shadow(x + w / 2, w)}<rect x="${x}" y="${y}" width="${w}" height="9" rx="2" fill="url(#kWood)"/>${holes.map(h => `<ellipse cx="${h}" cy="${y + 2}" rx="11" ry="2.4" fill="#5b3c1c"/>`).join('')}
  <rect x="${x}" y="${BENCH - 12}" width="${w}" height="12" rx="2" fill="url(#kWood)"/><rect x="${x + 3}" y="${y + 8}" width="6" height="${BENCH - y - 20}" fill="#a87a46"/><rect x="${x + w - 9}" y="${y + 8}" width="6" height="${BENCH - y - 20}" fill="#a87a46"/>`;
/* rack front rail drawn again on top of the tubes so they sit inside it */
K.rackFront = (x, w, y = BENCH - 46) => `<rect x="${x}" y="${y}" width="${w}" height="9" rx="2" fill="url(#kWood)"/><rect x="${x}" y="${y}" width="${w}" height="1.4" fill="#fff" opacity=".3"/>`;
/* metal strip electrode; kind: colour name or gradient id */
const METAL = K.METAL = {Magnesium: '#d9dde0', Zinc: '#a9b4bd', Iron: '#6a6f73', Tin: '#c4c9cc', Lead: '#7d8590', Copper: 'url(#kCopper)', Silver: '#eef1f3', Gold: '#e6c35c', Potassium: '#cfd3d6', Sodium: '#d9dde0', Calcium: '#d0d0c8', Aluminium: '#cfd5da', Carbon: 'url(#kCarbon)'};
K.strip = (x, y, w, h, metal) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1" fill="${METAL[metal] || metal}" stroke="#0004" stroke-width=".6"/><rect x="${x + 1.5}" y="${y + 2}" width="${Math.max(1.5, w * .25)}" height="${h - 4}" fill="#fff" opacity=".35"/>`;
/* power supply box */
K.power = (x, y, w, h, label, o = {}) => `<rect x="${x + 2}" y="${y + 3}" width="${w}" height="${h}" rx="6" fill="#000" opacity=".25" filter="url(#kSoft)"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="url(#kCase)" stroke="#aaa59a"/>
  <rect x="${x}" y="${y}" width="${w}" height="10" rx="5" fill="#2c6e8f"/><circle cx="${x + w * .28}" cy="${y + h * .55}" r="9" fill="url(#kPlastic)"/><path d="M${x + w * .28} ${y + h * .55} l5 -6" stroke="#fff" stroke-width="1.6"/>
  <circle cx="${x + w * .62}" cy="${y + h - 10}" r="4.5" fill="#c0392b"/><circle cx="${x + w * .82}" cy="${y + h - 10}" r="4.5" fill="#1d1d1d" stroke="#555"/>
  <circle cx="${x + w * .82}" cy="${y + 20}" r="3" fill="${o.on ? '#4ade80' : '#3b4a3f'}"/>${o.on ? `<circle cx="${x + w * .82}" cy="${y + 20}" r="7" fill="#4ade80" opacity=".35" filter="url(#kSoft)"/>` : ''}
  <text x="${x + w * .62}" y="${y + 27}" text-anchor="middle" font-size="8" font-family="IBM Plex Mono,monospace" fill="#333">${label}</text>`;
/* filter funnel with folded paper; cx, top y */
K.funnel = (cx, y, w = 80, o = {}) => `<path d="M${cx - w / 2} ${y} L${cx - 5} ${y + w * .62} V${y + w * .62 + 34} h10 V${y + w * .62} L${cx + w / 2} ${y} Z" fill="url(#kGlass)" stroke="${GL}" stroke-width="1.6" stroke-linejoin="round"/>
  <path d="M${cx - w / 2 + 7} ${y + 3} L${cx} ${y + w * .55} L${cx + w / 2 - 7} ${y + 3} Z" fill="#fbf8f0" stroke="#d6cfbd"/><path d="M${cx - w / 2 + 7} ${y + 3} L${cx + 4} ${y + w * .5}" stroke="#e2dccd"/>${o.residue ? `<path d="M${cx - 13} ${y + w * .4} Q${cx} ${y + w * .48} ${cx + 13} ${y + w * .4} L${cx} ${y + w * .54} Z" fill="${o.residue}"/>` : ''}`;
/* evaporating basin */
K.basin = (cx, y, w = 80, fill, lvl = 0, crystals = '') => `<path d="M${cx - w / 2} ${y} Q${cx} ${y + w * .55} ${cx + w / 2} ${y} Z" fill="url(#kPorcelain)" stroke="#a9a79f" stroke-width="1.3"/>
  ${lvl > 0 ? `<path d="M${f1(cx - w / 2 * (.35 + lvl * .55))} ${f1(y + w * .26 * (1 - lvl) + 2)} Q${cx} ${f1(y + w * .5)} ${f1(cx + w / 2 * (.35 + lvl * .55))} ${f1(y + w * .26 * (1 - lvl) + 2)} Z" fill="${liq(fill)}"/>` : ''}${crystals}
  <path d="M${cx + w / 2} ${y} l6 -2" stroke="#a9a79f" stroke-width="2"/><ellipse cx="${cx}" cy="${y}" rx="${w / 2}" ry="2.5" fill="none" stroke="#a9a79f"/>`;
/* small crystals scattered in an area */
K.crystals = (n, x0, x1, y0, y1, col, seed = 3) => { const r = K.seed(seed); let s = ''; for (let i = 0; i < n; i++) { const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), a = r() * 90, z = 2.5 + r() * 3;
  s += `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(z)}" height="${f1(z * 1.4)}" transform="rotate(${f1(a)} ${f1(x)} ${f1(y)})" fill="${col}" stroke="#0005" stroke-width=".4"/><path d="M${f1(x + .6)} ${f1(y + .6)} h${f1(z * .5)}" stroke="#fff" stroke-opacity=".8" stroke-width=".6" transform="rotate(${f1(a)} ${f1(x)} ${f1(y)})"/>`; } return s; };
/* spatula heap of powder */
K.heap = (cx, y, w, col) => `<path d="M${cx - w / 2} ${y} Q${cx} ${y - w * .45} ${cx + w / 2} ${y} Z" fill="${col}" stroke="#0003" stroke-width=".5"/>`;
/* white tile */
K.tile = (cx, w = 90) => `<rect x="${cx - w / 2}" y="${BENCH - 4}" width="${w}" height="5" rx="1" fill="#f7f7f4" stroke="#cfcfc8"/>`;
/* falling drop */
K.drop = (x, y, fill) => `<path d="M${x} ${y - 4} q3 5 0 7 q-3 -2 0 -7z" fill="${liq(fill)}" stroke="${GL}" stroke-width=".5"/>`;
/* radiation tracks: short dashes along a line, clipped at stopX */
K.tracks = (x0, x1, y, n, col = '#f2b33d', spread = 14) => { let s = ''; for (let i = 0; i < n; i++) { const x = R(x0, x1 - 8), yy = y + R(-spread, spread) * (x - x0) / Math.max(1, x1 - x0); s += `<path d="M${f1(x)} ${f1(yy)} h${f1(R(4, 9))}" stroke="${col}" stroke-width="1.6" stroke-linecap="round" opacity=".85"/>`; } return s; };
})();
