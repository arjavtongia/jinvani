# जिनवाणी · Jinvani

Jain scriptures in large, easy-to-read text, made for elders.

**Open the app:** https://arjavtongia.github.io/jinvani/

## What it does

- Choose Hindi or English on first launch, and switch any time from the home screen or Settings.
- One verse per screen, with big "पीछे / आगे" (Previous / Next) buttons. Swipes and arrow keys work too.
- Remembers where you stopped, and shows "पढ़ना जारी रखें" (Continue reading) on the home screen.
- Large text by default, with a text size setting, plus day and night colours.
- "सुनें" (Listen) reads each verse aloud in a Hindi voice and moves to the next one automatically.
- Search accepts Hindi or English spellings: भक्तामर, bhaktamar, तत्वार्थ, tattvarth.
- Save verses, show Roman script, and lock settings so they aren't changed by mistake.
- Works offline once opened, and can be added to the phone's home screen.

## Texts included

| Book | Text |
| --- | --- |
| णमोकार मंत्र एवं मंगल पाठ | Prakrit original, with Hindi and English meanings |
| भक्तामर स्तोत्र | Sanskrit original, Digambar tradition, 48 verses |
| तत्त्वार्थसूत्र | Sanskrit original, Digambar recension, 10 chapters, 357 sutras |

Sources are listed in the app under Settings → आभार (Credits).

## Fixing or adding text

All texts are plain text files in [`content/`](content/). You can edit them directly on GitHub. See [`content/README.md`](content/README.md) for the format.

To report a mistake without editing, tap "पाठ में गलती? बताएँ" (Mistake in the text? Report it) under any verse. This opens a GitHub issue with the verse already filled in.

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
