// =====================================================
// Ad Script Generation Service
// =====================================================
import { callAI, type AIPart } from './aiService';
import type { AdScriptRequest } from '../types';

const SCRIPT_SYSTEM = `You are an expert Ad Copywriter and Creative Director. Create compelling, high-converting voiceover scripts. Maintain brand consistency and professional tone. Output ONLY the voiceover script text - no production notes, no scene markings, just the spoken lines as a clean script.`;

export async function generateAdScript(req: AdScriptRequest): Promise<string> {
  const parts: AIPart[] = [];

  if (req.productImages && req.productImagesMime) {
    req.productImages.forEach((data, i) => {
      parts.push({ inlineData: { data, mimeType: req.productImagesMime![i] } });
    });
    parts.push({ text: 'PRODUCT IMAGES ABOVE' });
  }

  if (req.instructionsImages && req.instructionsImagesMime) {
    req.instructionsImages.forEach((data, i) => {
      parts.push({
        inlineData: { data, mimeType: req.instructionsImagesMime![i] },
      });
    });
    parts.push({ text: 'CLIENT INSTRUCTIONS SCREENSHOTS ABOVE' });
  }

  if (req.socialMediaImages && req.socialMediaImagesMime) {
    req.socialMediaImages.forEach((data, i) => {
      parts.push({
        inlineData: { data, mimeType: req.socialMediaImagesMime![i] },
      });
    });
    parts.push({ text: 'SOCIAL MEDIA PAGE SCREENSHOTS ABOVE' });
  }

  let prompt = `Generate a professional Voiceover Script based on the provided inputs.\n\n`;
  prompt += `Language: ${req.language}\n`;
  prompt += `Script Type: ${req.scriptType}\n`;
  if (req.videoDuration) prompt += `Video Duration: ${req.videoDuration} seconds\n`;
  if (req.tone) prompt += `Tone: ${req.tone}\n`;
  if (req.targetAudience) prompt += `Target Audience: ${req.targetAudience}\n`;
  if (req.clientBrief) prompt += `Client Brief/Script Input: "${req.clientBrief}"\n`;

  prompt += `\nCRITICAL: Output ONLY the spoken voiceover script (the words to be said). Do not include scene numbers, production notes, "VO:", "Scene 1", or any meta-text. Just the clean spoken lines.`;

  parts.push({ text: prompt });

  const response = await callAI({
    modelId: req.model || 'gemini-2.5-flash',
    systemInstruction: SCRIPT_SYSTEM,
    parts,
    temperature: 0.85,
    maxTokens: 2048,
  });

  return response.text || 'Failed to generate ad script.';
}
