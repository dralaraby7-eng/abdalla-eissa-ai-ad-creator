// =====================================================
// Brand DNA Analyzer
// Analyzes a product image and outputs:
//   1. Brand DNA (colors, feel, audience, theme)
//   2. N video ad ideas (with prompts) ready for storyboard.
// =====================================================
import { callAI } from './aiService';
import type { BrandDNA, VideoIdea } from '../types';
import { generateStoryboard, parseStoryboardResponse } from './storyboardService';

const BRAND_DNA_SYSTEM = `You are an Elite Creative Brand Strategist and AI Ad Creator.

Your task: receive a product image (and optional brief), then analyze the product's Brand DNA and propose multiple distinct video ad ideas.

You MUST output a single, valid JSON object (no markdown fences, no commentary, no preamble) with this exact shape:

{
  "productName": "string - inferred product name from image",
  "productCategory": "string - category like 'snack food', 'cosmetics', 'beverage', 'tech gadget'",
  "brandColors": ["#hex1", "#hex2", "#hex3"],
  "feel": "string - one of: luxury, fun, playful, eco, sporty, tech, minimal, bold, elegant, youthful",
  "audience": "string - target audience description (1 sentence)",
  "keyFeatures": "string - distinctive product features (bullet-style, comma separated)",
  "style": "string - overall visual theme description",
  "videoIdeas": [
    {
      "title": "string - punchy idea title (max 6 words)",
      "hook": "string - one-line attention-grabbing hook",
      "description": "string - 2-3 sentences describing the video concept",
      "duration": "string - one of '15s', '30s', '45s'",
      "videoStyle": "string - cinematic style (e.g. Luxury, Dynamic, Storyboard, Product Reveal)",
      "emotionalTrigger": "string - the emotion the ad evokes",
      "callToAction": "string - the closing CTA"
    }
  ]
}

CRITICAL RULES:
- Output ONLY the JSON object. NO markdown, NO triple backticks, NO commentary.
- Generate EXACTLY the number of video ideas requested by the user (default 3).
- Each idea MUST be DISTINCT in style, mood, and concept.
- brandColors must be hex codes inferred from the image (3-5 colors).
- Be specific and product-aware: reference visible details from the image.
- videoStyle should match what works best for that idea (Luxury, Sporty, Minimal, Storyboard, Product Reveal, 3D Macro, Dynamic, etc).`;

export interface BrandDNARequest {
  imagesBase64: string[];
  imageMimeTypes: string[];
  brief?: string;
  feel?: string;        // user override
  audience?: string;    // user override
  ideaCount?: number;   // default 3
  language?: string;    // 'English' | 'Arabic' | bilingual
  modelId?: string;
}

/**
 * Robust JSON extractor – handles models that wrap output in fences.
 */
function extractJSON(text: string): any {
  // Strip code fences
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');

  // Find first '{' and matching last '}'
  const first = cleaned.indexOf('{');
  const last = cleaned.lastIndexOf('}');
  if (first === -1 || last === -1) {
    throw new Error('No JSON object found in response.');
  }
  const jsonStr = cleaned.substring(first, last + 1);
  return JSON.parse(jsonStr);
}

export async function analyzeBrandDNA(req: BrandDNARequest): Promise<BrandDNA> {
  if (!req.imagesBase64 || req.imagesBase64.length === 0) {
    throw new Error('At least one product image is required for Brand DNA analysis.');
  }

  const ideaCount = req.ideaCount ?? 3;

  const parts: any[] = req.imagesBase64.map((data, i) => ({
    inlineData: { data, mimeType: req.imageMimeTypes[i] || 'image/jpeg' },
  }));

  let userText = `Analyze the attached product image(s) and produce the Brand DNA + ${ideaCount} distinct video ad ideas.`;

  if (req.brief) userText += `\n\nClient brief: "${req.brief}"`;
  if (req.feel && req.feel !== 'auto') userText += `\n\nDesired feel: ${req.feel}`;
  if (req.audience && req.audience !== 'auto')
    userText += `\n\nTarget audience: ${req.audience}`;
  if (req.language && req.language !== 'English')
    userText += `\n\nGenerate the textual content in ${req.language} (titles, hooks, descriptions). Keep the JSON keys in English.`;

  userText += `\n\nReturn ONLY the JSON object. No markdown, no commentary.`;

  parts.push({ text: userText });

  const response = await callAI({
    modelId: req.modelId || 'gemini-2.5-flash',
    systemInstruction: BRAND_DNA_SYSTEM,
    parts,
    temperature: 0.8,
    maxTokens: 4096,
  });

  const data = extractJSON(response.text);

  const brandDNA: BrandDNA = {
    productName: data.productName || 'Unknown Product',
    productCategory: data.productCategory || 'General',
    brandColors: Array.isArray(data.brandColors) ? data.brandColors : [],
    feel: data.feel || 'auto',
    audience: data.audience || '',
    keyFeatures: data.keyFeatures || '',
    style: data.style || '',
    videoIdeas: Array.isArray(data.videoIdeas)
      ? data.videoIdeas.map((idea: any): VideoIdea => ({
          title: idea.title || 'Untitled',
          hook: idea.hook || '',
          description: idea.description || '',
          duration: idea.duration || '30s',
          videoStyle: idea.videoStyle || 'Storyboard',
          emotionalTrigger: idea.emotionalTrigger || '',
          callToAction: idea.callToAction || '',
        }))
      : [],
  };

  return brandDNA;
}

/**
 * For a chosen video idea, generate the 2 storyboard prompts (Set 1 + Set 2)
 * for Nano Banana Pro / GPT-Image to render 3×3 grids.
 */
export async function generatePromptsForIdea(
  idea: VideoIdea,
  brandDNA: BrandDNA,
  imagesBase64: string[],
  imageMimeTypes: string[],
  modelId: string,
  gridSelection: string = '3x3',
  orientation: 'horizontal' | 'vertical' | 'square' = 'horizontal',
  brief?: string
): Promise<{ set1: string; set2: string; set1Parsed: any; set2Parsed: any }> {
  // Compose a brief that combines brand DNA + idea
  const enrichedBrief = `
Product: ${brandDNA.productName} (${brandDNA.productCategory})
Brand feel: ${brandDNA.feel}
Brand colors: ${brandDNA.brandColors.join(', ')}
Audience: ${brandDNA.audience}
Key features: ${brandDNA.keyFeatures}

VIDEO IDEA: ${idea.title}
HOOK: ${idea.hook}
CONCEPT: ${idea.description}
EMOTIONAL TRIGGER: ${idea.emotionalTrigger}
CALL TO ACTION: ${idea.callToAction}
DURATION: ${idea.duration}

${brief ? `Additional brief: ${brief}` : ''}
`.trim();

  // Set 1
  const set1Raw = await generateStoryboard({
    imagesBase64,
    imageMimeTypes,
    backgroundColor: brandDNA.brandColors[0] || 'Auto',
    backgroundColor2: brandDNA.brandColors[1] || '',
    gradientType: 'none',
    videoStyle: idea.videoStyle,
    brief: enrichedBrief,
    gridSelection,
    orientation,
    setNumber: 1,
    model: modelId,
  });

  const set1Parsed = parseStoryboardResponse(set1Raw);

  // Set 2 (continuation)
  const set2Raw = await generateStoryboard({
    imagesBase64,
    imageMimeTypes,
    backgroundColor: brandDNA.brandColors[0] || 'Auto',
    backgroundColor2: brandDNA.brandColors[1] || '',
    gradientType: 'none',
    videoStyle: idea.videoStyle,
    brief: enrichedBrief,
    gridSelection,
    orientation,
    isContinuation: true,
    previousContext: set1Parsed.prompt,
    setNumber: 2,
    model: modelId,
  });

  const set2Parsed = parseStoryboardResponse(set2Raw);

  return {
    set1: set1Parsed.prompt,
    set2: set2Parsed.prompt,
    set1Parsed,
    set2Parsed,
  };
}
