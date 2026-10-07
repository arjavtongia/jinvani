# जिनवाणी · Jinvani

Jain scriptures, pooja and temple guides, and a Jain tithi calendar, in clear, easy-to-read Hindi and English. For everyone, with large text that also suits elders.

**Open the app:** https://arjavtongia.github.io/jinvani/

## What it does

- Choose Hindi or English on first launch, and switch any time from the home screen or Settings.
- Today's date and Jain tithi on the home screen; tap it for the next 7 days, with अष्टमी, चतुर्दशी and festivals marked. In the week before Diwali, a card on the home screen opens the Diwali pooja. Calculated on the phone (sunrise in Delhi, purnimanta months).
- मंदिर दर्शन विधि and पूजा विधि: step-by-step temple and ashta-dravya pooja guides with every mantra and drawings (thali, ठौना with three cloves, swastik, pradakshina).
- "चित्र से समझें": diagrams that explain the meaning of key sutras and verses.
- One verse per screen, with big "पीछे / आगे" (Previous / Next) buttons; short sutras are grouped five or six to a screen. Swipes and arrow keys work too.
- Poojas and short paath (Deepawali poojas, Namokar, Darshan Path, Darshan Stuti, Barah Bhavana) scroll as one page each, so they can be recited without tapping Next.
- Remembers where you stopped, and shows "पढ़ना जारी रखें" (Continue reading) on the home screen.
- A bar at the bottom of every screen goes to Home, Books, Search and Settings; the reader keeps its own bar with Previous, Listen and Next.
- Large text by default, with a six-step text size setting, plus day and night colours or "same as phone".
- "साझा करें" (Share) sends the verse on screen to WhatsApp or a message, or copies it where sharing isn't available.
- "सुनें" (Listen) reads each verse aloud in a Hindi voice and moves to the next one automatically.
- Search accepts Hindi or English spellings: भक्तामर, bhaktamar, तत्वार्थ, tattvarth.
- Save verses, show Roman script, and lock settings so they aren't changed by mistake.
- Works offline once opened, and can be added to the phone's home screen.

## Texts included

| Book | Text |
| --- | --- |
| णमोकार मंत्र एवं मंगल पाठ | Prakrit original, with Hindi and English meanings |
| दर्शन पाठ | Sanskrit, 13 verses |
| दर्शन स्तुति — प्रभु पतित पावन | Pt. Budhjan, 8 stanzas (Hindi) |
| भक्तामर स्तोत्र | Sanskrit original, Digambar tradition, 48 verses |
| बारह भावना | Pt. Bhudhardas, 13 dohas |
| तत्त्वार्थसूत्र | Sanskrit original, Digambar recension, 10 chapters, 357 sutras, with 20 explanatory diagrams |
| मंदिर दर्शन विधि | Temple visit guide, 14 steps (Hindi and English) |
| पूजा विधि | Ashta-dravya pooja guide, 15 steps (Hindi and English) |
| दीपावली पूजन विधि | Diwali pooja at home and on the new bahi: setup steps (Hindi and English), arghyavali, Shri Mahavir Jin Pooja (Vrindavan), Saraswati Pooja (Dyanatray), Nirvan Kand (Bhagwatidas), 64 riddhi arghyas, visarjan and aarti |

Sources are listed in the app under Settings → आभार (Credits).

## Fixing or adding text

All texts are plain text files in [`content/`](content/). You can edit them directly on GitHub. See [`content/README.md`](content/README.md) for the format.

## Running it on your computer

There's no build step. Serve the folder with any static web server:

```bash
python -m http.server 8765
```

Then open http://localhost:8765.

## Files

| Path | What it holds |
| --- | --- |
| `index.html` | The page that loads the app |
| `js/app.js` | Screens, reader, search, read-aloud, settings |
| `js/strings.js` | Every word shown in the app, in Hindi and English |
| `js/translit.js` | Devanagari to Roman letters |
| `js/panchang.js` | Tithi calculation (sun and moon positions, sunrise) |
| `js/drawings.js` | Drawings for the temple and pooja guides |
| `js/icons.js` | Icons (Tabler Icons, MIT) |
| `css/app.css` | Styles, including day and night colours |
| `content/` | Book list (`books.json`) and the texts |
| `sw.js` | Offline support |
| `tools/make_icons.py` | Redraws the app icons |

To add another language, add a block to `js/strings.js` and the language to `LANGS` at the top of that file.

## License

- App code: MIT License (see [LICENSE](LICENSE)).
- Texts in `content/`: CC BY-SA 4.0. The original scriptures are centuries old; the transcriptions were checked against [Sanskrit Wikisource](https://sa.wikisource.org/), which is CC BY-SA 4.0.
- Font: Noto Serif Devanagari, SIL Open Font License (see `fonts/OFL.txt`).
- Icons: [Tabler Icons](https://tabler.io/icons), MIT License.
