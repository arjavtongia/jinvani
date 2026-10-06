# पाठ कैसे बदलें · How to edit the texts

हर ग्रंथ एक साधारण text फ़ाइल है। GitHub पर फ़ाइल खोलें, पेंसिल (✏️) का निशान दबाएँ, बदलाव करें और "Commit changes" दबाएँ। कुछ मिनट में ऐप में बदलाव दिखने लगेगा।

Each book is a plain text file. Open the file on GitHub, tap the pencil icon, make the change and tap "Commit changes". The app picks it up within a few minutes.

## नियम · Rules

```
# इस तरह की पंक्ति टिप्पणी है, ऐप में नहीं दिखती।
## प्रथम अध्याय | Chapter 1          ← नया अध्याय (हिंदी नाम | English name)

पहले श्लोक की पहली पंक्ति
पहले श्लोक की दूसरी पंक्ति
अर्थ: हिंदी अर्थ (चाहें तो)
Meaning: English meaning (optional)

दूसरा श्लोक…
```

- हर श्लोक या सूत्र के बीच **एक खाली पंक्ति** रखें। Leave **one blank line** between verses.
- श्लोक का नंबर न लिखें। ऐप अपने आप ॥ १ ॥, ॥ २ ॥ लगाता है। Don't type verse numbers; the app adds them.
- `##` वाली पंक्तियाँ तभी लिखें जब ग्रंथ में अध्याय हों। Use `##` lines only for books with chapters.

## नया ग्रंथ जोड़ना · Adding a new book

1. Add a new `.txt` file here, in the format above.
2. Add an entry to `books.json` with its `id`, `file`, `title`, `author`, `unit` and `source`. Copy an existing entry as a starting point. Add `sectionUnit` only if the book has chapters.
3. Add the file name to the `FILES` list in `sw.js` and change `VERSION` there (for example `jinvani-v2`), so it also works offline.

Only add texts that are free to share: old originals, or texts whose owner has given permission. Always fill in `source` so the book is credited on the Credits page.
