import { NextRequest, NextResponse } from 'next/server';
import { YouTubeVideoData } from '@/lib/youtube';
import { AIRescriptResult, AIHookEnhancement } from '@/lib/types';

export const runtime = 'nodejs';

const GEMINI_MODEL = 'gemini-3.6-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action: string = body?.action;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Missing action field.', code: 'MISSING_ACTION' },
        { status: 400 }
      );
    }

    const geminiKey = process.env.GEMINI_API_KEY;

    if (action === 'rescript') {
      const video: YouTubeVideoData | undefined = body?.video;
      if (!video) {
        return NextResponse.json(
          { success: false, error: 'Missing video data for rescript.', code: 'MISSING_VIDEO' },
          { status: 400 }
        );
      }

      const result = geminiKey
        ? await generateRescriptAI(video, geminiKey)
        : null;

      return NextResponse.json({
        success: true,
        data: result ?? generateRescriptFallback(video),
        aiPowered: !!result,
      });
    }

    if (action === 'enhance-hook') {
      const script: string | undefined = body?.script;
      if (!script) {
        return NextResponse.json(
          { success: false, error: 'Missing script for hook enhancement.', code: 'MISSING_SCRIPT' },
          { status: 400 }
        );
      }

      const result = geminiKey
        ? await enhanceHookAI(script, geminiKey)
        : null;

      return NextResponse.json({
        success: true,
        data: result ?? enhanceHookFallback(script),
        aiPowered: !!result,
      });
    }

    return NextResponse.json(
      { success: false, error: `Unknown action: ${action}`, code: 'UNKNOWN_ACTION' },
      { status: 400 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      { success: false, error: message, code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}

// ---------- Real Gemini calls ----------

async function callGemini(prompt: string, apiKey: string, schema: object): Promise<any | null> {
  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.9,
        },
      }),
      // Gemini free tier can be slow under load; give it real time before falling back.
      signal: AbortSignal.timeout(25000),
    });

    if (!res.ok) {
      console.error('Gemini API error', res.status, await res.text());
      return null;
    }

    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    return JSON.parse(text);
  } catch (err) {
    console.error('Gemini call failed', err);
    return null;
  }
}

async function generateRescriptAI(
  video: YouTubeVideoData,
  apiKey: string
): Promise<AIRescriptResult | null> {
  const prompt = `You are a YouTube SEO and scriptwriting strategist. A creator wants to out-rank this competitor video with their own upgraded version.

COMPETITOR VIDEO DATA:
Title: ${video.title}
Description: ${video.description.slice(0, 1500)}
Tags: ${video.tags.join(', ')}
Category: ${video.category}
Views: ${video.viewCount}
Duration: ${video.duration}

Produce an upgraded version that is genuinely more compelling and better optimized than the original — not a generic template. Base your suggestions on the SPECIFIC subject matter, tags, and angle of this exact video.

Return JSON with:
- optimizedTitle: a stronger, curiosity-driving title under 70 characters, specific to this video's actual topic
- optimizedDescription: a full YouTube description (250+ chars) with a hook opener, key takeaways, timestamps placeholder, and relevant hashtags — specific to this topic
- optimizedTags: 15-20 tags, mixing the original's best tags with new relevant long-tail variants
- hookScript: a 60-90 word spoken opening hook for the video, specific to the topic, written to be read aloud
- structureNotes: 5-7 concrete structural/pacing suggestions specific to this content
- seoImprovements: 4-6 specific, actionable SEO fixes referencing the actual title/tags/description above`;

  const schema = {
    type: 'object',
    properties: {
      optimizedTitle: { type: 'string' },
      optimizedDescription: { type: 'string' },
      optimizedTags: { type: 'array', items: { type: 'string' } },
      hookScript: { type: 'string' },
      structureNotes: { type: 'array', items: { type: 'string' } },
      seoImprovements: { type: 'array', items: { type: 'string' } },
    },
    required: [
      'optimizedTitle',
      'optimizedDescription',
      'optimizedTags',
      'hookScript',
      'structureNotes',
      'seoImprovements',
    ],
  };

  const result = await callGemini(prompt, apiKey, schema);
  if (!result) return null;

  return {
    optimizedTitle: String(result.optimizedTitle ?? ''),
    optimizedDescription: String(result.optimizedDescription ?? ''),
    optimizedTags: Array.isArray(result.optimizedTags) ? result.optimizedTags.slice(0, 20) : [],
    hookScript: String(result.hookScript ?? ''),
    structureNotes: Array.isArray(result.structureNotes) ? result.structureNotes : [],
    seoImprovements: Array.isArray(result.seoImprovements) ? result.seoImprovements : [],
  };
}

async function enhanceHookAI(script: string, apiKey: string): Promise<AIHookEnhancement | null> {
  const prompt = `You are a YouTube retention expert. Rewrite the opening hook of this script to maximize watch-time retention in the first 15 seconds.

ORIGINAL SCRIPT (or opening):
${script.slice(0, 2000)}

Return JSON with:
- enhancedHook: a rewritten 40-80 word hook specific to this script's actual content — use a pattern interrupt, build curiosity or stakes, and avoid generic filler
- curiosityScore: 0-100, how strong the curiosity gap is
- emotionalScore: 0-100, how strong the emotional pull is
- patternInterruptScore: 0-100, how effectively it breaks scrolling/skipping behavior
- reasoning: 2-3 sentences explaining specifically why this hook works for THIS content, not a generic explanation`;

  const schema = {
    type: 'object',
    properties: {
      enhancedHook: { type: 'string' },
      curiosityScore: { type: 'number' },
      emotionalScore: { type: 'number' },
      patternInterruptScore: { type: 'number' },
      reasoning: { type: 'string' },
    },
    required: ['enhancedHook', 'curiosityScore', 'emotionalScore', 'patternInterruptScore', 'reasoning'],
  };

  const result = await callGemini(prompt, apiKey, schema);
  if (!result) return null;

  return {
    enhancedHook: String(result.enhancedHook ?? ''),
    curiosityScore: Number(result.curiosityScore ?? 0),
    emotionalScore: Number(result.emotionalScore ?? 0),
    patternInterruptScore: Number(result.patternInterruptScore ?? 0),
    reasoning: String(result.reasoning ?? ''),
  };
}

// ---------- Fallback templates (used only if no API key or Gemini call fails) ----------

function generateRescriptFallback(video: YouTubeVideoData): AIRescriptResult {
  const optimizedTitle = `${video.title.split(' ').slice(0, 6).join(' ')} | The Ultimate Guide Nobody Shared`;
  const optimizedDescription = `${video.description.split('\n')[0]}\n\nIn this deep dive, we go beyond surface-level advice and break down the exact framework, tools, and mindset needed to succeed. Whether you are a beginner or already experienced, this video will give you actionable steps you can apply today.\n\nKey Takeaways:\n- The hidden strategy top creators use\n- Step-by-step breakdown with real examples\n- Tools and resources for immediate implementation\n- Common mistakes to avoid\n\nTimestamps:\n0:00 The Hook\n1:30 The Problem\n4:15 The Solution\n8:00 Real Results\n11:20 Action Plan\n\n${video.tags.map((t) => `#${t.replace(/\s+/g, '')}`).join(' ')}`;

  const optimizedTags = [
    ...video.tags,
    'how to', 'tutorial', 'step by step', 'guide', 'explained',
    'for beginners', '2025', 'tips', 'secrets', 'mistakes to avoid',
  ].slice(0, 20);

  const hookScript = `Wait — before you scroll past this, let me tell you something that took me years to figure out.\n\nEveryone talks about ${video.tags[0] || 'this topic'}, but almost nobody mentions the one thing that actually matters. And once you understand it, everything changes.\n\nIn the next ${video.duration?.replace('PT', '').replace('M', ' minutes').replace('S', ' seconds') || '12 minutes'}, I'm going to break down exactly what that is, how it works, and how you can use it starting today. Let's go.`;

  const structureNotes = [
    'Open with a pattern interrupt question that creates a curiosity gap',
    'Introduce the problem within the first 15 seconds',
    'Use a personal anecdote to build emotional connection',
    'Include a visual demonstration or screen recording every 60 seconds',
    'Add a mid-video pattern interrupt to reset attention',
    'Close with a clear call-to-action and next-step recommendation',
    'Insert card and end-screen prompts in the final 30 seconds',
  ];

  const seoImprovements = [
    `Move primary keyword "${video.tags[0] || 'your main keyword'}" into the first 100 characters of the description`,
    'Add timestamps with keyword-rich labels to improve Google search snippets',
    'Increase tag count to 15-20 for broader discoverability',
    'Add 3-5 long-tail keyword variations (e.g., "how to [keyword] for beginners")',
    'Include a 2-3 sentence summary at the top of the description for preview text',
    'Add relevant links and social media in a dedicated section below the fold',
  ];

  return {
    optimizedTitle,
    optimizedDescription,
    optimizedTags,
    hookScript,
    structureNotes,
    seoImprovements,
  };
}

function enhanceHookFallback(script: string): AIHookEnhancement {
  const firstLine = script.split(/[.!?\n]/)[0] || script.substring(0, 100);

  const enhancedHook = `Stop. If you're watching this, you're probably struggling with ${firstLine.toLowerCase().replace(/^(i|we|you)\s+/, '')} — and I get it. I was there too. But what I'm about to show you changes everything, and it's not what you think.\n\nHere's the thing nobody tells you...`;

  return {
    enhancedHook,
    curiosityScore: 87,
    emotionalScore: 78,
    patternInterruptScore: 92,
    reasoning:
      'The enhanced hook uses a pattern interrupt ("Stop") followed by empathy-based emotional connection, then creates a curiosity gap with "nobody tells you" phrasing. The open loop at the end forces the viewer to keep watching.',
  };
}
