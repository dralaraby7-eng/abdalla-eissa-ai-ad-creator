import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Loader2,
  Palette,
  Users,
  AlignLeft,
  Wand2,
  ChevronRight,
  Tag,
  Film,
  Mic,
  Target,
  X,
  Check,
} from 'lucide-react';
import { ImageUpload } from '../ui/ImageUpload';
import { ModelSelector } from '../ui/ModelSelector';
import { LabelTag } from '../ui/LabelTag';
import { CopyButton } from '../ui/CopyButton';
import {
  analyzeBrandDNA,
  generatePromptsForIdea,
} from '../../services/brandDNAService';
import { incrementUsage, checkLimit } from '../../utils/storage';
import { FEEL_OPTIONS, TARGET_AUDIENCES } from '../../config/styles';
import type { ProcessedFile } from '../../utils/files';
import type { AppSettings, BrandDNA, VideoIdea, StoryboardPrompt } from '../../types';
import { t } from '../../utils/i18n';

interface BrandDNAToolProps {
  settings: AppSettings;
  onUsage?: () => void;
}

export function BrandDNATool({ settings, onUsage }: BrandDNAToolProps) {
  // Form state
  const [productImages, setProductImages] = useState<ProcessedFile[]>([]);

  const [brief, setBrief] = useState('');
  const [feel, setFeel] = useState('auto');
  const [audience, setAudience] = useState('auto');
  const [ideaCount, setIdeaCount] = useState(3);
  const [language, setLanguage] = useState('English');
  const [model, setModel] = useState(settings.defaultModel);
  const [gridSelection, setGridSelection] = useState('3x3');
  const [orientation, setOrientation] = useState<
    'horizontal' | 'vertical' | 'square'
  >('horizontal');

  // Output state
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingPrompts, setGeneratingPrompts] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [brandDNA, setBrandDNA] = useState<BrandDNA | null>(null);
  const [ideasWithPrompts, setIdeasWithPrompts] = useState<
    Map<number, StoryboardPrompt[]>
  >(new Map());

  const handleAnalyze = async () => {
    if (productImages.length === 0) {
      setError(t('Please upload at least one product image first.', 'يرجى رفع صورة منتج واحدة على الأقل.'));
      return;
    }

    const limit = checkLimit();
    if (!limit.allowed) {
      setError(
        t(
          `Monthly limit reached (${limit.used}/${limit.limit}). Ask the admin to increase the limit.`,
          `تم الوصول للحد الشهري (${limit.used}/${limit.limit}).`
        )
      );
      return;
    }

    setAnalyzing(true);
    setError(null);
    setBrandDNA(null);
    setIdeasWithPrompts(new Map());

    try {
      const dna = await analyzeBrandDNA({
        imagesBase64: productImages.map((f) => f.base64),
        imageMimeTypes: productImages.map((f) => f.mimeType),
        brief,
        feel,
        audience,
        ideaCount,
        language,
        modelId: model,
      });
      setBrandDNA(dna);
      incrementUsage('brandDNA');
      onUsage?.();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to analyze brand DNA.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGeneratePrompts = async (ideaIdx: number) => {
    if (!brandDNA) return;
    const idea = brandDNA.videoIdeas[ideaIdx];
    if (!idea) return;

    setGeneratingPrompts(ideaIdx);
    setError(null);

    try {
      const result = await generatePromptsForIdea(
        idea,
        brandDNA,
        productImages.map((f) => f.base64),
        productImages.map((f) => f.mimeType),
        model,
        gridSelection,
        orientation,
        brief
      );

      const prompts: StoryboardPrompt[] = [
        {
          setNumber: 1,
          prompt: result.set1,
          basePrompt: result.set1Parsed.basePrompt,
          frames: result.set1Parsed.frames,
          grid: gridSelection,
        },
        {
          setNumber: 2,
          prompt: result.set2,
          basePrompt: result.set2Parsed.basePrompt,
          frames: result.set2Parsed.frames,
          grid: gridSelection,
        },
      ];
      setIdeasWithPrompts((prev) => {
        const next = new Map(prev);
        next.set(ideaIdx, prompts);
        return next;
      });
      incrementUsage('storyboard');
      onUsage?.();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate storyboard prompts.');
    } finally {
      setGeneratingPrompts(null);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 p-6 lg:p-10">
      {/* LEFT - INPUTS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="xl:col-span-5 space-y-6"
      >
        <div className="bg-[var(--bg-secondary)] rounded-[2rem] p-7 border border-[var(--border-color)] shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-indigo-400">
                {t('STEP 1', 'الخطوة ١')}
              </div>
              <h2 className="text-2xl font-black tracking-tight">
                {t('Brand DNA', 'هوية العلامة التجارية')}
              </h2>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>

          {/* Model selector */}
          <ModelSelector value={model} onChange={setModel} />

          {/* Image upload */}
          <ImageUpload
            label={t('Product Images', 'صور المنتج')}
            files={productImages}
            onChange={setProductImages}
            multiple
            maxFiles={5}
            hint={t(
              'Upload 1-5 product photos (drag-drop or paste)',
              'ارفع ١-٥ صور للمنتج (اسحب أو الصق)'
            )}
          />

          {/* Brief */}
          <div className="space-y-3">
            <LabelTag icon={<AlignLeft className="w-3.5 h-3.5" />}>
              {t('Optional Brief', 'موجز اختياري')}
            </LabelTag>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder={t(
                'Tell the AI about your product, brand story, or any specific direction...',
                'أخبر الذكاء الاصطناعي عن منتجك أو قصة علامتك...'
              )}
              className="input-base resize-none h-24"
            />
          </div>

          {/* Feel + Audience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <LabelTag icon={<Palette className="w-3.5 h-3.5" />}>
                {t('Brand Feel', 'إحساس العلامة')}
              </LabelTag>
              <select
                value={feel}
                onChange={(e) => setFeel(e.target.value)}
                className="input-base appearance-none cursor-pointer"
              >
                {FEEL_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <LabelTag icon={<Users className="w-3.5 h-3.5" />}>
                {t('Audience', 'الجمهور')}
              </LabelTag>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="input-base appearance-none cursor-pointer"
              >
                {TARGET_AUDIENCES.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Idea count + language */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <LabelTag icon={<Wand2 className="w-3.5 h-3.5" />}>
                {t('Number of Ideas', 'عدد الأفكار')}
              </LabelTag>
              <div className="flex gap-2">
                {[2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setIdeaCount(n)}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      ideaCount === n
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-white/5 text-[var(--text-muted)] hover:bg-white/10'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <LabelTag icon={<Tag className="w-3.5 h-3.5" />}>
                {t('Output Language', 'لغة المخرجات')}
              </LabelTag>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="input-base appearance-none cursor-pointer"
              >
                <option value="English">English</option>
                <option value="Arabic">العربية</option>
                <option value="French">Français</option>
                <option value="Spanish">Español</option>
                <option value="German">Deutsch</option>
              </select>
            </div>
          </div>

          {/* Grid + orientation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <LabelTag icon={<Film className="w-3.5 h-3.5" />}>
                {t('Storyboard Grid', 'شبكة لوحة القصة')}
              </LabelTag>
              <div className="flex gap-2">
                {['1x2', '2x2', '3x3'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setGridSelection(g)}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      gridSelection === g
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-white/5 text-[var(--text-muted)] hover:bg-white/10'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <LabelTag icon={<Target className="w-3.5 h-3.5" />}>
                {t('Orientation', 'الاتجاه')}
              </LabelTag>
              <div className="flex gap-2">
                {(['horizontal', 'vertical', 'square'] as const).map((o) => (
                  <button
                    key={o}
                    onClick={() => setOrientation(o)}
                    className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${
                      orientation === o
                        ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-white/5 text-[var(--text-muted)] hover:bg-white/10'
                    }`}
                  >
                    {o.slice(0, 4)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Analyze button */}
          <button
            onClick={handleAnalyze}
            disabled={analyzing || productImages.length === 0}
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-bold py-5 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('Analyzing Brand DNA...', 'جاري التحليل...')}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {t('Analyze & Generate Ideas', 'حلل وأنشئ الأفكار')}
              </>
            )}
          </button>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl flex items-start gap-3 text-sm">
              <X className="w-4 h-4 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* RIGHT - OUTPUTS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="xl:col-span-7 space-y-6"
      >
        {!brandDNA && !analyzing && (
          <div className="bg-[var(--bg-secondary)] rounded-[2rem] p-12 border-2 border-dashed border-[var(--border-color)] flex flex-col items-center justify-center text-center min-h-[600px] space-y-6">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-[var(--text-muted)] opacity-30" />
            </div>
            <p className="text-lg text-[var(--text-muted)] max-w-md leading-relaxed">
              {t(
                'Upload your product image and click Analyze. The AI will detect your brand identity, colors, audience, and propose distinct ad ideas.',
                'ارفع صورة منتجك واضغط على تحليل. سيكتشف الذكاء الاصطناعي هوية علامتك ويقترح أفكار إعلانية متميزة.'
              )}
            </p>
          </div>
        )}

        {analyzing && (
          <div className="bg-[var(--bg-secondary)] rounded-[2rem] p-12 border border-[var(--border-color)] flex flex-col items-center justify-center text-center min-h-[600px] space-y-6">
            <Loader2 className="w-12 h-12 text-indigo-400 animate-spin" />
            <p className="text-lg font-bold">
              {t('Analyzing your product...', 'جاري تحليل منتجك...')}
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              {t(
                'Detecting brand colors, feel, audience, and crafting ideas',
                'كشف الألوان والإحساس والجمهور وصياغة الأفكار'
              )}
            </p>
          </div>
        )}

        {brandDNA && (
          <>
            {/* Brand DNA card */}
            <div className="bg-[var(--bg-secondary)] rounded-[2rem] p-8 border border-[var(--border-color)] shadow-xl space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-400 mb-2">
                    {t('Brand DNA Detected', 'تم اكتشاف هوية العلامة')}
                  </div>
                  <h3 className="text-3xl font-black tracking-tight">
                    {brandDNA.productName}
                  </h3>
                  <div className="text-sm text-[var(--text-muted)] mt-1">
                    {brandDNA.productCategory}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  {brandDNA.brandColors.map((c, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div
                        className="w-4 h-4 rounded-md border border-white/20"
                        style={{ backgroundColor: c }}
                      />
                      <span className="text-[10px] font-mono">{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[var(--border-color)]">
                <DNARow label={t('Feel', 'الإحساس')} value={brandDNA.feel} />
                <DNARow label={t('Audience', 'الجمهور')} value={brandDNA.audience} />
                <div className="md:col-span-2">
                  <DNARow label={t('Key Features', 'الميزات الرئيسية')} value={brandDNA.keyFeatures} />
                </div>
                <div className="md:col-span-2">
                  <DNARow label={t('Visual Style', 'النمط البصري')} value={brandDNA.style} />
                </div>
              </div>
            </div>

            {/* Ideas */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black tracking-tight">
                  {t('Video Ideas', 'أفكار الفيديو')}
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                  {brandDNA.videoIdeas.length} {t('ideas', 'أفكار')}
                </span>
              </div>

              {brandDNA.videoIdeas.map((idea, idx) => (
                <IdeaCard
                  key={idx}
                  idea={idea}
                  index={idx}
                  prompts={ideasWithPrompts.get(idx)}
                  generating={generatingPrompts === idx}
                  onGeneratePrompts={() => handleGeneratePrompts(idx)}
                />
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

function DNARow({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <div className="text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
        {label}
      </div>
      <div className="text-sm text-[var(--text-primary)]">{value}</div>
    </div>
  );
}

interface IdeaCardProps {
  idea: VideoIdea;
  index: number;
  prompts?: StoryboardPrompt[];
  generating: boolean;
  onGeneratePrompts: () => void;
}

function IdeaCard({
  idea,
  index,
  prompts,
  generating,
  onGeneratePrompts,
}: IdeaCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--bg-secondary)] rounded-[1.5rem] border border-[var(--border-color)] overflow-hidden hover:border-[var(--border-strong)] transition-all"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-6 text-left flex items-start gap-4"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-black flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
          {index + 1}
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-lg font-bold tracking-tight">{idea.title}</h4>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-violet-500/15 text-violet-300 uppercase tracking-widest">
              {idea.duration}
            </span>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 uppercase tracking-widest">
              {idea.videoStyle}
            </span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] italic">
            "{idea.hook}"
          </p>
        </div>
        <ChevronRight
          className={`w-5 h-5 text-[var(--text-muted)] transition-transform shrink-0 ${expanded ? 'rotate-90' : ''}`}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 space-y-5">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {idea.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-rose-400 flex items-center gap-1.5 mb-1">
                    <Mic className="w-3 h-3" />
                    {t('Emotional Trigger', 'الإثارة العاطفية')}
                  </div>
                  <div className="text-xs">{idea.emotionalTrigger}</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-[9px] font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5 mb-1">
                    <Target className="w-3 h-3" />
                    {t('Call To Action', 'عبارة الحث')}
                  </div>
                  <div className="text-xs">{idea.callToAction}</div>
                </div>
              </div>

              {!prompts && (
                <button
                  onClick={onGeneratePrompts}
                  disabled={generating}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-fuchsia-500 to-pink-600 text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-fuchsia-500/20"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t('Generating storyboard prompts...', 'جاري توليد الموجهات...')}
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      {t('Generate 2 Storyboard Prompts', 'توليد موجهي لوحة قصة')}
                    </>
                  )}
                </button>
              )}

              {prompts && prompts.length > 0 && (
                <div className="space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-3 h-3" />
                    {t('Ready-to-use prompts', 'موجهات جاهزة للاستخدام')}
                  </div>
                  {prompts.map((p) => (
                    <PromptCard key={p.setNumber} prompt={p} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PromptCard({ prompt }: { prompt: StoryboardPrompt }) {
  return (
    <div className="rounded-2xl bg-black/40 border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">
            SET {prompt.setNumber} · {prompt.grid} GRID
          </span>
        </div>
        <CopyButton text={prompt.prompt} variant="full" />
      </div>
      <pre className="p-4 text-xs text-[var(--text-secondary)] font-mono whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto custom-scrollbar">
        {prompt.prompt}
      </pre>
    </div>
  );
}
