/*
 * Pictures for the children's stories (बच्चों की कहानियाँ): bright, round and friendly, built
 * from a small kit of characters and scenery, in a 320 x 200 box. Each page's picture is added
 * to SCENES as "kid-<story>-<page>" (so content/bal-katha/chitra.json can place it), and each
 * story's cover to SCENES.story.
 */
const KIDS = (function () {
  const P = {
    sky: '#8fd3fb', sky2: '#d9f1ff', sun: '#ffd23f', sunRay: '#ffb703', grass: '#7bd389', grass2: '#4fb477',
    leaf: '#3fae6b', trunk: '#a0673a', red: '#ff5d5d', orange: '#ff9f1c', pink: '#ff7eb6', purple: '#9b72ff',
    blue: '#4d96ff', teal: '#2ec4b6', yellow: '#ffe066', white: '#ffffff', ink: '#3a2b24', skin: '#f6c69a',
    skin2: '#e3a873', hair: '#3b2a20', cheek: '#ff9eae', cream: '#fff6e5', clay: '#c96f3b', night: '#26306b', night2: '#4a3f8f'
  };
  const svg = body => '<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' + body + '</svg>';
  const g = (x, y, s, body, flip) => '<g transform="translate(' + x + ' ' + y + ') scale(' + (flip ? -s : s) + ' ' + s + ')">' + body + '</g>';

  /* ---------- Scenery ---------- */
  let skyId = 0;
  function sky(top, bottom) {
    const id = 'kidsky' + (++skyId);
    return '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + (top || P.sky) + '"/><stop offset="1" stop-color="' + (bottom || P.sky2) + '"/></linearGradient></defs>' +
      '<rect width="320" height="200" fill="url(#' + id + ')"/>';
  }
  function sun(x, y, r, face) {
    let rays = '';
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6, x1 = x + Math.cos(a) * (r + 4), y1 = y + Math.sin(a) * (r + 4), x2 = x + Math.cos(a) * (r + 12), y2 = y + Math.sin(a) * (r + 12);
      rays += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '"/>';
    }
    return '<g stroke="' + P.sunRay + '" stroke-width="3.5" stroke-linecap="round">' + rays + '</g><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + P.sun + '"/>' +
      (face === false ? '' : '<circle cx="' + (x - r * 0.32) + '" cy="' + (y - r * 0.12) + '" r="' + (r * 0.1) + '" fill="' + P.ink + '"/><circle cx="' + (x + r * 0.32) + '" cy="' + (y - r * 0.12) + '" r="' + (r * 0.1) + '" fill="' + P.ink + '"/>' +
        '<path d="M' + (x - r * 0.35) + ' ' + (y + r * 0.22) + 'Q' + x + ' ' + (y + r * 0.6) + ' ' + (x + r * 0.35) + ' ' + (y + r * 0.22) + '" fill="none" stroke="' + P.ink + '" stroke-width="2" stroke-linecap="round"/>' +
        '<circle cx="' + (x - r * 0.55) + '" cy="' + (y + r * 0.2) + '" r="' + (r * 0.13) + '" fill="' + P.cheek + '"/><circle cx="' + (x + r * 0.55) + '" cy="' + (y + r * 0.2) + '" r="' + (r * 0.13) + '" fill="' + P.cheek + '"/>');
  }
  const cloud = (x, y, s) => g(x, y, s, '<g fill="#fff"><circle cx="0" cy="0" r="10"/><circle cx="12" cy="-6" r="13"/><circle cx="26" cy="0" r="10"/><rect x="-2" y="0" width="30" height="10" rx="5"/></g>');
  function ground(y, c1, c2) {
    return '<path d="M0 ' + y + 'Q80 ' + (y - 14) + ' 160 ' + y + 'T320 ' + (y - 4) + 'V200H0Z" fill="' + (c1 || P.grass) + '"/>' +
      '<path d="M0 ' + (y + 14) + 'Q100 ' + (y + 4) + ' 200 ' + (y + 16) + 'T320 ' + (y + 12) + 'V200H0Z" fill="' + (c2 || P.grass2) + '" opacity=".55"/>';
  }
  const tree = (x, y, s) => g(x, y, s, '<rect x="-5" y="-6" width="10" height="34" rx="4" fill="' + P.trunk + '"/><circle cx="0" cy="-22" r="22" fill="' + P.leaf + '"/><circle cx="-16" cy="-10" r="14" fill="' + P.grass2 + '"/><circle cx="16" cy="-12" r="15" fill="' + P.grass2 + '"/><circle cx="7" cy="-30" r="4" fill="' + P.red + '"/><circle cx="-9" cy="-20" r="4" fill="' + P.red + '"/><circle cx="12" cy="-6" r="4" fill="' + P.red + '"/>');
  const flower = (x, y, c) => '<g transform="translate(' + x + ' ' + y + ')"><line x1="0" y1="0" x2="0" y2="10" stroke="' + P.leaf + '" stroke-width="2"/>' +
    [0, 72, 144, 216, 288].map(a => '<circle cx="' + (Math.cos(a * Math.PI / 180) * 4).toFixed(1) + '" cy="' + (Math.sin(a * Math.PI / 180) * 4).toFixed(1) + '" r="3.2" fill="' + c + '"/>').join('') +
    '<circle r="2.4" fill="' + P.yellow + '"/></g>';
  const flowers = (y, n = 6) => Array.from({ length: n }, (_, i) => flower(18 + i * (290 / (n - 1 || 1)), y + (i % 2) * 6, [P.pink, P.yellow, P.purple, P.red, P.orange, P.white][i % 6])).join('');
  function rainbow(x, y, r) {
    return [P.red, P.orange, P.yellow, P.grass, P.blue, P.purple].map((c, i) => '<path d="M' + (x - r + i * 6) + ' ' + y + 'A' + (r - i * 6) + ' ' + (r - i * 6) + ' 0 0 1 ' + (x + r - i * 6) + ' ' + y + '" fill="none" stroke="' + c + '" stroke-width="6"/>').join('');
  }
  function stars(n, seed = 1) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = (Math.sin(i * 12.9 + seed) * 0.5 + 0.5) * 310 + 5, y = (Math.sin(i * 78.2 + seed * 3) * 0.5 + 0.5) * 110 + 6, r = 1.2 + (i % 3) * 0.7;
      s += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r + '" fill="#fff6c7"/>';
    }
    return s;
  }
  const sparkle = (x, y, s, c) => g(x, y, s, '<path d="M0 -8L2 -2L8 0L2 2L0 8L-2 2L-8 0L-2 -2Z" fill="' + (c || P.yellow) + '"/>');
  const heart = (x, y, s, c) => g(x, y, s, '<path d="M0 3C-6 -2 -6 -7 -2.5 -7C-1 -7 0 -6 0 -5C0 -6 1 -7 2.5 -7C6 -7 6 -2 0 3Z" fill="' + (c || P.pink) + '"/>');
  const moon = (x, y, r) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fff3b0"/><circle cx="' + (x + r * 0.45) + '" cy="' + (y - r * 0.25) + '" r="' + (r * 0.85) + '" fill="' + P.night + '"/>';
  /* A little Jain temple with its shikhar and flag. */
  const temple = (x, y, s) => g(x, y, s, '<rect x="-30" y="-20" width="60" height="40" fill="#fff6e5" stroke="' + P.clay + '" stroke-width="2"/>' +
    '<path d="M-22 -20L0 -62L22 -20Z" fill="#ffe8c2" stroke="' + P.clay + '" stroke-width="2"/><path d="M-10 0h20v20h-20z" fill="' + P.orange + '"/><path d="M-10 0a10 10 0 0 1 20 0" fill="' + P.orange + '"/>' +
    '<line x1="0" y1="-62" x2="0" y2="-80" stroke="' + P.ink + '" stroke-width="1.5"/><path d="M0 -80L14 -75L0 -70Z" fill="' + P.red + '"/><circle cx="0" cy="-63" r="3" fill="' + P.sun + '"/>');
  const bubble = (x, y, w, h, body) => '<g transform="translate(' + x + ' ' + y + ')"><rect x="0" y="0" width="' + w + '" height="' + h + '" rx="' + (h / 2) + '" fill="#fff" stroke="' + P.ink + '" stroke-width="1.5"/><path d="M14 ' + (h - 1) + 'L8 ' + (h + 9) + 'L24 ' + (h - 1) + '" fill="#fff" stroke="' + P.ink + '" stroke-width="1.5"/><rect x="12" y="' + (h - 4) + '" width="14" height="5" fill="#fff"/>' + body + '</g>';
  const thought = (x, y, r, body) => '<g transform="translate(' + x + ' ' + y + ')"><circle cx="-' + (r + 10) + '" cy="' + (r + 8) + '" r="3" fill="#fff" stroke="' + P.ink + '" stroke-width="1.2"/><circle cx="-' + (r + 3) + '" cy="' + (r + 1) + '" r="5" fill="#fff" stroke="' + P.ink + '" stroke-width="1.2"/><circle r="' + r + '" fill="#fff" stroke="' + P.ink + '" stroke-width="1.5"/>' + body + '</g>';

  /* ---------- People ---------- */
  function face(cx, cy, r, o = {}) {
    const look = o.look || 0, mood = o.mood || 'smile';
    const eye = (ex) => '<circle cx="' + (ex + look) + '" cy="' + (cy - r * 0.05) + '" r="' + (r * 0.15) + '" fill="' + P.ink + '"/><circle cx="' + (ex + look + r * 0.05) + '" cy="' + (cy - r * 0.11) + '" r="' + (r * 0.055) + '" fill="#fff"/>';
    const eyes = mood === 'calm' ? '<path d="M' + (cx - r * 0.45) + ' ' + cy + 'q' + (r * 0.15) + ' ' + (r * 0.12) + ' ' + (r * 0.3) + ' 0M' + (cx + r * 0.15) + ' ' + cy + 'q' + (r * 0.15) + ' ' + (r * 0.12) + ' ' + (r * 0.3) + ' 0" fill="none" stroke="' + P.ink + '" stroke-width="1.6" stroke-linecap="round"/>'
      : eye(cx - r * 0.32) + eye(cx + r * 0.32);
    const mouth = mood === 'sad' ? '<path d="M' + (cx - r * 0.2) + ' ' + (cy + r * 0.45) + 'q' + (r * 0.2) + ' -' + (r * 0.16) + ' ' + (r * 0.4) + ' 0" fill="none" stroke="' + P.ink + '" stroke-width="1.6" stroke-linecap="round"/>'
      : mood === 'oh' ? '<ellipse cx="' + (cx + look) + '" cy="' + (cy + r * 0.42) + '" rx="' + (r * 0.12) + '" ry="' + (r * 0.16) + '" fill="' + P.ink + '"/>'
        : '<path d="M' + (cx - r * 0.25 + look) + ' ' + (cy + r * 0.32) + 'q' + (r * 0.25) + ' ' + (r * 0.28) + ' ' + (r * 0.5) + ' 0" fill="' + (mood === 'laugh' ? P.red : 'none') + '" stroke="' + P.ink + '" stroke-width="1.6" stroke-linecap="round"/>';
    return eyes + mouth + '<circle cx="' + (cx - r * 0.58) + '" cy="' + (cy + r * 0.25) + '" r="' + (r * 0.14) + '" fill="' + P.cheek + '" opacity=".8"/><circle cx="' + (cx + r * 0.58) + '" cy="' + (cy + r * 0.25) + '" r="' + (r * 0.14) + '" fill="' + P.cheek + '" opacity=".8"/>';
  }
  /* A child: o.girl, o.shirt, o.pants, o.arms ('down' | 'up' | 'wave' | 'hold' | 'fold' | 'point'), o.crown, o.mood, o.look, o.skin */
  function kid(x, y, s, o = {}) {
    const skin = o.skin || P.skin, shirt = o.shirt || P.orange, pants = o.pants || P.blue;
    const arms = {
      down: 'M-9 -18L-14 -2M9 -18L14 -2', up: 'M-9 -18L-16 -34M9 -18L16 -34', wave: 'M-9 -18L-14 -2M9 -18L17 -32',
      hold: 'M-9 -18L-2 -10M9 -18L2 -10', fold: 'M-9 -18L-1 -16M9 -18L1 -16', point: 'M-9 -18L-14 -2M9 -18L24 -20', reach: 'M-9 -18L-20 -14M9 -18L20 -14'
    }[o.arms || 'down'];
    let body = '';
    body += '<path d="M-5 0V14M5 0V14" stroke="' + (o.girl ? skin : pants) + '" stroke-width="6" stroke-linecap="round"/>';
    body += '<path d="M-6 14h-3M6 14h3" stroke="' + P.ink + '" stroke-width="4" stroke-linecap="round"/>';
    body += o.girl ? '<path d="M-11 -22H11L15 4H-15Z" fill="' + shirt + '"/><path d="M-15 4H15" stroke="' + P.white + '" stroke-width="1.5" opacity=".6"/>'
      : '<rect x="-11" y="-22" width="22" height="20" rx="6" fill="' + shirt + '"/><rect x="-10" y="-4" width="20" height="7" rx="3" fill="' + pants + '"/>';
    body += '<path d="' + arms + '" stroke="' + skin + '" stroke-width="5.5" stroke-linecap="round" fill="none"/>';
    body += '<circle cx="0" cy="-36" r="15" fill="' + skin + '"/>';
    body += o.girl
      ? '<path d="M-15 -36C-16 -52 16 -54 15 -36C12 -44 -10 -46 -15 -36Z" fill="' + P.hair + '"/><circle cx="16" cy="-42" r="5" fill="' + P.hair + '"/><circle cx="-16" cy="-42" r="5" fill="' + P.hair + '"/><circle cx="16" cy="-42" r="2" fill="' + P.pink + '"/><circle cx="-16" cy="-42" r="2" fill="' + P.pink + '"/>'
      : '<path d="M-15 -37C-16 -54 16 -54 15 -38C9 -44 0 -47 -15 -37Z" fill="' + P.hair + '"/>';
    if (o.crown) body += '<path d="M-11 -49L-11 -58L-5 -53L0 -60L5 -53L11 -58L11 -49Z" fill="' + P.sun + '" stroke="' + P.sunRay + '" stroke-width="1"/>';
    body += face(0, -36, 15, o);
    return g(x, y, s, body, o.flip);
  }
  /* A grown-up: o.kind 'dadi' | 'mummy' | 'papa' | 'prince'; o.arms as for kid */
  function adult(x, y, s, o = {}) {
    const kind = o.kind || 'mummy', skin = o.skin || P.skin2;
    const dress = o.dress || { dadi: '#f7a8c4', mummy: P.purple, papa: P.teal, prince: o.color || P.blue }[kind];
    const arms = { down: 'M-12 -34L-17 -10M12 -34L17 -10', fold: 'M-12 -34L-2 -26M12 -34L2 -26', hold: 'M-12 -34L-4 -20M12 -34L4 -20', point: 'M-12 -34L-17 -10M12 -34L30 -38', reach: 'M-12 -34L-28 -26M12 -34L28 -26', up: 'M-12 -34L-22 -54M12 -34L22 -54', pour: 'M-12 -34L-17 -10M12 -34L26 -24' }[o.arms || 'down'];
    let b = '<path d="M-6 0V18M6 0V18" stroke="' + skin + '" stroke-width="6" stroke-linecap="round"/>';
    b += kind === 'papa' || kind === 'prince' ? '<rect x="-13" y="-40" width="26" height="40" rx="8" fill="' + dress + '"/><rect x="-11" y="-4" width="22" height="16" rx="4" fill="' + (kind === 'prince' ? P.yellow : '#f3f0e8') + '"/>'
      : '<path d="M-13 -40H13L18 12H-18Z" fill="' + dress + '"/><path d="M13 -40L-14 6" stroke="' + (kind === 'dadi' ? '#fff' : P.yellow) + '" stroke-width="4" opacity=".75"/>';
    b += '<path d="' + arms + '" stroke="' + skin + '" stroke-width="6" stroke-linecap="round" fill="none"/>';
    b += '<circle cx="0" cy="-54" r="15" fill="' + skin + '"/>';
    b += kind === 'dadi' ? '<path d="M-15 -55C-16 -72 16 -72 15 -55C10 -62 -10 -62 -15 -55Z" fill="#e9e6e1"/><circle cx="0" cy="-70" r="7" fill="#e9e6e1"/><path d="M-9 -52h7M2 -52h7" stroke="' + P.ink + '" stroke-width="1"/><rect x="-10" y="-56" width="8" height="6" rx="2" fill="none" stroke="' + P.ink + '" stroke-width="1"/><rect x="2" y="-56" width="8" height="6" rx="2" fill="none" stroke="' + P.ink + '" stroke-width="1"/>'
      : kind === 'mummy' ? '<path d="M-16 -52C-18 -74 18 -74 16 -52C12 -62 -12 -62 -16 -52Z" fill="' + P.hair + '"/><path d="M14 -56C24 -50 22 -36 16 -30" stroke="' + P.hair + '" stroke-width="6" fill="none" stroke-linecap="round"/><circle cx="0" cy="-60" r="1.8" fill="' + P.red + '"/>'
        : '<path d="M-15 -56C-16 -72 16 -72 15 -56C9 -63 -9 -63 -15 -56Z" fill="' + P.hair + '"/>' + (kind === 'papa' ? '<path d="M-6 -46q6 3 12 0" stroke="' + P.hair + '" stroke-width="2" fill="none"/>' : '');
    if (kind === 'prince' || o.crown) b += '<path d="M-12 -68L-12 -79L-6 -73L0 -82L6 -73L12 -79L12 -68Z" fill="' + P.sun + '" stroke="' + P.sunRay + '" stroke-width="1"/>';
    b += face(0, -54, 15, o);
    return g(x, y, s, b, o.flip);
  }
  /* A muni, drawn simply and with respect: shining, calm, with the peacock-feather pichhi. */
  function muni(x, y, s, o = {}) {
    const skin = '#f0c08e';
    let b = '<circle cx="0" cy="-54" r="24" fill="#fff3b0" opacity=".75"/><circle cx="0" cy="-54" r="32" fill="#fff3b0" opacity=".35"/>';
    b += '<path d="M-6 0V18M6 0V18" stroke="' + skin + '" stroke-width="6" stroke-linecap="round"/>';
    b += '<rect x="-12" y="-40" width="24" height="42" rx="10" fill="' + skin + '"/>';
    b += o.anjali ? '<path d="M-11 -34L-3 -24M11 -34L3 -24" stroke="' + skin + '" stroke-width="6" stroke-linecap="round"/><path d="M-7 -24Q0 -16 7 -24" fill="' + skin + '" stroke="#d99a62" stroke-width="1.5"/>'
      : '<path d="M-11 -34L-16 -10M11 -34L16 -10" stroke="' + skin + '" stroke-width="6" stroke-linecap="round"/>';
    b += '<circle cx="0" cy="-54" r="14" fill="' + skin + '"/><path d="M-14 -56C-14 -70 14 -70 14 -56C9 -62 -9 -62 -14 -56Z" fill="#7a5a3e"/>';
    b += face(0, -54, 14, { mood: 'calm' });
    /* pichhi: peacock feathers on a stick */
    b += o.anjali || o.pichhi === false ? '' : '<line x1="-16" y1="-10" x2="-26" y2="-46" stroke="#8b5a2b" stroke-width="2"/><g transform="translate(-27 -50)"><ellipse rx="8" ry="11" fill="' + P.teal + '"/><ellipse rx="4.5" ry="6" fill="' + P.blue + '"/><circle r="2.2" fill="' + P.sun + '"/></g>';
    return g(x, y, s, b, o.flip);
  }

  /* ---------- Animals and things ---------- */
  const ant = (x, y, s, r = 0) => '<g transform="translate(' + x + ' ' + y + ') rotate(' + r + ') scale(' + s + ')"><path d="M-6 2L-9 6M0 2L0 7M6 2L9 6" stroke="' + P.ink + '" stroke-width="1"/><circle cx="-6" cy="0" r="3.4" fill="' + P.ink + '"/><circle cx="0" cy="0" r="2.6" fill="' + P.ink + '"/><circle cx="6" cy="-1" r="3" fill="' + P.ink + '"/><circle cx="7" cy="-2" r=".9" fill="#fff"/><path d="M8 -3l3 -4M7 -4l1 -5" stroke="' + P.ink + '" stroke-width=".8"/></g>';
  const sugar = (x, y, s = 1) => g(x, y, s, '<rect x="-3" y="-3" width="6" height="6" rx="1" fill="#fff" stroke="#d8d2c4" stroke-width=".8"/>');
  const anthill = (x, y, s) => g(x, y, s, '<path d="M-22 0Q0 -26 22 0Z" fill="#c9915c"/><ellipse cx="0" cy="-9" rx="4" ry="3" fill="#6b4226"/>');
  const butterfly = (x, y, s, c) => g(x, y, s, '<ellipse cx="-5" cy="-3" rx="5" ry="7" fill="' + (c || P.pink) + '"/><ellipse cx="5" cy="-3" rx="5" ry="7" fill="' + (c || P.pink) + '"/><ellipse cx="-4" cy="5" rx="3.5" ry="4" fill="' + P.yellow + '"/><ellipse cx="4" cy="5" rx="3.5" ry="4" fill="' + P.yellow + '"/><rect x="-1" y="-8" width="2" height="16" rx="1" fill="' + P.ink + '"/>');
  const bird = (x, y, s, c) => g(x, y, s, '<ellipse cx="0" cy="0" rx="9" ry="7" fill="' + (c || P.blue) + '"/><circle cx="7" cy="-5" r="5" fill="' + (c || P.blue) + '"/><circle cx="8.5" cy="-6" r="1.2" fill="' + P.ink + '"/><path d="M12 -5l5 1.5l-5 1.5Z" fill="' + P.orange + '"/><path d="M-4 -2q-6 -8 -12 -2q6 2 12 2" fill="' + P.yellow + '"/>');
  const snake = (x, y, s, o = {}) => g(x, y, s, '<path d="M-60 10C-40 -10 -20 30 0 10S40 -10 52 4" fill="none" stroke="#3a7d44" stroke-width="12" stroke-linecap="round"/><path d="M-60 10C-40 -10 -20 30 0 10S40 -10 52 4" fill="none" stroke="#7bd389" stroke-width="4" stroke-dasharray="4 7" stroke-linecap="round"/>' +
    '<ellipse cx="58" cy="0" rx="13" ry="10" fill="#3a7d44"/><circle cx="62" cy="-4" r="3.6" fill="#fff"/><circle cx="62.6" cy="-4" r="1.8" fill="' + P.ink + '"/>' + (o.bow ? '<path d="M66 5q3 2 6 0" stroke="#fff" stroke-width="1.2" fill="none"/>' : '<path d="M70 2l7 -1M70 2l7 3" stroke="' + P.red + '" stroke-width="1.4"/>'));
  const pot = (x, y, s, c) => g(x, y, s, '<ellipse cx="0" cy="0" rx="18" ry="16" fill="' + (c || P.clay) + '"/><rect x="-8" y="-20" width="16" height="7" rx="2" fill="' + (c || P.clay) + '"/><path d="M-16 -2q16 8 32 0" stroke="#fff" stroke-width="2" fill="none" opacity=".5"/>');
  const glass = (x, y, s) => g(x, y, s, '<path d="M-6 -12H6L5 6H-5Z" fill="#cdeeff" stroke="#7cb8d8" stroke-width="1.2"/><path d="M-5 -4H5L4.5 6H-4.5Z" fill="#8fd3fb"/>');
  const thali = (x, y, s) => g(x, y, s, '<ellipse cx="0" cy="0" rx="26" ry="8" fill="#e6c36a" stroke="#c99a35" stroke-width="1.5"/><circle cx="-12" cy="-2" r="5" fill="' + P.orange + '"/><circle cx="0" cy="-3" r="5" fill="#f5e6b8"/><circle cx="12" cy="-2" r="5" fill="' + P.grass + '"/>');
  const vase = (x, y, s, broken) => broken
    ? g(x, y, s, '<path d="M-14 0l6 -9l5 7Z" fill="' + P.blue + '"/><path d="M2 0l5 -11l7 9Z" fill="' + P.blue + '"/><path d="M-4 2l4 -6l5 6Z" fill="' + P.teal + '"/><path d="M14 1l3 -5l4 5Z" fill="' + P.blue + '"/>')
    : g(x, y, s, '<path d="M-6 -26h12l-2 6q12 8 6 22h-20q-6 -14 6 -22Z" fill="' + P.blue + '"/><path d="M-8 -10h16" stroke="' + P.yellow + '" stroke-width="3"/><path d="M-4 -26l-3 -8M4 -26l3 -8M0 -26v-10" stroke="' + P.leaf + '" stroke-width="2"/><circle cx="-7" cy="-34" r="3" fill="' + P.pink + '"/><circle cx="7" cy="-34" r="3" fill="' + P.red + '"/><circle cx="0" cy="-37" r="3" fill="' + P.yellow + '"/>');
  const ball = (x, y, s) => g(x, y, s, '<circle r="8" fill="' + P.red + '"/><path d="M-8 0h16M0 -8q5 8 0 16" stroke="#fff" stroke-width="1.6" fill="none"/>');
  const sugarcane = (x, y, s) => g(x, y, s, [-6, 0, 6].map(dx => '<rect x="' + (dx - 2.5) + '" y="-40" width="5" height="44" rx="2" fill="#9bc53d"/><path d="M' + (dx - 2.5) + ' -26h5M' + (dx - 2.5) + ' -12h5" stroke="#5c8a1f" stroke-width="1.2"/><path d="M' + dx + ' -40q-8 -10 -14 -8M' + dx + ' -40q8 -12 14 -8" stroke="' + P.leaf + '" stroke-width="2" fill="none"/>').join(''));
  const kalash = (x, y, s) => g(x, y, s, '<ellipse cx="0" cy="0" rx="13" ry="12" fill="#f2b33d"/><rect x="-6" y="-17" width="12" height="7" rx="2" fill="#f2b33d"/><path d="M-11 -2h22" stroke="' + P.red + '" stroke-width="2.5"/><path d="M0 -22v4" stroke="' + P.leaf + '" stroke-width="3"/><circle cx="0" cy="-23" r="3" fill="' + P.grass + '"/>');
  const chain = (x, y, s) => g(x, y, s, '<g fill="none" stroke="#9aa3ad" stroke-width="2.5">' + [0, 8, 16, 24].map(dx => '<ellipse cx="' + dx + '" cy="0" rx="4.5" ry="3"/>').join('') + '</g>');
  const bowl = (x, y, s) => g(x, y, s, '<path d="M-10 0Q0 12 10 0Z" fill="' + P.clay + '"/><circle cx="-4" cy="-1" r="2" fill="#f5e6b8"/><circle cx="1" cy="-2" r="2" fill="#f5e6b8"/><circle cx="5" cy="-1" r="2" fill="#f5e6b8"/>');
  const swing = (x, y, s, kidBody) => g(x, y, s, '<line x1="-18" y1="-90" x2="-18" y2="-6" stroke="#8b5a2b" stroke-width="2"/><line x1="18" y1="-90" x2="18" y2="-6" stroke="#8b5a2b" stroke-width="2"/><rect x="-22" y="-8" width="44" height="6" rx="3" fill="' + P.orange + '"/>' + kidBody);
  const castle = (x, y, s, c) => g(x, y, s, '<rect x="-40" y="-40" width="80" height="40" fill="' + (c || '#ffe3b3') + '" stroke="' + P.clay + '" stroke-width="2"/><rect x="-46" y="-62" width="22" height="62" fill="' + (c || '#ffe3b3') + '" stroke="' + P.clay + '" stroke-width="2"/><rect x="24" y="-62" width="22" height="62" fill="' + (c || '#ffe3b3') + '" stroke="' + P.clay + '" stroke-width="2"/>' +
    '<path d="M-46 -62l11 -14l11 14M24 -62l11 -14l11 14" fill="' + P.red + '"/><path d="M-10 0v-20a10 10 0 0 1 20 0v20Z" fill="' + P.purple + '"/>');
  const rainOfFlowers = (n, seed = 2) => Array.from({ length: n }, (_, i) => flower(((Math.sin(i * 9.1 + seed) * 0.5 + 0.5) * 300 + 10).toFixed(1), ((Math.sin(i * 4.7 + seed) * 0.5 + 0.5) * 80 + 6).toFixed(1), [P.pink, P.yellow, P.red, P.purple][i % 4])).join('');
  const vines = (x, y, s) => g(x, y, s, '<path d="M-8 18C-16 4 4 -6 -6 -20S6 -38 -2 -50M8 18C16 2 -4 -8 6 -22S-6 -40 4 -52" fill="none" stroke="' + P.leaf + '" stroke-width="2.5"/>' + [[-9, 4], [6, -8], [-5, -26], [7, -30], [-3, -44]].map(([a, b2]) => '<ellipse cx="' + a + '" cy="' + b2 + '" rx="4" ry="2.2" fill="' + P.grass + '" transform="rotate(-30 ' + a + ' ' + b2 + ')"/>').join(''));

  /* ---------- The stories, page by page ---------- */
  const day = (body, o = {}) => svg(sky(o.top, o.bottom) + (o.sun === false ? '' : sun(o.sunX || 278, o.sunY || 34, 17)) + cloud(40, 30, 1) + cloud(150, 20, 0.8) + ground(o.ground || 150) + body);
  const night = body => svg(sky(P.night, P.night2) + stars(40, 3) + moon(270, 40, 18) + ground(160, '#3f6e5a', '#2b4f41') + body);
  const indoor = (body, wall) => svg('<rect width="320" height="200" fill="' + (wall || '#ffe9c7') + '"/><rect y="150" width="320" height="50" fill="#e0b98a"/><path d="M0 150H320" stroke="#c99a6a" stroke-width="3"/>' +
    '<rect x="230" y="30" width="60" height="50" rx="4" fill="' + P.sky + '" stroke="#fff" stroke-width="5"/><path d="M260 30v50M230 55h60" stroke="#fff" stroke-width="3"/>' + body);

  const PAGES = {
    chinti: [
      day(tree(40, 150, 1.1) + anthill(250, 160, 1.2) + [70, 92, 114, 136, 158, 180, 202, 224].map((x, i) => ant(x, 163 + Math.sin(i) * 3, 1.1, -4) + (i % 2 ? '' : sugar(x + 5, 156, 0.9))).join('') + kid(120, 118, 1.25, { shirt: P.orange, look: 2, mood: 'oh' }) + flowers(182)),
      day(anthill(260, 160, 1.1) + [120, 142, 164, 186, 208].map(x => ant(x, 164, 1.1, -3)).join('') + kid(110, 124, 1.25, { shirt: P.orange, arms: 'up' }) + adult(55, 132, 1.15, { kind: 'dadi', arms: 'point' }) + bubble(16, 26, 54, 26, '<text x="27" y="18" text-anchor="middle" font-size="16" font-weight="700" fill="' + P.red + '" font-family="sans-serif">!</text>')),
      day(anthill(240, 162, 1.1) + [150, 170, 190, 210].map(x => ant(x, 165, 1.1, -3)).join('') + kid(110, 130, 1.2, { shirt: P.orange, arms: 'hold', look: 3 }) + adult(60, 136, 1.1, { kind: 'dadi', arms: 'hold', look: 3 }) + heart(170, 120, 1.6) + heart(200, 100, 1.2, P.red) + heart(145, 96, 1.1)),
      day(rainbow(160, 120, 90) + anthill(240, 162, 1.1) + [255, 272, 228].map((x, i) => ant(x, 168 + i, 1.1, 0) + sugar(x - 2, 160, 0.9)).join('') + kid(110, 130, 1.25, { shirt: P.orange, arms: 'wave', mood: 'laugh' }) + heart(245, 132, 1.3) + butterfly(60, 70, 1.2) + flowers(184, 5), { sun: false })
    ],
    paani: [
      indoor(pot(170, 128, 1.6) + '<path d="M140 104q30 -12 60 0" fill="#fff" stroke="#ddd" stroke-width="1.5"/>' + adult(110, 132, 1.2, { kind: 'mummy', arms: 'pour' }) + kid(225, 140, 1.05, { girl: true, shirt: P.pink, look: -2, mood: 'oh' }) + '<path d="M140 95q8 6 12 14" stroke="#8fd3fb" stroke-width="3" fill="none"/>'),
      svg('<rect width="320" height="200" fill="#e9f7ff"/>' + '<circle cx="160" cy="100" r="70" fill="#cdeeff" stroke="#7cb8d8" stroke-width="5"/><rect x="205" y="140" width="60" height="14" rx="7" fill="' + P.clay + '" transform="rotate(40 205 140)"/>' +
        [[130, 80, P.pink], [180, 70, P.teal], [150, 125, P.purple], [195, 115, P.orange], [125, 108, P.grass]].map(([x, y, c]) => '<g transform="translate(' + x + ' ' + y + ')"><ellipse rx="10" ry="7" fill="' + c + '"/><circle cx="-3" cy="-1" r="1.6" fill="' + P.ink + '"/><circle cx="3" cy="-1" r="1.6" fill="' + P.ink + '"/><path d="M-3 3q3 2 6 0" stroke="' + P.ink + '" stroke-width="1" fill="none"/></g>').join('') + sparkle(60, 50, 1.4) + sparkle(270, 60, 1.1, P.pink) + sparkle(250, 170, 1, P.teal)),
      day('<ellipse cx="200" cy="146" rx="34" ry="10" fill="#8a8f98"/><rect x="166" y="120" width="68" height="26" fill="#a3a9b2"/><ellipse cx="200" cy="120" rx="34" ry="9" fill="#5a7fa8"/><path d="M180 92h40M200 92v22" stroke="#8b5a2b" stroke-width="3"/>' +
        adult(120, 140, 1.15, { kind: 'mummy', arms: 'reach', look: 3 }) + kid(70, 146, 1.05, { girl: true, shirt: P.pink, look: 3 }) + '<path d="M150 112q14 4 20 12" stroke="#8fd3fb" stroke-width="3" fill="none"/>' + sparkle(205, 108, 1, '#fff') + flowers(186, 4)),
      day(kid(150, 136, 1.3, { girl: true, shirt: P.pink, arms: 'hold', mood: 'laugh' }) + glass(150, 112, 1.2) + sparkle(110, 80, 1.3) + sparkle(195, 74, 1.1, P.pink) + heart(205, 100, 1.4) + butterfly(70, 80, 1.1, P.purple) + flowers(184, 6))
    ],
    suraj: [
      svg(sky('#ffb26b', '#ffe3a3') + sun(160, 128, 26) + ground(150, '#7bd389', '#4fb477') + '<rect x="60" y="150" width="200" height="8" rx="4" fill="#a0673a"/>' + thali(110, 146, 1) + thali(210, 146, 1) +
        kid(80, 140, 1, { shirt: P.blue, arms: 'hold' }) + adult(160, 140, 1.05, { kind: 'papa', arms: 'hold' }) + kid(240, 140, 1, { girl: true, shirt: P.pink, arms: 'hold', flip: true }) + bird(60, 60, 1, P.purple) + bird(90, 48, 0.8)),
      svg('<rect width="320" height="200" fill="' + P.night + '"/>' + stars(16, 5) + '<circle cx="230" cy="80" r="40" fill="#ffe8a3" opacity=".35"/><rect x="224" y="64" width="12" height="20" rx="3" fill="#fff6c7"/>' +
        [[210, 60], [250, 66], [240, 96], [214, 98], [232, 50]].map(([x, y], i) => butterfly(x, y, 0.5, ['#d9c7ff', '#ffd6e7', '#c7f0ff'][i % 3])).join('') + kid(110, 150, 1.25, { shirt: P.blue, mood: 'oh', look: 3 }) + thought(70, 40, 20, '<text x="0" y="6" text-anchor="middle" font-size="18" font-weight="700" fill="' + P.purple + '" font-family="sans-serif">?</text>')),
      svg(sky('#ff9f6b', '#ffd59a') + sun(250, 140, 22, false) + ground(150) + tree(270, 150, 1) + '<path d="M266 118q4 -4 8 0" stroke="' + P.ink + '" stroke-width="1.5" fill="none"/>' + bird(258, 112, 0.8, P.red) + bird(282, 108, 0.8) +
        adult(80, 140, 1.1, { kind: 'dadi', arms: 'point' }) + kid(150, 146, 1.1, { shirt: P.blue, look: 4 })),
      night('<rect x="60" y="130" width="170" height="30" rx="8" fill="#8b6bd6"/><rect x="60" y="122" width="40" height="14" rx="6" fill="#fff"/>' + '<g transform="translate(92 130)"><circle cx="0" cy="-6" r="13" fill="' + P.skin + '"/><path d="M-13 -7C-14 -21 14 -21 13 -8C8 -13 -2 -15 -13 -7Z" fill="' + P.hair + '"/>' + face(0, -6, 13, { mood: 'calm' }) + '</g>' +
        '<rect x="104" y="128" width="126" height="22" rx="8" fill="' + P.yellow + '"/><text x="250" y="70" font-size="18" fill="#fff6c7" font-family="sans-serif">z</text><text x="262" y="56" font-size="14" fill="#fff6c7" font-family="sans-serif">z</text>')
    ],
    sach: [
      indoor('<rect x="190" y="104" width="50" height="46" fill="#a0673a"/>' + vase(215, 104, 1.1) + kid(110, 140, 1.25, { shirt: P.teal, arms: 'up', mood: 'laugh' }) + ball(170, 70, 1.3) + '<path d="M150 90q12 -16 20 -22" stroke="' + P.ink + '" stroke-width="1" stroke-dasharray="3 3" fill="none"/>'),
      indoor('<rect x="190" y="104" width="50" height="46" fill="#a0673a"/>' + vase(200, 162, 1.3, true) + ball(250, 168, 1) + kid(120, 140, 1.25, { shirt: P.teal, mood: 'sad', look: 3 }) + thought(60, 50, 22, '<text x="0" y="7" text-anchor="middle" font-size="20" font-weight="700" fill="' + P.purple + '" font-family="sans-serif">?</text>')),
      indoor(adult(200, 140, 1.25, { kind: 'mummy', look: -3 }) + kid(120, 144, 1.15, { shirt: P.teal, arms: 'fold', look: 3 }) + vase(260, 166, 1, true) + bubble(70, 34, 70, 28, heart(35, 15, 1.4, P.red))),
      indoor(adult(170, 140, 1.25, { kind: 'mummy', arms: 'hold', mood: 'laugh' }) + kid(150, 146, 1.1, { shirt: P.teal, arms: 'reach', mood: 'laugh', flip: true }) + heart(130, 60, 1.6) + heart(205, 50, 1.3, P.red) + heart(165, 34, 1.1) + sparkle(100, 90, 1.2) + sparkle(240, 100, 1, P.pink))
    ],
    veer: [
      day(tree(170, 150, 1.6) + castle(60, 150, 0.6) + kid(110, 150, 1.1, { shirt: P.yellow, crown: true, arms: 'wave', mood: 'laugh' }) + kid(220, 152, 1, { shirt: P.blue, arms: 'up', mood: 'laugh' }) + kid(260, 154, 0.95, { girl: true, shirt: P.pink, mood: 'laugh', flip: true }) + flowers(186, 5)),
      day(tree(170, 150, 1.6) + snake(165, 120, 0.9) + kid(240, 156, 1, { shirt: P.blue, arms: 'up', mood: 'oh', flip: true }) + kid(285, 158, 0.95, { girl: true, shirt: P.pink, arms: 'up', mood: 'oh' }) + kid(90, 154, 1.1, { shirt: P.yellow, crown: true, mood: 'smile', look: 3 })),
      day('<circle cx="120" cy="104" r="46" fill="#fff3b0" opacity=".55"/>' + kid(120, 150, 1.35, { shirt: P.yellow, crown: true, arms: 'fold', mood: 'calm' }) + snake(205, 154, 0.75, { bow: true }) + sparkle(70, 70, 1.3) + sparkle(170, 64, 1.1) + sparkle(150, 40, 0.9, P.pink) + flowers(186, 4)),
      day('<circle cx="215" cy="96" r="54" fill="#fff3b0" opacity=".6"/>' + adult(215, 140, 1.15, { kind: 'prince', color: P.purple, arms: 'fold' }) + kid(100, 150, 1.25, { shirt: P.yellow, crown: true, mood: 'laugh' }) + sparkle(260, 50, 1.4) + sparkle(170, 46, 1.1, P.pink) + sparkle(280, 110, 1, P.teal) + rainbow(100, 70, 46), { sun: false })
    ],
    ganna: [
      day(castle(270, 150, 0.7) + muni(140, 140, 1.15) + adult(60, 140, 1, { kind: 'prince', color: P.teal, arms: 'reach' }) + '<g transform="translate(36 120)"><rect x="0" y="0" width="16" height="12" rx="3" fill="' + P.yellow + '"/><circle cx="4" cy="-2" r="3" fill="' + P.red + '"/><circle cx="11" cy="-2" r="3" fill="' + P.blue + '"/></g>' + adult(210, 142, 1, { kind: 'mummy', arms: 'reach', flip: true }) + flowers(184, 4)),
      day(muni(200, 140, 1.15, { flip: true }) + kid(80, 150, 1, { shirt: P.blue, mood: 'oh' }) + adult(120, 144, 1, { kind: 'papa', mood: 'oh' }) + thought(60, 40, 20, '<text x="0" y="7" text-anchor="middle" font-size="20" font-weight="700" fill="' + P.purple + '" font-family="sans-serif">?</text>') +
        [0, 1, 2].map(i => '<g transform="translate(' + (232 + i * 28) + ' ' + (24 + i * 4) + ') rotate(' + (i * 6 - 6) + ')"><rect width="22" height="24" rx="3" fill="#fff" stroke="' + P.ink + '" stroke-width="1"/><rect width="22" height="7" rx="2" fill="' + P.red + '"/><path d="M5 13h12M5 18h8" stroke="#bbb" stroke-width="1.5"/></g>').join(''), { sun: false }),
      indoor(adult(120, 140, 1.25, { kind: 'prince', color: P.blue, mood: 'laugh' }) + thought(220, 60, 36, sugarcane(-6, 18, 0.55) + kalash(14, 14, 0.85)) + sugarcane(270, 150, 0.9)),
      day(rainOfFlowers(14) + muni(200, 142, 1.15, { anjali: true, flip: true }) + adult(120, 142, 1.15, { kind: 'prince', color: P.blue, arms: 'pour', mood: 'laugh' }) + kalash(160, 104, 0.9) + '<path d="M168 102q10 6 16 14" stroke="#d6e86a" stroke-width="4" fill="none" stroke-linecap="round"/>' + sugarcane(60, 152, 0.8) + kid(270, 156, 0.9, { girl: true, shirt: P.pink, arms: 'up', mood: 'laugh' }), { sun: false })
    ],
    chandana: [
      day(tree(240, 150, 1.4) + swing(150, 150, 1, kid(0, -14, 1.05, { girl: true, shirt: P.pink, arms: 'up', crown: true, mood: 'laugh' })) + butterfly(70, 80, 1.2) + butterfly(270, 70, 1, P.purple) + flowers(186, 6)),
      indoor(kid(150, 144, 1.25, { girl: true, shirt: '#c9b8a6', arms: 'fold', mood: 'calm' }) + chain(132, 160, 1) + bowl(205, 150, 1.4) + sparkle(110, 70, 1, '#fff6c7'), '#e8dccb'),
      indoor(muni(225, 140, 1.15, { anjali: true, flip: true }) + kid(130, 146, 1.2, { girl: true, shirt: '#c9b8a6', arms: 'reach', mood: 'smile' }) + bowl(166, 124, 1.1) + '<rect x="190" y="40" width="80" height="112" rx="6" fill="none" stroke="#a0673a" stroke-width="5"/>', '#e8dccb'),
      day(rainOfFlowers(16, 5) + kid(140, 150, 1.3, { girl: true, shirt: P.pink, arms: 'up', crown: true, mood: 'laugh' }) + '<path d="M110 172l-8 4M176 172l8 4" stroke="#9aa3ad" stroke-width="3"/>' + adult(230, 142, 1.05, { kind: 'mummy', dress: P.teal, arms: 'fold' }) + sparkle(80, 110, 1.3) + sparkle(200, 96, 1, P.pink), { sun: false })
    ],
    bahubali: [
      day(castle(160, 150, 0.9) + adult(90, 142, 1.1, { kind: 'prince', color: P.blue, mood: 'laugh' }) + adult(235, 142, 1.15, { kind: 'prince', color: P.red, mood: 'laugh', flip: true }) + flowers(186, 5)),
      day('<path d="M120 120q20 -20 40 0q20 -20 40 0" fill="none" stroke="#5fc3ff" stroke-width="5" stroke-linecap="round"/>' + [130, 150, 170, 190].map((x, i) => '<circle cx="' + x + '" cy="' + (100 - i % 2 * 8) + '" r="4" fill="#8fd3fb"/>').join('') +
        '<path d="M0 160h320v40H0Z" fill="#5fb4ff" opacity=".6"/>' + adult(90, 152, 1.1, { kind: 'prince', color: P.blue, arms: 'reach', mood: 'laugh' }) + adult(235, 152, 1.15, { kind: 'prince', color: P.red, arms: 'reach', mood: 'laugh', flip: true })),
      day(adult(90, 142, 1.1, { kind: 'prince', color: P.blue, arms: 'fold', mood: 'oh' }) + adult(220, 142, 1.15, { kind: 'prince', color: P.red, arms: 'down', mood: 'calm', flip: true }) +
        '<g transform="translate(260 172)"><path d="M-12 0L-12 -11L-6 -5L0 -14L6 -5L12 -11L12 0Z" fill="' + P.sun + '" stroke="' + P.sunRay + '" stroke-width="1"/></g>' + thought(270, 50, 22, heart(0, 3, 1.6, P.red))),
      day('<circle cx="165" cy="96" r="58" fill="#fff3b0" opacity=".6"/>' + muni(165, 150, 1.35, { pichhi: false }) + vines(165, 130, 1.3) + anthill(120, 172, 0.8) + anthill(215, 172, 0.8) + bird(212, 76, 0.8, P.red) + butterfly(110, 90, 1, P.pink) + adult(60, 150, 1, { kind: 'prince', color: P.blue, arms: 'fold' }) + flowers(188, 4))
    ]
  };

  /* Covers: a bright banner of each story's first picture. */
  const STORY_IDS = { chinti: 'bal-chinti', paani: 'bal-paani', suraj: 'bal-suraj', sach: 'bal-sach', veer: 'bal-veer', ganna: 'bal-ganna', chandana: 'bal-chandana', bahubali: 'bal-bahubali' };
  if (typeof SCENES !== 'undefined') {
    SCENES.story = SCENES.story || {};
    Object.entries(PAGES).forEach(([k, pages]) => {
      pages.forEach((p, i) => { SCENES['kid-' + k + '-' + (i + 1)] = p; });
      SCENES.story[STORY_IDS[k]] = pages[0];
    });
  }

  /* The header picture of the children's corner. */
  function banner() {
    return svg(sky() + rainbow(160, 150, 120) + sun(270, 40, 20) + cloud(30, 40, 1.1) + cloud(110, 26, 0.8) + ground(152) +
      kid(70, 150, 1.05, { shirt: P.orange, arms: 'wave', mood: 'laugh' }) + kid(120, 152, 1, { girl: true, shirt: P.pink, arms: 'up', mood: 'laugh' }) +
      temple(230, 152, 0.85) + butterfly(170, 90, 1, P.purple) + bird(40, 90, 0.9) + flowers(186, 6));
  }
  return { banner: banner, pages: PAGES, palette: P };
})();
