/*
 * Search keys for questions. Each word, in Devanagari or Roman letters, becomes a rough sound
 * pattern: Devanagari is spelled out in Roman letters, aspiration and the vowel "a" are dropped,
 * and long and short vowels merge. So "navkar", "navakaar" and नवकार all become "nvkr", and
 * "karma" meets कर्म. Used by the Ask screen (js/ask.js), the answer server (server/) and,
 * copied in Python, by tools/build_ask_index.py; keep the three the same.
 */
const ASKKEY = (function () {
  const CONS = {
    'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'n', 'च': 'c', 'छ': 'ch', 'ज': 'j', 'झ': 'jh', 'ञ': 'n',
    'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n', 'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
    'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm', 'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh',
    'ष': 'sh', 'स': 's', 'ह': 'h', 'ळ': 'l', 'क़': 'k', 'ख़': 'kh', 'ग़': 'g', 'ज़': 'z', 'ड़': 'r', 'ढ़': 'rh',
    'फ़': 'f', 'य़': 'y'
  };
  const VOWELS = { 'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ii', 'उ': 'u', 'ऊ': 'uu', 'ऋ': 'ri', 'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au' };
  const MATRAS = { 'ा': 'aa', 'ि': 'i', 'ी': 'ii', 'ु': 'u', 'ू': 'uu', 'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ॉ': 'o', 'ॅ': 'e' };
  const VIRAMA = '्';
  /* Question words and grammar, in Hindi, Hinglish and English, after key(). */
  const STOP = new Set([
    'ky', 'kyo', 'kyon', 'kyu', 'kyun', 'he', 'hen', 'hi', 'hu', 'hun', 'ho', 'ki', 'ke', 'ko', 'kese', 'kesi', 'kon', 'kb', 'kn',
    'min', 'mein', 'men', 'me', 'or', 'pr', 'ne', 'se', 'ek', 'ye', 'yh', 've', 'vh', 'jo', 'to', 'bi', 'te', 'kr', 'krte', 'krn',
    'bt', 'btiye', 'btyen', 'smjiye', 'mtlb', 'vht', 'is', 'of', 'nd', 'in', 'do', 'dos', 'hv', 'vhy', 'ar', 'cn', 'it', 'its',
    'tis', 'tt', 'bout', 'plese', 'tel', 'us', 'my', 'vhen', 'vere', 'vic', 'vo', 'ny', 'ver', 'not', 'fter', 'befor', 'tere',
    'teir', 'tey', 'tem', 'did', 'sould', 'vould', 'kould', 'vho', 'vs', 'from', 'vit', 'for', 'some', 're', 'be', 'ben', 'on',
    'or', 'if', 'so', 'lso', 'get', 'hs', 'hve', 'you', 'your', 'tn', 'tht', 'tese', 'tose', 'vt', 'mens', 'expln', 'kind', 'nhi', 'nhin', 'nhn', 'lg', 'kte', 'kyi', 'kiy', 'jte', 'jti',
    'skte', 'cahiye', 'cyie', 'hot', 'hote', 'hoti', 'rhe', 'rhi', 'vle', 'vli', 'koi', 'kuc', 'sb', 'bhut', 'bt', 'mny', 'muc', 'hov', 'kitne', 'kitni', 'kitn', 'log', 'chiye', 'eksplen', 'mening', 'bto', 'bteye', 'smjo', 'smjiye'
  ]);

  /* English words that should also find the Hindi words the texts use. */
  const GLOSS = {
    eat: 'भोजन आहार', eating: 'भोजन आहार', food: 'भोजन आहार', meal: 'भोजन', dinner: 'रात्रिभोजन', night: 'रात्रि रात',
    sunset: 'सूर्यास्त रात्रिभोजन', water: 'जल पानी', soul: 'आत्मा जीव', souls: 'आत्मा जीव', self: 'आत्मा',
    liberation: 'मोक्ष मुक्ति', salvation: 'मोक्ष मुक्ति', moksha: 'मोक्ष', nonviolence: 'अहिंसा', violence: 'हिंसा अहिंसा',
    ahimsa: 'अहिंसा', truth: 'सत्य', stealing: 'अचौर्य चोरी', theft: 'अचौर्य चोरी', celibacy: 'ब्रह्मचर्य', chastity: 'ब्रह्मचर्य',
    possessions: 'अपरिग्रह परिग्रह', possessiveness: 'अपरिग्रह परिग्रह', attachment: 'राग मोह परिग्रह', vow: 'व्रत', vows: 'व्रत',
    fast: 'उपवास', fasting: 'उपवास', fasts: 'उपवास', penance: 'तप', austerity: 'तप', meditation: 'ध्यान', forgiveness: 'क्षमा',
    anger: 'क्रोध', pride: 'मान', ego: 'मान', deceit: 'माया', greed: 'लोभ', passions: 'कषाय', god: 'भगवान ईश्वर',
    creator: 'कर्ता सृष्टि', creation: 'सृष्टि', universe: 'लोक', world: 'लोक संसार', heaven: 'स्वर्ग', hell: 'नरक',
    rebirth: 'पुनर्जन्म भव', reincarnation: 'पुनर्जन्म भव', death: 'मरण', temple: 'मंदिर जिनालय', idol: 'प्रतिमा',
    worship: 'पूजा भक्ति', prayer: 'पाठ स्तुति', prayers: 'पाठ स्तुति', monk: 'मुनि साधु', monks: 'मुनि साधु', nun: 'आर्यिका',
    nuns: 'आर्यिका', householder: 'श्रावक गृहस्थ', layperson: 'श्रावक', laypeople: 'श्रावक', teacher: 'गुरु आचार्य',
    scripture: 'शास्त्र ग्रंथ आगम', scriptures: 'शास्त्र ग्रंथ आगम', knowledge: 'ज्ञान', faith: 'श्रद्धा दर्शन',
    belief: 'श्रद्धा', conduct: 'चारित्र', right: 'सम्यक्', jewels: 'रत्नत्रय', festival: 'पर्व', festivals: 'पर्व',
    enlightenment: 'केवलज्ञान', omniscience: 'केवलज्ञान', nirvana: 'निर्वाण', roots: 'कंदमूल', root: 'कंदमूल',
    potato: 'कंदमूल आलू', potatoes: 'कंदमूल आलू', onion: 'कंदमूल प्याज', garlic: 'कंदमूल लहसुन', honey: 'मधु',
    alcohol: 'मद्य', meat: 'मांस', vegetarian: 'शाकाहार', compassion: 'दया करुणा', charity: 'दान', donation: 'दान',
    restraint: 'संयम', equanimity: 'समता सामायिक', repentance: 'प्रतिक्रमण', substances: 'द्रव्य', elements: 'तत्त्व',
    bondage: 'बंध', influx: 'आस्रव', stages: 'गुणस्थान', reflections: 'भावना अनुप्रेक्षा', virtues: 'धर्म', ten: 'दस दश',
    twelve: 'बारह', five: 'पंच पाँच', eight: 'आठ अष्ट', lamp: 'दीप दीपक', swastika: 'स्वस्तिक', symbol: 'प्रतीक',
    mantra: 'मंत्र', birth: 'जन्म', mother: 'माता', father: 'पिता', king: 'राजा', story: 'कथा', stories: 'कथा',
    karma: 'कर्म', karmas: 'कर्म', liberated: 'सिद्ध', perfected: 'सिद्ध', omniscient: 'केवली अरिहंत', fordmaker: 'तीर्थंकर',
    tirthankars: 'तीर्थंकर', mahavira: 'महावीर', parshvanath: 'पार्श्वनाथ', rishabhdev: 'ऋषभदेव आदिनाथ',
    sins: 'पाप', sin: 'पाप', merit: 'पुण्य', virtue: 'पुण्य धर्म', happiness: 'सुख', suffering: 'दुःख', peace: 'शांति'
  };

  /* Devanagari to plain Roman letters, with the inherent "a" written out. */
  function roman(word) {
    let out = '';
    let pending = false;
    const chars = Array.from(word.normalize('NFC'));
    for (let i = 0; i < chars.length; i++) {
      const c = chars[i];
      if (c === 'ज' && chars[i + 1] === VIRAMA && chars[i + 2] === 'ञ') {
        if (pending) out += 'a';
        out += 'gy';
        pending = true;
        i += 2;
      } else if (CONS[c]) {
        if (pending) out += 'a';
        out += CONS[c];
        pending = true;
      } else if (MATRAS[c]) {
        out += MATRAS[c];
        pending = false;
      } else if (c === VIRAMA) {
        pending = false;
      } else if (VOWELS[c]) {
        if (pending) out += 'a';
        out += VOWELS[c];
        pending = false;
      } else if (c === 'ं' || c === 'ँ') {
        if (pending) out += 'a';
        out += 'n';
        pending = false;
      } else if (c === 'ः') {
        if (pending) out += 'a';
        out += 'h';
        pending = false;
      } else if (/[a-z]/.test(c)) {
        if (pending) out += 'a';
        out += c;
        pending = false;
      }
    }
    if (pending) out += 'a';
    return out;
  }

  /* One word to its sound pattern; '' when it carries no meaning for search. */
  function key(word) {
    let s = roman(word.toLowerCase());
    s = s.replace(/ksh/g, 'ks').replace(/x/g, 'ks').replace(/sh/g, 's').replace(/ph/g, 'f')
      .replace(/([bcdgjkpt])h/g, '$1').replace(/w/g, 'v').replace(/z/g, 'j').replace(/q/g, 'k')
      .replace(/ee/g, 'i').replace(/oo/g, 'u').replace(/ai/g, 'e').replace(/au/g, 'o')
      .replace(/a/g, '').replace(/(.)\1+/g, '$1').replace(/h$/, '');
    return s.length >= 2 && !STOP.has(s) ? s : '';
  }

  /* All the search keys in a piece of text, in order, repeats kept. */
  function keys(text) {
    const words = String(text).toLowerCase().match(/[a-z]+|[ऀ-ॣॱ-ॿ]+/g) || [];
    return words.map(key).filter(Boolean);
  }

  /* A question's keys word by word: each word's own key with its Hindi glossary keys. */
  function keyGroups(text) {
    const words = String(text).toLowerCase().match(/[a-z]+|[ऀ-ॣॱ-ॿ]+/g) || [];
    return words.map(w => {
      const group = [];
      (/^[a-z]{4,}s$/.test(w) ? [w, w.slice(0, -1)] : [w]).forEach(form => {
        const k = key(form);
        if (k) group.push(k);
        if (GLOSS[form]) GLOSS[form].split(' ').forEach(h => { const hk = key(h); if (hk) group.push(hk); });
      });
      return group;
    }).filter(g => g.length);
  }

  /* A question's keys without repeats, with the Hindi for its English words added. */
  function questionKeys(text) {
    const words = String(text).toLowerCase().match(/[a-z]+|[\u0900-\u0963\u0971-\u097f]+/g) || [];
    const out = [];
    words.forEach(w => {
      /* English plurals ("Jains", "vows") also look for the singular. */
      (/^[a-z]{4,}s$/.test(w) ? [w, w.slice(0, -1)] : [w]).forEach(form => {
        const k = key(form);
        if (k) out.push(k);
        if (GLOSS[form]) GLOSS[form].split(' ').forEach(h => { const hk = key(h); if (hk) out.push(hk); });
      });
    });
    return Array.from(new Set(out));
  }

  /* The shard file a key's entries live in (FNV-1a, 256 shards). */
  function shard(k) {
    let h = 2166136261;
    for (let i = 0; i < k.length; i++) {
      h ^= k.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return (h % 256).toString(16).padStart(2, '0');
  }

  return { roman: roman, key: key, keys: keys, keyGroups: keyGroups, questionKeys: questionKeys, shard: shard };
})();

if (typeof module !== 'undefined') module.exports = ASKKEY;
