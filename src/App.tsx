import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { Home } from './components/tools/Home';
import { BrandDNATool } from './components/tools/BrandDNATool';
import { StoryboardTool } from './components/tools/StoryboardTool';
import { AdScriptTool } from './components/tools/AdScriptTool';
import { SoundEffectsTool } from './components/tools/SoundEffectsTool';
import { ExtractorTool } from './components/tools/ExtractorTool';
import { SettingsModal } from './components/tools/SettingsModal';
import { UserSessionBadge } from './components/ui/UserPinModal';
import {
  loadSettings,
  saveSettings,
  hashPassword,
  isAdminAuthed,
  setAdminAuthed,
  checkLimit,
} from './utils/storage';
import { getCurrentSession, clearCurrentSession } from './utils/userStorage';
import type { AppSettings, Tool } from './types';
import { t } from './utils/i18n';
import { hasGeminiKey, hasOpenRouterKey } from './services/aiService';

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [activeTool, setActiveTool] = useState<Tool>('home');
  const [settingsOpen, setSettingsOpen] = useState(false);

  // password gate state
  const [authed, setAuthed] = useState(() =>
    !loadSettings().requirePassword || isAdminAuthed()
  );
  const [pwdInput, setPwdInput] = useState('');
  const [pwdError, setPwdError] = useState('');

  // limit warning
  const [limitWarning, setLimitWarning] = useState<string | null>(null);
  const [usageCounter, setUsageCounter] = useState(0); // bump to re-check limits

  // user session (subscriber) — updated reactively via userSessionChange events
  const [currentSession, setCurrentSessionState] = useState(getCurrentSession);

  useEffect(() => {
    const handler = () => setCurrentSessionState(getCurrentSession());
    window.addEventListener('userSessionChange', handler);
    return () => window.removeEventListener('userSessionChange', handler);
  }, []);

  function handleUserLogout() {
    clearCurrentSession(); // dispatches userSessionChange → updates state above
  }

  // ---- apply theme/direction/font-size to <html>
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-theme', settings.theme);
    html.setAttribute('dir', settings.direction);
    html.classList.toggle('font-large', settings.fontSize === 'large');
    if (settings.theme === 'dark') {
      html.classList.add('dark');
      html.classList.remove('light');
    } else {
      html.classList.add('light');
      html.classList.remove('dark');
    }
  }, [settings.theme, settings.direction, settings.fontSize]);

  // ---- check usage limit when usage increments
  const handleUsage = useCallback(() => {
    setUsageCounter((c) => c + 1);
    const lim = checkLimit();
    if (!lim.allowed) {
      setLimitWarning(
        t(
          `Monthly limit reached: ${lim.used}/${lim.limit}. Increase or remove the limit in Settings.`,
          `تم بلوغ الحد الشهري: ${lim.used}/${lim.limit}. يمكنك زيادته أو إزالته من الإعدادات.`
        )
      );
    } else if (lim.limit > 0 && lim.used >= lim.limit * 0.85) {
      setLimitWarning(
        t(
          `Approaching monthly limit: ${lim.used}/${lim.limit}.`,
          `اقتراب من الحد الشهري: ${lim.used}/${lim.limit}.`
        )
      );
    }
  }, []);

  useEffect(() => {
    if (limitWarning) {
      const timer = setTimeout(() => setLimitWarning(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [limitWarning]);

  function handleSettingsChange(next: AppSettings) {
    setSettings(next);
    saveSettings(next);
  }

  function handlePwdSubmit(e: React.FormEvent) {
    e.preventDefault();
    const incoming = hashPassword(pwdInput.trim());
    if (incoming === settings.adminPasswordHash) {
      setAuthed(true);
      setAdminAuthed(true);
      setPwdInput('');
      setPwdError('');
    } else {
      setPwdError(t('Incorrect password', 'كلمة مرور غير صحيحة'));
    }
  }

  function toggleTheme() {
    handleSettingsChange({
      ...settings,
      theme: settings.theme === 'dark' ? 'light' : 'dark',
    });
  }
  function toggleDirection() {
    handleSettingsChange({
      ...settings,
      direction: settings.direction === 'ltr' ? 'rtl' : 'ltr',
    });
  }
  function toggleFontSize() {
    handleSettingsChange({
      ...settings,
      fontSize: settings.fontSize === 'normal' ? 'large' : 'normal',
    });
  }

  // ---- key warnings
  const noKeys = !hasGeminiKey() && !hasOpenRouterKey();

  // ---- password gate
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-6">
        <motion.form
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onSubmit={handlePwdSubmit}
          className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-8 max-w-md w-full shadow-2xl"
        >
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/30">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] text-center mb-2">
            {t('Protected App', 'تطبيق محمي')}
          </h2>
          <p className="text-sm text-[var(--text-muted)] text-center mb-6">
            {t(
              'Enter the admin password to continue.',
              'أدخل كلمة مرور الإدارة للمتابعة.'
            )}
          </p>
          <input
            type="password"
            value={pwdInput}
            onChange={(e) => setPwdInput(e.target.value)}
            autoFocus
            placeholder="••••••••"
            className="input-base w-full mb-3"
          />
          {pwdError && (
            <p className="text-rose-400 text-sm mb-3 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              {pwdError}
            </p>
          )}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold uppercase tracking-widest text-sm shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            {t('Unlock', 'فتح')}
          </button>
        </motion.form>
      </div>
    );
  }

  // ---- main shell
  return (
    <div
      className={`min-h-screen flex bg-[var(--bg-primary)] text-[var(--text-primary)] ${
        settings.fontSize === 'large' ? 'text-base' : 'text-sm'
      }`}
      style={{ direction: settings.direction }}
    >
      <Sidebar
        active={activeTool}
        onChange={setActiveTool}
        theme={settings.theme}
        toggleTheme={toggleTheme}
        direction={settings.direction}
        toggleDirection={toggleDirection}
        fontSize={settings.fontSize}
        toggleFontSize={toggleFontSize}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <main className="flex-1 min-w-0 overflow-x-hidden">
        {/* Subscriber session badge */}
        {currentSession && (
          <div className="flex items-center justify-end px-6 py-2 border-b border-white/5">
            <UserSessionBadge session={currentSession} onLogout={handleUserLogout} />
          </div>
        )}

        {/* No-keys banner */}
        {noKeys && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-3 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-200">
              {t(
                'No API keys detected. Add GEMINI_API_KEY in AI Studio Secrets, or paste a custom key in Settings.',
                'لم يتم العثور على مفاتيح API. أضف GEMINI_API_KEY في أسرار AI Studio، أو الصق مفتاحاً مخصصاً في الإعدادات.'
              )}
            </p>
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="ml-auto text-xs font-bold text-amber-300 hover:text-amber-200 underline"
            >
              {t('Open Settings', 'فتح الإعدادات')}
            </button>
          </div>
        )}

        {/* Limit warning toast */}
        <AnimatePresence>
          {limitWarning && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 right-4 z-50 bg-rose-500/95 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-2xl max-w-sm text-sm"
            >
              {limitWarning}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-6 lg:p-10 min-h-[calc(100vh-0px)]">
          {activeTool === 'home' && <Home onNavigate={setActiveTool} />}
          {activeTool === 'brand-dna' && (
            <BrandDNATool settings={settings} onUsage={handleUsage} />
          )}
          {activeTool === 'storyboard' && (
            <StoryboardTool settings={settings} onUsage={handleUsage} />
          )}
          {activeTool === 'ad-script' && (
            <AdScriptTool settings={settings} onUsage={handleUsage} />
          )}
          {activeTool === 'sound-effects' && (
            <SoundEffectsTool settings={settings} onUsage={handleUsage} />
          )}
          {activeTool === 'extractor' && (
            <ExtractorTool settings={settings} onUsage={handleUsage} />
          )}
        </div>
      </main>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  );
}
