# मदद करें · Help improve Swadhyay

जय जिनेन्द्र! स्वाध्याय के पाठ साधारण फ़ाइलें हैं, जिन्हें कोई भी सुधार सकता है। आपका हर सुधार सबके काम आता है।

Jai Jinendra! Swadhyay's texts are plain files that anyone can correct, and every correction helps everyone who reads them.

## पाठ में भूल · A mistake in a text

**सबसे आसान · The easiest way:** [भूल बताएँ · Report the mistake](https://github.com/arjavtongia/swadhyay/issues/new?template=text-correction.yml) with the book, the verse number shown at the top of the screen, what it says now and what it should say. A source (the book or publisher you checked against) helps the correction get made quickly.

**स्वयं सुधारें · Fix it yourself:**

1. Find the text in [`content/`](content/): daily paath and guides are at the top level, poojas in `content/pooja/`, granths in `content/granth/` and stories in `content/katha/`. Each book's file is named after its id in [`content/books.json`](content/books.json).
2. Open the file on GitHub and tap the pencil (✏️) to edit it.
3. Make the change, following the format in [`content/README.md`](content/README.md): one blank line between verses, no verse numbers typed by hand, and labels such as `अर्थ:` and `Meaning:` for the meanings.
4. Describe what you changed and why, and propose the change. It shows in the app a few minutes after it is merged.

Please keep to the Digambar tradition and recension of each text, and never "modernise" the original scripture; corrections should bring a text closer to its source.

## नया पाठ या सुविधा · A new text or feature

[Suggest it here](https://github.com/arjavtongia/swadhyay/issues/new?template=idea.yml). For a new pooja or paath, include where the text comes from, so it can be checked and credited.

## Code

Swadhyay is plain HTML, CSS and JavaScript with no build step.

```bash
python -m http.server 8765
```

Then open http://localhost:8765 and test on a phone-sized screen, in day and night colours, and at the largest text size.

- **Every word shown in the app** lives in `js/strings.js`, in Hindi and English. Add both.
- **Offline support:** when you add or remove a file that the app loads, add it to the `FILES` list in `sw.js` and change `VERSION`.
- **After adding or editing texts:** run `python tools/add_openings.py` (opening lines in the lists) and `node tools/build_ask_index.js` (the Ask search index), and commit what they change.
- **Design:** [`DESIGN.md`](DESIGN.md) describes the look ("inside the mandir": marble, brass and sindoor, large text, one clear action per screen). [`PRODUCT.md`](PRODUCT.md) describes who the app is for. New screens should follow both.
- **The Ask server** is in `server/`, with its own setup guide in [`server/README.md`](server/README.md).

## आभार · Credit

Texts from other sources are credited in the app under Settings → आभार (Credits) and in the README. If you add a text, add its source there too.
