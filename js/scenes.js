/*
 * Scenes: simple pictures that show what each step of the temple and pooja guides
 * looks like, and who the five Parameshthis are. Numbered markers in a picture are
 * explained by the list under it (content/chitra.json), so they follow the app language.
 * Every scene is drawn from a few shared parts: a devotee, the Lord on an altar, a door,
 * a pot, a plate, a lamp, a book and so on.
 */
const SCENES = (function () {
  const INK = '#5b4636';
  const SKIN = '#e6b388';
  const SKIN_EDGE = '#b9825a';
  const HAIR = '#3b2a1e';
  const CLOTH = '#fff6e6';
  const CLOTH_EDGE = '#c9b08a';
  const SAFFRON = '#e09a3c';
  const RED = '#c0392b';
  const WOOD = '#b5773d';
  const WOOD_EDGE = '#8a5626';
  const BRASS = '#d9ad52';
  const BRASS_EDGE = '#a27726';
  const BRASS_LIGHT = '#ecc970';
  const PAPER = '#f6ecd9';
  const PAPER_EDGE = '#c7a679';
  const WATER = '#3a8fd6';
  const MARBLE = '#f9f3ea';
  const MARBLE_EDGE = '#8d7b66';
  const GLOW = '#ffe6a8';
  const FLAME = '#f7b733';
  const GREEN = '#4f8a3f';
  const FONT = "system-ui, 'Noto Sans Devanagari', 'Nirmala UI', sans-serif";

  /* ---------- Small parts ---------- */

  function svg(w, h, body) {
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      '<rect x="3" y="3" width="' + (w - 6) + '" height="' + (h - 6) + '" rx="18" fill="' + PAPER + '" stroke="' + PAPER_EDGE + '" stroke-width="2"/>' +
      body + '</svg>';
  }

  function floor(x1, x2, y) {
    return '<path d="M' + x1 + ' ' + y + ' H' + x2 + '" stroke="' + PAPER_EDGE + '" stroke-width="2.5" stroke-linecap="round"/>';
  }

  function badge(x, y, n) {
    return '<g><circle cx="' + x + '" cy="' + y + '" r="13" fill="#9a3412" stroke="#fff7ec" stroke-width="2.5"/>' +
      '<text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle" font-size="15" font-weight="700" fill="#fff7ec" font-family="' + FONT + '">' + n + '</text></g>';
  }

  function label(x, y, s, size) {
    return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-size="' + (size || 15) + '" font-weight="700" fill="' + INK + '" font-family="' + FONT + '">' + s + '</text>';
  }

  /* A red "not this" ring. */
  function nope(x, y, r) {
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="none" stroke="' + RED + '" stroke-width="4"/>' +
      '<path d="M' + (x - r * 0.7) + ' ' + (y - r * 0.7) + ' L' + (x + r * 0.7) + ' ' + (y + r * 0.7) + '" stroke="' + RED + '" stroke-width="4" stroke-linecap="round"/>';
  }

  function arrow(x1, y1, x2, y2, color) {
    const c = color || '#9a3412';
    const a = Math.atan2(y2 - y1, x2 - x1);
    const hx = x2 - 10 * Math.cos(a);
    const hy = y2 - 10 * Math.sin(a);
    return '<path d="M' + x1 + ' ' + y1 + ' L' + hx.toFixed(1) + ' ' + hy.toFixed(1) + '" stroke="' + c + '" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M-10 -6 L0 0 L-10 6 Z" fill="' + c + '" transform="translate(' + x2 + ' ' + y2 + ') rotate(' + (a * 180 / Math.PI).toFixed(1) + ')"/>';
  }

  function drop(x, y, s) {
    return '<path d="M0 -7 C3 -3 5 0 5 3 A5 5 0 0 1 -5 3 C-5 0 -3 -3 0 -7 Z" fill="' + WATER + '" transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')"/>';
  }

  function flame(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')">' +
      '<path d="M0 -16 Q8 -7 0 2 Q-8 -7 0 -16 Z" fill="' + FLAME + '"/><path d="M0 -9 Q3 -5 0 -1 Q-3 -5 0 -9 Z" fill="#fff1c1"/></g>';
  }

  function diya(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')">' + flame(0, 0, 1) +
      '<path d="M-15 3 Q0 17 15 3 Q8 1 0 1 Q-8 1 -15 3 Z" fill="#d0661f" stroke="#9c4512" stroke-width="1.5" stroke-linejoin="round"/></g>';
  }

  /* Palms joined (namaskar), pointing up, drawn around (x, y). */
  function folded(x, y, s) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')">' +
      '<path d="M-6 10 L-6 -8 Q0 -17 6 -8 L6 10 Z" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1.5" stroke-linejoin="round"/>' +
      '<path d="M0 -13 V8" stroke="' + SKIN_EDGE + '" stroke-width="1"/></g>';
  }

  function head(x, y, r, o) {
    o = o || {};
    return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1.5"/>' +
      (o.bald ? '' : '<path d="M' + (x - r) + ' ' + (y - 2) + ' Q' + x + ' ' + (y - r * 1.5) + ' ' + (x + r) + ' ' + (y - 2) + ' Q' + x + ' ' + (y - r * 0.7) + ' ' + (x - r) + ' ' + (y - 2) + ' Z" fill="' + HAIR + '"/>');
  }

  /*
   * A devotee standing with feet at (x, y), facing right. Options:
   *   dir: -1 to face left · hands: 'folded' | 'hold' | 'none' · bow: head lowered
   *   cloth: colour of the clothes · plain: no clothes (a muni) · item: extra drawing held at the hands
   */
  function stand(x, y, o) {
    o = o || {};
    const dir = o.dir || 1;
    const cloth = o.cloth || CLOTH;
    let g = '<g transform="translate(' + x + ' ' + y + ') scale(' + dir + ' 1)">';
    if (o.plain) {
      g += '<path d="M-9 0 V-36 H9 V0 Z" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1.5"/>' +
        '<path d="M-14 -36 Q-16 -76 -8 -82 H8 Q16 -76 14 -36 Z" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1.5"/>';
    } else {
      g += '<path d="M-11 0 V-36 H11 V0 Z" fill="' + cloth + '" stroke="' + CLOTH_EDGE + '" stroke-width="2"/>' +
        '<path d="M-15 -36 Q-17 -78 -8 -84 H8 Q17 -78 15 -36 Z" fill="' + cloth + '" stroke="' + CLOTH_EDGE + '" stroke-width="2"/>' +
        (o.dupatta ? '<path d="M-6 -82 Q-2 -60 -10 -36" fill="none" stroke="' + SAFFRON + '" stroke-width="5" stroke-linecap="round"/>' : '');
    }
    g += '<ellipse cx="-6" cy="1" rx="7" ry="3" fill="' + SKIN + '"/><ellipse cx="10" cy="1" rx="7" ry="3" fill="' + SKIN + '"/>';
    const hy = o.bow ? -92 : -97;
    const hx = o.bow ? 6 : 0;
    g += head(hx, hy, 13, { bald: o.plain });
    if (o.hands === 'folded') {
      g += '<path d="M8 -74 Q16 -70 15 -60 M-8 -74 Q4 -72 10 -60" fill="none" stroke="' + SKIN + '" stroke-width="7" stroke-linecap="round"/>' + folded(16, -58, 1);
    } else if (o.hands === 'hold') {
      g += '<path d="M8 -74 Q22 -66 26 -52 M-8 -74 Q10 -70 22 -52" fill="none" stroke="' + SKIN + '" stroke-width="7" stroke-linecap="round"/>' +
        '<circle cx="25" cy="-50" r="5" fill="' + SKIN + '"/>' + (o.item || '');
    } else {
      g += '<path d="M10 -76 Q18 -60 14 -40 M-10 -76 Q-18 -60 -14 -40" fill="none" stroke="' + SKIN + '" stroke-width="7" stroke-linecap="round"/>' + (o.item || '');
    }
    return g + '</g>';
  }

  /* A devotee seated cross-legged on the floor at (x, y), facing right. hands: 'folded' | 'mala' | 'lap' */
  function sit(x, y, o) {
    o = o || {};
    const dir = o.dir || 1;
    let g = '<g transform="translate(' + x + ' ' + y + ') scale(' + dir + ' 1)">' +
      '<ellipse cx="0" cy="-9" rx="31" ry="11" fill="' + CLOTH + '" stroke="' + CLOTH_EDGE + '" stroke-width="2"/>' +
      '<path d="M-16 -9 Q0 -18 16 -9" fill="none" stroke="' + CLOTH_EDGE + '" stroke-width="1.5"/>' +
      '<path d="M-14 -14 Q-16 -54 -7 -60 H7 Q16 -54 14 -14 Z" fill="' + CLOTH + '" stroke="' + CLOTH_EDGE + '" stroke-width="2"/>' +
      head(o.bow ? 4 : 0, o.bow ? -68 : -72, 12);
    if (o.hands === 'folded') {
      g += '<path d="M7 -52 Q14 -48 14 -40 M-7 -52 Q4 -50 10 -40" fill="none" stroke="' + SKIN + '" stroke-width="6" stroke-linecap="round"/>' + folded(14, -38, 0.9);
    } else if (o.hands === 'mala') {
      g += '<path d="M7 -52 Q20 -44 20 -30 M-7 -52 Q-16 -40 -8 -24" fill="none" stroke="' + SKIN + '" stroke-width="6" stroke-linecap="round"/>' +
        '<circle cx="21" cy="-28" r="5" fill="' + SKIN + '"/>' +
        '<path d="M21 -24 Q36 -4 20 10 Q6 -4 21 -24" fill="none" stroke="' + WOOD_EDGE + '" stroke-width="4" stroke-dasharray="0.5 4.5" stroke-linecap="round"/>' +
        '<path d="M22 11 l-3 8 M22 11 l3 8" stroke="' + RED + '" stroke-width="2" stroke-linecap="round"/>';
    } else {
      g += '<path d="M8 -52 Q18 -44 16 -30 M-8 -52 Q-18 -44 -16 -30" fill="none" stroke="' + SKIN + '" stroke-width="6" stroke-linecap="round"/>' +
        '<ellipse cx="0" cy="-26" rx="12" ry="5" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1"/>';
    }
    return g + '</g>';
  }

  /* The five-limbed bow, seen from the side: shins flat on the ground, the body folded forward,
     forehead on the ground at the left, arms stretched out with the palms down. */
  function prostrate(x, y) {
    return '<g transform="translate(' + x + ' ' + y + ')">' +
      '<rect x="14" y="-14" width="46" height="14" rx="7" fill="' + CLOTH + '" stroke="' + CLOTH_EDGE + '" stroke-width="2"/>' +
      '<ellipse cx="62" cy="-4" rx="7" ry="4" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1"/>' +
      '<path d="M58 -14 Q62 -50 30 -54 Q-6 -56 -28 -26 L-16 -12 Q0 -36 28 -38 Q46 -38 44 -14 Z" fill="' + CLOTH + '" stroke="' + CLOTH_EDGE + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M-20 -32 Q-44 -22 -62 -5" fill="none" stroke="' + SKIN + '" stroke-width="7" stroke-linecap="round"/>' +
      '<ellipse cx="-66" cy="-3" rx="9" ry="3.5" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1"/>' +
      head(-40, -12, 11) +
      '</g>';
  }

  /* The Lord, seated in meditation, base of the seat at (x, y). */
  function jina(x, y, s, o) {
    o = o || {};
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')">' +
      (o.noGlow ? '' : '<circle cx="0" cy="-70" r="34" fill="' + GLOW + '"/>') +
      (o.noChhatra ? '' : '<path d="M0 -92 V-122" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
        '<path d="M-26 -100 Q0 -114 26 -100 Z" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>' +
        '<path d="M-19 -110 Q0 -121 19 -110 Z" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>' +
        '<path d="M-12 -119 Q0 -128 12 -119 Z" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>') +
      '<ellipse cx="0" cy="-12" rx="30" ry="11" fill="' + MARBLE + '" stroke="' + MARBLE_EDGE + '" stroke-width="1.5"/>' +
      '<path d="M-17 -16 Q-20 -58 -9 -62 H9 Q20 -58 17 -16 Z" fill="' + MARBLE + '" stroke="' + MARBLE_EDGE + '" stroke-width="1.5"/>' +
      '<path d="M-10 -60 Q-20 -44 -14 -26 M10 -60 Q20 -44 14 -26" fill="none" stroke="' + MARBLE + '" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M-10 -60 Q-20 -44 -14 -26 M10 -60 Q20 -44 14 -26" fill="none" stroke="' + MARBLE_EDGE + '" stroke-width="1" stroke-linecap="round"/>' +
      '<ellipse cx="0" cy="-23" rx="11" ry="5" fill="' + MARBLE + '" stroke="' + MARBLE_EDGE + '" stroke-width="1.2"/>' +
      '<path d="M-3 -44 l3 -4 l3 4 l-3 4 z" fill="' + MARBLE_EDGE + '"/>' +
      '<circle cx="0" cy="-74" r="12" fill="' + MARBLE + '" stroke="' + MARBLE_EDGE + '" stroke-width="1.5"/>' +
      '<path d="M-12 -77 Q0 -94 12 -77 Q0 -84 -12 -77 Z" fill="' + MARBLE_EDGE + '"/>' +
      '<circle cx="0" cy="-88" r="3.5" fill="' + MARBLE_EDGE + '"/>' +
      '</g>';
  }

  function altar(x, y, w) {
    return '<rect x="' + (x - w / 2) + '" y="' + (y - 14) + '" width="' + w + '" height="14" rx="3" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="2"/>' +
      '<rect x="' + (x - w * 0.38) + '" y="' + (y - 28) + '" width="' + (w * 0.76) + '" height="14" rx="3" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/>';
  }

  function shrine(x, y, s, o) {
    return altar(x, y, 90 * (s || 1)) + jina(x, y - 28, s, o);
  }

  /* The temple doorway, floor at (x, y). */
  function doorway(x, y, w, h) {
    let toran = '';
    for (let i = -3; i <= 3; i++) {
      const tx = x + i * (w / 8);
      toran += '<path d="M' + (tx - 6) + ' ' + (y - h + 4) + ' l6 12 l6 -12 z" fill="' + GREEN + '"/>';
    }
    return '<rect x="' + (x - w / 2 + 10) + '" y="' + (y - h + 4) + '" width="' + (w - 20) + '" height="' + (h - 4) + '" fill="#fbf3e2"/>' +
      '<rect x="' + (x - w / 2) + '" y="' + (y - h) + '" width="12" height="' + h + '" rx="2" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="2"/>' +
      '<rect x="' + (x + w / 2 - 12) + '" y="' + (y - h) + '" width="12" height="' + h + '" rx="2" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="2"/>' +
      '<path d="M' + (x - w / 2 - 6) + ' ' + (y - h) + ' H' + (x + w / 2 + 6) + ' Q' + x + ' ' + (y - h - 22) + ' ' + (x - w / 2 - 6) + ' ' + (y - h) + ' Z" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="2"/>' +
      '<path d="M' + x + ' ' + (y - h - 20) + ' l-7 -12 h14 z" fill="' + SAFFRON + '"/>' + toran;
  }

  function chappal(x, y, rot) {
    return '<g transform="translate(' + x + ' ' + y + ') rotate(' + (rot || 0) + ')">' +
      '<ellipse cx="0" cy="0" rx="7" ry="13" fill="' + WOOD_EDGE + '"/><path d="M-5 -3 L0 3 L5 -3" fill="none" stroke="' + BRASS_LIGHT + '" stroke-width="2" stroke-linecap="round"/></g>';
  }

  function tap(x, y) {
    return '<path d="M' + x + ' ' + y + ' h16 v9 h-6 v7 h-5 v-7 h-5 z" fill="' + BRASS_EDGE + '"/>' +
      '<path d="M' + (x + 16) + ' ' + (y + 4) + ' h8 v-10" fill="none" stroke="' + BRASS_EDGE + '" stroke-width="4"/>' +
      drop(x + 7, y + 26, 0.9) + drop(x + 12, y + 40, 0.7) + drop(x + 3, y + 44, 0.6);
  }

  /* A brass water pot; spout: true gives a jhari with a spout, tilted to pour. */
  function pot(x, y, s, o) {
    o = o || {};
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ') rotate(' + (o.rot || 0) + ')">' +
      '<path d="M0 0 q-22 0 -22 -20 q0 -18 22 -18 q22 0 22 18 q0 20 -22 20 z" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="2.5"/>' +
      '<rect x="-9" y="-50" width="18" height="14" rx="3" fill="' + BRASS_LIGHT + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
      (o.spout ? '<path d="M18 -26 Q34 -30 38 -44" fill="none" stroke="' + BRASS_EDGE + '" stroke-width="6" stroke-linecap="round"/>' : '') +
      '</g>';
  }

  function plate(x, y, rx, ry) {
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="2.5"/>' +
      '<ellipse cx="' + x + '" cy="' + (y - 2) + '" rx="' + (rx * 0.78) + '" ry="' + (ry * 0.7) + '" fill="' + BRASS_LIGHT + '" stroke="' + BRASS_EDGE + '" stroke-width="1.2"/>';
  }

  function bowl(x, y, r, fill) {
    return '<path d="M' + (x - r) + ' ' + (y - r * 0.3) + ' q0 ' + (r * 0.9) + ' ' + r + ' ' + (r * 0.9) + ' q' + r + ' 0 ' + r + ' -' + (r * 0.9) + ' z" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
      '<ellipse cx="' + x + '" cy="' + (y - r * 0.3) + '" rx="' + r + '" ry="' + (r * 0.32) + '" fill="' + (fill || BRASS_LIGHT) + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>';
  }

  /* An open book lying flat, centre of the spine at (x, y). */
  function book(x, y, w, o) {
    o = o || {};
    const h = o.h || 26;
    let lines = '';
    for (let i = 1; i <= 2; i++) {
      const ly = y + 6 + i * (h / 3.2);
      lines += '<path d="M' + (x - w + 8) + ' ' + ly + ' H' + (x - 6) + ' M' + (x + 6) + ' ' + ly + ' H' + (x + w - 8) + '" stroke="#b9a487" stroke-width="2" stroke-linecap="round"/>';
    }
    return '<path d="M' + (x - w) + ' ' + y + ' Q' + (x - w / 2) + ' ' + (y - 7) + ' ' + x + ' ' + y + ' Q' + (x + w / 2) + ' ' + (y - 7) + ' ' + (x + w) + ' ' + y +
      ' V' + (y + h) + ' Q' + (x + w / 2) + ' ' + (y + h - 7) + ' ' + x + ' ' + (y + h) + ' Q' + (x - w / 2) + ' ' + (y + h - 7) + ' ' + (x - w) + ' ' + (y + h) + ' Z" fill="#fbf3e2" stroke="' + CLOTH_EDGE + '" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M' + x + ' ' + y + ' V' + (y + h) + '" stroke="' + CLOTH_EDGE + '" stroke-width="1.5"/>' + lines;
  }

  /* A low wooden stand (chowki), top edge at (x, y). */
  function chowki(x, y, w) {
    return '<rect x="' + (x - w / 2) + '" y="' + y + '" width="' + w + '" height="10" rx="3" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="2"/>' +
      '<path d="M' + (x - w / 2 + 8) + ' ' + (y + 10) + ' v14 M' + (x + w / 2 - 8) + ' ' + (y + 10) + ' v14" stroke="' + WOOD_EDGE + '" stroke-width="4"/>';
  }

  function sun(x, y, r) {
    let rays = '';
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      rays += '<path d="M' + (x + Math.cos(a) * (r + 5)).toFixed(1) + ' ' + (y + Math.sin(a) * (r + 5)).toFixed(1) + ' L' + (x + Math.cos(a) * (r + 13)).toFixed(1) + ' ' + (y + Math.sin(a) * (r + 13)).toFixed(1) + '" stroke="' + FLAME + '" stroke-width="3" stroke-linecap="round"/>';
    }
    return rays + '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + FLAME + '"/>';
  }

  function notes(x, y) {
    return '<text x="' + x + '" y="' + y + '" font-size="22" fill="' + INK + '" font-family="' + FONT + '">♪</text>' +
      '<text x="' + (x + 16) + '" y="' + (y - 14) + '" font-size="18" fill="' + INK + '" font-family="' + FONT + '">♫</text>';
  }

  /* A muni: standing, unclothed, with a pichhi (peacock-feather whisk) and a kamandal (water pot). */
  function muni(x, y, o) {
    o = o || {};
    let feathers = '';
    for (let i = -2; i <= 2; i++) {
      feathers += '<path d="M28 -52 q' + (i * 6) + ' -14 ' + (i * 9) + ' -30" fill="none" stroke="' + GREEN + '" stroke-width="3" stroke-linecap="round"/>';
    }
    const item = '<path d="M26 -50 L30 -36" stroke="' + WOOD_EDGE + '" stroke-width="4" stroke-linecap="round"/>' + feathers +
      (o.book ? '' : '<g transform="translate(-24 -8) scale(0.5)"><path d="M0 0 q-22 0 -22 -20 q0 -18 22 -18 q22 0 22 18 q0 20 -22 20 z" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="3"/><rect x="-7" y="-48" width="14" height="12" rx="3" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="2"/></g>');
    return stand(x, y, { plain: true, hands: 'hold', item: item, dir: o.dir }) +
      (o.book ? book(x - 22 * (o.dir || 1), y - 50, 14, { h: 18 }) : '');
  }

  function phone(x, y) {
    return '<rect x="' + (x - 11) + '" y="' + (y - 20) + '" width="22" height="40" rx="4" fill="#3b2a1e" stroke="#1d1209" stroke-width="2"/>' +
      '<rect x="' + (x - 8) + '" y="' + (y - 15) + '" width="16" height="28" rx="1.5" fill="#f3e9da"/>' +
      '<path d="M' + x + ' ' + (y - 8) + ' q-6 0 -6 7 v4 h12 v-4 q0 -7 -6 -7 z M' + (x - 3) + ' ' + (y + 5) + ' q3 4 6 0" fill="' + INK + '" stroke="' + INK + '" stroke-width="1"/>' +
      '<path d="M' + (x - 8) + ' ' + (y + 8) + ' L' + (x + 8) + ' ' + (y - 10) + '" stroke="' + RED + '" stroke-width="2.5" stroke-linecap="round"/>';
  }

  function heart(x, y, s) {
    return '<path d="M0 6 C-10 -2 -10 -12 -3 -12 C0 -12 0 -9 0 -8 C0 -9 0 -12 3 -12 C10 -12 10 -2 0 6 Z" fill="' + RED + '" transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')"/>';
  }

  /* ---------- Scenes ---------- */

  const scenes = {};

  /* Before leaving home (temple guide): 1 bathed, clean clothes · 2 rice box · 3 no leather · 4 walk looking at the ground */
  scenes.prepareMandir = svg(340, 210,
    floor(20, 320, 180) +
    stand(60, 180, { hands: 'none', dupatta: true }) + badge(60, 40, 1) +
    '<ellipse cx="128" cy="166" rx="18" ry="7" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
    '<rect x="110" y="150" width="36" height="16" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
    '<ellipse cx="128" cy="150" rx="18" ry="7" fill="' + BRASS_LIGHT + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
    '<ellipse cx="122" cy="149" rx="2.2" ry="4.5" fill="#fffdf6" stroke="#c9b994"/><ellipse cx="130" cy="148" rx="2.2" ry="4.5" transform="rotate(40 130 148)" fill="#fffdf6" stroke="#c9b994"/><ellipse cx="136" cy="150" rx="2.2" ry="4.5" transform="rotate(-30 136 150)" fill="#fffdf6" stroke="#c9b994"/>' +
    badge(128, 122, 2) +
    '<rect x="186" y="150" width="60" height="12" rx="3" fill="#6b4a2b" stroke="#3b2a1e" stroke-width="2"/><rect x="208" y="146" width="16" height="20" rx="2" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
    '<rect x="196" y="112" width="40" height="28" rx="4" fill="#6b4a2b" stroke="#3b2a1e" stroke-width="2"/><path d="M196 124 h40" stroke="#3b2a1e" stroke-width="2"/>' +
    nope(216, 140, 36) + badge(216, 84, 3) +
    stand(296, 180, { hands: 'none', bow: true, dir: -1 }) +
    '<path d="M286 96 L276 160" stroke="' + INK + '" stroke-width="1.5" stroke-dasharray="3 4"/>' +
    '<ellipse cx="274" cy="170" rx="5" ry="3" fill="' + INK + '"/><path d="M269 170 l-5 -3 M279 170 l5 -3" stroke="' + INK + '" stroke-width="1.5"/>' +
    badge(296, 40, 4));

  /* Before the pooja: 1 morning, bathed · 2 clean pooja clothes (dhoti, dupatta) · 3 no leather · 4 phone silent */
  scenes.preparePooja = svg(340, 210,
    floor(20, 320, 180) +
    sun(52, 48, 14) + badge(52, 90, 1) +
    stand(130, 180, { hands: 'folded', dupatta: true }) + badge(130, 40, 2) +
    '<rect x="196" y="150" width="60" height="12" rx="3" fill="#6b4a2b" stroke="#3b2a1e" stroke-width="2"/><rect x="218" y="146" width="16" height="20" rx="2" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
    '<rect x="206" y="112" width="40" height="28" rx="4" fill="#6b4a2b" stroke="#3b2a1e" stroke-width="2"/><path d="M206 124 h40" stroke="#3b2a1e" stroke-width="2"/>' +
    nope(226, 140, 36) + badge(226, 84, 3) +
    phone(298, 140) + badge(298, 90, 4));

  /* At the temple door: 1 footwear outside · 2 wash hands and feet · 3 say 'Nihsahi' three times while entering */
  scenes.door = svg(340, 230,
    floor(20, 320, 200) +
    doorway(236, 200, 110, 150) +
    chappal(44, 186, -12) + chappal(62, 184, -8) + badge(54, 150, 1) +
    tap(104, 120) + badge(112, 92, 2) +
    stand(176, 200, { hands: 'folded' }) +
    '<path d="M196 90 q0 -22 22 -22 h34 q22 0 22 22 q0 22 -22 22 h-24 l-14 12 v-12 h-4 q-14 0 -14 -22 z" fill="#fff7ec" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
    label(236, 97, '× 3', 20) + badge(290, 64, 3));

  /* Before the Lord: standing with folded hands and bowed head. */
  scenes.darshan = svg(320, 200,
    floor(20, 300, 176) +
    shrine(226, 176, 1) +
    stand(96, 176, { hands: 'folded', bow: true }));

  /* The darshan prayer: looking at the Lord, singing. */
  scenes.sing = svg(320, 200,
    floor(20, 300, 176) +
    shrine(226, 176, 1) +
    stand(96, 176, { hands: 'folded' }) + notes(112, 72));

  /* The five-limbed bow: 1 both knees · 2 both hands · 3 forehead, all touching the ground */
  scenes.bow = svg(340, 210,
    floor(20, 320, 190) +
    shrine(70, 190, 0.9) +
    prostrate(236, 190) +
    badge(284, 110, 1) + arrow(282, 123, 276, 170) +
    badge(150, 120, 2) + arrow(156, 133, 168, 180) +
    badge(196, 90, 3) + arrow(196, 103, 196, 164));

  /* Gandhodak: 1 a little on the fingertips of the right hand · 2 touch it to the forehead · 3 never on the feet */
  scenes.gandhodak = svg(340, 210,
    floor(20, 320, 186) +
    bowl(70, 150, 34, '#bfe0f7') + badge(70, 92, 1) +
    '<path d="M86 118 q10 -14 22 -8 q4 10 -8 20" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1.5"/>' +
    drop(100, 128, 0.8) +
    '<g transform="translate(200 0)">' +
    '<circle cx="0" cy="110" r="40" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="2"/>' +
    '<path d="M-40 100 Q0 50 40 104 Q0 76 -40 100 Z" fill="' + HAIR + '"/>' +
    '<path d="M28 108 q14 0 10 10" fill="none" stroke="' + SKIN_EDGE + '" stroke-width="2"/>' +
    '<circle cx="-12" cy="112" r="2.5" fill="' + INK + '"/><circle cx="12" cy="112" r="2.5" fill="' + INK + '"/>' +
    '<path d="M-8 130 q8 6 16 0" fill="none" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M-2 86 q-24 -18 -40 -2 q-10 10 -4 20 q6 6 16 0 q10 -4 28 -10" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1.5"/>' +
    drop(-4, 84, 0.8) + '</g>' + badge(236, 54, 2) +
    '<ellipse cx="296" cy="176" rx="10" ry="22" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1.5"/><ellipse cx="318" cy="176" rx="10" ry="22" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1.5"/>' +
    nope(307, 170, 30) + badge(307, 120, 3));

  /* More than one altar: 1 begin at the main altar · 2, 3 then each of the others */
  scenes.altars = svg(340, 230,
    floor(20, 320, 150) +
    shrine(170, 150, 1) + shrine(62, 150, 0.7, { noChhatra: true }) + shrine(278, 150, 0.7, { noChhatra: true }) +
    badge(170, 36, 1) + badge(62, 70, 2) + badge(278, 70, 3) +
    '<circle cx="170" cy="200" r="9" fill="' + INK + '"/>' +
    '<path d="M170 188 V166 M158 192 Q90 196 72 164 M182 192 Q250 196 268 164" fill="none" stroke="' + PAPER_EDGE + '" stroke-width="3" stroke-dasharray="6 6"/>' +
    arrow(170, 176, 170, 164) + arrow(80, 172, 72, 164) + arrow(260, 172, 268, 164));

  /* Scripture and saints: 1 the scripture on a stand, never on the floor · 2 bow to munis and aryikas with folded hands */
  scenes.jinvani = svg(340, 210,
    floor(20, 320, 186) +
    chowki(66, 156, 70) + book(66, 138, 30, { h: 18 }) + badge(66, 94, 1) +
    stand(170, 186, { hands: 'folded', bow: true }) +
    muni(282, 186, { dir: -1 }) + badge(282, 50, 2));

  /* Jaap, samayik and study: 1 Namokar on a mala, 9 or 108 times · 2 sit quietly, samayik · 3 read a little */
  scenes.jaap = svg(340, 200,
    floor(20, 320, 176) +
    sit(150, 176, { hands: 'mala' }) +
    label(214, 150, '9 · 108', 14) + badge(196, 120, 1) +
    badge(150, 72, 2) +
    chowki(272, 150, 60) + book(272, 134, 24, { h: 16 }) + badge(272, 100, 3));

  /* Leaving the temple: 1 bow once more · 2 step back a few paces, never turning the back · 3 'Asahi' three times at the door */
  scenes.leave = svg(340, 230,
    floor(20, 320, 200) +
    shrine(66, 200, 0.9) + badge(66, 60, 1) +
    stand(176, 200, { hands: 'folded', dir: -1 }) +
    arrow(206, 150, 240, 150) + badge(222, 124, 2) +
    doorway(290, 200, 80, 140) +
    '<path d="M236 60 q0 -18 18 -18 h40 q18 0 18 18 q0 18 -18 18 h-28 l-12 10 v-10 q-18 0 -18 -18 z" fill="#fff7ec" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
    label(274, 67, '× 3', 18) + badge(320, 36, 3));

  /* Things to keep in mind: 1 no eating or drinking · 2 phone off or silent · 3 feet never towards the Lord · 4 speak softly */
  scenes.rules = svg(340, 250,
    '<path d="M170 20 V230 M20 125 H320" stroke="' + PAPER_EDGE + '" stroke-width="2" stroke-dasharray="4 6"/>' +
    plate(84, 92, 34, 12) + '<circle cx="72" cy="80" r="9" fill="#e0a23a"/><circle cx="92" cy="82" r="9" fill="#e0a23a"/>' +
    '<rect x="108" y="54" width="14" height="40" rx="3" fill="' + BRASS_LIGHT + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
    nope(90, 76, 46) + badge(32, 36, 1) +
    phone(254, 78) + nope(254, 78, 36) + badge(202, 36, 2) +
    jina(44, 200, 0.55, { noChhatra: true }) +
    '<g transform="translate(118 210)"><ellipse cx="0" cy="-12" rx="16" ry="10" fill="' + CLOTH + '" stroke="' + CLOTH_EDGE + '" stroke-width="2"/><path d="M-6 -16 Q-6 -48 0 -52 H6 Q12 -48 12 -16 Z" fill="' + CLOTH + '" stroke="' + CLOTH_EDGE + '" stroke-width="2"/>' + head(3, -62, 9) +
    '<path d="M-10 -10 L-44 -4 M-6 -4 L-40 4" stroke="' + CLOTH + '" stroke-width="9" stroke-linecap="round"/><path d="M-10 -10 L-44 -4 M-6 -4 L-40 4" stroke="' + CLOTH_EDGE + '" stroke-width="1.5"/>' +
    '<ellipse cx="-48" cy="-4" rx="7" ry="4" fill="' + SKIN + '"/><ellipse cx="-44" cy="5" rx="7" ry="4" fill="' + SKIN + '"/></g>' +
    nope(84, 200, 40) + badge(32, 150, 3) +
    '<circle cx="254" cy="190" r="34" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="2"/>' +
    '<path d="M220 182 Q254 136 288 184 Q254 160 220 182 Z" fill="' + HAIR + '"/>' +
    '<circle cx="242" cy="190" r="2.5" fill="' + INK + '"/><circle cx="266" cy="190" r="2.5" fill="' + INK + '"/>' +
    '<path d="M248 206 h12" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M254 230 q-4 -16 0 -30 q6 -2 6 6 v28" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="1.5"/>' +
    badge(202, 150, 4));

  /* Abhishek: 1 pure, filtered water poured over the idol · 2 wiped with a clean, dry cloth · 3 the water collected is gandhodak */
  scenes.abhishek = svg(340, 230,
    floor(20, 320, 200) +
    altar(170, 200, 110) + jina(170, 172, 1, { noChhatra: true }) +
    pot(96, 72, 0.9, { spout: true, rot: 40 }) +
    '<path d="M126 56 Q150 60 164 76" fill="none" stroke="' + WATER + '" stroke-width="4" stroke-linecap="round"/>' +
    drop(160, 98, 0.7) + drop(176, 112, 0.6) + drop(152, 126, 0.5) + badge(60, 110, 1) +
    '<path d="M250 132 h52 v34 h-52 z" fill="' + CLOTH + '" stroke="' + CLOTH_EDGE + '" stroke-width="2"/><path d="M250 143 h52 M250 155 h52" stroke="' + CLOTH_EDGE + '" stroke-width="1.5"/>' +
    badge(276, 104, 2) +
    bowl(276, 196, 26, '#bfe0f7') + badge(312, 180, 3));

  /* Beginning the pooja: seated at the chowki, the book open towards the Lord. */
  scenes.poojaStart = svg(340, 210,
    floor(20, 320, 186) +
    shrine(270, 186, 0.9) +
    chowki(158, 150, 70) + book(158, 132, 30, { h: 18 }) +
    sit(74, 186, { hands: 'folded' }) +
    plate(214, 180, 26, 9));

  /* Offering a dravya: 1 read the verse · 2 say the mantra and offer · 3 water and chandan in three streams */
  scenes.offer = svg(340, 220,
    floor(20, 320, 196) +
    chowki(96, 150, 70) + book(96, 132, 30, { h: 18 }) + badge(96, 100, 1) +
    sit(220, 196, { hands: 'lap', dir: -1 }) +
    pot(206, 150, 0.7, { spout: true, rot: -40 }) +
    '<path d="M182 134 q-10 18 -14 30 M176 130 q-14 16 -22 28 M188 138 q-6 18 -6 30" fill="none" stroke="' + WATER + '" stroke-width="3" stroke-linecap="round"/>' +
    plate(166, 178, 36, 12) + badge(166, 120, 3) + badge(270, 110, 2));

  /* Arghya: 1 a little of each of the eight · 2 mixed in one bowl · 3 offered in the plate */
  scenes.arghya = svg(340, 200,
    (function () {
      let bowls = '';
      for (let i = 0; i < 8; i++) {
        const a = (-90 + i * 45) * Math.PI / 180;
        bowls += '<circle cx="' + (70 + 40 * Math.cos(a)).toFixed(1) + '" cy="' + (100 + 40 * Math.sin(a)).toFixed(1) + '" r="11" fill="' + BRASS_LIGHT + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>';
      }
      return '<circle cx="70" cy="100" r="60" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="3"/>' + bowls;
    })() + badge(70, 26, 1) +
    arrow(136, 100, 164, 100) +
    bowl(196, 110, 24, '#e9d5a8') +
    '<ellipse cx="190" cy="100" rx="2" ry="4.5" fill="#fffdf6" stroke="#c9b994"/><circle cx="200" cy="101" r="3.5" fill="#f6c22e"/><path d="M204 104 q4 -4 8 0" fill="none" stroke="#7a4f2a" stroke-width="1.5"/>' +
    badge(196, 54, 2) +
    arrow(226, 100, 252, 100) +
    plate(292, 112, 34, 12) + badge(292, 54, 3));

  /* Jaymala and the full arghya: 1 sing the jaymala from the book · 2 then offer the purnarghya */
  scenes.jaymala = svg(340, 200,
    floor(20, 320, 176) +
    chowki(110, 150, 90) + book(110, 128, 40, { h: 22 }) + notes(150, 100) +
    '<path d="M60 150 q50 -34 100 0" fill="none" stroke="#e0731b" stroke-width="5" stroke-dasharray="1 7" stroke-linecap="round"/>' +
    badge(110, 70, 1) +
    sit(258, 176, { hands: 'lap', dir: -1 }) + bowl(228, 164, 16, '#e9d5a8') + badge(258, 80, 2));

  /* Shanti path and visarjan: 1 shanti path · 2 visarjan, asking forgiveness · 3 Namokar nine times on the mala */
  scenes.shanti = svg(340, 200,
    floor(20, 320, 176) +
    chowki(92, 150, 70) + book(92, 132, 30, { h: 18 }) + badge(92, 100, 1) +
    sit(190, 176, { hands: 'folded' }) + badge(190, 76, 2) +
    '<path d="M282 100 q22 28 0 56 q-22 -28 0 -56" fill="none" stroke="' + WOOD_EDGE + '" stroke-width="5" stroke-dasharray="0.5 6" stroke-linecap="round"/>' +
    label(282, 172, '× 9', 16) + badge(282, 72, 3));

  /* Aarti and leaving: 1 aarti · 2 step back a few paces · 3 'Asahi' three times at the door */
  scenes.aarti = svg(340, 230,
    floor(20, 320, 200) +
    shrine(66, 200, 0.9) +
    stand(166, 200, { hands: 'hold', dir: -1, item: '<g transform="translate(40 -56)">' + plate(0, 0, 30, 9) + diya(-14, -6, 0.6) + diya(0, -8, 0.6) + diya(14, -6, 0.6) + '</g>' }) +
    badge(126, 100, 1) +
    arrow(200, 150, 234, 150) + badge(218, 124, 2) +
    doorway(290, 200, 80, 140) +
    '<path d="M236 60 q0 -18 18 -18 h40 q18 0 18 18 q0 18 -18 18 h-28 l-12 10 v-10 q-18 0 -18 -18 z" fill="#fff7ec" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/>' +
    label(274, 67, '× 3', 18) + badge(320, 36, 3));

  /* Nirmalya: 1 what has been offered · 2 not taken back, eaten or sold · 3 left for the temple to handle */
  scenes.nirmalya = svg(340, 200,
    floor(20, 320, 176) +
    plate(80, 150, 44, 15) +
    '<ellipse cx="62" cy="140" rx="2.4" ry="5" fill="#fffdf6" stroke="#c9b994"/><circle cx="78" cy="138" r="5" fill="#f6c22e"/><path d="M88 142 q6 -5 12 0" fill="none" stroke="#7a4f2a" stroke-width="2"/>' +
    diya(100, 132, 0.6) + badge(80, 92, 1) +
    arrow(132, 120, 166, 100) +
    '<circle cx="196" cy="82" r="20" fill="' + SKIN + '" stroke="' + SKIN_EDGE + '" stroke-width="2"/><path d="M176 76 Q196 50 216 78 Q196 64 176 76 Z" fill="' + HAIR + '"/>' +
    '<ellipse cx="196" cy="92" rx="6" ry="3" fill="' + INK + '"/>' +
    '<circle cx="238" cy="92" r="11" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/><text x="238" y="97" text-anchor="middle" font-size="13" font-weight="700" fill="' + BRASS_EDGE + '" font-family="' + FONT + '">₹</text>' +
    nope(216, 86, 42) + badge(216, 30, 2) +
    arrow(132, 160, 220, 160) +
    '<path d="M250 176 l6 -30 h50 l6 30 z" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="2"/><path d="M260 154 h42 M258 164 h46" stroke="' + WOOD_EDGE + '" stroke-width="1.5"/>' +
    badge(281, 122, 3));

  /* The true spirit of pooja: 1 no hurry, read with understanding · 2 the Lord is neither pleased nor displeased · 3 wishing to become like Him */
  scenes.bhav = svg(340, 210,
    floor(20, 320, 186) +
    shrine(256, 186, 1) + badge(256, 40, 2) +
    chowki(126, 160, 60) + book(126, 144, 24, { h: 16 }) + badge(126, 112, 1) +
    sit(60, 186, { hands: 'folded' }) +
    heart(110, 60, 1.6) + heart(150, 48, 1.1) + heart(184, 40, 0.8) +
    '<path d="M86 86 Q140 30 214 60" fill="none" stroke="' + RED + '" stroke-width="2" stroke-dasharray="3 5"/>' +
    badge(60, 90, 3));

  /* The five Parameshthis, in the order of the Namokar Mantra. */
  scenes.parameshthi = svg(360, 230,
    floor(20, 340, 200) +
    jina(60, 180, 0.85) + badge(60, 196, 1) +
    '<g transform="translate(132 0)">' +
    '<circle cx="0" cy="110" r="42" fill="' + GLOW + '"/>' +
    '<ellipse cx="0" cy="138" rx="24" ry="9" fill="none" stroke="' + BRASS_EDGE + '" stroke-width="2.5" stroke-dasharray="4 4"/>' +
    '<path d="M-13 -16 Q-16 -50 -7 -54 H7 Q16 -50 13 -16 Z" transform="translate(0 150)" fill="none" stroke="' + BRASS_EDGE + '" stroke-width="2.5" stroke-dasharray="4 4"/>' +
    '<circle cx="0" cy="86" r="10" fill="none" stroke="' + BRASS_EDGE + '" stroke-width="2.5" stroke-dasharray="4 4"/>' +
    '</g>' + badge(132, 196, 2) +
    muni(206, 200, {}) + badge(206, 216, 3) +
    muni(272, 200, { book: true }) + badge(272, 216, 4) +
    muni(332, 200, {}) + badge(332, 216, 5));

  return scenes;
})();
