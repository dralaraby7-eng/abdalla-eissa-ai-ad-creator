import { useState } from 'react';
import { motion } from 'motion/react';
import { Music, Wand2, Loader2, Volume2 } from 'lucide-react';
import { ModelSelector } from '../ui/ModelSelector';
import { ImageUpload } from '../ui/ImageUpload';
import { CopyButton } from '../ui/CopyButton';
import { LabelTag } from '../ui/LabelTag';
import { suggestSoundEffects } from '../../services/soundService';
import type { ProcessedFile } from '../../utils/files';
import type { AppSettings } from '../../types';
import { incrementUsage } from '../../utils/storage';
import { t } from '../../utils/i18n';

interface Props {
  settings: AppSettings;
  onUsage?: () => void;
}

export function SoundEffectsTool({ settings, onUsage }: Props) {
  const [model, setModel] = useState(settings.defaultModel);
  const [images, setImages] = useState<ProcessedFile[]>([]);
  const [context, setContext] = useState('');
  const [output, setOutput] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  async function handleAnalyze() {
    if (images.length === 0) {
      setError(t('Please upload an image first', 'الرجاء رفع صورة أولاً'));
      return;
    }
    setGenerating(true);
    setError('');
    setOutput('');
    try {
      const result = await suggestSoundEffects(
        images[0].base64,
        images[0].mimeType,
        context,
        model
      );
      setOutput(result);
      incrementUsage('sound');
      onUsage?.();
    } catch (e: any) {
      setError(e.message || 'Generation failed');
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
          label={t('Scene / Ad Frame Image', 'صورة المشهد / إطار الإعلان')}
          maxFiles={1}
        />

        <div>
          <label className="block mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
            {t('Additional Context (optional)', 'سياق إضافي (اختياري)')}
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder={t(
              'Describe the mood, the action, the brand…',
              'صف المزاج، الحدث، العلامة…'
            )}
            rows={4}
            className="input-base w-full"
          />
        </div>

        <button
          type="button"
          onClick={handleAnalyze}
          disabled={generating}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-amber-600/20"
        >
          {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
          {generating ? t('Analyzing…', 'جارٍ التحليل…') : t('Suggest Sound Design', 'اقتراح تصميم الصوت')}
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
            <Music className="w-16 h-16 text-zinc-700 mb-4" />
            <h3 className="text-lg font-bold text-zinc-300 mb-2">
              {t('Sound Design Suggestions', 'اقتراحات تصميم الصوت')}
            </h3>
            <p className="text-sm text-zinc-500 max-w-md">
              {t(
                'Upload a frame and get AI-curated SFX, foley, music genre, and cinematic audio cues.',
                'ارفع إطاراً واحصل على مؤثرات صوتية ومؤثرات Foley وأنواع موسيقية وإشارات صوتية سينمائية مختارة بالذكاء الاصطناعي.'
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
              <LabelTag variant="amber" icon={<Volume2 className="w-3 h-3" />}>
                {t('Sound Design', 'تصميم الصوت')}
              </LabelTag>
              <CopyButton text={output} />
            </div>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-100 font-mono bg-black/30 p-5 rounded-xl border border-white/5">
              {output}
            </pre>
          </motion.div>
        )}
      </div>
    </div>
  );
}
