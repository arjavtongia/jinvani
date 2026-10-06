/*
 * Jinvani — a simple reader for Jain scriptures, made for elders.
 * Plain JavaScript, no build step. Screens are chosen by the address
 * after "#", for example #/read/bhaktamar/12.
 */
(function () {
  'use strict';

  const REPO_URL = 'https://github.com/arjavtongia/jinvani';
  const STORE_KEY = 'jinvani.v1';
  const FONT_STEPS = [17, 19, 21, 24, 27, 31];
  const RATES = { slow: 0.7, normal: 0.9, fast: 1.1 };
  const MEANING_LABELS = ['अन्वयार्थ', 'अर्थ', 'भावार्थ', 'विशेषार्थ', 'विशेष', 'Meaning'];
  const LABEL_RE = new RegExp('^(' + MEANING_LABELS.join('|') + ')\\s*:\\s*(.*)$', 'i');

  /* Short one-line verses (like sutras) are grouped so each screen holds a paragraph. */
  const PAGE_CHARS = 320;
  const PAGE_MAX = 6;

  /* ---------- Saved settings (kept on this phone only) ---------- */

  const DEFAULTS = {
    lang: null, fontStep: 2, theme: null, speed: 'normal', roman: false, locked: false,
    positions: {}, last: null, bookmarks: []
  };
  const state = loadState();

  function loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return Object.assign({}, DEFAULTS, JSON.parse(raw));
    } catch (e) { /* private mode or blocked storage: use defaults */ }
    return Object.assign({}, DEFAULTS);
  }

  function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  /* ---------- Small helpers ---------- */

  const $app = document.getElementById('app');
  const $toast = document.getElementById('toast');

  function t(key, vars) {
    const table = STRINGS[state.lang] || STRINGS.hi;
    let s = table[key] != null ? table[key] : (STRINGS.hi[key] != null ? STRINGS.hi[key] : key);
    if (vars) Object.keys(vars).forEach(k => { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }

  /* Pick the current language from a {hi, en} object. */
  function L(obj) {
    if (!obj) return '';
    return obj[state.lang] || obj.hi || obj.en || '';
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* Numbers are always shown in English digits (1, 2, 3), also inside the texts. */
  function latinDigits(s) {
    return String(s).replace(/[०-९]/g, d => String(d.charCodeAt(0) - 0x966));
  }

  let toastTimer = null;
  function toast(msg) {
    $toast.textContent = msg;
    $toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $toast.classList.remove('show'), 3500);
  }

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  function isIos() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  function applySettings() {
    const root = document.documentElement;
    root.lang = state.lang || 'hi';
    root.style.fontSize = FONT_STEPS[state.fontStep] + 'px';
    const theme = state.theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day');
    root.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'night' ? '#17130e' : '#fbf6ec');
  }

  /* ---------- Books ---------- */

  let catalog = null;
  let categories = [];
  let chitra = null;
  const bookCache = {};

  async function getCatalog() {
    if (!catalog) {
      const [r, rc] = await Promise.all([
        fetch('content/books.json'),
        fetch('content/categories.json').catch(() => null)
      ]);
      if (!r.ok) throw new Error('books.json ' + r.status);
      catalog = await r.json();
      if (rc && rc.ok) categories = await rc.json();
    }
    return catalog;
  }

  async function getChitra() {
    if (!chitra) {
      try {
        const r = await fetch('content/chitra.json');
        chitra = r.ok ? await r.json() : {};
      } catch (e) {
        chitra = {};
      }
    }
    return chitra;
  }

  function bookMeta(id) {
    return catalog && catalog.find(b => b.id === id);
  }

  async function getBook(id) {
    if (bookCache[id]) return bookCache[id];
    await getCatalog();
    const meta = bookMeta(id);
    if (!meta) return null;
    const r = await fetch(meta.file);
    if (!r.ok) throw new Error(meta.file + ' ' + r.status);
    const book = Object.assign({}, meta, parseBook(await r.text()));
    const pictures = (await getChitra())[id] || [];
    pictures.forEach(c => (c.at || []).forEach(pos => {
      const v = book.verses[pos - 1];
      if (v) (v.chitra = v.chitra || []).push(c);
    }));
    book.pages = buildPages(book);
    bookCache[id] = book;
    return book;
  }

  /*
   * Text format (see content/README.md):
   *   # comment
   *   ## Hindi section name | English section name
   *   @ 19-20 | topic | English topic   (optional: original number and topic)
   *   verse lines
   *   पद्य: ...                   (Hindi verse translation, one line each)
   *   गद्य: ... / Prose: ...      (prose paragraph, Hindi / English)
   *   अन्वयार्थ: / अर्थ: / भावार्थ: / Meaning: ...
   *   a blank line ends a verse
   */
  function parseBook(txt) {
    const sections = [];
    const verses = [];
    let cur = null;
    let block = [];

    function startSection(title) {
      cur = { index: sections.length + 1, title: title, from: verses.length + 1, to: verses.length };
      sections.push(cur);
    }

    function flush() {
      if (!block.length) return;
      const v = { lines: [], padya: [], prose: [], proseEn: [], parts: [], label: '', topic: '', topicEn: '' };
      block.forEach(line => {
        let m;
        if (line.startsWith('@')) {
          const head = line.slice(1).split('|');
          v.label = (head[0] || '').trim();
          v.topic = (head[1] || '').trim();
          v.topicEn = (head[2] || '').trim();
        } else if ((m = line.match(/^पद्य\s*:\s*(.*)$/))) {
          v.padya.push(m[1]);
        } else if ((m = line.match(/^गद्य\s*:\s*(.*)$/))) {
          v.prose.push(m[1]);
        } else if ((m = line.match(/^prose\s*:\s*(.*)$/i))) {
          v.proseEn.push(m[1]);
        } else if ((m = line.match(LABEL_RE))) {
          v.parts.push({ label: m[1], lang: /^meaning$/i.test(m[1]) ? 'en' : 'hi', text: m[2] });
        } else {
          v.lines.push(line);
        }
      });
      block = [];
      if (!v.lines.length && !v.prose.length) return;
      if (!cur) startSection(null);
      v.pos = verses.length + 1;
      v.section = cur.index;
      v.num = v.pos - cur.from + 1;
      verses.push(v);
      cur.to = v.pos;
    }

    latinDigits(txt).replace(/\r/g, '').split('\n').forEach(raw => {
      const line = raw.trim();
      if (line.startsWith('##')) {
        flush();
        const parts = line.replace(/^##\s*/, '').split('|').map(s => s.trim());
        startSection({ hi: parts[0] || '', en: parts[1] || parts[0] || '' });
      } else if (line.startsWith('#')) {
        /* comment */
      } else if (!line) {
        flush();
      } else {
        block.push(line);
      }
    });
    flush();
    const kept = sections.filter(s => s.to >= s.from);
    kept.forEach((s, i) => {
      s.index = i + 1;
      for (let p = s.from; p <= s.to; p++) verses[p - 1].section = s.index;
    });
    return { sections: kept, verses: verses };
  }

  function buildPages(book) {
    const pages = [];
    let page = null;
    book.verses.forEach(v => {
      const size = v.lines.join('').length;
      const small = v.lines.length === 1 && !v.prose.length && !v.padya.length && !v.parts.length && !v.topic && !v.chitra;
      if (page && small && page.small && page.section === v.section &&
          page.to - page.from + 1 < PAGE_MAX && page.chars + size <= PAGE_CHARS) {
        page.to = v.pos;
        page.chars += size;
      } else {
        page = { from: v.pos, to: v.pos, section: v.section, small: small, chars: size };
        pages.push(page);
      }
      v.page = pages.length - 1;
    });
    return pages;
  }

  function numberOf(v) {
    return v.label || String(v.num);
  }

  function posLabel(book, v, last) {
    if (v.label === '0' && !last) return t('invocation');
    let n = numberOf(v);
    if (last && last !== v) n += '–' + numberOf(last);
    const unit = L(book.unit);
    const useSection = book.sectionUnit && (!v.label || book.numbering === 'section');
    if (useSection) return t('positionSec', { sec: L(book.sectionUnit), s: v.section, unit: unit, n: n });
    return t('position', { unit: unit, n: n });
  }

  function countLabel(book) {
    const n = book.count || (book.verses ? book.verses.length : 0);
    const unit = state.lang === 'en' ? L(book.unit).toLowerCase() : L(book.unit);
    return t('count', { n: n, unit: unit });
  }

  function sectionName(book, s) {
    if (s.title && L(s.title)) return L(s.title);
    return t('chapterShort', { sec: L(book.sectionUnit), n: s.index });
  }

  /* Book names always show in Devanagari; English mode adds the English name below. */
  function titleHtml(book, cls) {
    let html = '<span class="' + (cls || 'title') + '" translate="no" lang="hi">' + esc(book.title.hi) + '</span>';
    if (state.lang === 'en') html += '<span class="title-en">' + esc(book.title.en) + '</span>';
    return html;
  }

  function firstLine(v) {
    if (v.lines.length) return v.lines[0].replace(/[-।॥]\s*$/, '');
    const p = v.prose[0] || '';
    return p.length > 90 ? p.slice(0, 90) + '…' : p;
  }

  function topicOf(v) {
    return state.lang === 'en' && v.topicEn ? v.topicEn : v.topic;
  }

  function proseOf(v) {
    return state.lang === 'en' && v.proseEn.length ? v.proseEn : v.prose;
  }

  /* Meaning sections to show: English ones in English mode when they exist, otherwise Hindi. */
  function shownParts(v) {
    const en = v.parts.filter(p => p.lang === 'en');
    const hi = v.parts.filter(p => p.lang !== 'en');
    if (state.lang === 'en' && en.length) return en;
    return hi.length ? hi : en;
  }

  function partLabel(label) {
    if (/^meaning$/i.test(label)) return t('meaning');
    if (state.lang === 'en') return (STRINGS.en.partNames || {})[label] || label;
    return label;
  }

  /* Words in [brackets] inside an अन्वयार्थ are the original words; show them highlighted. */
  function padaHtml(text) {
    return esc(text).replace(/\[([^\]]+)\]/g, '<b class="pada">$1</b>');
  }

  /* ---------- Pictures that explain the text ("चित्र से समझें") ---------- */

  function dgItem(it, cls) {
    return '<span class="' + cls + '"><b translate="no">' + esc(L(it)) + '</b>' +
      (it.sub ? '<span class="dg-sub" translate="no">' + esc(L(it.sub)) + '</span>' : '') + '</span>';
  }

  function chitraHtml(c) {
    let body = '';
    const items = c.items || [];
    if (c.type === 'sum') {
      body = '<div class="dg-sum">' +
        items.map(it => dgItem(it, 'dg-box')).join('<span class="dg-op" aria-hidden="true">+</span>') +
        '<span class="dg-op" aria-hidden="true">=</span>' + dgItem(c.result, 'dg-box dg-result') + '</div>';
    } else if (c.type === 'list') {
      body = '<ol class="dg-list">' + items.map((it, i) =>
        '<li><span class="dg-badge">' + esc(it.tag || String(i + 1)) + '</span>' + dgItem(it, 'dg-text') + '</li>').join('') + '</ol>';
    } else if (c.type === 'flow') {
      body = '<ol class="dg-flow">' + items.map((it, i) =>
        '<li><span class="dg-badge">' + (i + 1) + '</span>' + dgItem(it, 'dg-text') + '</li>').join('') + '</ol>';
    } else if (c.type === 'stack') {
      const n = Math.max(items.length - 1, 1);
      body = '<ol class="dg-stack">' + items.map((it, i) =>
        '<li style="--depth:' + (i / n).toFixed(2) + '"><span class="dg-badge">' + (i + 1) + '</span>' + dgItem(it, 'dg-text') + '</li>').join('') + '</ol>';
    } else if (c.type === 'tree') {
      body = '<div class="dg-tree"><div class="dg-root">' + dgItem(c.root, 'dg-text') + '</div><div class="dg-branches">' +
        (c.branches || []).map(b => '<div class="dg-branch"><div class="dg-head">' + dgItem(b.head, 'dg-text') + '</div><ul>' +
          b.items.map(it => '<li>' + dgItem(it, 'dg-text') + '</li>').join('') + '</ul></div>').join('') +
        '</div></div>';
    } else if (c.type === 'drawing') {
      body = '<div class="dg-drawing" role="img" aria-label="' + esc(L(c.title)) + '">' + (DRAWINGS[c.drawing] || '') + '</div>' +
        '<ol class="dg-list dg-legend">' + items.map((it, i) =>
          '<li><span class="dg-badge">' + esc(it.tag || String(i + 1)) + '</span>' + dgItem(it, 'dg-text') + '</li>').join('') + '</ol>';
    }
    return '<figure class="chitra">' +
      '<p class="chitra-kicker">' + icon('heart') + '<span>' + esc(t('chitraLabel')) + '</span></p>' +
      '<figcaption class="chitra-title" translate="no">' + esc(L(c.title)) + '</figcaption>' + body +
      (c.tagNote ? '<p class="chitra-note">' + esc(L(c.tagNote)) + '</p>' : '') +
      (c.gist ? '<p class="chitra-gist"><b>' + esc(t('gist')) + ':</b> <span translate="no">' + esc(L(c.gist)) + '</span></p>' : '') +
      '</figure>';
  }

  function findByNumber(book, n) {
    return book.verses.find(v => {
      if (v.label) {
        const m = v.label.match(/\d+/g);
        if (!m) return false;
        const a = +m[0];
        const b = +(m[1] || m[0]);
        return n >= a && n <= b;
      }
      return v.num === n;
    });
  }

  function maxNumber(book) {
    const last = book.verses[book.verses.length - 1];
    if (last && last.label) {
      const m = last.label.match(/\d+/g);
      if (m) return +m[m.length - 1];
    }
    return book.verses.length;
  }

  function canGoToNumber(book) {
    if (book.verses.length <= 8) return false;
    if (!book.sectionUnit) return true;
    return book.verses.some(v => v.label) && book.numbering !== 'section';
  }

  /* ---------- Search ---------- */

  function normDev(s) {
    return s.normalize('NFC').toLowerCase()
      .replace(/[‌‍़]/g, '')
      .replace(/[ङञणनम]्(?=[क-ह])/g, 'ं')
      .replace(/ँ/g, 'ं')
      .replace(/([क-ह])्\1/g, '$1')
      .replace(/[^ऀ-ॿa-z]/g, '')
      .replace(/[।॥०-९ऽ]/g, '');
  }

  function metaKeys(meta) {
    if (!meta._n) {
      const aliases = meta.aliases || [];
      meta._n = [meta.title.hi].concat(aliases.filter(a => !/[a-z]/i.test(a))).map(normDev).filter(Boolean);
      meta._r = [TRANSLIT.key(meta.title.en || ''), TRANSLIT.romanKey(meta.title.hi)]
        .concat(aliases.map(a => /[a-z]/i.test(a) ? TRANSLIT.key(a) : TRANSLIT.romanKey(a)))
        .filter(Boolean);
    }
    return meta;
  }

  function indexBook(book) {
    if (book._indexed) return;
    book.verses.forEach(v => {
      const text = v.lines.concat(v.prose).join(' ') + ' ' + v.topic;
      const hiParts = v.parts.filter(p => p.lang !== 'en').map(p => p.text).join(' ');
      v._n = normDev(text + ' ' + v.padya.join(' ') + ' ' + hiParts);
      v._r = TRANSLIT.romanKey(v.lines.join(' ') + ' ' + v.topic);
      v._e = v.parts.filter(p => p.lang === 'en').map(p => p.text).join(' ').toLowerCase();
    });
    book._indexed = true;
  }

  function runSearch(metas, books, query) {
    const q = query.trim();
    const out = { books: [], verses: [] };
    if (!q) return out;
    const latin = /[a-z]/i.test(q);
    const nq = latin ? TRANSLIT.key(q) : normDev(q);
    const lower = q.toLowerCase();
    if (nq.length < 2) return out;
    metas.forEach(meta => {
      const keys = latin ? metaKeys(meta)._r : metaKeys(meta)._n;
      if (keys.some(k => k.includes(nq) || (k.length >= 5 && nq.includes(k)))) out.books.push(meta);
    });
    if (latin && nq.length < 3) return out;
    books.forEach(book => {
      indexBook(book);
      book.verses.forEach(v => {
        const hit = latin ? (v._r.includes(nq) || (lower.length > 3 && v._e.includes(lower))) : v._n.includes(nq);
        if (hit && out.verses.length < 60) out.verses.push({ book: book, v: v });
      });
    });
    return out;
  }

  /* Books searched by text: the small daily books, plus any book already saved on this phone. */
  async function searchableBooks() {
    await getCatalog();
    const out = [];
    for (const meta of catalog) {
      let ok = !!bookCache[meta.id] || !meta.category || meta.category === 'nitya';
      if (!ok && 'caches' in window) {
        try { ok = !!(await caches.match(meta.file, { ignoreSearch: true })); } catch (e) { /* ignore */ }
      }
      if (ok) {
        const book = await getBook(meta.id).catch(() => null);
        if (book) out.push(book);
      }
    }
    return out;
  }

  /* ---------- Listening (read aloud) ---------- */

  const speech = { playing: false, bookId: null, token: 0 };

  function hasSpeech() {
    return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
  }

  function findVoice(prefix) {
    const voices = window.speechSynthesis.getVoices();
    return voices.find(v => v.lang && v.lang.toLowerCase().replace('_', '-').startsWith(prefix)) || null;
  }

  function stopSpeech() {
    speech.playing = false;
    speech.token++;
    if (hasSpeech()) window.speechSynthesis.cancel();
  }

  /* Long text is spoken in short pieces: some browsers stop speaking after about 15 seconds. */
  function speechPieces(text) {
    const clean = text.replace(/\[|\]/g, '').replace(/[-–|]/g, ' ').replace(/\s+/g, ' ').trim();
    const sentences = clean.split(/(?<=[।॥?!.])\s+/);
    const out = [];
    sentences.forEach(s => {
      s = s.replace(/[।॥]/g, ' ').trim();
      while (s.length > 220) {
        const cut = s.lastIndexOf(' ', 220);
        const at = cut > 60 ? cut : 220;
        out.push(s.slice(0, at));
        s = s.slice(at).trim();
      }
      if (s) out.push(s);
    });
    return out;
  }

  function speakPage(book, verses) {
    const synth = window.speechSynthesis;
    synth.cancel();
    const hiVoice = findVoice('hi');
    if (!hiVoice && synth.getVoices().length) {
      stopSpeech();
      toast(t('noVoice'));
      refreshListenButton();
      return;
    }
    const enVoice = findVoice('en-in') || findVoice('en');
    const chunks = [];
    verses.forEach(v => {
      v.lines.forEach(l => speechPieces(l).forEach(p => chunks.push({ text: p, lang: 'hi-IN', voice: hiVoice })));
      const prose = proseOf(v);
      const isEnProse = prose.length > 0 && prose === v.proseEn;
      prose.forEach(pr => speechPieces(pr).forEach(p => chunks.push({ text: p, lang: isEnProse ? 'en-IN' : 'hi-IN', voice: isEnProse ? enVoice : hiVoice })));
      const part = shownParts(v)[0];
      if (part) {
        const isEn = part.lang === 'en';
        speechPieces(part.text).forEach(p => chunks.push({ text: p, lang: isEn ? 'en-IN' : 'hi-IN', voice: isEn ? enVoice : hiVoice }));
      }
    });
    const token = ++speech.token;
    /* Short delay after cancel(): some Android browsers drop the next utterance otherwise. */
    setTimeout(() => {
      if (token !== speech.token) return;
      chunks.forEach((c, i) => {
        const u = new SpeechSynthesisUtterance(c.text);
        u.lang = c.lang;
        if (c.voice) u.voice = c.voice;
        u.rate = RATES[state.speed] || 0.9;
        if (i === chunks.length - 1) {
          u.onend = () => {
            if (speech.playing && token === speech.token) pageSpoken(book);
          };
        }
        synth.speak(u);
      });
    }, 80);
  }

  function pageSpoken(book) {
    if (!ctx || ctx.book !== book) return;
    const next = ctx.page.to + 1;
    if (next <= book.verses.length) {
      setTimeout(() => {
        if (speech.playing && speech.bookId === book.id) go('read/' + book.id + '/' + next, true);
      }, 700);
    } else {
      stopSpeech();
      refreshListenButton();
    }
  }

  function refreshListenButton() {
    const btn = $app.querySelector('[data-action="listen"]');
    if (!btn) return;
    btn.innerHTML = speech.playing ? icon('player-stop') + '<span>' + esc(t('stop')) + '</span>'
      : icon('volume') + '<span>' + esc(t('listen')) + '</span>';
    btn.setAttribute('aria-pressed', speech.playing ? 'true' : 'false');
  }

  /* ---------- Screens ---------- */

  function backBar(href, label, title) {
    return '<header class="topbar">' +
      '<a class="btn btn-small" href="' + href + '">' + icon('arrow-left') + '<span>' + esc(label) + '</span></a>' +
      (title ? '<span class="topbar-title">' + esc(title) + '</span>' : '') +
      (href === '#/' ? '' : '<a class="btn btn-small btn-ghost" href="#/">' + icon('home') + '<span>' + esc(t('home')) + '</span></a>') +
      '</header>';
  }

  function chevronRow(href, mainHtml) {
    return '<li><a class="row" href="' + href + '"><span class="row-main">' + mainHtml + '</span>' +
      icon('chevron-right', 'row-chev') + '</a></li>';
  }

  function bookRow(meta) {
    return chevronRow('#/book/' + meta.id, titleHtml(meta) +
      '<span class="row-sub">' + (meta.author && L(meta.author) ? esc(L(meta.author)) + ' · ' : '') + esc(countLabel(meta)) + '</span>');
  }

  function verseRow(book, v) {
    const num = v.label === '0' ? '॰' : numberOf(v);
    const main = v.topic
      ? '<span class="row-topic" translate="no">' + esc(topicOf(v)) + '</span>'
      : '<span class="row-verse" translate="no" lang="' + (book.textLang || 'sa') + '">' + esc(firstLine(v)) + '</span>';
    return '<li><a class="row" href="#/read/' + book.id + '/' + v.pos + '">' +
      '<span class="row-num">' + esc(num) + '</span><span class="row-main">' + main + '</span></a></li>';
  }

  function usedCategories() {
    return categories.filter(c => catalog.some(b => b.category === c.id));
  }

  function viewWelcome() {
    document.title = 'जिनवाणी · Jinvani';
    return '<main class="welcome">' +
      '<p class="welcome-greet" translate="no" lang="hi">जय जिनेन्द्र</p>' +
      '<h1 class="welcome-q"><span translate="no" lang="hi">भाषा चुनें</span><span translate="no" lang="en">Choose language</span></h1>' +
      LANGS.map(l => '<button class="btn lang-btn" data-action="pick-lang" data-lang="' + l.code + '" translate="no" lang="' + l.code + '">' + esc(l.name) + '</button>').join('') +
      '<p class="welcome-note"><span translate="no" lang="hi">बाद में सेटिंग में बदल सकते हैं</span><span translate="no" lang="en">You can change this later in Settings</span></p>' +
      '</main>';
  }

  /* ---------- Today's date and tithi ---------- */

  let weekOpen = false;

  /* Festivals by purnimanta month (0 = Chaitra), paksha and day of the paksha. */
  const FESTIVALS = [
    { m: 0, p: 'shukla', d: [13], key: 'mahavirJayanti' },
    { m: 1, p: 'shukla', d: [3], key: 'akshayaTritiya' },
    { m: 2, p: 'shukla', d: [5], key: 'shrutPanchami' },
    { m: 3, p: 'shukla', d: [8, 9, 10, 11, 12, 13, 14, 15], key: 'ashtahnika' },
    { m: 4, p: 'krishna', d: [1], key: 'veerShasan' },
    { m: 4, p: 'shukla', d: [7], key: 'mokshSaptami' },
    { m: 4, p: 'shukla', d: [15], key: 'rakshaBandhan' },
    { m: 5, p: 'shukla', d: [14], key: 'anantChaturdashi' },
    { m: 5, p: 'shukla', d: [5, 6, 7, 8, 9, 10, 11, 12, 13], key: 'dasLakshan' },
    { m: 6, p: 'krishna', d: [1], key: 'kshamavani' },
    { m: 7, p: 'krishna', d: [15], key: 'diwali' },
    { m: 7, p: 'shukla', d: [8, 9, 10, 11, 12, 13, 14, 15], key: 'ashtahnika' },
    { m: 11, p: 'shukla', d: [8, 9, 10, 11, 12, 13, 14, 15], key: 'ashtahnika' }
  ];

  function dayInfo(date) {
    const p = PANCHANG.forDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
    const tithiName = t('tithis')[p.tithi === 30 ? 15 : p.day - 1];
    const month = (p.adhik ? t('adhik') + ' ' : '') + t('months')[p.month];
    const fest = p.adhik ? null : FESTIVALS.find(f => f.m === p.month && f.p === p.paksha && f.d.indexOf(p.day) >= 0);
    return {
      date: date,
      tithiName: tithiName,
      paksha: t('paksha')[p.paksha],
      full: month + ' ' + t('paksha')[p.paksha] + ' ' + tithiName,
      parva: p.day === 8 || p.day === 14,
      festival: fest ? t('festivals')[fest.key] : ''
    };
  }

  function dateFmt(date, opts) {
    try {
      return new Intl.DateTimeFormat(state.lang === 'en' ? 'en-IN' : 'hi-IN', opts).format(date);
    } catch (e) {
      return date.toDateString();
    }
  }

  function dateCardHtml() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const info = dayInfo(today);
    let html = '<button class="card card-date" data-action="toggle-week" aria-expanded="' + weekOpen + '">' +
      '<span class="date-row"><span class="card-label">' + esc(t('today')) + '</span>' +
      '<span class="date-more">' + esc(weekOpen ? t('weekClose') : t('weekOpen')) + icon(weekOpen ? 'arrow-left' : 'calendar') + '</span></span>' +
      '<span class="date-main">' + esc(dateFmt(today, { weekday: 'long', day: 'numeric', month: 'long' })) + '</span>' +
      '<span class="date-tithi" translate="no">' + esc(info.full) + '</span>' +
      (info.festival || info.parva ? '<span class="date-badges">' +
        (info.festival ? '<span class="badge">' + esc(info.festival) + '</span>' : '') +
        (info.parva ? '<span class="badge">' + esc(info.tithiName + ' · ' + t('parva')) + '</span>' : '') + '</span>' : '') +
      '</button>';
    if (weekOpen) {
      const days = [];
      for (let i = 0; i < 7; i++) days.push(dayInfo(new Date(today.getFullYear(), today.getMonth(), today.getDate() + i)));
      html += '<ol class="week-strip" aria-label="' + esc(t('weekOpen')) + '">' + days.map((d, i) =>
        '<li class="day' + (i === 0 ? ' is-today' : '') + (d.parva || d.festival ? ' is-parva' : '') + '">' +
        '<span class="day-wd">' + esc(i === 0 ? t('today') : dateFmt(d.date, { weekday: 'short' })) + '</span>' +
        '<span class="day-date">' + d.date.getDate() + '</span>' +
        '<span class="day-mon">' + esc(dateFmt(d.date, { month: 'short' })) + '</span>' +
        '<span class="day-tithi" translate="no">' + esc(d.tithiName) + '</span>' +
        '<span class="day-paksha" translate="no">' + esc(d.paksha) + '</span>' +
        (d.festival ? '<span class="day-fest">' + esc(d.festival) + '</span>' : (d.parva ? '<span class="day-fest">' + esc(t('parva')) + '</span>' : '')) +
        '</li>').join('') + '</ol>' +
        '<p class="muted tithi-note">' + esc(t('tithiNote')) + '</p>';
    }
    return html;
  }

  async function viewHome() {
    document.title = t('appName');
    const other = LANGS.find(l => l.code !== state.lang) || LANGS[0];
    let html = '<header class="home-head"><h1 class="greet">' + esc(t('greeting')) + '</h1><span class="head-btns">';
    if (!state.locked) {
      html += '<button class="btn btn-small" data-action="switch-lang" data-lang="' + other.code + '" translate="no" lang="' + other.code + '">' +
        icon('language') + '<span>' + esc(other.name) + '</span></button>';
    }
    html += '<a class="btn btn-small" href="#/settings" aria-label="' + esc(t('settings')) + '">' + icon('settings') + '</a>' +
      '</span></header><main>' + dateCardHtml();

    const last = state.last && await getBook(state.last.book).catch(() => null);
    if (last && last.verses[state.last.pos - 1]) {
      const v = last.verses[state.last.pos - 1];
      const pct = Math.round(v.pos / last.verses.length * 100);
      html += '<a class="card card-accent" href="#/read/' + last.id + '/' + v.pos + '">' +
        '<span class="card-label">' + esc(t('continueReading')) + '</span>' +
        titleHtml(last, 'card-title') +
        '<span class="card-meta">' + esc(posLabel(last, v)) + ' · ' + v.pos + ' / ' + last.verses.length + '</span>' +
        '<span class="progress" aria-hidden="true"><span style="width:' + pct + '%"></span></span></a>';
    } else {
      const first = await getBook('namokar').catch(() => null);
      if (first) {
        html += '<a class="card card-accent" href="#/read/namokar/1">' +
          '<span class="card-label">' + esc(t('startReading')) + '</span>' +
          titleHtml(first, 'card-title') + '</a>';
      }
    }

    html += '<nav class="tiles" aria-label="' + esc(t('appName')) + '">' +
      '<a class="tile" href="#/books">' + icon('books') + '<span>' + esc(t('books')) + '</span></a>' +
      '<a class="tile" href="#/book/mandir-darshan">' + icon('home') + '<span>' + esc(t('mandirGuide')) + '</span></a>' +
      '<a class="tile" href="#/book/pooja-vidhi">' + icon('flower') + '<span>' + esc(t('poojaGuide')) + '</span></a>' +
      '<a class="tile" href="#/search">' + icon('search') + '<span>' + esc(t('search')) + '</span></a>' +
      '<a class="tile" href="#/saved">' + icon('bookmark') + '<span>' + esc(t('saved')) + '</span></a>' +
      '</nav>';

    const ts = await getBook('tattvarth-sutra').catch(() => null);
    if (ts) {
      const day = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
      const v = ts.verses[day % ts.verses.length];
      html += '<a class="card" href="#/read/' + ts.id + '/' + v.pos + '">' +
        '<span class="card-label">' + esc(t('todaysSutra')) + '</span>' +
        '<span class="card-verse" translate="no" lang="sa">' + esc(v.lines.join(' ')) + '</span>' +
        '<span class="card-meta">' + esc(ts.title.hi) + ' · ' + esc(posLabel(ts, v)) + '</span></a>';
    }
    return html + '</main>';
  }

  async function viewBooks(catId) {
    await getCatalog();
    const used = usedCategories();
    if (catId) {
      const cat = used.find(c => c.id === catId);
      if (!cat) return viewNotFound();
      document.title = L(cat.title) + ' · ' + t('appName');
      return backBar('#/books', t('books')) +
        '<main><h1 translate="no">' + esc(L(cat.title)) + '</h1><ul class="rows">' +
        catalog.filter(b => b.category === cat.id).map(bookRow).join('') + '</ul></main>';
    }
    document.title = t('books') + ' · ' + t('appName');
    let html = backBar('#/', t('home')) + '<main><h1>' + esc(t('books')) + '</h1><ul class="rows">';
    if (used.length <= 1) {
      html += catalog.map(bookRow).join('');
    } else {
      html += used.map(c => {
        const n = catalog.filter(b => b.category === c.id).length;
        return chevronRow('#/books/' + c.id, '<span class="title" translate="no">' + esc(L(c.title)) + '</span>' +
          '<span class="row-sub">' + esc(t('booksCount', { n: n })) + '</span>');
      }).join('');
      html += catalog.filter(b => !used.some(c => c.id === b.category)).map(bookRow).join('');
    }
    return html + '</ul></main>';
  }

  function bookParent(book) {
    const used = usedCategories();
    const cat = used.length > 1 && used.find(c => c.id === book.category);
    return cat ? { href: '#/books/' + cat.id, label: L(cat.title) } : { href: '#/books', label: t('books') };
  }

  function gotoForm(book) {
    const max = maxNumber(book);
    return '<form class="goto" data-form="goto" data-book="' + book.id + '" novalidate>' +
      '<label for="goto-num">' + esc(t('goToNumber')) + '</label>' +
      '<div class="goto-row"><input id="goto-num" name="num" type="number" inputmode="numeric" min="1" max="' + max + '" placeholder="' + esc(t('numberHint', { n: max })) + '" autocomplete="off">' +
      '<button class="btn btn-primary" type="submit">' + esc(t('go')) + '</button></div>' +
      '<p class="field-error" id="goto-error" role="alert"></p></form>';
  }

  async function viewBook(id, secStr) {
    const book = await getBook(id);
    if (!book) return viewNotFound();
    const multi = book.sections.length > 1;

    if (secStr && multi) {
      const s = book.sections[parseInt(secStr, 10) - 1];
      if (!s) return viewNotFound();
      document.title = sectionName(book, s) + ' · ' + book.title.hi + ' · ' + t('appName');
      const verses = book.verses.slice(s.from - 1, s.to);
      return backBar('#/book/' + id, t('contents')) + '<main>' +
        '<p class="muted book-of" translate="no" lang="hi">' + esc(book.title.hi) + '</p>' +
        '<h1 translate="no">' + esc(sectionName(book, s)) + '</h1>' +
        '<div class="stack"><a class="btn btn-primary btn-wide" href="#/read/' + id + '/' + s.from + '">' + icon('book') +
        '<span>' + esc(book.sectionUnit ? t('readSectionFromStart', { sec: L(book.sectionUnit) }) : t('readFromStart')) + '</span></a></div>' +
        '<ol class="rows verse-index">' + verses.map(v => verseRow(book, v)).join('') + '</ol></main>';
    }

    document.title = book.title.hi + ' · ' + t('appName');
    const parent = bookParent(book);
    let html = backBar(parent.href, parent.label) + '<main>' +
      '<h1 class="book-head">' + titleHtml(book) + '</h1>' +
      '<p class="muted">' + (L(book.author) ? esc(L(book.author)) + ' · ' : '') + esc(countLabel(book)) + '</p>' +
      '<div class="stack">';

    const saved = state.positions[id];
    if (saved && saved > 1 && book.verses[saved - 1]) {
      html += '<a class="btn btn-primary btn-wide" href="#/read/' + id + '/' + saved + '">' + icon('bookmark') +
        '<span>' + esc(t('resumeAt')) + ' — ' + esc(posLabel(book, book.verses[saved - 1])) + '</span></a>' +
        '<a class="btn btn-wide" href="#/read/' + id + '/1">' + icon('book') + '<span>' + esc(t('readFromStart')) + '</span></a>';
    } else {
      html += '<a class="btn btn-primary btn-wide" href="#/read/' + id + '/1">' + icon('book') + '<span>' + esc(t('readFromStart')) + '</span></a>';
    }
    html += '</div>';
    if (canGoToNumber(book)) html += gotoForm(book);

    if (multi) {
      const unitPlural = state.lang === 'en' ? L(book.unit).toLowerCase() + 's' : L(book.unit);
      const shortNames = book.sections.every(s => sectionName(book, s).length <= 14);
      const items = book.sections.map(s => ({ s: s, name: sectionName(book, s), n: s.to - s.from + 1 }));
      html += '<h2>' + esc(L(book.sectionUnit) || t('contents')) + '</h2>';
      if (shortNames) {
        html += '<div class="grid-btns">' + items.map(x => '<a class="btn grid-btn" href="#/book/' + id + '/' + x.s.index + '">' +
          '<span class="grid-big" translate="no">' + esc(x.name) + '</span>' +
          '<span class="grid-small">' + x.n + ' ' + esc(unitPlural) + '</span></a>').join('') + '</div>';
      } else {
        html += '<ol class="rows">' + items.map(x => '<li><a class="row" href="#/book/' + id + '/' + x.s.index + '">' +
          '<span class="row-num">' + x.s.index + '</span><span class="row-main"><span class="row-topic" translate="no" lang="hi">' + esc(x.name) + '</span>' +
          '<span class="row-sub">' + x.n + ' ' + esc(unitPlural) + '</span></span>' + icon('chevron-right', 'row-chev') + '</a></li>').join('') + '</ol>';
      }
    } else {
      html += '<h2>' + esc(t('contents')) + '</h2><ol class="rows verse-index">' +
        book.verses.map(v => verseRow(book, v)).join('') + '</ol>';
    }
    return html + '</main>';
  }

  let ctx = null;

  function verseBlockHtml(book, v, isTarget) {
    const lang = book.textLang || 'sa';
    let html = '<div class="verse-block' + (isTarget ? ' is-target' : '') + '" id="v-' + v.pos + '">';
    if (v.topic) html += '<p class="topic" translate="no">' + esc(topicOf(v)) + '</p>';
    if (v.lines.length) {
      /* The verse number goes at the end as ॥ 12 ॥, replacing any closing danda already in the text. */
      const lastIndex = v.lines.length - 1;
      const lines = v.lines.map((l, i) => {
        if (i !== lastIndex || !book.numberMark) return '<span class="verse-line">' + esc(l) + '</span>';
        return '<span class="verse-line">' + esc(l.replace(/[\s।॥]+$/, '')) +
          ' <span class="verse-mark">॥ ' + esc(numberOf(v)) + ' ॥</span></span>';
      }).join('');
      html += '<p class="verse" translate="no" lang="' + lang + '">' + lines + '</p>';
      if (state.roman) {
        html += '<p class="roman" translate="no" lang="' + lang + '-Latn">' +
          v.lines.map(l => '<span class="verse-line">' + esc(TRANSLIT.toRoman(l)) + '</span>').join('') + '</p>';
      }
    }
    const prose = proseOf(v);
    if (prose.length) {
      html += '<div class="prose" translate="no">' + prose.map(p => '<p>' + esc(p) + '</p>').join('') + '</div>';
    }
    (v.chitra || []).forEach(c => { html += chitraHtml(c); });
    if (v.padya.length) {
      html += '<section class="padya"><h2>' + esc(t('padya')) + '</h2><p translate="no" lang="hi">' +
        v.padya.map(l => '<span class="verse-line">' + esc(l) + '</span>').join('') + '</p></section>';
    }
    shownParts(v).forEach(p => {
      html += '<section class="meaning"><h2>' + esc(partLabel(p.label)) + '</h2><p translate="no" lang="' + p.lang + '">' + padaHtml(p.text) + '</p></section>';
    });
    return html + '</div>';
  }

  async function viewRead(id, posStr) {
    const book = await getBook(id);
    if (!book) return viewNotFound();
    const n = book.verses.length;
    let pos = parseInt(posStr, 10);
    if (!(pos >= 1)) pos = 1;
    if (pos > n) pos = n;
    const page = book.pages[book.verses[pos - 1].page];
    const verses = book.verses.slice(page.from - 1, page.to);
    const first = verses[0];
    const last = verses[verses.length - 1];
    ctx = { book: book, page: page, verses: verses };
    state.positions[id] = page.from;
    state.last = { book: id, pos: page.from };
    saveState();

    const label = posLabel(book, first, last);
    document.title = book.title.hi + ' · ' + label + ' · ' + t('appName');
    const sec = book.sections[first.section - 1];
    const secName = book.sections.length > 1 && sec && sec.title ? L(sec.title) : '';
    const isBookmarked = state.bookmarks.some(b => b.book === id && b.pos >= page.from && b.pos <= page.to);
    const isFirst = page.from === 1;
    const isLast = page.to === n;
    const contentsHref = book.sections.length > 1 ? '#/book/' + id + '/' + first.section : '#/book/' + id;
    const posText = page.from === page.to ? String(page.from) : page.from + '–' + page.to;

    let html = '<header class="topbar">' +
      '<a class="btn btn-small" href="' + contentsHref + '">' + icon('list') + '<span>' + esc(t('contents')) + '</span></a>' +
      '<a class="btn btn-small btn-ghost" href="#/">' + icon('home') + '<span>' + esc(t('home')) + '</span></a>' +
      '</header>' +
      '<div class="progress progress-top" aria-hidden="true"><span style="width:' + Math.round(page.to / n * 100) + '%"></span></div>' +
      '<main class="reader" id="verse-area">' +
      '<p class="reader-where"><span translate="no" lang="hi">' + esc(book.title.hi) + (secName ? ' · ' + esc(secName) : '') + '</span>' +
      '<span class="where-pos">' + posText + ' / ' + n + '</span></p>' +
      '<h1 class="verse-label">' + esc(label) + '</h1>' +
      '<div class="page' + (verses.length > 1 ? ' page-many' : '') + '">' +
      verses.map(v => verseBlockHtml(book, v, verses.length > 1 && v.pos === pos && pos !== page.from)).join('') +
      '</div>' +
      '<div class="reader-tools">' +
      '<button class="btn" data-action="bookmark" aria-pressed="' + isBookmarked + '">' + icon(isBookmarked ? 'check' : 'bookmark') +
      '<span>' + esc(isBookmarked ? t('savedDone') : t('save')) + '</span></button>' +
      (state.locked ? '' :
        '<span class="size-btns">' +
        '<button class="btn" data-action="font-down" aria-label="' + esc(t('textSize') + ': ' + t('smaller')) + '"><span translate="no" lang="hi">अ</span>−</button>' +
        '<button class="btn" data-action="font-up" aria-label="' + esc(t('textSize') + ': ' + t('bigger')) + '"><span translate="no" lang="hi">अ</span>+</button>' +
        '</span>') +
      '</div>' +
      '</main>' +
      '<nav class="reader-bar" aria-label="' + esc(book.title.hi) + '">' +
      '<button class="btn" data-action="prev">' + icon(isFirst ? 'list' : 'arrow-left') + '<span>' + esc(isFirst ? t('contents') : t('prev')) + '</span></button>' +
      '<button class="btn btn-primary" data-action="listen" aria-pressed="' + (speech.playing ? 'true' : 'false') + '">' +
      (speech.playing ? icon('player-stop') + '<span>' + esc(t('stop')) : icon('volume') + '<span>' + esc(t('listen'))) + '</span></button>' +
      '<button class="btn" data-action="next"><span>' + esc(isLast ? t('finish') : t('next')) + '</span>' + icon(isLast ? 'check' : 'arrow-right') + '</button>' +
      '</nav>';
    return html;
  }

  let lastQuery = '';
  let searchBooks = [];

  async function viewSearch() {
    document.title = t('search') + ' · ' + t('appName');
    searchBooks = await searchableBooks();
    const hasMic = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    return backBar('#/', t('home')) +
      '<main><h1>' + esc(t('search')) + '</h1>' +
      '<form class="search-form" data-form="search" role="search" novalidate>' +
      '<label class="visually-hidden" for="q">' + esc(t('search')) + '</label>' +
      '<input id="q" name="q" type="search" autocomplete="off" enterkeyhint="search" placeholder="' + esc(t('searchPlaceholder')) + '" value="' + esc(lastQuery) + '">' +
      (hasMic ? '<button class="btn btn-wide" type="button" data-action="voice-search">' + icon('microphone') + '<span>' + esc(t('speak')) + '</span></button>' : '') +
      '</form><div id="results" aria-live="polite"></div></main>';
  }

  function renderResults() {
    const box = document.getElementById('results');
    if (!box) return;
    const scope = searchBooks.length < catalog.length ? '<p class="muted scope-note">' + esc(t('searchScope')) + '</p>' : '';
    if (!lastQuery.trim()) {
      box.innerHTML = '<p class="muted">' + esc(t('typeToSearch')) + '</p>';
      return;
    }
    const res = runSearch(catalog, searchBooks, lastQuery);
    if (!res.books.length && !res.verses.length) {
      box.innerHTML = '<p class="muted">' + esc(t('noResults')) + '</p>' + scope;
      return;
    }
    let html = '';
    if (res.books.length) {
      html += '<h2>' + esc(t('resultsBooks')) + '</h2><ul class="rows">' + res.books.map(bookRow).join('') + '</ul>';
    }
    if (res.verses.length) {
      html += '<h2>' + esc(t('resultsText')) + '</h2><ul class="rows">' +
        res.verses.map(r => chevronRow('#/read/' + r.book.id + '/' + r.v.pos,
          '<span class="row-verse" translate="no" lang="' + (r.book.textLang || 'sa') + '">' + esc(r.v.topic || firstLine(r.v)) + '</span>' +
          '<span class="row-sub"><span translate="no" lang="hi">' + esc(r.book.title.hi) + '</span> · ' + esc(posLabel(r.book, r.v)) + '</span>')).join('') + '</ul>';
    }
    box.innerHTML = html + scope;
  }

  async function viewSaved() {
    document.title = t('saved') + ' · ' + t('appName');
    let html = backBar('#/', t('home')) + '<main><h1>' + esc(t('saved')) + '</h1>';
    if (!state.bookmarks.length) return html + '<p class="muted">' + esc(t('noBookmarks')) + '</p></main>';
    const ids = Array.from(new Set(state.bookmarks.map(b => b.book)));
    await Promise.all(ids.map(id => getBook(id).catch(() => null)));
    const items = state.bookmarks.slice().reverse()
      .map(b => ({ b: b, book: bookCache[b.book] }))
      .filter(x => x.book && x.book.verses[x.b.pos - 1]);
    html += '<ul class="rows">' + items.map(x => {
      const v = x.book.verses[x.b.pos - 1];
      return '<li class="row-with-action"><a class="row" href="#/read/' + x.book.id + '/' + v.pos + '"><span class="row-main">' +
        '<span class="row-verse" translate="no" lang="' + (x.book.textLang || 'sa') + '">' + esc(v.topic || firstLine(v)) + '</span>' +
        '<span class="row-sub"><span translate="no" lang="hi">' + esc(x.book.title.hi) + '</span> · ' + esc(posLabel(x.book, v)) + '</span></span></a>' +
        '<button class="btn btn-small" data-action="unsave" data-book="' + x.book.id + '" data-pos="' + v.pos + '">' + esc(t('remove')) + '</button></li>';
    }).join('') + '</ul>';
    return html + '</main>';
  }

  let installPrompt = null;

  function choice(action, current, options) {
    return '<div class="choice" role="group">' + options.map(o =>
      '<button class="btn" data-action="' + action + '" data-value="' + o.value + '" aria-pressed="' + (o.value === current) + '"' +
      (o.lang ? ' translate="no" lang="' + o.lang + '"' : '') + '>' + (o.value === current ? icon('check') : '') + '<span>' + esc(o.label) + '</span></button>'
    ).join('') + '</div>';
  }

  function viewSettings() {
    document.title = t('settings') + ' · ' + t('appName');
    let html = backBar('#/', t('home')) + '<main><h1>' + esc(t('settings')) + '</h1>';
    if (state.locked) {
      return html + '<section class="panel"><p>' + icon('lock') + ' ' + esc(t('lockedMsg')) + '</p>' +
        '<button class="btn btn-wide hold-btn" data-hold="unlock"><span class="hold-fill"></span><span class="hold-text">' + icon('lock') + '<span>' + esc(t('holdToUnlock')) + '</span></span></button></section>' +
        '<a class="row row-link" href="#/credits"><span class="row-main">' + esc(t('credits')) + '</span>' + icon('chevron-right', 'row-chev') + '</a></main>';
    }
    const theme = document.documentElement.dataset.theme;
    html += '<section class="panel"><h2>' + esc(t('language')) + '</h2>' +
      choice('set-lang', state.lang, LANGS.map(l => ({ value: l.code, label: l.name, lang: l.code }))) + '</section>';
    html += '<section class="panel"><h2>' + esc(t('textSize')) + '</h2>' +
      '<p class="size-preview" translate="no" lang="pra">' + esc(t('sizePreview')) + '</p>' +
      '<div class="choice"><button class="btn" data-action="font-down"><span translate="no" lang="hi">अ</span>− <span>' + esc(t('smaller')) + '</span></button>' +
      '<button class="btn" data-action="font-up"><span translate="no" lang="hi">अ</span>+ <span>' + esc(t('bigger')) + '</span></button></div></section>';
    html += '<section class="panel"><h2>' + esc(t('colours')) + '</h2>' +
      choice('set-theme', theme, [{ value: 'day', label: t('day') }, { value: 'night', label: t('night') }]) + '</section>';
    if (hasSpeech()) {
      html += '<section class="panel"><h2>' + esc(t('speed')) + '</h2>' +
        choice('set-speed', state.speed, [{ value: 'slow', label: t('slow') }, { value: 'normal', label: t('normal') }, { value: 'fast', label: t('fast') }]) + '</section>';
    }
    html += '<section class="panel"><h2>' + esc(t('roman')) + '</h2><p class="muted">' + esc(t('romanDesc')) + '</p>' +
      choice('set-roman', state.roman ? 'yes' : 'no', [{ value: 'yes', label: t('yes') }, { value: 'no', label: t('no') }]) + '</section>';

    if (isStandalone()) {
      html += '<section class="panel"><h2>' + esc(t('install')) + '</h2><p>' + icon('check') + ' ' + esc(t('installed')) + '</p></section>';
    } else if (installPrompt) {
      html += '<section class="panel"><h2>' + esc(t('install')) + '</h2><p class="muted">' + esc(t('installDesc')) + '</p>' +
        '<button class="btn btn-primary btn-wide" data-action="install">' + icon('download') + '<span>' + esc(t('install')) + '</span></button></section>';
    } else if (isIos()) {
      html += '<section class="panel"><h2>' + esc(t('install')) + '</h2><p>' + esc(t('installIos')) + '</p></section>';
    }

    html += '<section class="panel"><h2>' + esc(t('lock')) + '</h2><p class="muted">' + esc(t('lockDesc')) + '</p>' +
      '<button class="btn btn-wide" data-action="lock">' + icon('lock') + '<span>' + esc(t('lockOn')) + '</span></button></section>';
    html += '<a class="row row-link" href="#/credits"><span class="row-main">' + esc(t('credits')) + '</span>' + icon('chevron-right', 'row-chev') + '</a>';
    return html + '</main>';
  }

  async function viewCredits() {
    document.title = t('credits') + ' · ' + t('appName');
    await getCatalog();
    return backBar('#/settings', t('settings')) +
      '<main><h1>' + esc(t('credits')) + '</h1><p>' + esc(t('creditsIntro')) + '</p>' +
      '<h2>' + esc(t('textsHeading')) + '</h2>' +
      catalog.map(b => '<section class="panel"><h3 translate="no" lang="hi">' + esc(b.title.hi) + '</h3>' +
        (L(b.author) ? '<p class="muted">' + esc(L(b.author)) + '</p>' : '') +
        (b.source ? '<p>' + esc(L(b.source)) + '</p>' : '') + '</section>').join('') +
      '<h2>' + esc(t('toolsHeading')) + '</h2><ul class="plain"><li>' + esc(t('fontCredit')) + '</li><li>' + esc(t('iconCredit')) + '</li></ul>' +
      '<p>' + esc(t('proofNote')) + '</p><p class="muted">' + esc(t('licenseNote')) + '</p>' +
      '<p><a href="' + REPO_URL + '" target="_blank" rel="noopener">' + REPO_URL.replace('https://', '') + '</a></p></main>';
  }

  function viewNotFound() {
    return backBar('#/', t('home')) + '<main><h1>' + esc(t('notFound')) + '</h1></main>';
  }

  function viewError() {
    return '<main class="center"><p>' + esc(t('loadError')) + '</p>' +
      '<button class="btn btn-primary" data-action="retry">' + esc(t('retry')) + '</button></main>';
  }

  /* ---------- Navigation ---------- */

  function routeParts() {
    return location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  }

  function go(path, replace) {
    if (replace) {
      history.replaceState(null, '', '#/' + path);
      render();
    } else {
      location.hash = '#/' + path;
    }
  }

  let renderToken = 0;
  let currentView = null;
  let currentRoute = null;

  async function render() {
    applySettings();
    const parts = routeParts();
    const view = state.lang ? (parts[0] || 'home') : 'welcome';
    if (view !== 'read') stopSpeech();
    const token = ++renderToken;
    const focusAction = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.action : null;
    const sameView = view === currentView;
    const route = parts.join('/');
    const sameRoute = route === currentRoute;
    const loadingTimer = setTimeout(() => {
      if (token === renderToken) $app.innerHTML = '<main class="center"><p>' + esc(t('loading')) + '</p></main>';
    }, 300);
    let html;
    try {
      switch (view) {
        case 'welcome': html = viewWelcome(); break;
        case 'home': html = await viewHome(); break;
        case 'books': html = await viewBooks(parts[1]); break;
        case 'book': html = await viewBook(parts[1], parts[2]); break;
        case 'read': html = await viewRead(parts[1], parts[2]); break;
        case 'search': html = await viewSearch(); break;
        case 'saved': html = await viewSaved(); break;
        case 'settings': html = viewSettings(); break;
        case 'credits': html = await viewCredits(); break;
        default: html = viewNotFound();
      }
    } catch (e) {
      console.error(e);
      html = viewError();
    }
    clearTimeout(loadingTimer);
    if (token !== renderToken) return;
    $app.innerHTML = html;
    currentView = view;
    currentRoute = route;
    afterRender(view, sameView, sameRoute, focusAction);
  }

  function afterRender(view, sameView, sameRoute, focusAction) {
    const again = focusAction && $app.querySelector('[data-action="' + focusAction + '"]');
    if (sameView && again) {
      again.focus({ preventScroll: true });
    } else if (!sameView && currentView !== 'welcome') {
      const h1 = $app.querySelector('h1');
      if (h1) {
        h1.setAttribute('tabindex', '-1');
        h1.focus({ preventScroll: true });
      }
    }
    if (!(sameRoute && (view === 'settings' || view === 'saved'))) window.scrollTo(0, 0);
    if (view === 'search') {
      renderResults();
      const q = document.getElementById('q');
      if (q && !sameView) q.focus();
    }
    if (view === 'read' && speech.playing && ctx) {
      if (speech.bookId === ctx.book.id) speakPage(ctx.book, ctx.verses);
      else stopSpeech();
    }
  }

  /* ---------- Actions ---------- */

  function changeFont(delta) {
    const next = state.fontStep + delta;
    if (next < 0) { toast(t('minSize')); return; }
    if (next >= FONT_STEPS.length) { toast(t('maxSize')); return; }
    state.fontStep = next;
    saveState();
    applySettings();
  }

  function readerStep(delta) {
    if (!ctx) return;
    const { book, page } = ctx;
    if (delta < 0) {
      if (page.from === 1) { go('book/' + book.id + (book.sections.length > 1 ? '/1' : '')); return; }
      const prev = book.pages[book.verses[page.from - 2].page];
      go('read/' + book.id + '/' + prev.from, true);
      return;
    }
    if (page.to >= book.verses.length) {
      stopSpeech();
      toast(t('bookDone'));
      go('book/' + book.id);
      return;
    }
    go('read/' + book.id + '/' + (page.to + 1), true);
  }

  const actions = {
    'pick-lang': el => { state.lang = el.dataset.lang; saveState(); render(); },
    'switch-lang': el => { state.lang = el.dataset.lang; saveState(); render(); },
    'set-lang': el => { state.lang = el.dataset.value; saveState(); render(); },
    'set-theme': el => { state.theme = el.dataset.value; saveState(); render(); },
    'set-speed': el => { state.speed = el.dataset.value; saveState(); render(); },
    'set-roman': el => { state.roman = el.dataset.value === 'yes'; saveState(); render(); },
    'font-up': () => changeFont(1),
    'font-down': () => changeFont(-1),
    'lock': () => { state.locked = true; saveState(); render(); },
    'toggle-week': () => { weekOpen = !weekOpen; render(); },
    'retry': () => render(),
    'prev': () => readerStep(-1),
    'next': () => readerStep(1),
    'bookmark': () => {
      if (!ctx) return;
      const { book, page } = ctx;
      const before = state.bookmarks.length;
      state.bookmarks = state.bookmarks.filter(b => !(b.book === book.id && b.pos >= page.from && b.pos <= page.to));
      if (state.bookmarks.length < before) {
        toast(t('removed'));
      } else {
        state.bookmarks.push({ book: book.id, pos: page.from });
        toast(t('savedDone'));
      }
      saveState();
      render();
    },
    'unsave': el => {
      const pos = parseInt(el.dataset.pos, 10);
      state.bookmarks = state.bookmarks.filter(b => !(b.book === el.dataset.book && b.pos === pos));
      saveState();
      toast(t('removed'));
      render();
    },
    'listen': () => {
      if (!hasSpeech()) { toast(t('noSpeech')); return; }
      if (speech.playing) {
        stopSpeech();
      } else if (ctx) {
        speech.playing = true;
        speech.bookId = ctx.book.id;
        speakPage(ctx.book, ctx.verses);
      }
      refreshListenButton();
    },
    'install': async () => {
      if (!installPrompt) return;
      installPrompt.prompt();
      try { await installPrompt.userChoice; } catch (e) { /* ignore */ }
      installPrompt = null;
      render();
    },
    'voice-search': el => startVoiceSearch(el)
  };

  function startVoiceSearch(btn) {
    const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) { toast(t('noMic')); return; }
    const rec = new Rec();
    rec.lang = state.lang === 'en' ? 'en-IN' : 'hi-IN';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    const label = btn.querySelector('span');
    const original = label.textContent;
    label.textContent = t('listening');
    btn.classList.add('is-listening');
    const done = () => { label.textContent = original; btn.classList.remove('is-listening'); };
    rec.onresult = e => {
      const said = e.results[0][0].transcript;
      const q = document.getElementById('q');
      if (q) q.value = said;
      lastQuery = said;
      renderResults();
    };
    rec.onerror = e => {
      done();
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') toast(t('micDenied'));
    };
    rec.onend = done;
    try { rec.start(); } catch (e) { done(); }
  }

  $app.addEventListener('click', e => {
    const el = e.target.closest('[data-action]');
    if (!el || !actions[el.dataset.action]) return;
    e.preventDefault();
    actions[el.dataset.action](el, e);
  });

  $app.addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;
    if (form.dataset.form === 'goto') {
      const book = bookCache[form.dataset.book];
      const num = parseInt(form.num.value, 10);
      const err = document.getElementById('goto-error');
      if (!book) return;
      const v = num >= 0 ? findByNumber(book, num) : null;
      if (!v) {
        err.textContent = t('badNumber', { n: maxNumber(book) });
        form.num.focus();
        return;
      }
      go('read/' + book.id + '/' + v.pos);
    } else if (form.dataset.form === 'search') {
      const q = document.getElementById('q');
      if (q) q.blur();
    }
  });

  let searchTimer = null;
  $app.addEventListener('input', e => {
    if (e.target.id === 'q') {
      lastQuery = e.target.value;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(renderResults, 200);
    } else if (e.target.id === 'goto-num') {
      const err = document.getElementById('goto-error');
      if (err) err.textContent = '';
    }
  });

  /* Press and hold for 3 seconds to unlock settings. */
  let holdTimer = null;
  function holdStart(el) {
    el.classList.add('holding');
    holdTimer = setTimeout(() => {
      state.locked = false;
      saveState();
      toast(t('unlocked'));
      render();
    }, 3000);
  }
  function holdEnd() {
    clearTimeout(holdTimer);
    const el = $app.querySelector('.hold-btn');
    if (el) el.classList.remove('holding');
  }
  $app.addEventListener('pointerdown', e => {
    const el = e.target.closest('[data-hold]');
    if (el) { e.preventDefault(); holdStart(el); }
  });
  ['pointerup', 'pointercancel'].forEach(ev => $app.addEventListener(ev, holdEnd));
  $app.addEventListener('pointerleave', e => { if (e.target.matches && e.target.matches('[data-hold]')) holdEnd(); }, true);
  $app.addEventListener('contextmenu', e => { if (e.target.closest('[data-hold]')) e.preventDefault(); });
  $app.addEventListener('keydown', e => {
    const el = e.target.closest && e.target.closest('[data-hold]');
    if (el && (e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); holdStart(el); }
  });
  $app.addEventListener('keyup', e => {
    if (e.target.closest && e.target.closest('[data-hold]')) holdEnd();
  });

  /* Reader: arrow keys and swipes move between pages. */
  document.addEventListener('keydown', e => {
    if (currentView !== 'read' || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target.matches && e.target.matches('input, textarea')) return;
    if (e.key === 'ArrowRight') readerStep(1);
    if (e.key === 'ArrowLeft') readerStep(-1);
  });

  let touchStart = null;
  $app.addEventListener('touchstart', e => {
    if (currentView !== 'read' || e.touches.length !== 1) { touchStart = null; return; }
    touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, { passive: true });
  $app.addEventListener('touchend', e => {
    if (!touchStart || currentView !== 'read') return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    touchStart = null;
    if (Math.abs(dx) > 70 && Math.abs(dy) < 60) readerStep(dx < 0 ? 1 : -1);
  }, { passive: true });

  window.addEventListener('hashchange', render);

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    installPrompt = e;
    if (currentView === 'settings') render();
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!state.theme) applySettings();
  });

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    const firstInstall = !navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').then(() => {
      if (firstInstall) {
        navigator.serviceWorker.addEventListener('controllerchange', () => toast(t('offlineReady')), { once: true });
      }
    }).catch(() => { /* offline support is optional */ });
  }

  render();
})();
