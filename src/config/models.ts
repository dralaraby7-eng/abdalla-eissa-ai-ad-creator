import type { AIModel } from '../types';

// =====================================================
// AI MODELS CATALOG
// Last verified: May 2026
// Add or remove models here freely.
// =====================================================

export const AI_MODELS: AIModel[] = [
  // ============ GEMINI (DIRECT) ============
  {
    id: 'gemini-2.5-flash',
    label: 'Gemini 2.5 Flash',
    provider: 'gemini',
    description: 'Fast & free tier-friendly. Great for storyboards.',
    visionCapable: true,
    isDefault: true,
    badge: 'FAST',
  },
  {
    id: 'google/gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    provider: 'openrouter',
    description: 'Higher quality reasoning. Better for brand DNA analysis.',
    visionCapable: true,
    badge: 'PRO',
  },
  {
    id: 'gemini-2.0-flash',
    label: 'Gemini 2.0 Flash',
    provider: 'gemini',
    description: 'Stable, balanced performance.',
    visionCapable: true,
  },

  // ============ CLAUDE (via OpenRouter) ============
  {
    id: 'anthropic/claude-opus-4.7',
    label: 'Claude Opus 4.7',
    provider: 'openrouter',
    description: 'Highest quality. Best for deep brand analysis & creative scripts.',
    visionCapable: true,
    badge: 'TOP',
  },
  {
    id: 'anthropic/claude-sonnet-4.6',
    label: 'Claude Sonnet 4.6',
    provider: 'openrouter',
    description: 'Excellent balance of speed and quality.',
    visionCapable: true,
    badge: 'NEW',
  },
  {
    id: 'anthropic/claude-haiku-4.5',
    label: 'Claude Haiku 4.5',
    provider: 'openrouter',
    description: 'Very fast and cost-effective.',
    visionCapable: true,
    badge: 'FAST',
  },

  // ============ OPENAI (via OpenRouter) ============
  {
    id: 'openai/gpt-5',
    label: 'GPT-5',
    provider: 'openrouter',
    description: 'OpenAI flagship. Excellent creative writing.',
    visionCapable: true,
    badge: 'TOP',
  },
  {
    id: 'openai/gpt-4o',
    label: 'GPT-4o',
    provider: 'openrouter',
    description: 'Strong multimodal performance.',
    visionCapable: true,
  },
  {
    id: 'openai/gpt-4o-mini',
    label: 'GPT-4o Mini',
    provider: 'openrouter',
    description: 'Fast & affordable OpenAI option.',
    visionCapable: true,
    badge: 'FAST',
  },

  // ============ OTHER (via OpenRouter) ============
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    label: 'Llama 3.3 70B',
    provider: 'openrouter',
    description: 'Open-source alternative. Text-only.',
    visionCapable: false,
  },
];

// Helper: find a model by id
export function findModel(id: string): AIModel | undefined {
  return AI_MODELS.find((m) => m.id === id);
}

// Helper: get default model
export function getDefaultModel(): AIModel {
  return AI_MODELS.find((m) => m.isDefault) || AI_MODELS[0];
}

// Helper: filter models by provider availability (which key is set)
export function getAvailableModels(
  hasGemini: boolean,
  hasOpenRouter: boolean
): AIModel[] {
  return AI_MODELS.filter((m) => {
    if (m.provider === 'gemini') return hasGemini;
    if (m.provider === 'openrouter') return hasOpenRouter;
    return false;
  });
}
