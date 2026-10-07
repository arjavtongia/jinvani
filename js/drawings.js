/*
 * Simple drawings for the pooja guide. Each drawing carries numbered markers;
 * the names for the numbers come from content/chitra.json, so they follow
 * the app language.
 */
const DRAWINGS = (function () {
  const WOOD = '#b5773d';
  const WOOD_EDGE = '#8a5626';
  const BRASS = '#d9ad52';
  const BRASS_EDGE = '#a27726';
  const BRASS_LIGHT = '#ecc970';
  const RICE = '#fffaf0';
  const RICE_EDGE = '#d9ccb2';
  const CLOVE = '#6e3f1c';

  function badge(x, y, n) {
    return '<g><circle cx="' + x + '" cy="' + y + '" r="13" fill="#a3301a" stroke="#fff7ec" stroke-width="2.5"/>' +
      '<text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle" font-size="15" font-weight="700" fill="#fff7ec" font-family="system-ui, sans-serif">' + n + '</text></g>';
  }

  function clove(x, y, scale) {
    const s = scale || 1;
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' +
      '<path d="M0 26 L0 0" stroke="' + CLOVE + '" stroke-width="5" stroke-linecap="round"/>' +
      '<circle cx="0" cy="-6" r="7" fill="' + CLOVE + '"/>' +
      '<circle cx="-6" cy="-12" r="3.6" fill="' + CLOVE + '"/><circle cx="6" cy="-12" r="3.6" fill="' + CLOVE + '"/>' +
      '<circle cx="0" cy="-15" r="3.6" fill="' + CLOVE + '"/></g>';
  }

  function svg(viewBox, body) {
    return '<svg viewBox="' + viewBox + '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  /* Akshat arrangement: swastik, three dots, crescent with a dot. */
  const swastik = svg('0 0 240 250',
    '<rect x="4" y="4" width="232" height="242" rx="18" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="3"/>' +
    '<circle cx="110" cy="28" r="8" fill="' + RICE + '" stroke="' + RICE_EDGE + '" stroke-width="1.5"/>' +
    '<path d="M76 44 Q110 76 144 44 Q110 60 76 44 Z" fill="' + RICE + '" stroke="' + RICE_EDGE + '" stroke-width="1.5"/>' +
    '<circle cx="78" cy="94" r="8" fill="' + RICE + '" stroke="' + RICE_EDGE + '" stroke-width="1.5"/>' +
    '<circle cx="110" cy="94" r="8" fill="' + RICE + '" stroke="' + RICE_EDGE + '" stroke-width="1.5"/>' +
    '<circle cx="142" cy="94" r="8" fill="' + RICE + '" stroke="' + RICE_EDGE + '" stroke-width="1.5"/>' +
    '<path d="M110 128 V218 M65 173 H155 M110 128 H155 M155 173 V218 M110 218 H65 M65 173 V128" fill="none" stroke="' + RICE_EDGE + '" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M110 128 V218 M65 173 H155 M110 128 H155 M155 173 V218 M110 218 H65 M65 173 V128" fill="none" stroke="' + RICE + '" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>' +
    badge(196, 42, 1) + badge(196, 94, 2) + badge(196, 172, 3));

  /* Thona (small plate) with three cloves for sthapana. */
  const thona = svg('0 0 260 170',
    '<ellipse cx="130" cy="112" rx="112" ry="46" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="3"/>' +
    '<ellipse cx="130" cy="108" rx="88" ry="32" fill="' + BRASS_LIGHT + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>' +
    clove(85, 100) + clove(130, 100) + clove(175, 100) +
    badge(85, 40, 1) + badge(130, 40, 2) + badge(175, 40, 3));

  /* Layout of the pooja place on the chowki, seen from above. */
  function katoriRing(cx, cy, r, k, size) {
    let out = '';
    for (let i = 0; i < k; i++) {
      const a = (-90 + i * 360 / k) * Math.PI / 180;
      out += '<circle cx="' + (cx + r * Math.cos(a)).toFixed(1) + '" cy="' + (cy + r * Math.sin(a)).toFixed(1) + '" r="' + size + '" fill="' + BRASS_LIGHT + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>';
    }
    return out;
  }

  const layout = svg('0 0 340 280',
    '<rect x="6" y="6" width="328" height="268" rx="16" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="3"/>' +
    /* 1: book on a stand */
    '<rect x="120" y="24" width="100" height="52" rx="5" fill="#fbf3e2" stroke="#b9a487" stroke-width="2"/>' +
    '<path d="M170 26 V74 M132 38 H160 M132 50 H160 M132 62 H160 M180 38 H208 M180 50 H208 M180 62 H208" stroke="#b9a487" stroke-width="2"/>' +
    badge(234, 40, 1) +
    /* 2: thona with cloves */
    '<ellipse cx="62" cy="128" rx="38" ry="22" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="2.5"/>' +
    clove(48, 124, 0.55) + clove(62, 124, 0.55) + clove(76, 124, 0.55) +
    badge(62, 92, 2) +
    /* 3: offering plate */
    '<circle cx="170" cy="150" r="50" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="3"/>' +
    '<circle cx="170" cy="150" r="38" fill="' + BRASS_LIGHT + '" stroke="' + BRASS_EDGE + '" stroke-width="1.5"/>' +
    badge(170, 150, 3) +
    /* 4: plate with the eight dravya */
    '<circle cx="276" cy="196" r="48" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="3"/>' +
    katoriRing(276, 196, 32, 8, 9) +
    badge(276, 196, 4) +
    /* 5: water pot (kalash / jhari) */
    '<path d="M50 222 q-24 0 -24 -22 q0 -20 24 -20 q24 0 24 20 q0 22 -24 22 z" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="2.5"/>' +
    '<rect x="42" y="168" width="16" height="14" rx="3" fill="' + BRASS_LIGHT + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
    badge(92, 236, 5) +
    /* 6: incense burner */
    '<path d="M150 248 q20 14 40 0 l-4 -14 h-32 z" fill="#6b5847" stroke="#4a3b2f" stroke-width="2"/>' +
    '<path d="M162 228 q-6 -8 0 -16 q6 -8 0 -16 M178 228 q-6 -8 0 -16 q6 -8 0 -16" fill="none" stroke="#e7dccb" stroke-width="2.5" stroke-linecap="round"/>' +
    badge(214, 238, 6));

  /* Small pictures of what goes in each bowl, drawn around (0, 0) in a box of about 30 x 28. */
  function grain(x, y, rot, fill, edge) {
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="2.6" ry="5.4" transform="rotate(' + rot + ' ' + x + ' ' + y + ')" fill="' + fill + '" stroke="' + edge + '" stroke-width="1"/>';
  }
  function almond(x, y, rot) {
    return '<path d="M0 9 C-6 4 -6 -6 0 -10 C6 -6 6 4 0 9 Z" fill="#b5713a" stroke="#7d4a1f" stroke-width="1.2" transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')"/>' +
      '<path d="M0 6 C-2 2 -2 -4 0 -7" fill="none" stroke="#8f5528" stroke-width="1" transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')"/>';
  }
  function flower(x, y, s) {
    let petals = '';
    for (let i = 0; i < 5; i++) {
      petals += '<ellipse cx="0" cy="-6" rx="4.2" ry="6.5" fill="#f6c22e" stroke="#d99a12" stroke-width="1" transform="rotate(' + (i * 72) + ')"/>';
    }
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')">' + petals + '<circle r="3.6" fill="#e0731b"/></g>';
  }
  const DRAVYA_PICTURES = [
    /* 1 jal: a drop of water over ripples */
    '<path d="M0 -14 C6 -6 9 -1 9 3 A9 9 0 0 1 -9 3 C-9 -1 -6 -6 0 -14 Z" fill="#3a8fd6"/>' +
    '<path d="M-3 1 A4 4 0 0 0 0 6" fill="none" stroke="#d6ecfb" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M-14 14 q3.5 -3 7 0 t7 0 t7 0 t7 0" fill="none" stroke="#3a8fd6" stroke-width="2" stroke-linecap="round"/>',
    /* 2 chandan: sandalwood paste with a sandalwood stick */
    '<rect x="2" y="-15" width="6" height="20" rx="2" fill="#a8743c" stroke="#7d5124" stroke-width="1" transform="rotate(30 5 -5)"/>' +
    '<ellipse cx="-2" cy="6" rx="13" ry="7.5" fill="#e9b867" stroke="#c4893a" stroke-width="1.2"/>' +
    '<path d="M-9 6 q4 -6 9 -3 q4 3 -1 5 q-4 1 -5 -2" fill="none" stroke="#c4893a" stroke-width="1.5" stroke-linecap="round"/>',
    /* 3 akshat: white unbroken rice */
    grain(-9, -4, -30, '#fffdf6', '#c9b994') + grain(-2, -8, 15, '#fffdf6', '#c9b994') + grain(6, -5, 50, '#fffdf6', '#c9b994') +
    grain(-6, 6, 70, '#fffdf6', '#c9b994') + grain(2, 4, -20, '#fffdf6', '#c9b994') + grain(10, 6, 25, '#fffdf6', '#c9b994') +
    grain(-12, 10, 10, '#fffdf6', '#c9b994'),
    /* 4 pushp: a yellow flower (yellow rice stands for flowers) */
    flower(0, -1, 1.15) + grain(-12, 11, 30, '#f7d34f', '#c99a10') + grain(12, 11, -30, '#f7d34f', '#c99a10'),
    /* 5 naivedya: white pieces of dry coconut */
    '<path d="M-15 6 Q-12 -9 -1 -8 L-3 6 Z" fill="#fffaf0" stroke="#7a4f2a" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M1 -10 Q13 -10 15 2 L2 3 Z" fill="#fffaf0" stroke="#7a4f2a" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M-5 9 Q4 1 12 9 Q4 14 -5 9 Z" fill="#fffaf0" stroke="#7a4f2a" stroke-width="2" stroke-linejoin="round"/>',
    /* 6 deep: a lit clay lamp */
    '<path d="M0 -15 Q7 -7 0 0 Q-7 -7 0 -15 Z" fill="#f7b733"/>' +
    '<path d="M0 -9 Q3 -5 0 -1 Q-3 -5 0 -9 Z" fill="#fff1c1"/>' +
    '<path d="M-15 3 Q0 17 15 3 Q8 1 0 1 Q-8 1 -15 3 Z" fill="#d0661f" stroke="#9c4512" stroke-width="1.5" stroke-linejoin="round"/>',
    /* 7 dhoop: a heap of incense powder with smoke */
    '<path d="M-3 -1 q-4 -5 0 -9 q4 -4 0 -8 M5 -1 q-4 -5 0 -9 q4 -4 0 -8" fill="none" stroke="#9a8f86" stroke-width="2" stroke-linecap="round"/>' +
    '<path d="M-15 11 Q0 -5 15 11 Z" fill="#7a5a44" stroke="#5a412f" stroke-width="1.2" stroke-linejoin="round"/>',
    /* 8 phal: almonds and a clove */
    almond(-8, 1, -20) + almond(4, 3, 15) +
    '<g transform="translate(12 -4) rotate(25) scale(0.5)"><path d="M0 26 L0 0" stroke="' + CLOVE + '" stroke-width="5" stroke-linecap="round"/>' +
    '<circle cx="0" cy="-6" r="7" fill="' + CLOVE + '"/><circle cx="-6" cy="-12" r="3.6" fill="' + CLOVE + '"/><circle cx="6" cy="-12" r="3.6" fill="' + CLOVE + '"/><circle cx="0" cy="-15" r="3.6" fill="' + CLOVE + '"/></g>',
    /* 9 arghya: a little of everything */
    grain(-10, 4, -30, '#fffdf6', '#c9b994') + grain(-4, 9, 40, '#fffdf6', '#c9b994') + flower(-5, -6, 0.6) +
    almond(9, 2, 20) + '<path d="M2 9 Q8 4 13 9 Q8 12 2 9 Z" fill="#fffaf0" stroke="#7a4f2a" stroke-width="1.5"/>'
  ];

  /* The dravya plate: eight bowls in the order of offering, arghya in the middle.
     Each bowl shows a picture and the name, in the app language. */
  function dravya(names) {
    const cx = 170;
    const cy = 170;
    function bowl(x, y, i) {
      const name = (names && names[i]) || '';
      return '<circle cx="' + x + '" cy="' + y + '" r="42" fill="' + BRASS_LIGHT + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
        '<circle cx="' + x + '" cy="' + y + '" r="36" fill="#fff8ea" stroke="rgba(0,0,0,0.12)" stroke-width="1"/>' +
        '<g transform="translate(' + x + ' ' + (y - 10) + ') scale(1.15)">' + DRAVYA_PICTURES[i] + '</g>' +
        '<text x="' + x + '" y="' + (y + 25) + '" text-anchor="middle" font-size="13.5" font-weight="700" fill="#3b1d08" ' +
        'font-family="system-ui, \'Noto Sans Devanagari\', \'Nirmala UI\', sans-serif">' + name.replace(/[&<>"]/g, '') + '</text>' +
        '<circle cx="' + (x - 31) + '" cy="' + (y - 31) + '" r="10" fill="#a3301a" stroke="#fff7ec" stroke-width="2"/>' +
        '<text x="' + (x - 31) + '" y="' + (y - 27) + '" text-anchor="middle" font-size="11" font-weight="700" fill="#fff7ec" font-family="system-ui, sans-serif">' + (i + 1) + '</text>';
    }
    let bowls = '';
    for (let i = 0; i < 8; i++) {
      const a = (-90 + i * 45) * Math.PI / 180;
      bowls += bowl(+(cx + 116 * Math.cos(a)).toFixed(1), +(cy + 116 * Math.sin(a)).toFixed(1), i);
    }
    return svg('0 0 340 340',
      '<circle cx="' + cx + '" cy="' + cy + '" r="166" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="4"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="160" fill="none" stroke="' + BRASS_EDGE + '" stroke-width="1.5" stroke-dasharray="4 5"/>' +
      bowls + bowl(cx, cy, 8));
  }

  /* Three rounds around the altar, clockwise, keeping the Lord on the right. */
  function arrowAt(cx, cy, r, deg) {
    const a = deg * Math.PI / 180;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    const rot = deg + 90; /* tangent direction for clockwise travel */
    return '<path d="M-9 -7 L9 0 L-9 7 Z" fill="#a3301a" transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + rot + ')"/>';
  }
  let rounds = '';
  [64, 88, 112].forEach(r => {
    rounds += '<circle cx="140" cy="140" r="' + r + '" fill="none" stroke="#c7a679" stroke-width="3" stroke-dasharray="8 7"/>' +
      arrowAt(140, 140, r, 0) + arrowAt(140, 140, r, 180) + arrowAt(140, 140, r, 270);
  });
  const pradakshina = svg('0 0 280 290',
    '<rect x="4" y="4" width="272" height="282" rx="18" fill="var(--scene-paper, #f3e6cf)" stroke="#c7a679" stroke-width="2"/>' +
    rounds +
    /* altar: stepped platform with a canopy */
    '<rect x="108" y="138" width="64" height="26" rx="3" fill="' + WOOD + '" stroke="' + WOOD_EDGE + '" stroke-width="2"/>' +
    '<rect x="118" y="120" width="44" height="20" rx="3" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
    '<path d="M112 120 L140 100 L168 120 Z" fill="' + BRASS_LIGHT + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
    badge(140, 186, 1) +
    badge(244, 92, 2) +
    /* the devotee starts in front of the Lord, at the bottom */
    '<circle cx="140" cy="262" r="9" fill="#5b4636"/>' +
    badge(176, 262, 3));

  return { swastik: swastik, thona: thona, layout: layout, dravya: dravya, pradakshina: pradakshina };
})();
