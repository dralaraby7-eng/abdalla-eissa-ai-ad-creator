import { useState, useRef, useEffect } from 'react';
import { Cpu, ChevronDown, Check, Sparkles, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AI_MODELS, findModel } from '../../config/models';
import { hasGeminiKey, hasOpenRouterKey } from '../../services/aiService';
import { getCurrentSession, setCurrentSession } from '../../utils/userStorage';
import { t } from '../../utils/i18n';
import { UserPinModal } from './UserPinModal';
import type { User } from '../../types';

interface ModelSelectorProps {
  value: string;
  onChange: (id: string) => void;
  className?: string;
  compact?: boolean;
}

export function ModelSelector({
  value,
  onChange,
  className = '',
  compact = false,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [pendingModelId, setPendingModelId] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const hasG = hasGeminiKey();
  const hasOR = hasOpenRouterKey();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const current = findModel(value) || AI_MODELS[0];
  const session = getCurrentSession(); // re-read on every render; sessionKey forces refresh

  const grouped: Record<string, typeof AI_MODELS> = {
    Gemini: AI_MODELS.filter((m) => m.provider === 'gemini'),
    'Claude (via OpenRouter)': AI_MODELS.filter(
      (m) => m.provider === 'openrouter' && m.id.startsWith('anthropic/')
    ),
    'OpenAI (via OpenRouter)': AI_MODELS.filter(
      (m) => m.provider === 'openrouter' && m.id.startsWith('openai/')
    ),
    'Other (via OpenRouter)': AI_MODELS.filter(
      (m) =>
        m.provider === 'openrouter' &&
        !m.id.startsWith('anthropic/') &&
        !m.id.startsWith('openai/')
    ),
  };

  const isAvailable = (id: string) => {
    const m = findModel(id);
    if (!m) return false;
    if (m.provider === 'gemini') return hasG;
    if (m.provider === 'openrouter') return hasOR;
    return false;
  };

  function handleModelClick(modelId: string) {
    const m = findModel(modelId);
    if (!m) return;

    if (m.provider === 'openrouter') {
      const s = getCurrentSession();
      if (!s) {
        setOpen(false);
        setPendingModelId(modelId);
        setPinModalOpen(true);
        return;
      }
    }

    onChange(modelId);
    setOpen(false);
  }

  function handlePinSuccess(user: User) {
    setCurrentSession(user);
    setPinModalOpen(false);
    if (pendingModelId) {
      onChange(pendingModelId);
      setPendingModelId('');
    }
  }

  return (
    <>
      <div ref={ref} className={`relative ${className}`}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center justify-between gap-3 px-4 ${compact ? 'py-2.5' : 'py-3.5'} rounded-2xl bg-white/[0.03] border border-[var(--border-color)] hover:border-indigo-500/40 hover:bg-white/[0.05] transition-all group`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <div className="text-left min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                {t('AI Model', 'نموذج الذكاء الاصطناعي')}
              </div>
              <div className="text-sm font-bold text-[var(--text-primary)] truncate flex items-center gap-2">
                {current.label}
                {current.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold">
                    {current.badge}
                  </span>
                )}
              </div>
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-[var(--text-muted)] transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 mt-2 w-full max-h-[420px] overflow-y-auto custom-scrollbar rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-strong)] shadow-2xl shadow-black/50 p-2"
            >
              {/* Session info banner */}
              {session ? (
                <div className="mx-2 mb-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  {t(`Subscribed as: ${session.name}`, `مشترك كـ: ${session.name}`)}
                </div>
              ) : (
                <div className="mx-2 mb-2 px-3 py-2 rounded-xl bg-amber-500/8 border border-amber-500/15 text-amber-400 text-xs flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  {t('OpenRouter models require a subscription PIN', 'نماذج OpenRouter تتطلب رمز PIN للاشتراك')}
                </div>
              )}

              {Object.entries(grouped).map(([group, models]) => {
                if (models.length === 0) return null;
                return (
                  <div key={group} className="mb-2 last:mb-0">
                    <div className="px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                      {group}
                    </div>
                    {models.map((m) => {
                      const avail = isAvailable(m.id);
                      const needsPin = m.provider === 'openrouter' && !session && avail;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          disabled={!avail}
                          onClick={() => handleModelClick(m.id)}
                          className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                            m.id === value
                              ? 'bg-indigo-500/15 border border-indigo-500/30'
                              : avail
                                ? 'bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] hover:border-white/10'
                                : 'opacity-40 cursor-not-allowed border border-transparent'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-[var(--text-primary)]">
                                {m.label}
                              </span>
                              {m.badge && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold">
                                  {m.badge}
                                </span>
                              )}
                              {needsPin && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5" />
                                  PIN
                                </span>
                              )}
                              {!avail && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-red-500/20 text-red-400 font-bold">
                                  {t('NO KEY', 'لا يوجد مفتاح')}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[var(--text-muted)] mt-0.5">
                              {m.description}
                            </div>
                          </div>
                          {m.id === value && (
                            <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                );
              })}

              {!hasOR && (
                <div className="mt-2 mx-2 mb-1 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    {t(
                      'Add an OpenRouter key in Settings → API Keys to unlock Claude Opus, Sonnet, GPT-5 & more.',
                      'أضف مفتاح OpenRouter في الإعدادات لفتح كلود وجي بي تي.'
                    )}
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <UserPinModal
        open={pinModalOpen}
        onSuccess={handlePinSuccess}
        onClose={() => { setPinModalOpen(false); setPendingModelId(''); }}
      />
    </>
  );
}
