import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, X, ShieldCheck, AlertCircle, LogOut } from 'lucide-react';
import { verifyPin, setCurrentSession, loadUsers } from '../../utils/userStorage';
import type { User, UserSession } from '../../types';
import { t } from '../../utils/i18n';

interface Props {
  open: boolean;
  onSuccess: (user: User) => void;
  onClose: () => void;
}

export function UserPinModal({ open, onSuccess, onClose }: Props) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setPin('');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pin.trim()) return;
    setLoading(true);
    setError('');

    const users = loadUsers();
    if (users.length === 0) {
      setError(t(
        'No users configured. Admin must add users in Settings → Users.',
        'لا يوجد مستخدمون. يجب على المسؤول إضافة مستخدمين في الإعدادات.'
      ));
      setLoading(false);
      return;
    }

    const user = verifyPin(pin);
    if (!user) {
      setError(t('Incorrect PIN. Please try again.', 'رمز PIN غير صحيح. حاول مرة أخرى.'));
      setPin('');
      setLoading(false);
      inputRef.current?.focus();
      return;
    }

    setCurrentSession(user);
    setLoading(false);
    onSuccess(user);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl w-full max-w-sm p-7"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-xl shadow-indigo-700/30">
                <Lock className="w-7 h-7 text-white" />
              </div>
            </div>

            <h2 className="text-center text-lg font-bold text-zinc-100 mb-1">
              {t('Subscription Required', 'مطلوب اشتراك')}
            </h2>
            <p className="text-center text-sm text-zinc-500 mb-6">
              {t(
                'OpenRouter models are for subscribers. Enter your PIN to continue.',
                'نماذج OpenRouter للمشتركين فقط. أدخل رمز PIN للمتابعة.'
              )}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
                  {t('Your PIN', 'رمز PIN الخاص بك')}
                </label>
                <input
                  ref={inputRef}
                  type="password"
                  value={pin}
                  onChange={(e) => { setPin(e.target.value); setError(''); }}
                  placeholder="••••••"
                  maxLength={20}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/60 focus:bg-white/[0.06] transition-all text-center text-xl tracking-widest"
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={!pin.trim() || loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-indigo-700/20 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                {loading ? t('Verifying…', 'جارٍ التحقق…') : t('Unlock Models', 'فتح النماذج')}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 text-zinc-400 text-sm transition-all"
              >
                {t('Cancel', 'إلغاء')}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ---------- Active session badge (shown in header/toolbar) ----------

interface SessionBadgeProps {
  session: UserSession;
  onLogout: () => void;
}

export function UserSessionBadge({ session, onLogout }: SessionBadgeProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-sm">
      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
      <span className="text-indigo-300 font-semibold text-xs">{session.name}</span>
      <button
        type="button"
        onClick={onLogout}
        className="text-zinc-500 hover:text-zinc-300 transition-colors ml-1"
        title={t('Log out', 'تسجيل الخروج')}
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
