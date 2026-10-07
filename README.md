# स्वाध्याय · Swadhyay

Jain scriptures, pooja and temple guides, and a Jain tithi calendar, in clear, easy-to-read Hindi and English. For everyone, with large text that also suits elders.

**Open the app:** https://arjavtongia.github.io/swadhyay/

## What it does

- Choose Hindi or English on first launch, and switch any time from the home screen or Settings.
- Today's tithi on the home screen, with the next 7 days under it: अष्टमी, चतुर्दशी and festivals carry a flag, and tapping a day shows its full tithi. In the week before Diwali, a card on the home screen opens the Diwali pooja. Calculated on the phone (sunrise in Delhi, purnimanta months).
- मंदिर दर्शन विधि and पूजा विधि: step-by-step temple and ashta-dravya pooja guides with every mantra and drawings (thali, ठौना with three cloves, swastik, pradakshina).
- "चित्र से समझें": diagrams that explain the meaning of key sutras and verses.
- प्रश्न पूछें (Ask): questions about Jain dharma, answered from the app's own texts with links to the verses. 38 common questions are answered on the phone, offline; new ones go to a small server that uses NVIDIA's model and caches every answer (see `server/README.md`).
- बच्चों की कहानियाँ (Children's stories): 8 short stories for young children in easy Hindi and English (ahimsa, filtered water, eating before sunset, truth, and four favourites retold simply), with bright pictures on every page and a lesson at the end. They live in `content/bal-katha/`, with pictures drawn in `js/kids.js`.
- जैन कथाएँ (Jain stories): 33 traditional stories, in five groups, with photos of the places where they happened, a short version in Hindi and English, and the lesson of each story. A different story is offered on the home screen every day.
- One verse per screen, with big "पीछे / आगे" (Previous / Next) buttons; short sutras are grouped five or six to a screen. Swipes and arrow keys work too.
- Poojas and short paath (Deepawali poojas, Namokar, Darshan Path, Darshan Stuti, Barah Bhavana) scroll as one page each, so they can be recited without tapping Next.
- Remembers where you stopped, and shows "पढ़ना जारी रखें" (Continue reading) on the home screen.
- A bar at the bottom of every screen goes to Home, Books, Search and Settings; the reader keeps its own bar with Previous, Listen and Next.
- Large text by default, with a six-step text size setting, plus day colours by default, night colours, or "same as phone".
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

### Jain stories (`content/katha/`, 33 stories)

The stories are listed in five groups:

| Group | Stories |
| --- | --- |
| तीर्थंकर और महापुरुष | Mahavir's childhood (his five names), Bharat and Bahubali, Akshay Tritiya, Neminath and Rajul, Parshvanath and Kamath, Sati Chandana: retold for this app in simple Hindi and English, with photos of Kundalpur, Shravanabelagola, Hastinapur, Girnar, Kashi, Shikharji and Pawapuri |
| आचार्यों की कथाएँ | Acharya Mantunga and the Bhaktamar, Shrutkevali Bhadrabahu, Samantabhadra, Akalank, Patrakesari |
| सम्यग्दर्शन के आठ अंग | Anjan Chor, Anantmati, Raja Uddayan, Revati Rani, Jinendrabhakt Seth, Varishen Muni, Vishnukumar Muni (Rakshabandhan), Vajrakumar Muni, with a diagram of all eight angas |
| व्रत, सत्य और अहिंसा | Yampal Chandal, Mrigsen the fisherman, the little fish Shalisikth, giving up food at night, Raja Vasu, Shribhuti, Neeli |
| मुनि, राजा और श्रेष्ठी | Mahamuni Sukumal and Seth Sudarshan (in chapters), Sukaushal Muni, Gajkumar Muni, Raja Shrenik, Charudatt, Raja Karkandu |

The stories that are not retold come from the Jain Database and the Aradhana Katha Kosh (Br. Nemidatta), in Hindi; each has a short version in Hindi and English and its lesson, written for this app. Photos are from Wikimedia Commons and are credited under each picture; stories without a photo have a drawn picture on their card.

### Poojas, paath and stotras (`content/pooja/`, 170 texts)

| Group | What's in it |
| --- | --- |
| पूजा से पहले | Abhishek path, prakshal vidhi, vinay path, mangalashtak, pooja prarambh, swasti mangal, darshan paths, abhishek bhajans |
| नित्य पूजाएँ | Dev-Shastra-Guru (5 versions), Siddh pooja (4), Navdevta, Panch Parmeshthi, Samuchchay, Chaubis Tirthankar, Bees Tirthankar, Simandhar, Bahubali, Ratnatray, Dashlakshan, Solahkaran, Saraswati, Panchmeru, Nandishwar, Nirvan Kshetra and more |
| तीर्थंकर पूजाएँ | A pooja for each of the 24 Tirthankars (Vrindavandas), plus other versions for Adinath, Padmaprabh, Vasupujya, Shantinath, Neminath, Parshvanath and Mahavir |
| पर्व पूजाएँ | Kshamavani, Akshay Tritiya, Deepawali, Rakshabandhan, Veer Shasan Jayanti, Shrut Panchami |
| अर्घ्य, शांति पाठ, विसर्जन | Arghyavali, maha arghya, Shanti path (Sanskrit and Hindi), Visarjan path |
| आरती और चालीसा | Panch Parmeshthi, Chandaprabhu, Parshvanath, Mahavir and Bahubali aartis; Adinath and Mahavir chalisa |
| पाठ, भावना और स्तुति | Meri Bhavana, Chhahdhala (Daulatram, with meaning; also Budhjan and Dyanatray), Samayik path (3), Alochana path, Barah Bhavana (2 more), Samadhimaran, Nirvan Kand, Vairagya Bhavana, Dukhharan Vinati, Apurva Avsar, Jain Shatak, Kundkund Shatak and more |
| स्तोत्र | Kalyan Mandir, Ekibhav, Vishapahar, Bhaktamar (with meaning, and two Hindi versions), Swayambhu, Mahavirashtak, Jin Sahasranam, Akalank, Gandharvalay, Mandalasa and more |

Poojas scroll as one page. Stotras and paath that have a meaning for every verse show one verse per screen.

### Granths (`content/granth/`, 54 books)

Grouped by anuyog: Samaysar, Pravachansar, Niyamsar, Panchastikay, Ashtapahud, Ratnakarand Shravakachar, Purusharthasiddhyupay, Gommatsar, Bhagavati Aradhana, Padmanandi Panchvinshatika, Gyanarnav, Apt Mimansa, Parikshamukh and many more, mostly with Hindi meaning. The puranas and charitras (Adipuran, Padmapuran, Uttarpuran, Mahavir Puran, Jambuswami, Sukumal and Sudarshan Charitra, Aradhana Katha Kosh, Samyaktva Kaumudi) are in Hindi prose, a screen at a time.

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
| `index.html` | The page that loads the app, and the opening screen (Bhagwan Mahavir, shown for 3 seconds; its animation is in `css/app.css`) |
| `js/app.js` | Screens, reader, search, read-aloud, settings |
| `js/strings.js` | Every word shown in the app, in Hindi and English |
| `js/translit.js` | Devanagari to Roman letters |
| `js/panchang.js` | Tithi calculation (sun and moon positions, sunrise) |
| `js/kids.js` | Bright pictures for the children's stories, built from a small kit of characters and scenery |
| `js/drawings.js` | Drawings for the temple and pooja guides |
| `js/ornaments.js` | The mandir's ornaments: chhatra, carved arch, flag, brass rules |
| `js/icons-swadhyay.js` | The app's own icon pack, built from `icons/ui/*.svg` by `tools/build_icons.py` |
| `js/icons.js` | Icons (Tabler Icons, MIT) |
| `css/app.css` | Styles, including day and night colours |
| `content/` | Book list (`books.json`) and the texts |
| `img/katha/` | Photos for the stories |
| `sw.js` | Offline support |
| `tools/make_icons.py` | Redraws the app icons |
| `js/ask.js`, `js/askkey.js` | The Ask screen's answers, and the word matching it shares with the server |
| `content/faq.json` | The common questions and their answers |
| `ask-index/` | Search index of every passage, for the Ask server (built by `tools/build_ask_index.js`) |
| `server/` | The Ask server (Cloudflare Worker + NVIDIA); setup in `server/README.md` |
| `tools/add_openings.py` | Writes each pooja's and path's opening line into `content/books.json` (run after adding or editing texts) |

To add another language, add a block to `js/strings.js` and the language to `LANGS` at the top of that file.

## License

- App code: MIT License (see [LICENSE](LICENSE)).
- Texts in `content/` (except the two folders below): CC BY-SA 4.0. The original scriptures are centuries old; the transcriptions were checked against [Sanskrit Wikisource](https://sa.wikisource.org/), which is CC BY-SA 4.0.
- Texts in `content/pooja/` and `content/granth/`: taken from the Jain Database, [nikkyjain.github.io](https://nikkyjain.github.io/), with the translators it credits. Its license is not stated; the texts are shared here with credit, for study and worship.
- Photos in `img/katha/`: from [Wikimedia Commons](https://commons.wikimedia.org/), public domain, CC0 or CC BY-SA; the photographer and license are shown under each photo in the app.
- Fonts: Vesper Libre (`fonts/OFL-vesperlibre.txt`), Hind (`fonts/OFL-hind.txt`) and Noto Serif Devanagari (`fonts/OFL.txt`), all under the SIL Open Font License.
- Icons: Swadhyay's own icon pack (`icons/ui/`), and [Tabler Icons](https://tabler.io/icons), MIT License, for the rest.
