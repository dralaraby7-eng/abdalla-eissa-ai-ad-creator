// =====================================================
// Storyboard Generation Service
// =====================================================
import { callAI, type AIPart } from './aiService';
import type { StoryboardRequest } from '../types';

const STORYBOARD_SYSTEM = `You are an AI Creative Director and Storyboard Generator for high-end cinematic product visuals.

The user will upload a product image. Your job is to output:
1. A single, cohesive prompt for an image generator (Nano Banana Pro / GPT-Image / Imagen) to create a grid storyboard.

VIDEO STYLE PREDICTION:
- If the user provides a "Video Style", use it as the primary aesthetic guide.
- If "Video Style" is NOT provided, analyze the product image and predict the most suitable style from: "Simple/Minimalist", "3D Explanatory/Technical", "Luxury/High-End", "Dynamic/Action", "3d angles", "storyboard", or "product reveal".
- "3d angles" style: Focus on perfect, varied angles of the product. Include a complete variety of shots from extreme macro to worm's-eye view, and any other creative angles that fit a cinematic sequence.
- "storyboard" style: Create a progressive sequence. Start with the product appearing from "nowhere" (empty space, particle formation, or light rays) and transition into a full 3D cinematic product reveal. The sequence should feel like a narrative unveiling from frame 1 to the final frame.
- "product reveal" style: Focus on the high-impact unveiling of the product. Use dramatic lighting, slow-motion reveals of key features, and cinematic camera movements to build anticipation and showcase the product as a hero.
- Incorporate the chosen style into the [STORYBOARD_PROMPT] and frame descriptions.

OUTPUT STRUCTURE:
[STORYBOARD_PROMPT]:
Create a [Grid Size] grid of [Product Name], background color [Color/Image Description].
[Product Description]
Ultra high-end commercial product photography
Extreme sharpness and texture clarity
Clean geometry composition
Hyper-realistic 3D render style
Premium advertising look
All frames must have the same look and feel, and all frames should have the same background color.
Make sure that all scenes are shot inside a studio with the same setup.
استخدم نفس تفاصيل المنتج الرفوع واللوجو والكلام وشكل المنتج
add a small black box numbering everyframe بالترتيب

Create a storyboard based on analyzing the brief:
1. [Frame Description]
2. [Frame Description]
...

CRITICAL RULES:
- In the [STORYBOARD_PROMPT], you MUST specify the grid dimensions in the format '( X rows Y coloumn )' immediately after the grid size mention (e.g., 'Create a 3x3 grid ( 3 rows 3 coloumn ) of...').
- Use the following mapping for dimensions:
  - 1x2 grid: ( 1 rows 2 coloumn )
  - 2x2 grid: ( 2 rows 2 coloumn )
  - 3x3 grid: ( 3 rows 3 coloumn )
- In the [STORYBOARD_PROMPT], after the initial product description, you MUST ALWAYS append these exact lines:
  Ultra high-end commercial product photography
  Extreme sharpness and texture clarity
  Clean geometry composition
  Hyper-realistic 3D render style
  Premium advertising look
  All frames must have the same look and feel, and all frames should have the same background color.
  Make sure that all scenes are shot inside a studio with the same setup.
  استخدم نفس تفاصيل المنتج الرفوع واللوجو والكلام وشكل المنتج
  add a small black box numbering everyframe بالترتيب
- FRAME DESCRIPTIONS (1, 2, 3...) MUST FOLLOW THE USER'S SCRIPT/BRIEF EXACTLY.
- When referring to the product in a frame description, you MUST use the exact token "input object" — never re-describe the product in the frame list. The image generator will replace "input object" with the actual uploaded product image.
- IMPORTANT: Do NOT force "input object" into every frame. If the brief describes an environment, a person, or a secondary element where the product is absent, describe it exactly as requested without mentioning "input object". Follow the narrative flow naturally.
- CREATIVE DIRECTION: Use a variety of macro angles (e.g., 100mm lens), explore "no gravity" (floating elements), and use the product creatively. Incorporate technical lighting terms like "volumetric lighting", "rim light", and "specular highlights". Ensure a narrative flow that can transition from raw ingredients/source to the hero product and finally to the consumer experience or emotional lifestyle moments, all while maintaining the studio setup. Use abstract elements like "glowing dust particles", "magical motion", and "light rays" to enhance the luxury feel.
- EVERY single frame MUST share the exact same background, lighting setup, and environmental settings to ensure a "unified visual style" and "seamless continuation".
- PRODUCT SPECIFICITY: In the [STORYBOARD_PROMPT] header paragraph you MUST describe the product with full specific visual details (brand name, colors, label text, shape, textures). In the numbered frame descriptions use "input object" as the product token — do NOT re-describe it there.
- The output must be an ultra-realistic 3D render, Octane style.
- Use SINGLE newlines between frames.
- IMPORTANT: Output should be a single concise paragraph for the [STORYBOARD_PROMPT] section followed by the numbered frame list. NO segmented or shot-by-shot breakdown beyond the required numbered frames.`;

export async function describeImage(
  imageBase64: string,
  mimeType: string,
  color?: string,
  modelId?: string
): Promise<string> {
  const colorInstruction =
    color && color !== 'Auto'
      ? `IMPORTANT: The user has selected the color ${color} as a primary theme. Describe how the environment, shadows, and lighting are tinted or influenced by this specific color.`
      : color === 'Auto'
      ? 'IMPORTANT: Analyze the product and choose a background color that perfectly complements its colors. Describe how this chosen color influences the environment, shadows, and lighting.'
      : '';

  const prompt = `Analyze this product image in extreme detail. Describe the product's specific features (shape, material, colors, textures, logos, labels) and the environment it's in (background, lighting, mood). ${colorInstruction} Keep it concise but highly specific for use in a creative prompt.`;

  try {
    const res = await callAI({
      modelId: modelId || 'gemini-2.5-flash',
      systemInstruction:
        'You are a creative director providing a highly detailed analysis of a product and its setting for use in high-end advertising. Provide a single paragraph description.',
      parts: [
        { inlineData: { data: imageBase64, mimeType } },
        { text: prompt },
      ],
      temperature: 0.5,
    });
    return res.text || 'A professional background.';
  } catch (err) {
    console.error('describeImage error:', err);
    return 'A professional background.';
  }
}

export async function generateStoryboard(req: StoryboardRequest): Promise<string> {
  const parts: AIPart[] = [];

  // Product images
  if (req.imagesBase64 && req.imageMimeTypes) {
    for (let i = 0; i < req.imagesBase64.length; i++) {
      parts.push({
        inlineData: {
          data: req.imagesBase64[i],
          mimeType: req.imageMimeTypes[i] || 'image/jpeg',
        },
      });
    }
  }

  // Background image
  if (req.backgroundImageBase64 && req.backgroundImageMimeType) {
    parts.push({ text: 'USE THIS IMAGE AS THE BACKGROUND FOR ALL FRAMES:' });
    parts.push({
      inlineData: {
        data: req.backgroundImageBase64,
        mimeType: req.backgroundImageMimeType,
      },
    });
  }

  // Style image
  if (req.styleImageBase64 && req.styleImageMimeType) {
    parts.push({
      text: 'USE THIS IMAGE AS A STYLE REFERENCE FOR THE RENDER/PHOTOGRAPHY AND BACKGROUND:',
    });
    parts.push({
      inlineData: {
        data: req.styleImageBase64,
        mimeType: req.styleImageMimeType,
      },
    });
  }

  // Build prompt text
  let promptText = '';

  if (req.isRefinement) {
    promptText = `REFINEMENT MODE\n\nHere is the previous storyboard:\n\n${req.previousContext}\n\nThe user wants to edit the LAST generated output with the following comment/instruction:\n"${req.refinementComment}"\n\nPlease provide the UPDATED storyboard set based on this feedback. Output ONLY the [STORYBOARD_PROMPT] part.`;
  } else if (req.isContinuation) {
    if (req.continuationImagesBase64 && req.continuationImageMimeTypes) {
      for (let i = 0; i < req.continuationImagesBase64.length; i++) {
        parts.push({
          inlineData: {
            data: req.continuationImagesBase64[i],
            mimeType: req.continuationImageMimeTypes[i] || 'image/jpeg',
          },
        });
      }
      parts.push({
        text:
          'The above images are reference images for the NEXT set of the storyboard. Use them to guide the style, composition, or elements of the continuation.',
      });
    }
    promptText = `CONTINUATION MODE (NEXT BUTTON CLICKED)\n\nHere is the previous storyboard history:\n\n${req.previousContext}\n\nPlease generate [STORYBOARD - SET ${req.setNumber}] continuing the sequence. ONLY output the [STORYBOARD_PROMPT] part. Introduce new motion variations, angles, and macro focus.${
      req.continuationFocus ? `\n\nFOCUS FOR THIS SET: "${req.continuationFocus}"` : ''
    }`;

    if (req.gridSelection && req.gridSelection !== 'None') {
      const gridMapping: Record<string, string> = {
        '1x2': '( 1 rows 2 coloumn )',
        '2x2': '( 2 rows 2 coloumn )',
        '3x3': '( 3 rows 3 coloumn )',
      };
      const dims = gridMapping[req.gridSelection] || '';
      promptText += `\n\nGrid Output: "${req.gridSelection}". Generate exactly the number of frames required for a ${req.gridSelection} grid. IMPORTANT: In the [STORYBOARD_PROMPT] line, you MUST append "${dims}" immediately after the grid size mention (e.g., "Create a ${req.gridSelection} grid ${dims} of...").`;
    }

    if (req.orientation) {
      const aspectMap: Record<string, string> = {
        horizontal: '16:9',
        vertical: '9:16',
        square: '1:1',
      };
      promptText += `\n\nStoryboard Orientation: "${req.orientation}". Ensure visual compositions suit a ${req.orientation} aspect ratio (${aspectMap[req.orientation] || '16:9'}).`;
    }
  } else {
    promptText = `Please analyze the attached product image(s) and generate a storyboard.`;

    if (req.videoStyle) {
      promptText += `\n\nRequested Video Style: "${req.videoStyle}"`;
    } else {
      promptText += `\n\nVideo Style: Analyze the product and predict the best style.`;
    }

    if (req.backgroundColor) {
      if (req.backgroundColor === 'Auto') {
        promptText += `\n\nBackground Color: Analyze the product image(s) and choose a background color that perfectly complements the product's colors.`;
      } else {
        if (
          req.gradientType &&
          req.gradientType !== 'none' &&
          req.backgroundColor2
        ) {
          const type =
            req.gradientType === 'linear'
              ? 'linear gradient (top to bottom)'
              : 'radial gradient (middle to edges)';
          promptText += `\n\nBackground: A ${type} using colors "${req.backgroundColor}" and "${req.backgroundColor2}".`;
        } else {
          promptText += `\n\nBackground Color: "${req.backgroundColor}"`;
        }
      }
    }

    if (req.backgroundImageBase64) {
      promptText += `\n\nBackground Image: Use the attached background image for the scene.`;
      if (req.backgroundImageDescription) {
        promptText += `\nBackground Description: ${req.backgroundImageDescription}`;
      }
      if (req.backgroundColor) {
        promptText += `\nIMPORTANT: Blend the background image with the selected color (${req.backgroundColor}) to create a cohesive look.`;
      }
    }

    if (req.brief) {
      promptText += `\n\nCreative Brief: "${req.brief}" (Ensure the storyboard aligns with these creative directions)`;
    }

    if (req.script) {
      promptText += `\n\nVoice-over Script: "${req.script}" (Ensure the storyboard strictly follows this narrative)`;
    }

    if (req.gridSelection && req.gridSelection !== 'None') {
      const gridMapping: Record<string, string> = {
        '1x2': '( 1 rows 2 coloumn )',
        '2x2': '( 2 rows 2 coloumn )',
        '3x3': '( 3 rows 3 coloumn )',
      };
      const dims = gridMapping[req.gridSelection] || '';
      promptText += `\n\nGrid Output: "${req.gridSelection}". Generate exactly the number of frames required for a ${req.gridSelection} grid. IMPORTANT: In the [STORYBOARD_PROMPT] line, you MUST append "${dims}" immediately after the grid size mention (e.g., "Create a ${req.gridSelection} grid ${dims} of...").`;
    }

    if (req.orientation) {
      const aspectMap: Record<string, string> = {
        horizontal: '16:9',
        vertical: '9:16',
        square: '1:1',
      };
      promptText += `\n\nStoryboard Orientation: "${req.orientation}". Ensure the visual compositions and framing in the descriptions suit a ${req.orientation} aspect ratio (e.g., ${aspectMap[req.orientation] || '16:9'}).`;
    }
  }

  parts.push({ text: promptText });

  const response = await callAI({
    modelId: req.model || 'gemini-2.5-flash',
    systemInstruction: STORYBOARD_SYSTEM,
    parts,
    temperature: 0.75,
    maxTokens: 4096,
  });

  return response.text || 'Failed to generate storyboard.';
}

// Parse AI response into base prompt + frames
export function parseStoryboardResponse(text: string) {
  const promptMatch = text.match(/\[STORYBOARD_PROMPT\]:\s*([\s\S]*)/i);
  const fullPrompt = promptMatch ? promptMatch[1].trim() : text.trim();

  const divider = 'Create a storyboard based on analyzing the brief:';
  const splitIndex = fullPrompt.toLowerCase().indexOf(divider.toLowerCase());

  let basePrompt = fullPrompt;
  let frames: string[] = [];

  if (splitIndex !== -1) {
    basePrompt = fullPrompt.substring(0, splitIndex).trim();
    const framesSection = fullPrompt.substring(splitIndex + divider.length);
    const framesMatch = framesSection.match(
      /(?:\d+\.\s+)([\s\S]*?)(?=\n\d+\.\s+|$)/g
    );
    if (framesMatch) {
      frames = framesMatch.map((f) => f.replace(/^\d+\.\s+/, '').trim());
    }
  }

  return { prompt: fullPrompt, basePrompt, frames };
}

export function getStandalonePrompt(basePrompt: string, frameDescription: string): string {
  let base = basePrompt.replace(
    /Create a \d+x\d+ grid\s*\(\s*\d+\s*rows\s*\d+\s*coloumn\s*\)\s*of\s*/i,
    ''
  );
  base = base.replace(/All frames/g, 'this frame');
  base = base.replace(
    /Make sure that all scenes are shot inside a studio with the same setup\./g,
    ''
  );
  base = base.replace(/add a small black box numbering everyframe بالترتيب/g, '');

  base = base
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line)
    .join('\n');

  base = base.charAt(0).toUpperCase() + base.slice(1);
  return `${frameDescription} of ${base}`;
}
