export interface HookAnalysis {
  curiosityGaps: { text: string; score: number }[];
  emotionalImpact: { text: string; score: number }[];
  patternInterrupts: { text: string; score: number }[];
  overallHookScore: number;
}

export interface PacingSegment {
  startWord: number;
  endWord: number;
  text: string;
  density: 'dense' | 'balanced' | 'sparse';
  wordsPerSecond: number;
}

export interface PacingResult {
  totalWords: number;
  estimatedDuration: number;
  segments: PacingSegment[];
  averageWPM: number;
}

export interface MonetizationFlag {
  term: string;
  context: string;
  severity: 'high' | 'medium' | 'low';
  suggestion: string;
}

export const SENSITIVE_PHRASES: Record<string, { severity: 'high' | 'medium' | 'low'; suggestion: string }> = {
  'kill': { severity: 'high', suggestion: 'Replace with "defeat" or "overcome" to avoid violence triggers.' },
  'murder': { severity: 'high', suggestion: 'Replace with "eliminate" or "remove" to avoid violence flags.' },
  'blood': { severity: 'medium', suggestion: 'Replace with "effort" or "sweat" to avoid mature content flags.' },
  'gun': { severity: 'high', suggestion: 'Remove firearm references to maintain brand safety.' },
  'weapon': { severity: 'high', suggestion: 'Reframe as "tool" to avoid dangerous action flags.' },
  'bomb': { severity: 'high', suggestion: 'Replace with "explosive growth" or similar non-violent phrasing.' },
  'drug': { severity: 'high', suggestion: 'Remove substance references for monetization compliance.' },
  'alcohol': { severity: 'medium', suggestion: 'Consider removing or contextualizing substance references.' },
  'nude': { severity: 'high', suggestion: 'Remove mature content references immediately.' },
  'sex': { severity: 'high', suggestion: 'Remove sexual content references for brand safety.' },
  'gamble': { severity: 'medium', suggestion: 'Reframe discussion of gambling to avoid policy issues.' },
  'hack': { severity: 'medium', suggestion: 'Clarify context as "life hack" or "tip" to avoid cybersecurity flags.' },
  'illegal': { severity: 'high', suggestion: 'Remove references to illegal activities.' },
  'steal': { severity: 'medium', suggestion: 'Replace with "borrow" or "adapt" to avoid theft connotations.' },
  'dangerous': { severity: 'medium', suggestion: 'Reframe as "challenging" to avoid dangerous action flags.' },
  'explosion': { severity: 'medium', suggestion: 'Replace with "rapid growth" to avoid violence flags.' },
  'attack': { severity: 'medium', suggestion: 'Replace with "approach" or "tackle" to avoid violence triggers.' },
  'fight': { severity: 'medium', suggestion: 'Replace with "compete" or "challenge" for brand safety.' },
  'death': { severity: 'medium', suggestion: 'Replace with "end" or "conclusion" to avoid mature flags.' },
  'suicide': { severity: 'high', suggestion: 'Remove self-harm references immediately for policy compliance.' },
};

const CURIOSITY_PHRASES = [
  'nobody tells you', 'secret', 'truth about', 'what happens', 'you won\'t believe',
  'hidden', 'nobody knows', 'the real reason', 'shocking', 'never knew',
  'unexpected', 'surprising', 'mind-blowing', 'nobody talks about',
];

const EMOTIONAL_PHRASES = [
  'amazing', 'incredible', 'life-changing', 'devastating', 'heartbreaking',
  'inspiring', 'unbelievable', 'powerful', 'emotional', 'transformed',
  'changed my life', 'breakthrough', 'struggle', 'overcome',
];

const PATTERN_INTERRUPT_PHRASES = [
  'but wait', 'stop', 'listen', 'here\'s the thing', 'suddenly',
  'plot twist', 'turns out', 'actually', 'wrong', 'mistake',
  'never', 'always', 'but here', 'now', 'imagine',
];

export function analyzeHook(script: string): HookAnalysis {
  const first150Words = script.split(/\s+/).slice(0, 150).join(' ');
  const sentences = first150Words.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const lowerScript = first150Words.toLowerCase();

  const curiosityGaps = sentences
    .filter((s) => CURIOSITY_PHRASES.some((p) => s.toLowerCase().includes(p)))
    .map((s) => ({
      text: s.trim(),
      score: Math.min(100, 60 + Math.floor(Math.random() * 40)),
    }));

  const emotionalImpact = sentences
    .filter((s) => EMOTIONAL_PHRASES.some((p) => s.toLowerCase().includes(p)))
    .map((s) => ({
      text: s.trim(),
      score: Math.min(100, 55 + Math.floor(Math.random() * 45)),
    }));

  const patternInterrupts = sentences
    .filter((s) => PATTERN_INTERRUPT_PHRASES.some((p) => s.toLowerCase().includes(p)))
    .map((s) => ({
      text: s.trim(),
      score: Math.min(100, 50 + Math.floor(Math.random() * 50)),
    }));

  const overallHookScore = Math.min(
    100,
    30 + curiosityGaps.length * 15 + emotionalImpact.length * 12 + patternInterrupts.length * 10
  );

  return { curiosityGaps, emotionalImpact, patternInterrupts, overallHookScore };
}

export function analyzePacing(script: string, targetWPM: number): PacingResult {
  const words = script.split(/\s+/).filter(Boolean);
  const totalWords = words.length;
  const estimatedDuration = totalWords / (targetWPM / 60);

  const segmentSize = Math.max(20, Math.floor(totalWords / 5));
  const segments: PacingSegment[] = [];

  for (let i = 0; i < totalWords; i += segmentSize) {
    const segmentWords = words.slice(i, i + segmentSize);
    const segmentText = segmentWords.join(' ');
    const wordsPerSecond = (segmentWords.length / (targetWPM / 60));

    let density: 'dense' | 'balanced' | 'sparse' = 'balanced';
    if (wordsPerSecond > 3) density = 'dense';
    else if (wordsPerSecond < 1.5) density = 'sparse';

    segments.push({
      startWord: i,
      endWord: Math.min(i + segmentSize, totalWords),
      text: segmentText,
      density,
      wordsPerSecond: Math.round(wordsPerSecond * 100) / 100,
    });
  }

  return { totalWords, estimatedDuration, segments, averageWPM: targetWPM };
}

export function auditMonetization(script: string): MonetizationFlag[] {
  const flags: MonetizationFlag[] = [];
  const lowerScript = script.toLowerCase();

  for (const [term, info] of Object.entries(SENSITIVE_PHRASES)) {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    const matches = script.match(regex);
    if (matches) {
      const contextStart = Math.max(0, lowerScript.indexOf(term) - 30);
      const contextEnd = Math.min(script.length, lowerScript.indexOf(term) + term.length + 30);
      flags.push({
        term,
        context: script.substring(contextStart, contextEnd).trim(),
        severity: info.severity,
        suggestion: info.suggestion,
      });
    }
  }

  return flags;
}

export function generateCommunityPosts(script: string): string[] {
  const sentences = script.split(/[.!?]+/).filter((s) => s.trim().length > 10);
  const takeaways: string[] = [];

  for (let i = 0; i < Math.min(3, sentences.length); i++) {
    const sentence = sentences[i].trim();
    const hooks = [
      `🔥 Key takeaway: ${sentence} What do you think? Drop a comment below! 👇`,
      `📊 Did you know? ${sentence} Full video linked below! 🎬`,
      `💡 Pro tip: ${sentence} Which one will you try first? Let me know! ⬇️`,
    ];
    takeaways.push(hooks[i % hooks.length]);
  }

  return takeaways;
}

export function constructMasterPrompt(script: string, duration: string, niche: string): string {
  const theme = script.split(/\s+/).slice(0, 20).join(' ');
  return `You are an expert YouTube scriptwriter and content strategist specializing in the ${niche} niche.

TASK: Create a fully optimized, high-retention YouTube script.

CONTEXT:
- Video Duration Target: ${duration}
- Target Niche: ${niche}
- Source Material / Theme: ${theme}...

REQUIREMENTS:
1. Open with a powerful 15-second hook that creates a curiosity gap
2. Include pattern interrupts every 45-60 seconds to maintain engagement
3. Use emotional storytelling techniques to build connection
4. Structure content with clear sections and visual cues
5. Include a strong call-to-action in the final 30 seconds
6. Optimize all spoken text for YouTube SEO and discoverability
7. Ensure 100% brand-safe language (no violence, mature, or dangerous content)
8. Add suggested B-roll descriptions and text overlay suggestions
9. Include timestamps for each section
10. Provide 5 optimized video title options at the end

OUTPUT FORMAT:
- Full script with [VISUAL] and [AUDIO] tags
- Section headers with timestamps
- 5 title options
- 10 recommended tags
- 150-word optimized description`;
}
