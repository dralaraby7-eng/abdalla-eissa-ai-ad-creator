// =====================================================
// Unified AI Service - Routes calls to correct provider
// Supports: Gemini (direct) + OpenRouter (Claude, GPT, etc.)
// Designed by Abdalla Eissa
// =====================================================
import { GoogleGenAI } from '@google/genai';
import { findModel, getDefaultModel } from '../config/models';
import { loadSettings, isAdminAuthed } from '../utils/storage';
import { getCurrentSession, checkUserCredits, incrementUserCredits } from '../utils/userStorage';

// ---------- KEY RESOLUTION ----------
function getGeminiKey(): string {
  const settings = loadSettings();
  return (
    settings.customGeminiKey?.trim() ||
    (process.env.GEMINI_API_KEY as string) ||
    ''
  );
}

function getOpenRouterKey(): string {
  const settings = loadSettings();
  return (
    settings.customOpenRouterKey?.trim() ||
    (process.env.OPENROUTER_API_KEY as string) ||
    ''
  );
}

export function hasGeminiKey(): boolean {
  return !!getGeminiKey();
}

export function hasOpenRouterKey(): boolean {
  return !!getOpenRouterKey();
}

// ---------- TYPES ----------
export interface AIPart {
  text?: string;
  inlineData?: { data: string; mimeType: string }; // base64 image
}

export interface AIRequest {
  modelId: string;
  systemInstruction?: string;
  parts: AIPart[];
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  text: string;
  modelUsed: string;
}

// ---------- DELAY ----------
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ---------- MAIN CALL ROUTER ----------
export async function callAI(req: AIRequest, retries = 3): Promise<AIResponse> {
  const model = findModel(req.modelId) || getDefaultModel();

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      if (model.provider === 'gemini') {
        return await callGemini(req, model.id);
      } else if (model.provider === 'openrouter') {
        return await callOpenRouter(req, model.id);
      }
      throw new Error(`Unknown provider for model ${model.id}`);
    } catch (error: any) {
      console.error(`AI attempt ${attempt} failed:`, error);

      const msg = error?.message || '';
      if (
        error?.status === 429 ||
        msg.includes('quota') ||
        msg.includes('429') ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('rate limit')
      ) {
        throw new Error(
          'API Rate Limit Reached. Please wait a minute and try again, or switch to a different model in the dropdown.'
        );
      }

      if (
        error?.status === 503 ||
        msg.includes('503') ||
        msg.includes('UNAVAILABLE') ||
        msg.includes('high demand')
      ) {
        if (attempt < retries) {
          await delay(4000 * attempt);
          continue;
        }
        throw new Error(
          'The model is experiencing high demand right now. Please try again in a moment, or switch to a different model.'
        );
      }

      if (msg.includes('API key') || msg.includes('401') || msg.includes('403')) {
        throw new Error(
          `Invalid or missing API key for ${model.provider === 'gemini' ? 'Gemini' : 'OpenRouter'}. Check your settings.`
        );
      }

      if (attempt === retries) {
        throw new Error(error.message || 'Failed after multiple attempts.');
      }
      await delay(1500 * attempt);
    }
  }

  throw new Error('Failed to call AI.');
}

// =====================================================
// GEMINI PROVIDER
// =====================================================
async function callGemini(req: AIRequest, modelId: string): Promise<AIResponse> {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new Error('Gemini API key is missing.');

  const ai = new GoogleGenAI({ apiKey });

  const parts = req.parts.map((p) => {
    if (p.text) return { text: p.text };
    if (p.inlineData)
      return {
        inlineData: {
          data: p.inlineData.data,
          mimeType: p.inlineData.mimeType,
        },
      };
    return { text: '' };
  });

  const response = await ai.models.generateContent({
    model: modelId,
    contents: { parts },
    config: {
      systemInstruction: req.systemInstruction,
      temperature: req.temperature ?? 0.7,
      maxOutputTokens: req.maxTokens ?? 4096,
    },
  });

  return {
    text: response.text || '',
    modelUsed: modelId,
  };
}

// =====================================================
// OPENROUTER PROVIDER (Claude, GPT, Llama, etc.)
// =====================================================
async function callOpenRouter(req: AIRequest, modelId: string): Promise<AIResponse> {
  // Check user session and credits before consuming API quota
  if (!isAdminAuthed()) {
    const session = getCurrentSession();
    if (!session) {
      throw new Error(
        'OpenRouter models require a subscription PIN. Please select the model again and enter your PIN.'
      );
    }
    const credits = checkUserCredits(session.userId);
    if (!credits.allowed) {
      throw new Error(
        `Credit limit reached (${credits.used}/${credits.limit} used). Please contact the admin to increase your limit.`
      );
    }
  }

  const apiKey = getOpenRouterKey();
  if (!apiKey) {
    throw new Error(
      'OpenRouter API key is missing. Add it in Settings → API Keys, or get one at openrouter.ai/keys'
    );
  }

  // Build OpenAI-compatible message format
  const messages: any[] = [];
  if (req.systemInstruction) {
    messages.push({ role: 'system', content: req.systemInstruction });
  }

  // Build user content - mix text + images
  const userContent: any[] = [];
  for (const p of req.parts) {
    if (p.text) {
      userContent.push({ type: 'text', text: p.text });
    } else if (p.inlineData) {
      // OpenRouter follows OpenAI format for images
      userContent.push({
        type: 'image_url',
        image_url: {
          url: `data:${p.inlineData.mimeType};base64,${p.inlineData.data}`,
        },
      });
    }
  }

  messages.push({
    role: 'user',
    content: userContent.length === 1 && userContent[0].type === 'text'
      ? userContent[0].text
      : userContent,
  });

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': (process.env.APP_URL as string) || 'https://abdalla-eissa.app',
      'X-Title': 'Abdalla Eissa AI Ad Creator Pro',
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      temperature: req.temperature ?? 0.7,
      max_tokens: req.maxTokens ?? 4096,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    let errMsg = `OpenRouter error ${res.status}`;
    try {
      const errJson = JSON.parse(errText);
      errMsg = errJson.error?.message || errMsg;
    } catch {
      errMsg = errText || errMsg;
    }
    const err: any = new Error(errMsg);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || '';

  // Handle case where content is array of parts (some models)
  let finalText = '';
  if (typeof text === 'string') {
    finalText = text;
  } else if (Array.isArray(text)) {
    finalText = text
      .map((c: any) => (typeof c === 'string' ? c : c.text || ''))
      .join('');
  }

  // Increment user credits after successful call (skip for admin sessions)
  if (!isAdminAuthed()) {
    const s = getCurrentSession();
    if (s) incrementUserCredits(s.userId);
  }

  return {
    text: finalText,
    modelUsed: modelId,
  };
}
