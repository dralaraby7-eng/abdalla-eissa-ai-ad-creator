import { useState } from 'react';
import { motion } from 'motion/react';
import { Wand2, Loader2, FileText, Sparkles } from 'lucide-react';
import { ModelSelector } from '../ui/ModelSelector';
import { ImageUpload } from '../ui/ImageUpload';
import { CopyButton } from '../ui/CopyButton';
import { LabelTag } from '../ui/LabelTag';
import {
  VIDEO_DURATIONS,
  TONE_OPTIONS,
  TARGET_AUDIENCES,
  SCRIPT_TYPES,
  LANGUAGES,
} from '../../config/styles';
import { generateAdScript } from '../../services/scriptService';
import type { ProcessedFile } from '../../utils/files';
import type { AppSettings } from '../../types';
import { incrementUsage } from '../../utils/storage';
import { t } from '../../utils/i18n';

interface Props {
  settings: AppSettings;
  onUsage?: () => void;
}

export function AdScriptTool({ settings, onUsage }: Props) {
  const [model, setModel] = useState(settings.defaultModel);
  const [productImages, setProductImages] = useState<ProcessedFile[]>([]);
  const [instructionsImages, setInstructionsImages] = useState<ProcessedFile[]>([]);
  const [socialImages, setSocialImages] = useState<ProcessedFile[]>([]);
  const [brief, setBrief] = useState('');

  const [language, setLanguage] = useState(settings.defaultLanguage);
  const [scriptType, setScriptType] = useState('voiceover');
  const [duration, setDuration] = useState('30');
  const [tone, setTone] = useState('auto');
  const [audience, setAudience] = useState('auto');

  const [output, setOutput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  async function handleGenerate() {
    if (productImages.length === 0 && !brief.trim()) {
      setError(t('Please upload a product image or write a brief', 'الرجاء رفع صورة منتج أو كتابة موجز'));
      return;
    }
    setGenerating(true);
    setError('');
    setOutput('');
    try {
      const result = await generateAdScript({
        productImages: productImages.map((f) => f.base64),
        productImagesMime: productImages.map((f) => f.mimeType),
        instructionsImages: instructionsImages.map((f) => f.base64),
        instructionsImagesMime: instructionsImages.map((f) => f.mimeType),
        socialMediaImages: socialImages.map((f) => f.base64),
        socialMediaImagesMime: socialImages.map((f) => f.mimeType),
        clientBrief: brief,
        language,
        scriptType,
        videoDuration: duration,
        tone,
        targetAudience: audience,
        model,
      });
      setOutput(result);
      incrementUsage('script');
      onUsage?.();
    } catch (e: any) {
      setError(e.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6 h-full">
      {/* LEFT: controls */}
      <div className="space-y-5 overflow-y-auto custom-scrollbar pr-2">
        <ModelSelector value={model} onChange={setModel} />

        <ImageUpload
          files={productImages}
          onChange={setProductImages}
          label={t('Product Images', 'صور المنتج')}
          multiple
          maxFiles={4}
        />

        <div>
          <label className="block mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
            {t('Brief / Concept', 'موجز / مفهوم')}
          </label>
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder={t(
              'Describe what the ad is about, the message, the offer…',
              'صف موضوع الإعلان والرسالة والعرض…'
            )}
            rows={5}
            className="input-base w-full"
          />
        </div>

        <ImageUpload
          files={instructionsImages}
          onChange={setInstructionsImages}
          label={t('Brand / Brief Instructions (optional)', 'تعليمات العلامة / الموجز (اختياري)')}
          multiple
          maxFiles={3}
        />

        <ImageUpload
          files={socialImages}
          onChange={setSocialImages}
          label={t('Social Media Reference (optional)', 'مرجع وسائل التواصل (اختياري)')}
          multiple
          maxFiles={3}
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
              {t('Language', 'اللغة')}
            </label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="input-base w-full">
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
              {t('Script Type', 'نوع السيناريو')}
            </label>
            <select value={scriptType} onChange={(e) => setScriptType(e.target.value)} className="input-base w-full">
              {SCRIPT_TYPES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
              {t('Duration', 'المدة')}
            </label>
            <select value={duration} onChange={(e) => setDuration(e.target.value)} className="input-base w-full">
              {VIDEO_DURATIONS.map((d) => (
                <option key={d.id} value={d.id}>{d.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
              {t('Tone', 'النبرة')}
            </label>
            <select value={tone} onChange={(e) => setTone(e.target.value)} className="input-base w-full">
              {TONE_OPTIONS.map((tn) => (
                <option key={tn.id} value={tn.id}>{tn.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
            {t('Audience', 'الجمهور')}
          </label>
          <select value={audience} onChange={(e) => setAudience(e.target.value)} className="input-base w-full">
            {TARGET_AUDIENCES.map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-600/20"
        >
          {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
          {generating ? t('Writing…', 'جارٍ الكتابة…') : t('Generate Ad Script', 'توليد السيناريو')}
        </button>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-300">
            {error}
          </div>
        )}
      </div>

      {/* RIGHT: output */}
      <div className="overflow-y-auto custom-scrollbar pr-2">
        {!output ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-white/10 rounded-3xl">
            <FileText className="w-16 h-16 text-zinc-700 mb-4" />
            <h3 className="text-lg font-bold text-zinc-300 mb-2">
              {t('Ad Script Output', 'مخرجات السيناريو')}
            </h3>
            <p className="text-sm text-zinc-500 max-w-md">
              {t(
                'Outputs are pure spoken words ready for voiceover — no production notes, no shot directions.',
                'المخرجات كلمات منطوقة جاهزة للتعليق الصوتي — بدون ملاحظات إنتاج أو توجيهات تصوير.'
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
              <div className="flex items-center gap-2 flex-wrap">
                <LabelTag variant="emerald" icon={<Sparkles className="w-3 h-3" />}>
                  {SCRIPT_TYPES.find((s) => s.id === scriptType)?.label}
                </LabelTag>
                <LabelTag variant="indigo">{language}</LabelTag>
                <LabelTag variant="amber">{duration}s</LabelTag>
              </div>
              <CopyButton text={output} />
            </div>
            <pre className="whitespace-pre-wrap text-base leading-relaxed text-zinc-100 font-sans bg-black/30 p-5 rounded-xl border border-white/5">
              {output}
            </pre>
          </motion.div>
        )}
      </div>
    </div>
  );
}
