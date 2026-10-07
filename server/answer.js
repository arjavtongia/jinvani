/*
 * Asks the model (NVIDIA's hosted API, OpenAI-compatible) to answer from the passages found,
 * and returns the answer with the passages it cites.
 */
const ENDPOINT = 'https://integrate.api.nvidia.com/v1/chat/completions';
/* Chosen after trying NVIDIA's models on Hindi questions: quick, and sound on doctrine. */
export const DEFAULT_MODEL = 'nvidia/nemotron-3-super-120b-a12b';

const SYSTEM = {
  en: `You answer questions about Jain dharma inside Swadhyay, an app of Digambar Jain scriptures, poojas and stories.
Rules:
- Answer from the numbered passages below, which come from the app's texts. Put the passage number in square brackets, like [2], after each sentence it supports. The reader cannot see the passages: never write "passage", "the passages" or "the provided text"; name the book instead when it helps.
- If the passages do not answer the question, you may give the widely accepted basic Jain teaching in one or two sentences, and say that it is not from the app's texts. If you are not sure, say so and suggest asking a learned person at the temple. Never invent verses, verse numbers, dates or quotations.
- Follow the Digambar tradition of these texts. Where Digambar and Shvetambar practice differ, say so briefly.
- Be respectful and simple, in plain English, in at most 160 words. No headings, no lists unless the question asks for one.
- Only answer questions about Jain dharma, its practice, texts, history and festivals. For anything else, say politely that you can only help with Jain dharma.`,
  hi: `आप स्वाध्याय ऐप के भीतर जैन धर्म के प्रश्नों का उत्तर देते हैं। यह ऐप दिगम्बर जैन ग्रंथों, पूजाओं और कथाओं का है।
नियम:
- नीचे दिए गए क्रमांकित अंशों (ऐप के ग्रंथों से) के आधार पर उत्तर दें। हर वाक्य के बाद, जिस अंश से वह लिया गया है उसका क्रमांक कोष्ठक में लिखें, जैसे [2]। पाठक अंशों को नहीं देख सकता: 'अंश', 'दिए गए अंश' जैसे शब्द न लिखें; ज़रूरत हो तो ग्रंथ का नाम लें।
- अगर अंशों में उत्तर न हो, तो सर्वमान्य मूल जैन सिद्धांत एक-दो वाक्यों में बता सकते हैं, पर साफ़ कहें कि यह ऐप के ग्रंथों से नहीं है। संदेह हो तो कहें, और मंदिर में किसी विद्वान से पूछने का सुझाव दें। कोई श्लोक, क्रमांक, तिथि या उद्धरण अपनी ओर से न गढ़ें।
- इन ग्रंथों की दिगम्बर परम्परा का पालन करें। जहाँ दिगम्बर और श्वेताम्बर मान्यता अलग हो, वहाँ संक्षेप में बताएँ।
- पूरा उत्तर विनम्र और सरल हिंदी (देवनागरी) में, अधिक से अधिक 160 शब्दों में दें; अंग्रेज़ी वाक्य न जोड़ें। शीर्षक न लगाएँ; सूची तभी जब प्रश्न में माँगी गई हो।
- केवल जैन धर्म, उसके आचरण, ग्रंथों, इतिहास और पर्वों के प्रश्नों का उत्तर दें। दूसरे विषयों पर विनम्रता से कहें कि आप केवल जैन धर्म में सहायता कर सकते हैं।`
};

export async function answer(question, lang, passages, env) {
  const context = passages.map((p, i) => '[' + (i + 1) + '] ' + p.title.hi + ' (' + p.title.en + ')' + (p.author ? ', by ' + p.author : '') + ', part ' + p.pos + ':\n' + p.text).join('\n\n');
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + env.NVIDIA_API_KEY, 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      model: env.MODEL || DEFAULT_MODEL,
      temperature: 0.1,
      top_p: 0.9,
      max_tokens: 1400,
      stream: false,
      messages: [
        { role: 'system', content: SYSTEM[lang === 'hi' ? 'hi' : 'en'] },
        { role: 'user', content: (context ? 'Passages:\n\n' + context + '\n\n' : 'No passages were found in the app\'s texts.\n\n') + 'Question: ' + question }
      ]
    })
  });
  if (!res.ok) throw new Error('model ' + res.status + ' ' + (await res.text()).slice(0, 300));
  const data = await res.json();
  /* Some models write citations as 【2】 or ［2］; make them [2]. */
  let text = ((data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '')
    .replace(/[【［]\s*(\d+)\s*[】］]/g, '[$1]').trim();
  /* If the model ran out of room, end at the last full sentence rather than mid-word. */
  if (data.choices && data.choices[0] && data.choices[0].finish_reason === 'length') {
    const cut = Math.max(text.lastIndexOf('।'), text.lastIndexOf('. '), text.lastIndexOf('.\n'));
    if (cut > 40) text = text.slice(0, cut + 1);
  }
  /* Keep only the passages the answer cites, renumbered in the order they first appear. */
  const order = [];
  text.replace(/\[(\d+)\]/g, (m, n) => { const i = +n - 1; if (passages[i] && order.indexOf(i) < 0) order.push(i); return m; });
  const renum = text.replace(/\[(\d+)\]/g, (m, n) => { const at = order.indexOf(+n - 1); return at < 0 ? '' : '[' + (at + 1) + ']'; })
    .replace(/[ \t]+([.,।!?])/g, '$1');
  return {
    answer: renum,
    sources: order.map(i => ({ book: passages[i].book, pos: passages[i].pos, title: passages[i].title })),
    model: env.MODEL || DEFAULT_MODEL
  };
}
