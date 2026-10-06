/*
 * Devanagari to Roman letters.
 * toRoman() gives the standard IAST spelling for display (bhaktāmara).
 * romanKey() gives a loose key so typed searches like "bhaktamar",
 * "tatvarth" or "samaysar" still match.
 */
const TRANSLIT = (function () {
  const CONS = {
    'क': ['k', 'k'], 'ख': ['kh', 'kh'], 'ग': ['g', 'g'], 'घ': ['gh', 'gh'], 'ङ': ['ṅ', 'n'],
    'च': ['c', 'ch'], 'छ': ['ch', 'chh'], 'ज': ['j', 'j'], 'झ': ['jh', 'jh'], 'ञ': ['ñ', 'n'],
    'ट': ['ṭ', 't'], 'ठ': ['ṭh', 'th'], 'ड': ['ḍ', 'd'], 'ढ': ['ḍh', 'dh'], 'ण': ['ṇ', 'n'],
    'त': ['t', 't'], 'थ': ['th', 'th'], 'द': ['d', 'd'], 'ध': ['dh', 'dh'], 'न': ['n', 'n'],
    'प': ['p', 'p'], 'फ': ['ph', 'ph'], 'ब': ['b', 'b'], 'भ': ['bh', 'bh'], 'म': ['m', 'm'],
    'य': ['y', 'y'], 'र': ['r', 'r'], 'ल': ['l', 'l'], 'ळ': ['ḷ', 'l'], 'व': ['v', 'v'],
    'श': ['ś', 'sh'], 'ष': ['ṣ', 'sh'], 'स': ['s', 's'], 'ह': ['h', 'h']
  };
  const VOWELS = {
    'अ': ['a', 'a'], 'आ': ['ā', 'a'], 'इ': ['i', 'i'], 'ई': ['ī', 'i'], 'उ': ['u', 'u'], 'ऊ': ['ū', 'u'],
    'ऋ': ['ṛ', 'ri'], 'ॠ': ['ṝ', 'ri'], 'ऌ': ['ḷ', 'li'], 'ए': ['e', 'e'], 'ऐ': ['ai', 'ai'],
    'ओ': ['o', 'o'], 'औ': ['au', 'au']
  };
  const MATRAS = {
    'ा': ['ā', 'a'], 'ि': ['i', 'i'], 'ी': ['ī', 'i'], 'ु': ['u', 'u'], 'ू': ['ū', 'u'],
    'ृ': ['ṛ', 'ri'], 'ॄ': ['ṝ', 'ri'], 'ॢ': ['ḷ', 'li'], 'े': ['e', 'e'], 'ै': ['ai', 'ai'],
    'ो': ['o', 'o'], 'ौ': ['au', 'au']
  };
  const OTHER = {
    'ं': ['ṃ', 'n'], 'ः': ['ḥ', 'h'], 'ँ': ['m̐', 'n'], 'ऽ': ['’', ''], 'ॐ': ['oṃ', 'om'],
    '।': ['|', ' '], '॥': ['||', ' '],
    '०': ['0', '0'], '१': ['1', '1'], '२': ['2', '2'], '३': ['3', '3'], '४': ['4', '4'],
    '५': ['5', '5'], '६': ['6', '6'], '७': ['7', '7'], '८': ['8', '8'], '९': ['9', '9']
  };
  const VIRAMA = '्';
  const NUKTA = '़';

  function convert(text, k) {
    let out = '';
    const s = text.normalize('NFC').replace(/[‌‍]/g, '');
    for (let i = 0; i < s.length; i++) {
      let ch = s[i];
      if (CONS[ch]) {
        out += CONS[ch][k];
        let j = i + 1;
        if (s[j] === NUKTA) j++;
        const nx = s[j];
        if (nx === VIRAMA) { i = j; continue; }
        if (MATRAS[nx]) { out += MATRAS[nx][k]; i = j; continue; }
        out += 'a';
        i = j - 1;
        continue;
      }
      if (VOWELS[ch]) { out += VOWELS[ch][k]; continue; }
      if (OTHER[ch]) { out += OTHER[ch][k]; continue; }
      if (ch === NUKTA || ch === VIRAMA) continue;
      out += ch;
    }
    return out;
  }

  function toRoman(text) {
    return convert(text, 0);
  }

  /* Loose key: lower case, letters only, no "a", no doubled letters. */
  function key(latin) {
    return latin.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z]/g, '')
      .replace(/w/g, 'v')
      .replace(/ee/g, 'i').replace(/oo/g, 'u')
      .replace(/a/g, '')
      .replace(/(.)\1+/g, '$1');
  }

  function romanKey(devanagari) {
    return key(convert(devanagari, 1));
  }

  return { toRoman, romanKey, key };
})();
