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

  function devDigits(n) {
    return String(n).replace(/[0-9]/g, d => '०१२३४५६७८९'[d]);
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
  const bookCache = {};

  async function getCatalog() {
    if (!catalog) {
      const r = await fetch('content/books.json');
      if (!r.ok) throw new Error('books.json ' + r.status);
      catalog = await r.json();
    }
    return catalog;
  }

  async function getBook(id) {
    if (bookCache[id]) return bookCache[id];
    await getCatalog();
    const meta = catalog.find(b => b.id === id);
    if (!meta) return null;
    const r = await fetch(meta.file);
    if (!r.ok) throw new Error(meta.file + ' ' + r.status);
    const book = Object.assign({}, meta, parseBook(await r.text()));
    bookCache[id] = book;
    return book;
  }

  async function getAllBooks() {
    await getCatalog();
    return Promise.all(catalog.map(b => getBook(b.id)));
  }

  /*
   * Text format (see content/README.md):
   *   # comment
   *   ## Hindi section name | English section name
   *   verse lines, then optional "अर्थ: ..." and "Meaning: ..." lines
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
      if (!cur) startSection(null);
      const v = { lines: [], meaning: {} };
      block.forEach(line => {
        let m;
        if ((m = line.match(/^अर्थ\s*:\s*(.*)$/))) v.meaning.hi = m[1];
        else if ((m = line.match(/^meaning\s*:\s*(.*)$/i))) v.meaning.en = m[1];
        else v.lines.push(line);
      });
      block = [];
      if (!v.lines.length) return;
      v.pos = verses.length + 1;
      v.section = cur.index;
      v.num = v.pos - cur.from + 1;
      verses.push(v);
      cur.to = v.pos;
    }

    txt.replace(/\r/g, '').split('\n').forEach(raw => {
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
    return { sections: sections.filter(s => s.to >= s.from), verses: verses };
  }

  function posLabel(book, v) {
    if (book.sectionUnit) {
      return t('positionSec', { sec: L(book.sectionUnit), s: v.section, unit: L(book.unit), n: v.num });
    }
    return t('position', { unit: L(book.unit), n: v.num });
  }

  function countLabel(book) {
    const unit = state.lang === 'en' ? L(book.unit).toLowerCase() : L(book.unit);
    return t('count', { n: book.verses.length, unit: unit });
  }

  /* Book names always show in Devanagari; English mode adds the English name below. */
  function titleHtml(book, cls) {
    let html = '<span class="' + (cls || 'title') + '" lang="hi">' + esc(book.title.hi) + '</span>';
    if (state.lang === 'en') html += '<span class="title-en">' + esc(book.title.en) + '</span>';
    return html;
  }

  function firstLine(v) {
    return v.lines[0].replace(/[-।॥]\s*$/, '');
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

  function indexBook(book) {
    if (book._indexed) return;
    book._n = [book.title.hi].concat(book.aliases || []).map(normDev);
    book._r = [book.title.en].concat(book.aliases || []).map(TRANSLIT.key);
    book.verses.forEach(v => {
      const text = v.lines.join(' ');
      v._n = normDev(text + ' ' + (v.meaning.hi || ''));
      v._r = TRANSLIT.romanKey(text);
      v._e = (v.meaning.en || '').toLowerCase();
    });
    book._indexed = true;
  }

  function runSearch(books, query) {
    const q = query.trim();
    const out = { books: [], verses: [] };
    if (!q) return out;
    const latin = /[a-z]/i.test(q);
    const nq = latin ? TRANSLIT.key(q) : normDev(q);
    const lower = q.toLowerCase();
    if (nq.length < 2) return out;
    books.forEach(book => {
      indexBook(book);
      const keys = latin ? book._r : book._n;
      if (keys.some(k => k && (k.includes(nq) || nq.includes(k)))) out.books.push(book);
      if (latin && nq.length < 3) return;
      book.verses.forEach(v => {
        const hit = latin ? (v._r.includes(nq) || (lower.length > 3 && v._e.includes(lower))) : v._n.includes(nq);
        if (hit && out.verses.length < 60) out.verses.push({ book: book, v: v });
      });
    });
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

  function speakVerse(book, v) {
    const synth = window.speechSynthesis;
    synth.cancel();
    const hiVoice = findVoice('hi');
    if (!hiVoice && synth.getVoices().length) {
      stopSpeech();
      toast(t('noVoice'));
      refreshListenButton();
      return;
    }
    const chunks = v.lines
      .map(l => ({ text: l.replace(/[-–।॥|]/g, ' ').replace(/\s+/g, ' ').trim(), lang: 'hi-IN', voice: hiVoice }))
      .filter(c => c.text);
    const meaning = L(v.meaning);
    if (meaning) {
      const isEn = state.lang === 'en' && v.meaning.en;
      chunks.push({ text: meaning, lang: isEn ? 'en-IN' : 'hi-IN', voice: isEn ? (findVoice('en-in') || findVoice('en')) : hiVoice });
    }
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
            if (speech.playing && token === speech.token) verseSpoken(book, v);
          };
        }
        synth.speak(u);
      });
    }, 80);
  }

  function verseSpoken(book, v) {
    if (v.pos < book.verses.length) {
      setTimeout(() => {
        if (speech.playing && speech.bookId === book.id) go('read/' + book.id + '/' + (v.pos + 1), true);
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

  function viewWelcome() {
    document.title = 'जिनवाणी · Jinvani';
    return '<main class="welcome">' +
      '<p class="welcome-greet" lang="hi">जय जिनेन्द्र</p>' +
      '<h1 class="welcome-q"><span lang="hi">भाषा चुनें</span><span lang="en">Choose language</span></h1>' +
      LANGS.map(l => '<button class="btn lang-btn" data-action="pick-lang" data-lang="' + l.code + '" lang="' + l.code + '">' + esc(l.name) + '</button>').join('') +
      '<p class="welcome-note"><span lang="hi">बाद में सेटिंग में बदल सकते हैं</span><span lang="en">You can change this later in Settings</span></p>' +
      '</main>';
  }

  async function viewHome() {
    document.title = t('appName');
    const other = LANGS.find(l => l.code !== state.lang) || LANGS[0];
    let html = '<header class="home-head"><h1 class="greet">' + esc(t('greeting')) + '</h1>';
    if (!state.locked) {
      html += '<button class="btn btn-small" data-action="switch-lang" data-lang="' + other.code + '" lang="' + other.code + '">' +
        icon('language') + '<span>' + esc(other.name) + '</span></button>';
    }
    html += '</header><main>';

    const last = state.last && await getBook(state.last.book).catch(() => null);
    if (last && last.verses[state.last.pos - 1]) {
      const v = last.verses[state.last.pos - 1];
      const pct = Math.round(v.pos / last.verses.length * 100);
      html += '<a class="card card-accent" href="#/read/' + last.id + '/' + v.pos + '">' +
        '<span class="card-label">' + esc(t('continueReading')) + '</span>' +
        titleHtml(last, 'card-title') +
        '<span class="card-meta">' + esc(posLabel(last, v)) + (last.sectionUnit ? ' · ' + v.pos : '') + ' / ' + last.verses.length + '</span>' +
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
      '<a class="tile" href="#/search">' + icon('search') + '<span>' + esc(t('search')) + '</span></a>' +
      '<a class="tile" href="#/saved">' + icon('bookmark') + '<span>' + esc(t('saved')) + '</span></a>' +
      '<a class="tile" href="#/settings">' + icon('settings') + '<span>' + esc(t('settings')) + '</span></a>' +
      '</nav>';

    const ts = await getBook('tattvarth-sutra').catch(() => null);
    if (ts) {
      const day = Math.floor((Date.now() - new Date().getTimezoneOffset() * 60000) / 86400000);
      const v = ts.verses[day % ts.verses.length];
      html += '<a class="card" href="#/read/' + ts.id + '/' + v.pos + '">' +
        '<span class="card-label">' + esc(t('todaysSutra')) + '</span>' +
        '<span class="card-verse" lang="sa">' + esc(v.lines.join(' ')) + '</span>' +
        '<span class="card-meta">' + esc(ts.title.hi) + ' · ' + esc(posLabel(ts, v)) + '</span></a>';
    }
    return html + '</main>';
  }

  async function viewBooks() {
    document.title = t('books') + ' · ' + t('appName');
    const books = await getAllBooks();
    return backBar('#/', t('home')) +
      '<main><h1>' + esc(t('books')) + '</h1><ul class="rows">' +
      books.map(b => '<li><a class="row" href="#/book/' + b.id + '">' +
        '<span class="row-main">' + titleHtml(b) +
        '<span class="row-sub">' + esc(L(b.author)) + ' · ' + esc(countLabel(b)) + '</span></span>' +
        icon('chevron-right', 'row-chev') + '</a></li>').join('') +
      '</ul></main>';
  }

  async function viewBook(id) {
    const book = await getBook(id);
    if (!book) return viewNotFound();
    document.title = book.title.hi + ' · ' + t('appName');
    const n = book.verses.length;
    let html = backBar('#/books', t('books')) + '<main>' +
      '<h1 class="book-head">' + titleHtml(book) + '</h1>' +
      '<p class="muted">' + esc(L(book.author)) + ' · ' + esc(countLabel(book)) + '</p>' +
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

    if (book.sectionUnit) {
      html += '<h2>' + esc(L(book.sectionUnit)) + '</h2><div class="grid-btns">' +
        book.sections.map(s => '<a class="btn grid-btn" href="#/read/' + id + '/' + s.from + '">' +
          '<span class="grid-big">' + esc(t('chapterShort', { sec: L(book.sectionUnit), n: s.index })) + '</span>' +
          '<span class="grid-small">' + (s.to - s.from + 1) + ' ' + esc(state.lang === 'en' ? L(book.unit).toLowerCase() + 's' : L(book.unit)) + '</span></a>').join('') +
        '</div>';
    } else {
      if (n > 8) {
        html += '<form class="goto" data-form="goto" data-book="' + id + '" novalidate>' +
          '<label for="goto-num">' + esc(t('goToNumber')) + '</label>' +
          '<div class="goto-row"><input id="goto-num" name="num" type="number" inputmode="numeric" min="1" max="' + n + '" placeholder="' + esc(t('numberHint', { n: n })) + '" autocomplete="off">' +
          '<button class="btn btn-primary" type="submit">' + esc(t('go')) + '</button></div>' +
          '<p class="field-error" id="goto-error" role="alert"></p></form>';
      }
      html += '<h2>' + esc(t('contents')) + '</h2><ol class="rows verse-index">' +
        book.verses.map(v => '<li><a class="row" href="#/read/' + id + '/' + v.pos + '">' +
          '<span class="row-num">' + v.num + '</span>' +
          '<span class="row-main"><span class="row-verse" lang="' + (book.textLang || 'sa') + '">' + esc(firstLine(v)) + '</span></span></a></li>').join('') +
        '</ol>';
    }
    return html + '</main>';
  }

  let ctx = null;

  async function viewRead(id, posStr) {
    const book = await getBook(id);
    if (!book) return viewNotFound();
    const n = book.verses.length;
    let pos = parseInt(posStr, 10);
    if (!(pos >= 1)) pos = 1;
    if (pos > n) pos = n;
    const v = book.verses[pos - 1];
    ctx = { book: book, v: v };
    state.positions[id] = pos;
    state.last = { book: id, pos: pos };
    saveState();
    document.title = book.title.hi + ' · ' + posLabel(book, v) + ' · ' + t('appName');

    const lang = book.textLang || 'sa';
    const isBookmarked = state.bookmarks.some(b => b.book === id && b.pos === pos);
    const meaning = L(v.meaning);
    /* The verse number goes at the end as ॥ १२ ॥, replacing any closing danda already in the text. */
    const lastIndex = v.lines.length - 1;
    const lines = v.lines.map((l, i) => {
      if (i !== lastIndex || !book.numberMark) return '<span class="verse-line">' + esc(l) + '</span>';
      return '<span class="verse-line">' + esc(l.replace(/[\s।॥]+$/, '')) +
        ' <span class="verse-mark">॥ ' + devDigits(v.num) + ' ॥</span></span>';
    }).join('');
    const mistake = REPO_URL + '/issues/new?title=' +
      encodeURIComponent(t('mistakeTitle', { book: book.title.hi, pos: posLabel(book, v) })) +
      '&body=' + encodeURIComponent(t('mistakeBody', { text: v.lines.join('\n') }));

    let html = '<header class="topbar">' +
      '<a class="btn btn-small" href="#/book/' + id + '">' + icon('list') + '<span>' + esc(t('contents')) + '</span></a>' +
      '<a class="btn btn-small btn-ghost" href="#/">' + icon('home') + '<span>' + esc(t('home')) + '</span></a>' +
      '</header>' +
      '<div class="progress progress-top" aria-hidden="true"><span style="width:' + Math.round(pos / n * 100) + '%"></span></div>' +
      '<main class="reader" id="verse-area">' +
      '<p class="reader-where"><span lang="hi">' + esc(book.title.hi) + '</span><span class="where-pos">' + pos + ' / ' + n + '</span></p>' +
      '<h1 class="verse-label">' + esc(posLabel(book, v)) + '</h1>' +
      '<p class="verse" lang="' + lang + '">' + lines + '</p>';
    if (state.roman) {
      html += '<p class="roman" lang="' + lang + '-Latn">' + v.lines.map(l => '<span class="verse-line">' + esc(TRANSLIT.toRoman(l)) + '</span>').join('') + '</p>';
    }
    if (meaning) {
      html += '<section class="meaning"><h2>' + esc(t('meaning')) + '</h2><p>' + esc(meaning) + '</p></section>';
    }
    html += '<div class="reader-tools">' +
      '<button class="btn" data-action="bookmark" aria-pressed="' + isBookmarked + '">' + icon(isBookmarked ? 'check' : 'bookmark') +
      '<span>' + esc(isBookmarked ? t('savedDone') : t('save')) + '</span></button>' +
      (state.locked ? '' :
        '<span class="size-btns">' +
        '<button class="btn" data-action="font-down" aria-label="' + esc(t('textSize') + ': ' + t('smaller')) + '"><span lang="hi">अ</span>−</button>' +
        '<button class="btn" data-action="font-up" aria-label="' + esc(t('textSize') + ': ' + t('bigger')) + '"><span lang="hi">अ</span>+</button>' +
        '</span>') +
      '</div>' +
      '<a class="report-link" href="' + esc(mistake) + '" target="_blank" rel="noopener">' + icon('message-report') + '<span>' + esc(t('reportMistake')) + '</span></a>' +
      '</main>' +
      '<nav class="reader-bar" aria-label="' + esc(book.title.hi) + '">' +
      '<button class="btn" data-action="prev">' + icon(pos === 1 ? 'list' : 'arrow-left') + '<span>' + esc(pos === 1 ? t('contents') : t('prev')) + '</span></button>' +
      '<button class="btn btn-primary" data-action="listen" aria-pressed="' + (speech.playing ? 'true' : 'false') + '">' +
      (speech.playing ? icon('player-stop') + '<span>' + esc(t('stop')) : icon('volume') + '<span>' + esc(t('listen'))) + '</span></button>' +
      '<button class="btn" data-action="next"><span>' + esc(pos === n ? t('finish') : t('next')) + '</span>' + icon(pos === n ? 'check' : 'arrow-right') + '</button>' +
      '</nav>';
    return html;
  }

  let lastQuery = '';

  async function viewSearch() {
    document.title = t('search') + ' · ' + t('appName');
    await getAllBooks();
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
    if (!lastQuery.trim()) {
      box.innerHTML = '<p class="muted">' + esc(t('typeToSearch')) + '</p>';
      return;
    }
    const res = runSearch(catalog.map(b => bookCache[b.id]).filter(Boolean), lastQuery);
    if (!res.books.length && !res.verses.length) {
      box.innerHTML = '<p class="muted">' + esc(t('noResults')) + '</p>';
      return;
    }
    let html = '';
    if (res.books.length) {
      html += '<h2>' + esc(t('resultsBooks')) + '</h2><ul class="rows">' +
        res.books.map(b => '<li><a class="row" href="#/book/' + b.id + '"><span class="row-main">' + titleHtml(b) +
          '<span class="row-sub">' + esc(L(b.author)) + '</span></span>' + icon('chevron-right', 'row-chev') + '</a></li>').join('') + '</ul>';
    }
    if (res.verses.length) {
      html += '<h2>' + esc(t('resultsText')) + '</h2><ul class="rows">' +
        res.verses.map(r => '<li><a class="row" href="#/read/' + r.book.id + '/' + r.v.pos + '"><span class="row-main">' +
          '<span class="row-verse" lang="' + (r.book.textLang || 'sa') + '">' + esc(firstLine(r.v)) + '</span>' +
          '<span class="row-sub"><span lang="hi">' + esc(r.book.title.hi) + '</span> · ' + esc(posLabel(r.book, r.v)) + '</span></span>' +
          icon('chevron-right', 'row-chev') + '</a></li>').join('') + '</ul>';
    }
    box.innerHTML = html;
  }

  async function viewSaved() {
    document.title = t('saved') + ' · ' + t('appName');
    let html = backBar('#/', t('home')) + '<main><h1>' + esc(t('saved')) + '</h1>';
    if (!state.bookmarks.length) return html + '<p class="muted">' + esc(t('noBookmarks')) + '</p></main>';
    await getAllBooks();
    const items = state.bookmarks.slice().reverse()
      .map(b => ({ b: b, book: bookCache[b.book] }))
      .filter(x => x.book && x.book.verses[x.b.pos - 1]);
    html += '<ul class="rows">' + items.map(x => {
      const v = x.book.verses[x.b.pos - 1];
      return '<li class="row-with-action"><a class="row" href="#/read/' + x.book.id + '/' + v.pos + '"><span class="row-main">' +
        '<span class="row-verse" lang="' + (x.book.textLang || 'sa') + '">' + esc(firstLine(v)) + '</span>' +
        '<span class="row-sub"><span lang="hi">' + esc(x.book.title.hi) + '</span> · ' + esc(posLabel(x.book, v)) + '</span></span></a>' +
        '<button class="btn btn-small" data-action="unsave" data-book="' + x.book.id + '" data-pos="' + v.pos + '">' + esc(t('remove')) + '</button></li>';
    }).join('') + '</ul>';
    return html + '</main>';
  }

  let installPrompt = null;

  function choice(action, current, options) {
    return '<div class="choice" role="group">' + options.map(o =>
      '<button class="btn" data-action="' + action + '" data-value="' + o.value + '" aria-pressed="' + (o.value === current) + '"' +
      (o.lang ? ' lang="' + o.lang + '"' : '') + '>' + (o.value === current ? icon('check') : '') + '<span>' + esc(o.label) + '</span></button>'
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
      '<p class="size-preview" lang="pra">' + esc(t('sizePreview')) + '</p>' +
      '<div class="choice"><button class="btn" data-action="font-down"><span lang="hi">अ</span>− <span>' + esc(t('smaller')) + '</span></button>' +
      '<button class="btn" data-action="font-up"><span lang="hi">अ</span>+ <span>' + esc(t('bigger')) + '</span></button></div></section>';
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
    const books = await getAllBooks();
    return backBar('#/settings', t('settings')) +
      '<main><h1>' + esc(t('credits')) + '</h1><p>' + esc(t('creditsIntro')) + '</p>' +
      '<h2>' + esc(t('textsHeading')) + '</h2>' +
      books.map(b => '<section class="panel"><h3 lang="hi">' + esc(b.title.hi) + '</h3><p class="muted">' + esc(L(b.author)) + '</p><p>' + esc(L(b.source)) + '</p></section>').join('') +
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

  async function render() {
    applySettings();
    const parts = routeParts();
    const view = state.lang ? (parts[0] || 'home') : 'welcome';
    if (view !== 'read') stopSpeech();
    const token = ++renderToken;
    const focusAction = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.action : null;
    const sameView = view === currentView;
    const loadingTimer = setTimeout(() => {
      if (token === renderToken) $app.innerHTML = '<main class="center"><p>' + esc(t('loading')) + '</p></main>';
    }, 300);
    let html;
    try {
      switch (view) {
        case 'welcome': html = viewWelcome(); break;
        case 'home': html = await viewHome(); break;
        case 'books': html = await viewBooks(); break;
        case 'book': html = await viewBook(parts[1]); break;
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
    afterRender(view, sameView, focusAction);
  }

  function afterRender(view, sameView, focusAction) {
    const again = focusAction && $app.querySelector('[data-action="' + focusAction + '"]');
    if (sameView && again) {
      again.focus({ preventScroll: true });
    } else {
      const h1 = $app.querySelector('h1');
      if (h1 && sameView === false && currentView !== 'welcome') {
        h1.setAttribute('tabindex', '-1');
        h1.focus({ preventScroll: true });
      }
    }
    if (!(view === 'settings' && sameView)) window.scrollTo(0, 0);
    if (view === 'search') {
      renderResults();
      const q = document.getElementById('q');
      if (q && !sameView) q.focus();
    }
    if (view === 'read' && speech.playing && ctx) {
      if (speech.bookId === ctx.book.id) speakVerse(ctx.book, ctx.v);
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
    const { book, v } = ctx;
    const target = v.pos + delta;
    if (target < 1) { go('book/' + book.id); return; }
    if (target > book.verses.length) {
      stopSpeech();
      toast(t('bookDone'));
      go('book/' + book.id);
      return;
    }
    go('read/' + book.id + '/' + target, true);
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
    'retry': () => render(),
    'prev': () => readerStep(-1),
    'next': () => readerStep(1),
    'bookmark': () => {
      if (!ctx) return;
      const { book, v } = ctx;
      const i = state.bookmarks.findIndex(b => b.book === book.id && b.pos === v.pos);
      if (i >= 0) { state.bookmarks.splice(i, 1); toast(t('removed')); }
      else { state.bookmarks.push({ book: book.id, pos: v.pos }); toast(t('savedDone')); }
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
        speakVerse(ctx.book, ctx.v);
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
      if (!(num >= 1 && num <= book.verses.length)) {
        err.textContent = t('badNumber', { n: book.verses.length });
        form.num.focus();
        return;
      }
      go('read/' + book.id + '/' + num);
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

  /* Reader: arrow keys and swipes move between verses. */
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
