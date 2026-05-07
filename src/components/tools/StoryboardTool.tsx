import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HexColorPicker } from 'react-colorful';
import {
  Sparkles,
  Wand2,
  Plus,
  X,
  ArrowRight,
  Palette,
  Layers,
  Loader2,
  Search,
  Pipette,
} from 'lucide-react';
import { ModelSelector } from '../ui/ModelSelector';
import { ImageUpload } from '../ui/ImageUpload';
import { CopyButton } from '../ui/CopyButton';
import { LabelTag } from '../ui/LabelTag';
import { ImageColorPicker } from '../ui/ImageColorPicker';
import {
  CINEMATIC_STYLES,
  SUGGESTED_KEYWORDS,
  GRID_OPTIONS,
  ORIENTATION_OPTIONS,
} from '../../config/styles';
import { generateStoryboard, parseStoryboardResponse, describeImage } from '../../services/storyboardService';
import { suggestCinematicStyles } from '../../services/soundService';
import type { ProcessedFile } from '../../utils/files';
import type { AppSettings } from '../../types';
import { incrementUsage } from '../../utils/storage';
import { t } from '../../utils/i18n';

interface Props {
  settings: AppSettings;
  onUsage?: () => void;
}

interface HistoryEntry {
  style: string;
  setNumber: number;
  prompt: string;
  parsed: { basePrompt?: string; frames?: string[] };
  ts: number;
}

export function StoryboardTool({ settings, onUsage }: Props) {
  // ---- model
  const [model, setModel] = useState(settings.defaultModel);

  // ---- product images
  const [productImages, setProductImages] = useState<ProcessedFile[]>([]);

  // ---- background
  const [bgColor, setBgColor] = useState('Auto');
  const [bgColor2, setBgColor2] = useState('');
  const [gradientType, setGradientType] = useState<'none' | 'linear' | 'radial'>('none');
  const [showPicker, setShowPicker] = useState(false);
  const [activePicker, setActivePicker] = useState<'color1' | 'color2'>('color1');
  const [bgImage, setBgImage] = useState<ProcessedFile[]>([]);
  const [bgImageDesc, setBgImageDesc] = useState('');
  const [analyzingBg, setAnalyzingBg] = useState(false);

  // ---- style
  const [styleImage, setStyleImage] = useState<ProcessedFile[]>([]);
  const [videoStyles, setVideoStyles] = useState<string[]>(['3d angles']);
  const [styleSearch, setStyleSearch] = useState('');
  const [showStylePicker, setShowStylePicker] = useState<number | null>(null);
  const [suggestingStyles, setSuggestingStyles] = useState(false);

  // ---- core
  const [brief, setBrief] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [sequenceCount, setSequenceCount] = useState(2);
  const [grid, setGrid] = useState(settings.defaultGrid);
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical' | 'square'>(settings.defaultOrientation);

  // ---- generation
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // ---- continuation / refinement
  const [continuationFocus, setContinuationFocus] = useState('');
  const [continuationImages, setContinuationImages] = useState<ProcessedFile[]>([]);
  const [refinementComment, setRefinementComment] = useState('');
  const [refinementTarget, setRefinementTarget] = useState<number | null>(null);

  // ---- image color picker
  const [imagePickerTarget, setImagePickerTarget] = useState<'color1' | 'color2' | null>(null);

  useEffect(() => {
    if (productImages.length > 0 && bgImage.length > 0 && !bgImageDesc && !analyzingBg) {
      autoDescribeBg();
    }
  }, [bgImage]);

  // Collect all uploaded images available for color picking
  const pickerImages = [...productImages, ...bgImage, ...styleImage];

  async function autoDescribeBg() {
    if (bgImage.length === 0) return;
    setAnalyzingBg(true);
    try {
      const desc = await describeImage(bgImage[0].base64, bgImage[0].mimeType, '', model);
      setBgImageDesc(desc);
    } catch (e: any) {
      console.warn('bg describe failed', e?.message);
    } finally {
      setAnalyzingBg(false);
    }
  }

  function toggleStyle(styleId: string, slotIdx?: number) {
    if (slotIdx !== undefined) {
      const next = [...videoStyles];
      next[slotIdx] = styleId;
      setVideoStyles(next);
      setShowStylePicker(null);
      setStyleSearch('');
    } else {
      if (!videoStyles.includes(styleId)) {
        setVideoStyles([...videoStyles, styleId]);
      }
    }
  }

  function removeStyle(idx: number) {
    if (videoStyles.length > 1) {
      setVideoStyles(videoStyles.filter((_, i) => i !== idx));
    }
  }

  function toggleKeyword(kw: string) {
    setKeywords((prev) => (prev.includes(kw) ? prev.filter((k) => k !== kw) : [...prev, kw]));
  }

  async function handleSuggestStyles() {
    if (productImages.length === 0 || !brief.trim()) {
      setError(t('Please upload a product image and write a brief first', 'الرجاء رفع صورة منتج وكتابة موجز أولاً'));
      return;
    }
    setSuggestingStyles(true);
    setError('');
    try {
      const suggested = await suggestCinematicStyles(
        productImages[0].base64,
        productImages[0].mimeType,
        brief,
        CINEMATIC_STYLES as { id: string; label: string; description: string }[],
        model
      );
      if (suggested.length > 0) {
        setVideoStyles(suggested.slice(0, 4));
      }
    } catch (e: any) {
      setError(e.message || 'Failed to suggest styles');
    } finally {
      setSuggestingStyles(false);
    }
  }

  async function handleGenerateInitial() {
    if (productImages.length === 0) {
      setError(t('Please upload at least one product image', 'الرجاء رفع صورة منتج واحدة على الأقل'));
      return;
    }

    setGenerating(true);
    setError('');
    setHistory([]);

    try {
      const briefText = brief.trim() || 'Analyze the product image and create a compelling high-end commercial storyboard that showcases the product beautifully.';
      const fullBrief = [briefText, keywords.length ? `Keywords: ${keywords.join(', ')}` : '']
        .filter(Boolean)
        .join('\n\n');

      // local accumulator to avoid stale-closure reads of React state
      const localHistory: HistoryEntry[] = [];

      for (const style of videoStyles) {
        if (!style) continue;
        for (let i = 1; i <= sequenceCount; i++) {
          const result = await generateStoryboard({
            imagesBase64: productImages.map((f) => f.base64),
            imageMimeTypes: productImages.map((f) => f.mimeType),
            backgroundImageBase64: bgImage[0]?.base64,
            backgroundImageMimeType: bgImage[0]?.mimeType,
            backgroundImageDescription: bgImageDesc,
            backgroundColor: bgColor,
            backgroundColor2: bgColor2,
            gradientType,
            styleImageBase64: styleImage[0]?.base64,
            styleImageMimeType: styleImage[0]?.mimeType,
            brief: fullBrief,
            videoStyle: style,
            gridSelection: grid,
            orientation,
            setNumber: i,
            isContinuation: i > 1,
            previousContext: i > 1 ? localHistory[localHistory.length - 1]?.prompt : undefined,
            model,
          });

          const parsed = parseStoryboardResponse(result);
          const entry: HistoryEntry = { style, setNumber: i, prompt: result, parsed, ts: Date.now() };
          localHistory.push(entry);
          setHistory((prev) => [...prev, entry]);
        }
      }
      incrementUsage('storyboard');
      onUsage?.();
    } catch (e: any) {
      setError(e.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }

  async function handleContinue(style: string) {
    setGenerating(true);
    setError('');
    try {
      const lastEntryForStyle = [...history].reverse().find((h) => h.style === style);
      const result = await generateStoryboard({
        imagesBase64: productImages.map((f) => f.base64),
        imageMimeTypes: productImages.map((f) => f.mimeType),
        styleImageBase64: styleImage[0]?.base64,
        styleImageMimeType: styleImage[0]?.mimeType,
        brief,
        videoStyle: style,
        gridSelection: grid,
        orientation,
        setNumber: (lastEntryForStyle?.setNumber || 0) + 1,
        isContinuation: true,
        continuationFocus,
        continuationImagesBase64: continuationImages.map((f) => f.base64),
        continuationImageMimeTypes: continuationImages.map((f) => f.mimeType),
        previousContext: lastEntryForStyle?.prompt,
        model,
      });
      const parsed = parseStoryboardResponse(result);
      setHistory((prev) => [
        ...prev,
        {
          style,
          setNumber: (lastEntryForStyle?.setNumber || 0) + 1,
          prompt: result,
          parsed,
          ts: Date.now(),
        },
      ]);
      setContinuationFocus('');
      setContinuationImages([]);
      incrementUsage('storyboard');
      onUsage?.();
    } catch (e: any) {
      setError(e.message || 'Continuation failed');
    } finally {
      setGenerating(false);
    }
  }

  async function handleRefine(idx: number) {
    if (!refinementComment.trim()) return;
    const target = history[idx];
    if (!target) return;
    setGenerating(true);
    setError('');
    try {
      const result = await generateStoryboard({
        imagesBase64: productImages.map((f) => f.base64),
        imageMimeTypes: productImages.map((f) => f.mimeType),
        brief,
        videoStyle: target.style,
        gridSelection: grid,
        orientation,
        setNumber: target.setNumber,
        isRefinement: true,
        refinementComment,
        previousContext: target.prompt,
        model,
      });
      const parsed = parseStoryboardResponse(result);
      setHistory((prev) =>
        prev.map((h, i) =>
          i === idx ? { ...h, prompt: result, parsed, ts: Date.now() } : h
        )
      );
      setRefinementComment('');
      setRefinementTarget(null);
      incrementUsage('storyboard');
      onUsage?.();
    } catch (e: any) {
      setError(e.message || 'Refinement failed');
    } finally {
      setGenerating(false);
    }
  }

  const filteredStyles = CINEMATIC_STYLES.filter(
    (s) =>
      s.label.toLowerCase().includes(styleSearch.toLowerCase()) ||
      s.id.toLowerCase().includes(styleSearch.toLowerCase()) ||
      s.description.toLowerCase().includes(styleSearch.toLowerCase())
  );

  return (
    <div className="grid lg:grid-cols-2 gap-6 h-full">
      {/* ===== LEFT: CONTROLS ===== */}
      <div className="space-y-5 overflow-y-auto custom-scrollbar pr-2">
        <ModelSelector value={model} onChange={setModel} />

        <ImageUpload
          files={productImages}
          onChange={setProductImages}
          label={t('Product Images', 'صور المنتج')}
          multiple
          maxFiles={6}
        />

        {/* Brief */}
        <div>
          <label className="block mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
            {t('Brief / Script', 'موجز / سيناريو')}
          </label>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder={t(
              'Describe the ad concept, story, mood...',
              'صف فكرة الإعلان والقصة والمزاج...'
            )}
            rows={4}
            className="input-base w-full"
          />
        </div>

        {/* Keywords */}
        <div>
          <label className="block mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
            {t('Suggested Keywords', 'كلمات مقترحة')}
          </label>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_KEYWORDS.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => toggleKeyword(kw)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  keywords.includes(kw)
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                }`}
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

        {/* Cinematic Styles */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-400">
              {t('Cinematic Styles', 'أنماط سينمائية')}
            </label>
            <button
              type="button"
              onClick={handleSuggestStyles}
              disabled={suggestingStyles || productImages.length === 0}
              className="text-xs flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 disabled:opacity-40 disabled:cursor-not-allowed font-semibold"
            >
              {suggestingStyles ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
              {t('Auto-suggest', 'اقتراح تلقائي')}
            </button>
          </div>

          <div className="space-y-2">
            {videoStyles.map((styleId, idx) => {
              const styleDef = CINEMATIC_STYLES.find((s) => s.id === styleId);
              return (
                <div key={idx} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowStylePicker(showStylePicker === idx ? null : idx)}
                    className="flex-1 input-base text-left flex items-center justify-between"
                  >
                    <span className={styleDef ? 'text-zinc-100' : 'text-zinc-500'}>
                      {styleDef?.label || t('Choose a style…', 'اختر نمطاً…')}
                    </span>
                    <ArrowRight className="w-4 h-4 text-zinc-500" />
                  </button>
                  {videoStyles.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStyle(idx)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* style picker dropdown */}
          <AnimatePresence>
            {showStylePicker !== null && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-2 bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
              >
                <div className="p-3 border-b border-white/5 flex items-center gap-2">
                  <Search className="w-4 h-4 text-zinc-500" />
                  <input
                    autoFocus
                    value={styleSearch}
                    onChange={(e) => setStyleSearch(e.target.value)}
                    placeholder={t('Search styles…', 'بحث عن نمط…')}
                    className="flex-1 bg-transparent text-sm text-zinc-100 outline-none"
                  />
                </div>
                <div className="max-h-72 overflow-y-auto custom-scrollbar">
                  {filteredStyles.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleStyle(s.id, showStylePicker)}
                      className="w-full text-left px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-none flex flex-col gap-0.5"
                    >
                      <span className="text-sm font-semibold text-zinc-100">{s.label}</span>
                      <span className="text-xs text-zinc-500">{s.description}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setVideoStyles([...videoStyles, ''])}
            className="mt-2 w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-dashed border-white/10 text-xs font-semibold text-zinc-400 flex items-center justify-center gap-2"
          >
            <Plus className="w-3 h-3" /> {t('Add another style', 'أضف نمطاً آخر')}
          </button>
        </div>

        {/* Background */}
        <div>
          <label className="block mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
            <Palette className="inline w-3 h-3 mr-1" />
            {t('Background', 'الخلفية')}
          </label>

          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => {
                  setActivePicker('color1');
                  setShowPicker(!showPicker);
                }}
                className="input-base flex-1 flex items-center gap-2 cursor-pointer"
              >
                <div
                  className="w-6 h-6 rounded-md border border-white/20 shrink-0 flex items-center justify-center"
                  style={{ background: bgColor && bgColor !== 'Auto' ? bgColor : 'transparent' }}
                >
                  {bgColor === 'Auto' && <span className="text-[8px] font-bold text-zinc-400">AUTO</span>}
                </div>
                <span className="text-xs text-zinc-300 truncate">{bgColor || t('Color 1', 'لون ١')}</span>
              </button>
              <button
                type="button"
                title={t('Pick from image', 'اختر من الصورة')}
                disabled={pickerImages.length === 0}
                onClick={() => setImagePickerTarget('color1')}
                className="p-2 rounded-xl bg-white/5 hover:bg-indigo-500/20 border border-white/10 text-zinc-400 hover:text-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Pipette className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => {
                  setActivePicker('color2');
                  setShowPicker(!showPicker);
                }}
                className="input-base flex-1 flex items-center gap-2 cursor-pointer"
              >
                <div
                  className="w-6 h-6 rounded-md border border-white/20 shrink-0"
                  style={{ background: bgColor2 || 'transparent' }}
                />
                <span className="text-xs text-zinc-300 truncate">{bgColor2 || t('Color 2', 'لون ٢')}</span>
              </button>
              <button
                type="button"
                title={t('Pick from image', 'اختر من الصورة')}
                disabled={pickerImages.length === 0}
                onClick={() => setImagePickerTarget('color2')}
                className="p-2 rounded-xl bg-white/5 hover:bg-indigo-500/20 border border-white/10 text-zinc-400 hover:text-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Pipette className="w-4 h-4" />
              </button>
            </div>
          </div>

          {showPicker && (
            <div className="mb-2 p-3 bg-zinc-900 border border-white/10 rounded-2xl">
              <HexColorPicker
                color={(activePicker === 'color1' ? bgColor : bgColor2).replace('Auto', '#000000')}
                onChange={(c) => (activePicker === 'color1' ? setBgColor(c) : setBgColor2(c))}
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (activePicker === 'color1') setBgColor('Auto');
                    else setBgColor2('');
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-zinc-400"
                >
                  {activePicker === 'color1' ? t('Auto', 'تلقائي') : t('Clear', 'مسح')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowPicker(false)}
                  className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-semibold"
                >
                  {t('Done', 'تم')}
                </button>
              </div>
            </div>
          )}

          {bgColor && bgColor !== 'Auto' && bgColor2 && (
            <div className="grid grid-cols-3 gap-2 mb-2">
              {(['none', 'linear', 'radial'] as const).map((g) => (
                <button
                  type="button"
                  key={g}
                  onClick={() => setGradientType(g)}
                  className={`py-1.5 rounded-lg text-xs font-semibold capitalize ${
                    gradientType === g
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          )}

          <ImageUpload
            files={bgImage}
            onChange={setBgImage}
            label={t('Or background image', 'أو صورة خلفية')}
            maxFiles={1}
          />
          {analyzingBg && (
            <div className="mt-2 text-xs text-indigo-400 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              {t('Analyzing background…', 'تحليل الخلفية…')}
            </div>
          )}
          {bgImageDesc && !analyzingBg && (
            <div className="mt-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-xs text-emerald-300">
              {bgImageDesc}
            </div>
          )}
        </div>

        {/* Style image */}
        <ImageUpload
          files={styleImage}
          onChange={setStyleImage}
          label={t('Style Reference (optional)', 'مرجع نمط (اختياري)')}
          maxFiles={1}
        />

        {/* Sequence + Grid + Orientation */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
              {t('Sequences', 'تسلسلات')}
            </label>
            <div className="grid grid-cols-3 gap-1">
              {[1, 2, 3].map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setSequenceCount(n)}
                  className={`py-2 rounded-lg text-sm font-bold ${
                    sequenceCount === n
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
              {t('Grid', 'شبكة')}
            </label>
            <select
              value={grid}
              onChange={(e) => setGrid(e.target.value)}
              className="input-base w-full"
            >
              {GRID_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
              {t('Orientation', 'الاتجاه')}
            </label>
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as any)}
              className="input-base w-full"
            >
              {ORIENTATION_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Generate */}
        <button
          type="button"
          onClick={handleGenerateInitial}
          disabled={generating}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-indigo-600/20"
        >
          {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
          {generating ? t('Generating…', 'جارٍ التوليد…') : t('Generate Storyboards', 'توليد الستوريبورد')}
        </button>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-300">
            {error}
          </div>
        )}
      </div>

      {/* ===== RIGHT: OUTPUT ===== */}
      <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-white/10 rounded-3xl">
            <Layers className="w-16 h-16 text-zinc-700 mb-4" />
            <h3 className="text-lg font-bold text-zinc-300 mb-2">
              {t('Storyboard Output', 'مخرجات الستوريبورد')}
            </h3>
            <p className="text-sm text-zinc-500 max-w-md">
              {t(
                'Upload your product, write a brief, pick styles, and generate. Each prompt is ready to paste into Nano Banana Pro or any image-grid model.',
                'ارفع منتجك، اكتب موجزاً، اختر الأنماط، ثم ولّد. كل برومبت جاهز للصق في Nano Banana Pro أو أي نموذج شبكة صور.'
              )}
            </p>
          </div>
        ) : (
          history.map((entry, idx) => {
            const styleDef = CINEMATIC_STYLES.find((s) => s.id === entry.style);
            return (
              <motion.div
                key={`${entry.ts}-${idx}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.02] border border-white/10 rounded-3xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <LabelTag variant="indigo">{styleDef?.label || entry.style}</LabelTag>
                    <LabelTag variant="emerald">SET {entry.setNumber}</LabelTag>
                    <LabelTag variant="amber">{grid}</LabelTag>
                  </div>
                  <CopyButton text={entry.prompt} />
                </div>

                <pre className="whitespace-pre-wrap text-sm text-zinc-200 font-mono leading-relaxed bg-black/30 p-4 rounded-xl border border-white/5 max-h-96 overflow-y-auto custom-scrollbar">
                  {entry.prompt}
                </pre>

                {/* per-entry actions */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setRefinementTarget(refinementTarget === idx ? null : idx)
                    }
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-xs text-amber-300 font-semibold"
                  >
                    {t('Refine', 'تحسين')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleContinue(entry.style)}
                    disabled={generating}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-xs text-emerald-300 font-semibold disabled:opacity-50"
                  >
                    {t('Continue this style', 'استكمل هذا النمط')}
                  </button>
                </div>

                {refinementTarget === idx && (
                  <div className="mt-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                    <textarea
                      value={refinementComment}
                      onChange={(e) => setRefinementComment(e.target.value)}
                      placeholder={t(
                        'What should change? e.g., make the lighting warmer…',
                        'ما الذي يجب تغييره؟ مثلاً: إضاءة أدفأ…'
                      )}
                      rows={2}
                      className="input-base w-full text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleRefine(idx)}
                      disabled={generating || !refinementComment.trim()}
                      className="mt-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold disabled:opacity-50"
                    >
                      {generating ? t('Refining…', 'جارٍ التحسين…') : t('Apply refinement', 'تطبيق التحسين')}
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })
        )}

        {/* continuation panel for any style */}
        {history.length > 0 && (
          <div className="p-4 bg-white/[0.02] border border-dashed border-white/10 rounded-2xl">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
              {t('Continuation Focus (optional)', 'تركيز الاستكمال (اختياري)')}
            </h4>
            <textarea
              value={continuationFocus}
              onChange={(e) => setContinuationFocus(e.target.value)}
              placeholder={t(
                'Describe what the next set should focus on…',
                'صف ما يجب أن تركز عليه المجموعة التالية…'
              )}
              rows={2}
              className="input-base w-full text-sm mb-2"
            />
            <ImageUpload
              files={continuationImages}
              onChange={setContinuationImages}
              label={t('Reference images for continuation', 'صور مرجعية للاستكمال')}
              multiple
              maxFiles={3}
            />
            <p className="mt-2 text-xs text-zinc-500">
              {t(
                'Use the green "Continue" button on any output above to extend that style.',
                'استخدم زر "استكمل" الأخضر على أي مخرج أعلاه لتمديد ذلك النمط.'
              )}
            </p>
          </div>
        )}
      </div>

      {/* Image color picker modal */}
      {imagePickerTarget && (
        <ImageColorPicker
          images={pickerImages}
          onPick={(hex) => {
            if (imagePickerTarget === 'color1') setBgColor(hex);
            else setBgColor2(hex);
          }}
          onClose={() => setImagePickerTarget(null)}
        />
      )}
    </div>
  );
}
