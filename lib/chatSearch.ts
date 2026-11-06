/**
 * Tiny retrieval engine for the portfolio chatbots. It runs in the browser with no API and no LLM.
 *  - Each doc = a pre-written FAQ answer, or a snippet auto-built from the site's content (projects, issues, experience).
 *  - Ranking = BM25 over question + keywords (weighted) + answer, with light stemming and synonyms.
 *  - Below the confidence threshold there is no answer: the UI offers to send the question to Sathwik on WhatsApp.
 */
import type { ChatDoc } from './content';

const STOP = new Set(
  'a an the and or but of to in on for with at by from is are was were be been being am do does did you your yours u ur i me my we our it its this that these those what whats which who whom how why when where can could would should will shall may might have has had about tell please any some there their them they he she his her as so if then than just also really very main mainly primary primarily issue issues section folder page thing things stuff work works kind sort know'.split(
    ' '
  )
);

// map variants to one token so different wordings meet
const SYN: Record<string, string> = {
  colour: 'color', colours: 'color', colors: 'color', palette: 'color', shade: 'color', shades: 'color',
  favourite: 'favorite', fav: 'favorite', fave: 'favorite', like: 'favorite', love: 'favorite', prefer: 'favorite',
  specialise: 'specialize', specialisation: 'specialize', specialization: 'specialize', specialty: 'specialize', domain: 'specialize', expertise: 'specialize', focus: 'specialize', field: 'specialize',
  hire: 'hire', hiring: 'hire', commission: 'hire', freelance: 'hire', freelancing: 'hire', job: 'hire', jobs: 'hire', internship: 'hire', internships: 'hire', intern: 'hire', role: 'hire', roles: 'hire', opportunity: 'hire', available: 'hire', availability: 'hire',
  ui: 'uiux', ux: 'uiux', 'ui/ux': 'uiux', uiux: 'uiux',
  ai: 'ai', ml: 'ai', llm: 'ai', agent: 'agentic', agents: 'agentic', agentic: 'agentic',
  rag: 'rag', retrieval: 'rag',
  csl: 'csl', leader: 'csl', leadership: 'csl',
  software: 'tool', app: 'tool', apps: 'tool', tools: 'tool', tool: 'tool', use: 'tool',
  aesthetic: 'style', aesthetics: 'style', vibe: 'style', vibes: 'style', taste: 'style', style: 'style',
  proud: 'best', proudest: 'best', best: 'best', top: 'best', flagship: 'best',
  degree: 'study', ug: 'study', undergrad: 'study', btech: 'study', 'b.tech': 'study', course: 'study', branch: 'study', college: 'study', study: 'study', studying: 'study',
  contact: 'contact', reach: 'contact', email: 'contact', mail: 'contact', whatsapp: 'contact', phone: 'contact', number: 'contact',
  resume: 'resume', cv: 'resume',
};

function stem(w: string) {
  if (w.length > 5 && w.endsWith('ing')) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith('ed')) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
}

export function tokens(text: string): string[] {
  const raw = text
    .toLowerCase()
    .replace(/[’']/g, '')
    .match(/[a-z0-9./+#-]+/g);
  if (!raw) return [];
  const out: string[] = [];
  for (let w of raw) {
    w = w.replace(/^[.\-/]+|[.\-/]+$/g, '');
    if (!w || STOP.has(w)) continue;
    out.push(SYN[w] ?? stem(SYN[stem(w)] ?? w));
  }
  return out;
}

type Indexed = { doc: ChatDoc; tf: Map<string, number>; len: number; phrases: string[] };

export function buildIndex(docs: ChatDoc[]) {
  const items: Indexed[] = docs.map((doc) => {
    const tf = new Map<string, number>();
    const add = (t: string[], w: number) => t.forEach((x) => tf.set(x, (tf.get(x) ?? 0) + w));
    add(tokens(doc.question), doc.featured ? 3 : 2);
    add(tokens(doc.keywords.join(' ')), 2.5);
    add(tokens(doc.answer), 0.6);
    let len = 0;
    tf.forEach((v) => (len += v));
    return { doc, tf, len, phrases: [doc.question, ...doc.keywords].map((p) => p.toLowerCase().replace(/[?!.]+$/, '').trim()).filter((p) => p.length > 3) };
  });
  const N = items.length;
  const avg = items.reduce((n, d) => n + d.len, 0) / Math.max(1, N);
  const df = new Map<string, number>();
  items.forEach((d) => d.tf.forEach((_, t) => df.set(t, (df.get(t) ?? 0) + 1)));
  return { items, N, avg, df };
}

export type Hit = { doc: ChatDoc; score: number; confidence: number; coverage: number; phrase: boolean };

export function search(index: ReturnType<typeof buildIndex>, query: string, k = 3): Hit[] {
  const q = [...new Set(tokens(query))];
  if (!q.length) return [];
  const k1 = 1.4,
    b = 0.6;
  const lower = query.toLowerCase();
  const scored = index.items.map((d) => {
    let s = 0,
      matched = 0;
    for (const t of q) {
      const f = d.tf.get(t);
      if (!f) continue;
      matched++;
      const n = index.df.get(t) ?? 0;
      const idf = Math.log(1 + (index.N - n + 0.5) / (n + 0.5));
      s += (idf * (f * (k1 + 1))) / (f + k1 * (1 - b + (b * d.len) / index.avg));
    }
    // exact phrase bonus ("ui/ux", "crime scene", a project name…)
    // exact multi-word phrase ("crime scene", "tech stack", a full question…), matched on word boundaries
    let phrase = false;
    for (const p of d.phrases)
      if (/[\s/]/.test(p) && new RegExp(`(^|[^a-z0-9])${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`).test(lower)) {
        s += 2.5;
        phrase = true;
      }
    const coverage = matched / q.length;
    return { doc: d.doc, score: s * (0.5 + coverage), coverage, phrase };
  });
  scored.sort((a, b) => b.score - a.score);
  const top = scored[0]?.score ?? 0;
  return scored
    .filter((x) => x.score > 0)
    .slice(0, k)
    .map((x) => ({ doc: x.doc, score: x.score, coverage: x.coverage, phrase: x.phrase, confidence: Math.min(1, x.score / 7) * (0.6 + 0.4 * x.coverage) * (top ? x.score / top : 0) }));
}

/** answer only when the match is strong AND covers most of what was asked (or hits an exact phrase) */
export function isConfident(h: Hit | undefined) {
  return !!h && h.confidence >= CONFIDENT && (h.coverage >= 0.6 || h.phrase);
}

/** answer threshold: below this the bot hands the question to WhatsApp instead of guessing */
export const CONFIDENT = 0.34;
