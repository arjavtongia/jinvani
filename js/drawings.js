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
    return '<g><circle cx="' + x + '" cy="' + y + '" r="13" fill="#9a3412" stroke="#fff7ec" stroke-width="2.5"/>' +
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

  /* The dravya plate: eight bowls in the order of offering, arghya in the middle. */
  const DRAVYA_COLOURS = ['#cfe6f5', '#f0cf98', '#fbf7ee', '#f5cf45', '#f3ecdc', '#f2a93b', '#8a6a52', '#c48b52'];
  let bowls = '';
  DRAVYA_COLOURS.forEach((colour, i) => {
    const a = (-90 + i * 45) * Math.PI / 180;
    const x = (150 + 96 * Math.cos(a)).toFixed(1);
    const y = (150 + 96 * Math.sin(a)).toFixed(1);
    const dark = i === 6;
    bowls += '<circle cx="' + x + '" cy="' + y + '" r="31" fill="' + BRASS_LIGHT + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="23" fill="' + colour + '" stroke="rgba(0,0,0,0.15)" stroke-width="1"/>' +
      '<text x="' + x + '" y="' + (+y + 6) + '" text-anchor="middle" font-size="17" font-weight="700" fill="' + (dark ? '#fff7ec' : '#3b1d08') + '" font-family="system-ui, sans-serif">' + (i + 1) + '</text>';
  });
  const dravya = svg('0 0 300 300',
    '<circle cx="150" cy="150" r="142" fill="' + BRASS + '" stroke="' + BRASS_EDGE + '" stroke-width="4"/>' +
    '<circle cx="150" cy="150" r="128" fill="none" stroke="' + BRASS_EDGE + '" stroke-width="1.5" stroke-dasharray="4 5"/>' +
    bowls +
    '<circle cx="150" cy="150" r="31" fill="' + BRASS_LIGHT + '" stroke="' + BRASS_EDGE + '" stroke-width="2"/>' +
    '<circle cx="150" cy="150" r="23" fill="#e7c48a" stroke="rgba(0,0,0,0.15)" stroke-width="1"/>' +
    '<text x="150" y="156" text-anchor="middle" font-size="17" font-weight="700" fill="#3b1d08" font-family="system-ui, sans-serif">9</text>');

  /* Three rounds around the altar, clockwise, keeping the Lord on the right. */
  function arrowAt(cx, cy, r, deg) {
    const a = deg * Math.PI / 180;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    const rot = deg + 90; /* tangent direction for clockwise travel */
    return '<path d="M-9 -7 L9 0 L-9 7 Z" fill="#9a3412" transform="translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ') rotate(' + rot + ')"/>';
  }
  let rounds = '';
  [64, 88, 112].forEach(r => {
    rounds += '<circle cx="140" cy="140" r="' + r + '" fill="none" stroke="#c7a679" stroke-width="3" stroke-dasharray="8 7"/>' +
      arrowAt(140, 140, r, 0) + arrowAt(140, 140, r, 180) + arrowAt(140, 140, r, 270);
  });
  const pradakshina = svg('0 0 280 290',
    '<rect x="4" y="4" width="272" height="282" rx="18" fill="#f3e6cf" stroke="#c7a679" stroke-width="2"/>' +
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
