import { useState } from 'react';
import { motion } from 'motion/react';
import { Wand2, Loader2, Grid3x3, Check, Copy } from 'lucide-react';
import { ImageUpload } from '../ui/ImageUpload';
import { CopyButton } from '../ui/CopyButton';
import { describeImage } from '../../services/storyboardService';
import { ModelSelector } from '../ui/ModelSelector';
import type { ProcessedFile } from '../../utils/files';
import type { AppSettings } from '../../types';
import { incrementUsage } from '../../utils/storage';
import { t } from '../../utils/i18n';

interface Props {
  settings: AppSettings;
  onUsage?: () => void;
}

// 4 prompt sets preserved verbatim from v1
const EXTRACTION_PROMPTS = [
  // Set 1
  [
    'Please crop the image provided to only show the top-left panel. The resulting image should be a high-resolution, full-sized image of that specific panel, removing all other parts. Upscale the image to the highest possible quality.',
    'Please crop the image provided to only show the top-center panel. The resulting image should be a high-resolution, full-sized image of that specific panel, removing all other parts. Upscale the image to the highest possible quality.',
    'Please crop the image provided to only show the top-right panel. The resulting image should be a high-resolution, full-sized image of that specific panel, removing all other parts. Upscale the image to the highest possible quality.',
    'Please crop the image provided to only show the middle-left panel. The resulting image should be a high-resolution, full-sized image of that specific panel, removing all other parts. Upscale the image to the highest possible quality.',
    'Please crop the image provided to only show the center panel. The resulting image should be a high-resolution, full-sized image of that specific panel, removing all other parts. Upscale the image to the highest possible quality.',
    'Please crop the image provided to only show the middle-right panel. The resulting image should be a high-resolution, full-sized image of that specific panel, removing all other parts. Upscale the image to the highest possible quality.',
    'Please crop the image provided to only show the bottom-left panel. The resulting image should be a high-resolution, full-sized image of that specific panel, removing all other parts. Upscale the image to the highest possible quality.',
    'Please crop the image provided to only show the bottom-center panel. The resulting image should be a high-resolution, full-sized image of that specific panel, removing all other parts. Upscale the image to the highest possible quality.',
    'Please crop the image provided to only show the bottom-right panel. The resulting image should be a high-resolution, full-sized image of that specific panel, removing all other parts. Upscale the image to the highest possible quality.',
  ],
  // Set 2
  [
    'Extract the top-left image from this image. Maintain the exact style, color, and composition of that panel. Upscale the extracted image to the highest possible quality.',
    'Extract the top-center image from this image. Maintain the exact style, color, and composition of that panel. Upscale the extracted image to the highest possible quality.',
    'Extract the top-right image from this image. Maintain the exact style, color, and composition of that panel. Upscale the extracted image to the highest possible quality.',
    'Extract the middle-left image from this image. Maintain the exact style, color, and composition of that panel. Upscale the extracted image to the highest possible quality.',
    'Extract the center image from this image. Maintain the exact style, color, and composition of that panel. Upscale the extracted image to the highest possible quality.',
    'Extract the middle-right image from this image. Maintain the exact style, color, and composition of that panel. Upscale the extracted image to the highest possible quality.',
    'Extract the bottom-left image from this image. Maintain the exact style, color, and composition of that panel. Upscale the extracted image to the highest possible quality.',
    'Extract the bottom-center image from this image. Maintain the exact style, color, and composition of that panel. Upscale the extracted image to the highest possible quality.',
    'Extract the bottom-right image from this image. Maintain the exact style, color, and composition of that panel. Upscale the extracted image to the highest possible quality.',
  ],
  // Set 3
  [
    'Using this image, extract the image at row 1, column 1, as shown in the grid. Ensure the aspect ratio of the extracted image matches the original cell in the grid.',
    'Using this image, extract the image at row 1, column 2, as shown in the grid. Ensure the aspect ratio of the extracted image matches the original cell in the grid.',
    'Using this image, extract the image at row 1, column 3, as shown in the grid. Ensure the aspect ratio of the extracted image matches the original cell in the grid.',
    'Using this image, extract the image at row 2, column 1, as shown in the grid. Ensure the aspect ratio of the extracted image matches the original cell in the grid.',
    'Using this image, extract the image at row 2, column 2, as shown in the grid. Ensure the aspect ratio of the extracted image matches the original cell in the grid.',
    'Using this image, extract the image at row 2, column 3, as shown in the grid. Ensure the aspect ratio of the extracted image matches the original cell in the grid.',
    'Using this image, extract the image at row 3, column 1, as shown in the grid. Ensure the aspect ratio of the extracted image matches the original cell in the grid.',
    'Using this image, extract the image at row 3, column 2, as shown in the grid. Ensure the aspect ratio of the extracted image matches the original cell in the grid.',
    'Using this image, extract the image at row 3, column 3, as shown in the grid. Ensure the aspect ratio of the extracted image matches the original cell in the grid.',
  ],
  // Set 4
  [
    'Extract the exact frame exact angle NUMBER 1 ( row 1 column 1 ) from this image and restore quality and enhance details and render',
    'Extract the exact frame exact angle NUMBER 2 ( row 1 column 2 ) from this image and restore quality and enhance details and render',
    'Extract the exact frame exact angle NUMBER 3 ( row 1 column 3 ) from this image and restore quality and enhance details and render',
    'Extract the exact frame exact angle NUMBER 4 ( row 2 column 1 ) from this image and restore quality and enhance details and render',
    'Extract the exact frame exact angle NUMBER 5 ( row 2 column 2 ) from this image and restore quality and enhance details and render',
    'Extract the exact frame exact angle NUMBER 6 ( row 2 column 3 ) from this image and restore quality and enhance details and render',
    'Extract the exact frame exact angle NUMBER 7 ( row 3 column 1 ) from this image and restore quality and enhance details and render',
    'Extract the exact frame exact angle NUMBER 8 ( row 3 column 2 ) from this image and restore quality and enhance details and render',
    'Extract the exact frame exact angle NUMBER 9 ( row 3 column 3 ) from this image and restore quality and enhance details and render',
  ],
];

interface SelectedCell {
  index: number;       // cell index (0..gridCount-1)
  setIdx: number;      // which prompt set
  imageIdx: number;    // which uploaded image
}

export function ExtractorTool({ settings, onUsage }: Props) {
  const [model, setModel] = useState(settings.defaultModel);
  const [images, setImages] = useState<ProcessedFile[]>([]);
  const [grid, setGrid] = useState<'2x2' | '3x3'>('3x3');
  const [selectedCells, setSelectedCells] = useState<SelectedCell[]>([]);
  const [output, setOutput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [analyses, setAnalyses] = useState<string[]>([]);

  const gridCount = grid === '3x3' ? 9 : 4;
  const cols = grid === '3x3' ? 3 : 2;

  // 2x2 maps to a subset of indices in the 9-cell prompt arrays:
  // 2x2 uses indices [0,2,6,8] (corners) when reusing 3x3 prompt sets
  function map2x2Index(localIdx: number): number {
    const map2x2 = [0, 2, 6, 8];
    return map2x2[localIdx] ?? 0;
  }

  function toggleCell(imageIdx: number, cellIndex: number) {
    setSelectedCells((prev) => {
      const existing = prev.find((c) => c.imageIdx === imageIdx && c.index === cellIndex);
      if (existing) {
        // cycle through prompt sets 0->1->2->3->remove
        if (existing.setIdx >= 3) {
          return prev.filter((c) => !(c.imageIdx === imageIdx && c.index === cellIndex));
        }
        return prev.map((c) =>
          c.imageIdx === imageIdx && c.index === cellIndex
            ? { ...c, setIdx: c.setIdx + 1 }
            : c
        );
      }
      return [...prev, { imageIdx, index: cellIndex, setIdx: 0 }];
    });
  }

  function selectAll(imageIdx: number, setIdx: number) {
    const newSelections: SelectedCell[] = [];
    for (let i = 0; i < gridCount; i++) {
      newSelections.push({ imageIdx, index: i, setIdx });
    }
    setSelectedCells((prev) => [
      ...prev.filter((c) => c.imageIdx !== imageIdx),
      ...newSelections,
    ]);
  }

  function clearSelection(imageIdx: number) {
    setSelectedCells((prev) => prev.filter((c) => c.imageIdx !== imageIdx));
  }

  async function handleExtract() {
    if (images.length === 0) {
      setError(t('Please upload at least one grid image', 'الرجاء رفع صورة شبكة واحدة على الأقل'));
      return;
    }
    setGenerating(true);
    setError('');
    setOutput('');
    setAnalyses([]);
    try {
      // Step 1: describe each image (helps user know what's in each grid)
      const analysisResults: string[] = [];
      for (const img of images) {
        try {
          const desc = await describeImage(img.base64, img.mimeType, '', model);
          analysisResults.push(desc);
        } catch {
          analysisResults.push('(analysis failed)');
        }
      }
      setAnalyses(analysisResults);

      // Step 2: build per-image extraction prompts
      const sections: string[] = [];
      for (let imgIdx = 0; imgIdx < images.length; imgIdx++) {
        const cellsForImg = selectedCells.filter((c) => c.imageIdx === imgIdx);
        const cells = cellsForImg.length > 0
          ? cellsForImg
          : Array.from({ length: gridCount }, (_, i) => ({ imageIdx: imgIdx, index: i, setIdx: 0 }));

        const promptLines = cells
          .sort((a, b) => a.index - b.index)
          .map((cell) => {
            const promptSet = EXTRACTION_PROMPTS[cell.setIdx];
            const promptIdx = grid === '2x2' ? map2x2Index(cell.index) : cell.index;
            const basePrompt = promptSet[promptIdx];
            const adapted = basePrompt.replace('this image', `this ${grid} image grid`);
            return `[Frame ${cell.index + 1}]\n${adapted}`;
          });

        sections.push(
          `=== IMAGE ${imgIdx + 1} ===\nDescription: ${analysisResults[imgIdx]}\n\n${promptLines.join('\n\n')}`
        );
      }

      setOutput(sections.join('\n\n\n'));
      incrementUsage('extractor');
      onUsage?.();
    } catch (e: any) {
      setError(e.message || 'Extraction failed');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6 h-full">
      <div className="space-y-5 overflow-y-auto custom-scrollbar pr-2">
        <ModelSelector value={model} onChange={setModel} />

        <ImageUpload
          files={images}
          onChange={setImages}
          label={t('Grid Images (each is a 2x2 or 3x3 grid)', 'صور الشبكة (كل صورة شبكة 2×2 أو 3×3)')}
          multiple
          maxFiles={6}
        />

        <div>
          <label className="block mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
            {t('Grid Type', 'نوع الشبكة')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['2x2', '3x3'] as const).map((g) => (
              <button
                type="button"
                key={g}
                onClick={() => {
                  setGrid(g);
                  setSelectedCells([]);
                }}
                className={`py-3 rounded-xl text-sm font-bold uppercase tracking-widest border transition-all ${
                  grid === g
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Per-image grid selectors */}
        {images.map((img, imgIdx) => (
          <div key={imgIdx} className="bg-white/[0.02] border border-white/10 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                {t('Image', 'صورة')} {imgIdx + 1}
              </span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => selectAll(imgIdx, 0)}
                  className="text-[10px] px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-zinc-400 font-semibold"
                >
                  {t('All', 'الكل')}
                </button>
                <button
                  type="button"
                  onClick={() => clearSelection(imgIdx)}
                  className="text-[10px] px-2 py-1 rounded-md bg-white/5 hover:bg-white/10 text-zinc-400 font-semibold"
                >
                  {t('Clear', 'مسح')}
                </button>
              </div>
            </div>
            <div className="relative max-w-[260px] mx-auto">
              <img src={img.preview} alt="" className="w-full rounded-lg" />
              <div
                className={`absolute inset-0 grid gap-1 p-1`}
                style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
              >
                {Array.from({ length: gridCount }).map((_, i) => {
                  const sel = selectedCells.find((c) => c.imageIdx === imgIdx && c.index === i);
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleCell(imgIdx, i)}
                      className={`rounded-md border-2 transition-all flex items-center justify-center text-xs font-bold ${
                        sel
                          ? 'bg-indigo-600/40 border-indigo-400 text-white'
                          : 'bg-black/0 border-white/20 text-transparent hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {sel ? `${i + 1}·S${sel.setIdx + 1}` : i + 1}
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="text-[10px] text-zinc-500 text-center mt-1">
              {t('Click cells to cycle prompt set: S1→S2→S3→S4→off', 'انقر للخلية لتدوير المجموعة: S1→S2→S3→S4→إيقاف')}
            </p>
          </div>
        ))}

        <button
          type="button"
          onClick={handleExtract}
          disabled={generating || images.length === 0}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-600/20"
        >
          {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
          {generating ? t('Extracting…', 'جارٍ الاستخراج…') : t('Generate Extraction Prompts', 'توليد برومبتات الاستخراج')}
        </button>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-300">
            {error}
          </div>
        )}
      </div>

      <div className="overflow-y-auto custom-scrollbar pr-2">
        {!output ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-white/10 rounded-3xl">
            <Grid3x3 className="w-16 h-16 text-zinc-700 mb-4" />
            <h3 className="text-lg font-bold text-zinc-300 mb-2">
              {t('Extraction Output', 'مخرجات الاستخراج')}
            </h3>
            <p className="text-sm text-zinc-500 max-w-md">
              {t(
                'Each cell becomes a tested prompt for image-to-image models. Paste each into Nano Banana, ChatGPT-Image, or Midjourney.',
                'كل خلية تصبح برومبت مُختبر لنماذج صورة إلى صورة. الصق كل واحد في Nano Banana أو ChatGPT-Image أو Midjourney.'
              )}
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.02] border border-white/10 rounded-3xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Grid3x3 className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-bold text-zinc-200">
                  {t('Cell Extraction Prompts', 'برومبتات استخراج الخلايا')}
                </span>
              </div>
              <CopyButton text={output} />
            </div>
            <pre className="whitespace-pre-wrap text-xs text-zinc-200 font-mono leading-relaxed bg-black/30 p-4 rounded-xl border border-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
              {output}
            </pre>
          </motion.div>
        )}
      </div>
    </div>
  );
}
