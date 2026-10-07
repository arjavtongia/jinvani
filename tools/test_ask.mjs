/*
 * Tries questions against the local index, and against NVIDIA when NVIDIA_API_KEY is set.
 *   node tools/test_ask.mjs "रत्नत्रय क्या है?" "Why do Jains not eat after sunset?"
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { retrieve } from '../server/retrieve.js';
import { answer } from '../server/answer.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cache = new Map();
const load = async p => {
  if (!cache.has(p)) cache.set(p, JSON.parse(fs.readFileSync(path.join(ROOT, 'ask-index', p), 'utf8')));
  return cache.get(p);
};

const questions = process.argv.slice(2);
for (const q of questions) {
  const { keys, passages } = await retrieve(q, load);
  console.log('\n## ' + q + '\nkeys: ' + keys.join(' '));
  passages.forEach((p, i) => console.log('[' + (i + 1) + '] ' + p.title.hi + ' #' + p.pos + ': ' + p.text.slice(0, 140).replace(/\s+/g, ' ')));
  if (process.env.NVIDIA_API_KEY) {
    const out = await answer(q, /[ऀ-ॿ]/.test(q) ? 'hi' : 'en', passages, { NVIDIA_API_KEY: process.env.NVIDIA_API_KEY, MODEL: process.env.MODEL });
    console.log('\n' + out.answer + '\nsources: ' + out.sources.map(s => s.book + '#' + s.pos).join(', '));
  }
}
