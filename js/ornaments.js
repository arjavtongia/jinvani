/*
 * Ornaments of the mandir, drawn in SVG and coloured from the page (brass and sindoor),
 * so they follow day and night: the chhatra over the greeting, the carved toran arch
 * that frames scripture, the dhwaja that marks parva days, and the arch-shaped window
 * for pictures. Gradients live in index.html (#brassV, #brassSide).
 */
const ORN = (function () {
  /* The arch is drawn in a 360-wide box: it springs from both sides at y = 80 and its
     kalash finial rises above y = 0. Lobes are always even, so the apex is a cusp. */
  const W = 360;
  const SPRING = 80;
  const TOP = -18;
  const f = n => n.toFixed(1);

  function points(lobes, inset) {
    const cx = W / 2, rx = cx - inset, ry = SPRING - inset * 0.6, out = [];
    for (let i = 0; i <= lobes; i++) {
      const t = Math.PI - Math.PI * i / lobes;
      out.push([cx + rx * Math.cos(t), SPRING - ry * Math.sin(t)]);
    }
    return out;
  }

  /* Each lobe bulges inward; sweep is 0 drawing left to right, 1 drawing right to left. */
  function lobesPath(list, sweep) {
    let d = '';
    for (let i = 1; i < list.length; i++) {
      const [x0, y0] = list[i - 1], [x1, y1] = list[i];
      const r = Math.hypot(x1 - x0, y1 - y0) * 0.62;
      d += ' A' + f(r) + ' ' + f(r) + ' 0 0 ' + sweep + ' ' + f(x1) + ' ' + f(y1);
    }
    return d;
  }

  /* The outline as two halves that start at the apex, so it can be drawn down from the kalash. */
  function halves(lobes, inset) {
    const p = points(lobes, inset), k = lobes / 2;
    const left = p.slice(0, k + 1).reverse(), right = p.slice(k);
    return [
      'M' + f(left[0][0]) + ' ' + f(left[0][1]) + lobesPath(left, 1),
      'M' + f(right[0][0]) + ' ' + f(right[0][1]) + lobesPath(right, 0)
    ];
  }

  function filled(lobes, bottom) {
    const p = points(lobes, 0);
    return 'M0 ' + bottom + ' L' + f(p[0][0]) + ' ' + f(p[0][1]) + lobesPath(p, 0) + ' L' + W + ' ' + bottom + ' Z';
  }

  const KALASH = '<path class="kalash" d="M180 -16C184 -11 185 -8 185 -5.5C185 -2.5 183 -.5 180 -.5C177 -.5 175 -2.5 175 -5.5C175 -8 176 -11 180 -16Z"/>';

  function lines(lobes) {
    const [l0, r0] = halves(lobes, 1.5), [l1, r1] = halves(lobes, 8);
    return '<path class="arch-line" pathLength="1" d="' + l0 + '"/><path class="arch-line" pathLength="1" d="' + r0 + '"/>' +
      '<path class="arch-inner" pathLength="1" d="' + l1 + '"/><path class="arch-inner" pathLength="1" d="' + r1 + '"/>' + KALASH;
  }

  /* The top of a shrine: fill, double brass line and kalash. Its sides are drawn by sides(). */
  function crown(lobes) {
    return '<svg class="crown" viewBox="0 ' + TOP + ' ' + W + ' ' + (SPRING - TOP) + '" aria-hidden="true" focusable="false">' +
      '<path class="arch-fill" d="' + filled(lobes, SPRING) + '"/>' + lines(lobes) + '</svg>';
  }

  /* The two brass pillars of a shrine, stretched to the height of what it holds.
     Stretching keeps their width in step with the crown, which scales with the same width. */
  function sides() {
    return '<svg class="sides" viewBox="0 0 ' + W + ' 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
      '<path class="side-line" d="M1.5 0V100M358.5 0V100"/><path class="side-inner" d="M8 0V100M352 0V100"/></svg>';
  }

  /* A picture seen through the arch: the window shape (as a CSS mask) and its brass frame.
     Pictures are 16:9, so the box is 360 by 202.5 with the arch inside it. */
  const PIC_H = W / (16 / 9);
  function picFrame(lobes) {
    return '<svg class="pic-frame" viewBox="0 ' + TOP + ' ' + W + ' ' + PIC_H + '" preserveAspectRatio="none" aria-hidden="true" focusable="false">' +
      lines(lobes) + '<path class="side-line" d="M1.5 80V' + f(PIC_H + TOP) + 'M358.5 80V' + f(PIC_H + TOP) + '"/>' +
      '<path class="side-inner" d="M8 80V' + f(PIC_H + TOP) + 'M352 80V' + f(PIC_H + TOP) + '"/></svg>';
  }
  function picMask(lobes) {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 ' + TOP + ' ' + W + ' ' + PIC_H + '" preserveAspectRatio="none">' +
      '<path d="' + filled(lobes, f(PIC_H + TOP)) + '"/></svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  }

  /* The chhatra-traya, the three-tier umbrella held over the Jina; the same drawing as the opening screen. */
  function chhatra(cls) {
    return '<svg class="chhatra' + (cls ? ' ' + cls : '') + '" viewBox="134 0 132 86" aria-hidden="true" focusable="false">' +
      '<rect class="chhatra-staff" x="198.6" y="20" width="2.8" height="58"/>' +
      '<g class="chhatra-tiers">' +
      '<path d="M138 76Q200 36 262 76a4.1 3.5 0 0 1 -8.3 0a4.1 3.5 0 0 1 -8.3 0a4.1 3.5 0 0 1 -8.3 0a4.1 3.5 0 0 1 -8.3 0a4.1 3.5 0 0 1 -8.3 0a4.1 3.5 0 0 1 -8.3 0a4.1 3.5 0 0 1 -8.3 0a4.1 3.5 0 0 1 -8.3 0a4.1 3.5 0 0 1 -8.3 0a4.1 3.5 0 0 1 -8.3 0a4.1 3.5 0 0 1 -8.3 0a4.1 3.5 0 0 1 -8.3 0a4.1 3.5 0 0 1 -8.3 0a4.1 3.5 0 0 1 -8.3 0a4.1 3.5 0 0 1 -8.3 0Z"/>' +
      '<path d="M156 56Q200 24 244 56a4 3.4 0 0 1 -8 0a4 3.4 0 0 1 -8 0a4 3.4 0 0 1 -8 0a4 3.4 0 0 1 -8 0a4 3.4 0 0 1 -8 0a4 3.4 0 0 1 -8 0a4 3.4 0 0 1 -8 0a4 3.4 0 0 1 -8 0a4 3.4 0 0 1 -8 0a4 3.4 0 0 1 -8 0a4 3.4 0 0 1 -8 0Z"/>' +
      '<path d="M172 38Q200 14 228 38a4 3.4 0 0 1 -8 0a4 3.4 0 0 1 -8 0a4 3.4 0 0 1 -8 0a4 3.4 0 0 1 -8 0a4 3.4 0 0 1 -8 0a4 3.4 0 0 1 -8 0a4 3.4 0 0 1 -8 0Z"/>' +
      '<path d="M200 3C204 9 206 13 206 17C206 21 203 24 200 24C197 24 194 21 194 17C194 13 196 9 200 3Z"/></g></svg>';
  }

  /* The dhwaja, the flag on every temple shikhar: marks ashtami, chaturdashi and festivals. */
  function dhwaja(cls) {
    return '<svg class="dhwaja' + (cls ? ' ' + cls : '') + '" viewBox="0 0 20 24" aria-hidden="true" focusable="false">' +
      '<path class="dhwaja-pole" d="M5 23V2.5"/><path class="dhwaja-flag" d="M6 3L19 7.5L6 12Z"/><circle class="dhwaja-top" cx="5" cy="2.2" r="1.7"/></svg>';
  }

  /* A brass hairline with a lozenge at its centre, between parts of a page. */
  function rule(cls) {
    return '<div class="rule' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><i></i></div>';
  }

  /* The masks are data URIs, so they are made once and handed to the stylesheet. */
  /* The Jain Prateek, the emblem on the app icon (drawn the same way in tools/make_icons.py), in sindoor:
     the loka, siddhashila and siddha, ratnatraya, swastik, and the hand of ahimsa with the chakra. */
  function prateek(cls) {
    return '<svg class="prateek' + (cls ? ' ' + cls : '') + '" viewBox="-4 -4 108 156.5" aria-hidden="true" focusable="false">' +
      '<g class="prateek-ink" fill="none" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M50 0H64L82.4 35.4L67.1 73.5L100 148.5H0L32.9 73.5L17.6 35.4L36 0Z" stroke-width="5"/>' +
      '<path d="M36 0A14 12.5 0 0 0 64 0" stroke-width="4.2"/>' +
      '<path d="M50 34.5V59.5M37.5 47H62.5M50 34.5H62.5M62.5 47V59.5M50 59.5H37.5M37.5 47V34.5" stroke-width="4.4" stroke-linecap="square" stroke-linejoin="miter"/>' +
      '<path d="M41.52 111.12L41.52 87.92M48.88 111.12L48.88 83.02M56.25 111.12L56.25 85.25M63.61 111.12L63.61 91.05" stroke-width="7.3"/><path d="M38.85 122.72L31.26 107.55" stroke-width="7.7"/></g>' +
      '<g class="prateek-fill"><circle cx="50" cy="6.45" r="2"/><circle cx="39" cy="20" r="2.2"/><circle cx="50" cy="20" r="2.2"/><circle cx="61" cy="20" r="2.2"/>' +
      '<rect x="37.86" y="101.31" width="29.4" height="30.34" rx="12.05"/></g>' +
      '<g class="prateek-cut" fill="none"><path d="M45.18 89.71L45.18 105.77M52.54 88.82L52.54 105.77M59.9 92.38L59.9 105.77" stroke-width="1"/><circle cx="52.68" cy="120.05" r="7.81" stroke-width="1.4"/></g>' +
      '<circle class="prateek-hub" cx="52.68" cy="120.05" r="2.23"/></svg>';
  }

  const root = document.documentElement.style;
  root.setProperty('--pic-mask', picMask(8));

  return { crown: crown, sides: sides, picFrame: picFrame, chhatra: chhatra, prateek: prateek, dhwaja: dhwaja, rule: rule };
})();
