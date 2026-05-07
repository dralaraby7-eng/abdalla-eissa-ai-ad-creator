// =====================================================
// Type Definitions - Abdalla Eissa AI Ad Creator Pro
// =====================================================

export type AIProvider = 'gemini' | 'openrouter';

export interface AIModel {
  id: string;          // exact API model name
  label: string;       // display label
  provider: AIProvider;
  description: string;
  visionCapable: boolean;
  isDefault?: boolean;
  badge?: string;      // optional badge: "NEW" | "PRO" | "FAST"
}

export type Tool =
  | 'home'
  | 'brand-dna'
  | 'storyboard'
  | 'ad-script'
  | 'sound-effects'
  | 'extractor'
  | 'admin';

export type Theme = 'dark' | 'light';
export type Direction = 'ltr' | 'rtl';
export type FontSize = 'normal' | 'large';

export interface BrandDNA {
  productName: string;
  productCategory: string;
  brandColors: string[];
  feel: string;       // luxury, fun, eco, sporty, tech...
  audience: string;
  keyFeatures: string;
  style: string;
  videoIdeas: VideoIdea[];
}

export interface VideoIdea {
  title: string;
  hook: string;            // attention-grabbing 1-liner
  description: string;
  duration: string;        // "15s" | "30s" | "60s"
  videoStyle: string;
  emotionalTrigger: string;
  callToAction: string;
  prompts?: StoryboardPrompt[]; // populated by storyboard generator
}

export interface StoryboardPrompt {
  setNumber: number;       // 1 or 2
  prompt: string;          // full Nano Banana / GPT-Image prompt
  basePrompt?: string;
  frames?: string[];
  grid: string;            // "3x3" usually
}

export interface StoryboardRequest {
  imagesBase64?: string[];
  imageMimeTypes?: string[];
  backgroundImageBase64?: string;
  backgroundImageMimeType?: string;
  backgroundImageDescription?: string;
  backgroundColor?: string;
  backgroundColor2?: string;
  gradientType?: 'none' | 'linear' | 'radial';
  script?: string;
  brief?: string;
  videoStyle?: string;
  gridSelection?: string;
  orientation?: 'horizontal' | 'vertical' | 'square';
  isContinuation?: boolean;
  continuationFocus?: string;
  continuationImagesBase64?: string[];
  continuationImageMimeTypes?: string[];
  isRefinement?: boolean;
  refinementComment?: string;
  previousContext?: string;
  setNumber?: number;
  styleImageBase64?: string;
  styleImageMimeType?: string;
  // multi-model
  model?: string;          // model id
}

export interface AdScriptRequest {
  productImages?: string[];
  productImagesMime?: string[];
  clientBrief?: string;
  instructionsImages?: string[];
  instructionsImagesMime?: string[];
  socialMediaImages?: string[];
  socialMediaImagesMime?: string[];
  language: string;
  scriptType: string;
  videoDuration?: string;
  tone?: string;
  targetAudience?: string;
  model?: string;
}

export interface UsageStats {
  totalGenerations: number;
  brandDNARuns: number;
  storyboardRuns: number;
  scriptRuns: number;
  soundRuns: number;
  extractorRuns: number;
  lastUsed: string;        // ISO date
  monthlyResetDate: string;
  monthlyGenerations: number;
}

export interface AppSettings {
  theme: Theme;
  direction: Direction;
  fontSize: FontSize;
  defaultModel: string;
  defaultGrid: string;
  defaultOrientation: 'horizontal' | 'vertical' | 'square';
  defaultLanguage: string;
  monthlyLimit: number;     // 0 = unlimited
  requirePassword: boolean; // admin gate
  adminPasswordHash: string;
  customGeminiKey?: string;
  customOpenRouterKey?: string;
  watermark: boolean;
}

export interface User {
  id: string;
  name: string;
  pinHash: string;
  creditLimit: number; // 0 = unlimited
  creditsUsed: number;
  createdAt: string;
  lastUsed: string;
}

export interface UserSession {
  userId: string;
  name: string;
  loginTime: string;
}
