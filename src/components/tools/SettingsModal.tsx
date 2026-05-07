import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Settings as SettingsIcon, Trash2, Lock, AlertTriangle, Eye, EyeOff, UserPlus, Users, RotateCcw, ShieldCheck } from 'lucide-react';
import {
  loadSettings,
  saveSettings,
  loadUsage,
  clearAllStorage,
  hashPassword,
  isAdminAuthed,
  setAdminAuthed,
  DEFAULT_SETTINGS,
} from '../../utils/storage';
import {
  loadUsers,
  addUser,
  deleteUser,
  updateUserLimit,
  resetUserCredits,
  resetToDefaultUsers,
} from '../../utils/userStorage';
import { AI_MODELS } from '../../config/models';
import type { AppSettings, User } from '../../types';
import { t } from '../../utils/i18n';

interface Props {
  open: boolean;
  onClose: () => void;
  onSettingsChange: (s: AppSettings) => void;
}

export function SettingsModal({ open, onClose, onSettingsChange }: Props) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [usage, setUsage] = useState(loadUsage());
  const [showPwd, setShowPwd] = useState(false);
  const [adminPwd, setAdminPwd] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  // Admin gate
  const [isAdmin, setIsAdmin] = useState(false);
  const [inlineAdminPwd, setInlineAdminPwd] = useState('');
  const [inlinePwdError, setInlinePwdError] = useState('');

  // Users & Subscriptions
  const [users, setUsers] = useState<User[]>([]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserPin, setNewUserPin] = useState('');
  const [newUserLimit, setNewUserLimit] = useState(50);
  const [showNewUserPin, setShowNewUserPin] = useState(false);
  const [userError, setUserError] = useState('');

  useEffect(() => {
    if (open) {
      const s = loadSettings();
      setSettings(s);
      setUsage(loadUsage());
      setUsers(loadUsers());
      // Admin = no password configured yet, OR already authenticated this session
      setIsAdmin(!s.requirePassword || !s.adminPasswordHash || isAdminAuthed());
    }
  }, [open]);

  function handleInlineAdminUnlock(e: React.FormEvent) {
    e.preventDefault();
    const s = loadSettings();
    if (hashPassword(inlineAdminPwd.trim()) === s.adminPasswordHash) {
      setAdminAuthed(true);
      setIsAdmin(true);
      setInlineAdminPwd('');
      setInlinePwdError('');
    } else {
      setInlinePwdError(t('Incorrect password', 'كلمة مرور غير صحيحة'));
    }
  }

  function handleAddUser() {
    if (!newUserName.trim()) { setUserError(t('Name is required.', 'الاسم مطلوب.')); return; }
    if (newUserPin.trim().length < 3) { setUserError(t('PIN must be at least 3 characters.', 'يجب أن يكون PIN 3 أحرف على الأقل.')); return; }
    addUser(newUserName, newUserPin, newUserLimit);
    setUsers(loadUsers());
    setNewUserName('');
    setNewUserPin('');
    setNewUserLimit(50);
    setUserError('');
  }

  function handleDeleteUser(id: string) {
    deleteUser(id);
    setUsers(loadUsers());
  }

  function handleResetCredits(id: string) {
    resetUserCredits(id);
    setUsers(loadUsers());
  }

  function handleUpdateLimit(id: string, val: number) {
    updateUserLimit(id, val);
    setUsers(loadUsers());
  }

  function update<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    let toSave = { ...settings };
    if (adminPwd.trim()) {
      toSave.adminPasswordHash = hashPassword(adminPwd.trim());
      toSave.requirePassword = true;
    }
    saveSettings(toSave);
    onSettingsChange(toSave);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
    setAdminPwd('');
  }

  function handleResetSettings() {
    saveSettings(DEFAULT_SETTINGS);
    setSettings(DEFAULT_SETTINGS);
    onSettingsChange(DEFAULT_SETTINGS);
    setConfirmReset(false);
  }

  function handleClearAll() {
    clearAllStorage();
    setSettings(DEFAULT_SETTINGS);
    setUsage(loadUsage());
    onSettingsChange(DEFAULT_SETTINGS);
    setConfirmClear(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.94, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-zinc-950/95 backdrop-blur-sm border-b border-white/5 p-5 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <SettingsIcon className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-zinc-100">
                  {t('Settings', 'الإعدادات')}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/5 text-zinc-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Appearance */}
              <Section title={t('Appearance', 'المظهر')}>
                <div className="grid grid-cols-3 gap-3">
                  <Field label={t('Theme', 'النمط')}>
                    <select
                      value={settings.theme}
                      onChange={(e) => update('theme', e.target.value as any)}
                      className="input-base w-full"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                    </select>
                  </Field>
                  <Field label={t('Direction', 'الاتجاه')}>
                    <select
                      value={settings.direction}
                      onChange={(e) => update('direction', e.target.value as any)}
                      className="input-base w-full"
                    >
                      <option value="ltr">LTR (EN)</option>
                      <option value="rtl">RTL (AR)</option>
                    </select>
                  </Field>
                  <Field label={t('Font Size', 'حجم الخط')}>
                    <select
                      value={settings.fontSize}
                      onChange={(e) => update('fontSize', e.target.value as any)}
                      className="input-base w-full"
                    >
                      <option value="normal">Normal</option>
                      <option value="large">Large</option>
                    </select>
                  </Field>
                </div>
              </Section>

              {/* AI Defaults */}
              <Section title={t('AI Defaults', 'إعدادات الذكاء الاصطناعي')}>
                <Field label={t('Default Model', 'النموذج الافتراضي')}>
                  <select
                    value={settings.defaultModel}
                    onChange={(e) => update('defaultModel', e.target.value)}
                    className="input-base w-full"
                  >
                    {AI_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label} {m.badge ? `· ${m.badge}` : ''}
                      </option>
                    ))}
                  </select>
                </Field>
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <Field label={t('Default Grid', 'الشبكة الافتراضية')}>
                    <select
                      value={settings.defaultGrid}
                      onChange={(e) => update('defaultGrid', e.target.value)}
                      className="input-base w-full"
                    >
                      <option value="2x2">2x2</option>
                      <option value="3x3">3x3</option>
                    </select>
                  </Field>
                  <Field label={t('Default Orientation', 'الاتجاه الافتراضي')}>
                    <select
                      value={settings.defaultOrientation}
                      onChange={(e) => update('defaultOrientation', e.target.value as any)}
                      className="input-base w-full"
                    >
                      <option value="horizontal">16:9</option>
                      <option value="vertical">9:16</option>
                      <option value="square">1:1</option>
                    </select>
                  </Field>
                  <Field label={t('Default Language', 'اللغة الافتراضية')}>
                    <select
                      value={settings.defaultLanguage}
                      onChange={(e) => update('defaultLanguage', e.target.value)}
                      className="input-base w-full"
                    >
                      <option value="English">English</option>
                      <option value="Arabic">العربية</option>
                      <option value="Bilingual">EN/AR</option>
                    </select>
                  </Field>
                </div>
              </Section>

              {/* API Keys removed — loaded from .env only */}

              {/* Usage Limits — ADMIN ONLY */}
              {isAdmin && (
              <Section title={t('Usage Limits', 'حدود الاستخدام')}>
                <Field
                  label={t('Monthly Generation Limit (0 = unlimited)', 'حد التوليد الشهري (0 = بلا حد)')}
                >
                  <input
                    type="number"
                    min={0}
                    value={settings.monthlyLimit}
                    onChange={(e) => update('monthlyLimit', parseInt(e.target.value) || 0)}
                    className="input-base w-full"
                  />
                </Field>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <UsageStat label={t('Total', 'الإجمالي')} value={usage.totalGenerations} />
                  <UsageStat label={t('This Month', 'هذا الشهر')} value={usage.monthlyGenerations} />
                  <UsageStat
                    label={t('Last Used', 'آخر استخدام')}
                    value={usage.lastUsed ? new Date(usage.lastUsed).toLocaleDateString() : '—'}
                    isText
                  />
                </div>
              </Section>
              )}

              {/* Admin Lock — ADMIN ONLY */}
              {isAdmin && (
              <Section title={t('Admin Lock', 'قفل الإدارة')}>
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-200/80">
                    {t(
                      'Setting a password will require it to access Settings/Admin Panel from this browser. Lost passwords cannot be recovered — clear browser data to reset.',
                      'تعيين كلمة مرور سيتطلب إدخالها للوصول إلى الإعدادات/لوحة الإدارة من هذا المتصفح. كلمات المرور المفقودة لا يمكن استردادها — امسح بيانات المتصفح لإعادة الضبط.'
                    )}
                  </p>
                </div>
                <Field label={t('Admin Password (leave blank to keep current)', 'كلمة مرور الإدارة (فارغ للإبقاء على الحالية)')}>
                  <div className="relative">
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={adminPwd}
                      onChange={(e) => setAdminPwd(e.target.value)}
                      placeholder="••••••••"
                      className="input-base w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-zinc-500 hover:text-zinc-300"
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </Field>
                <label className="mt-3 flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.requirePassword}
                    onChange={(e) => update('requirePassword', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-zinc-300">
                    {t('Require password to open Settings', 'طلب كلمة المرور لفتح الإعدادات')}
                  </span>
                </label>
              </Section>
              )}

              {/* Misc */}
              <Section title={t('Misc', 'متفرقات')}>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.watermark}
                    onChange={(e) => update('watermark', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-zinc-300">
                    {t('Show "Designed by Abdalla Eissa" in footer', 'إظهار "تصميم عبد الله عيسى" في التذييل')}
                  </span>
                </label>
              </Section>

              {/* Admin unlock card — shown to non-admin when a password is set */}
              {!isAdmin && (
                <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Lock className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                      {t('Admin Access', 'وصول الإدارة')}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mb-3">
                    {t(
                      'API keys, user management, and danger zone are restricted to the admin.',
                      'مفاتيح API وإدارة المستخدمين ومنطقة الخطر مقيدة للمسؤول فقط.'
                    )}
                  </p>
                  <form onSubmit={handleInlineAdminUnlock} className="flex gap-2">
                    <input
                      type="password"
                      value={inlineAdminPwd}
                      onChange={(e) => { setInlineAdminPwd(e.target.value); setInlinePwdError(''); }}
                      placeholder={t('Admin password…', 'كلمة مرور الإدارة…')}
                      className="input-base flex-1 text-sm"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {t('Unlock', 'فتح')}
                    </button>
                  </form>
                  {inlinePwdError && (
                    <p className="mt-2 text-xs text-rose-400">{inlinePwdError}</p>
                  )}
                </div>
              )}

              {/* Users & Subscriptions — ADMIN ONLY */}
              {isAdmin && (
              <Section title={t('Users & Subscriptions', 'المستخدمون والاشتراكات')}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-zinc-500">
                    {t(
                      'Add users with a PIN and credit limit. Credits = number of OpenRouter API calls allowed.',
                      'أضف مستخدمين برمز PIN وحد ائتمان. الائتمانات = عدد طلبات OpenRouter المسموح بها.'
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => { resetToDefaultUsers(); setUsers(loadUsers()); }}
                    className="shrink-0 ml-3 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest transition-colors"
                  >
                    {t('Reset defaults', 'إعادة الافتراضي')}
                  </button>
                </div>

                {/* Existing users */}
                {users.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {users.map((u) => (
                      <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/8">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-zinc-200 truncate">{u.name}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                              u.creditLimit > 0 && u.creditsUsed >= u.creditLimit
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-emerald-500/15 text-emerald-400'
                            }`}>
                              {u.creditLimit === 0
                                ? t(`${u.creditsUsed} used / ∞`, `${u.creditsUsed} مستخدم / ∞`)
                                : t(`${u.creditsUsed} / ${u.creditLimit}`, `${u.creditsUsed} / ${u.creditLimit}`)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] text-zinc-500">
                              {t('Limit:', 'الحد:')}
                            </span>
                            <input
                              type="number"
                              min={0}
                              value={u.creditLimit}
                              onChange={(e) => handleUpdateLimit(u.id, parseInt(e.target.value) || 0)}
                              className="w-20 px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/10 text-zinc-200 text-xs focus:outline-none focus:border-indigo-500/50"
                            />
                            <span className="text-[10px] text-zinc-600">{t('(0=∞)', '(0=∞)')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleResetCredits(u.id)}
                            title={t('Reset credits', 'إعادة ضبط الائتمانات')}
                            className="p-1.5 rounded-lg hover:bg-amber-500/10 text-amber-500 hover:text-amber-400 transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(u.id)}
                            title={t('Delete user', 'حذف المستخدم')}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-zinc-600 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {users.length === 0 && (
                  <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-white/[0.02] border border-dashed border-white/10 text-zinc-600 text-xs">
                    <Users className="w-4 h-4" />
                    {t('No users yet. Add the first subscriber below.', 'لا يوجد مستخدمون بعد. أضف أول مشترك أدناه.')}
                  </div>
                )}

                {/* Add new user form */}
                <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/15 space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5" />
                    {t('Add New User', 'إضافة مستخدم جديد')}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block mb-1 text-[10px] font-semibold text-zinc-500">{t('Name', 'الاسم')}</label>
                      <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => { setNewUserName(e.target.value); setUserError(''); }}
                        placeholder={t('Ahmed', 'أحمد')}
                        className="input-base w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-[10px] font-semibold text-zinc-500">{t('PIN', 'رمز PIN')}</label>
                      <div className="relative">
                        <input
                          type={showNewUserPin ? 'text' : 'password'}
                          value={newUserPin}
                          onChange={(e) => { setNewUserPin(e.target.value); setUserError(''); }}
                          placeholder="••••••"
                          className="input-base w-full text-sm pr-8"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewUserPin(!showNewUserPin)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                        >
                          {showNewUserPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-[10px] font-semibold text-zinc-500">
                      {t('Credit Limit (0 = unlimited)', 'حد الائتمان (0 = بلا حد)')}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={newUserLimit}
                      onChange={(e) => setNewUserLimit(parseInt(e.target.value) || 0)}
                      className="input-base w-full text-sm"
                    />
                  </div>
                  {userError && (
                    <p className="text-xs text-rose-400">{userError}</p>
                  )}
                  <button
                    type="button"
                    onClick={handleAddUser}
                    className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    {t('Add User', 'إضافة مستخدم')}
                  </button>
                </div>
              </Section>
              )} {/* end isAdmin — Users */}

              {/* Danger Zone — ADMIN ONLY */}
              {isAdmin && (
              <Section title={t('Danger Zone', 'منطقة خطرة')} accent="rose">
                <div className="space-y-2">
                  {!confirmReset ? (
                    <button
                      type="button"
                      onClick={() => setConfirmReset(true)}
                      className="w-full py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      <SettingsIcon className="w-4 h-4" />
                      {t('Reset All Settings', 'إعادة ضبط جميع الإعدادات')}
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleResetSettings}
                        className="py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-sm font-bold"
                      >
                        {t('Confirm Reset', 'تأكيد الإعادة')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmReset(false)}
                        className="py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-sm"
                      >
                        {t('Cancel', 'إلغاء')}
                      </button>
                    </div>
                  )}

                  {!confirmClear ? (
                    <button
                      type="button"
                      onClick={() => setConfirmClear(true)}
                      className="w-full py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t('Clear All Data (settings, usage, history)', 'مسح جميع البيانات (إعدادات، استخدام، سجل)')}
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleClearAll}
                        className="py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-sm font-bold"
                      >
                        {t('Confirm Clear All', 'تأكيد المسح')}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmClear(false)}
                        className="py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-sm"
                      >
                        {t('Cancel', 'إلغاء')}
                      </button>
                    </div>
                  )}
                </div>
              </Section>
              )} {/* end isAdmin — Danger Zone */}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-zinc-950/95 backdrop-blur-sm border-t border-white/5 p-4 flex items-center justify-end gap-3">
              {savedFlash && (
                <span className="text-xs text-emerald-400 font-semibold">
                  ✓ {t('Saved', 'تم الحفظ')}
                </span>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-sm font-semibold"
              >
                {t('Close', 'إغلاق')}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/20"
              >
                {t('Save Changes', 'حفظ التغييرات')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({
  title,
  children,
  accent,
}: {
  title: string;
  children: React.ReactNode;
  accent?: 'rose';
}) {
  return (
    <div>
      <h3
        className={`text-xs font-bold uppercase tracking-widest mb-3 ${
          accent === 'rose' ? 'text-rose-400' : 'text-indigo-400'
        }`}
      >
        {title}
      </h3>
      <div>{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className="block mb-1.5 text-xs font-semibold text-zinc-400">{label}</label>
      {children}
    </div>
  );
}

function UsageStat({
  label,
  value,
  isText,
}: {
  label: string;
  value: number | string;
  isText?: boolean;
}) {
  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-3 text-center">
      <div className={`font-bold text-zinc-100 ${isText ? 'text-sm' : 'text-2xl'}`}>{value}</div>
      <div className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">{label}</div>
    </div>
  );
}
