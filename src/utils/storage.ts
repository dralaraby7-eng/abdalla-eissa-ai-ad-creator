import type { AppSettings, UsageStats } from '../types';

// =====================================================
// Storage utilities (localStorage wrapper)
// =====================================================

const STORAGE_KEYS = {
  SETTINGS: 'aec_settings_v2',
  USAGE: 'aec_usage_v2',
  HISTORY: 'aec_history_v2',
  ADMIN_AUTHED: 'aec_admin_authed_v2',
};

// ---------- SETTINGS ----------
export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  direction: 'ltr',
  fontSize: 'normal',
  defaultModel: 'gemini-2.5-flash',
  defaultGrid: '3x3',
  defaultOrientation: 'horizontal',
  defaultLanguage: 'English',
  monthlyLimit: 0, // 0 = unlimited
  requirePassword: false,
  adminPasswordHash: '',
  customGeminiKey: '',
  customOpenRouterKey: '',
  watermark: true,
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
}

// ---------- USAGE STATS ----------
export const DEFAULT_USAGE: UsageStats = {
  totalGenerations: 0,
  brandDNARuns: 0,
  storyboardRuns: 0,
  scriptRuns: 0,
  soundRuns: 0,
  extractorRuns: 0,
  lastUsed: '',
  monthlyResetDate: new Date().toISOString(),
  monthlyGenerations: 0,
};

export function loadUsage(): UsageStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USAGE);
    if (!raw) return { ...DEFAULT_USAGE };
    const parsed: UsageStats = JSON.parse(raw);

    // Auto-reset monthly counter if month elapsed
    const last = new Date(parsed.monthlyResetDate || new Date());
    const now = new Date();
    const monthsDiff =
      (now.getFullYear() - last.getFullYear()) * 12 +
      (now.getMonth() - last.getMonth());
    if (monthsDiff >= 1) {
      parsed.monthlyGenerations = 0;
      parsed.monthlyResetDate = now.toISOString();
    }
    return { ...DEFAULT_USAGE, ...parsed };
  } catch {
    return { ...DEFAULT_USAGE };
  }
}

export function saveUsage(usage: UsageStats): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USAGE, JSON.stringify(usage));
  } catch (err) {
    console.error('Failed to save usage:', err);
  }
}

export function incrementUsage(
  type: 'brandDNA' | 'storyboard' | 'script' | 'sound' | 'extractor'
): UsageStats {
  const current = loadUsage();
  const updated: UsageStats = {
    ...current,
    totalGenerations: current.totalGenerations + 1,
    monthlyGenerations: current.monthlyGenerations + 1,
    lastUsed: new Date().toISOString(),
  };
  if (type === 'brandDNA') updated.brandDNARuns += 1;
  if (type === 'storyboard') updated.storyboardRuns += 1;
  if (type === 'script') updated.scriptRuns += 1;
  if (type === 'sound') updated.soundRuns += 1;
  if (type === 'extractor') updated.extractorRuns += 1;
  saveUsage(updated);
  return updated;
}

export function checkLimit(): { allowed: boolean; used: number; limit: number } {
  const settings = loadSettings();
  const usage = loadUsage();
  if (settings.monthlyLimit === 0) {
    return { allowed: true, used: usage.monthlyGenerations, limit: 0 };
  }
  return {
    allowed: usage.monthlyGenerations < settings.monthlyLimit,
    used: usage.monthlyGenerations,
    limit: settings.monthlyLimit,
  };
}

// ---------- ADMIN ----------
// Tiny non-cryptographic hash for casual gating (NOT real security).
export function hashPassword(pw: string): string {
  let h = 0;
  for (let i = 0; i < pw.length; i++) {
    h = (h << 5) - h + pw.charCodeAt(i);
    h |= 0;
  }
  return 'h_' + Math.abs(h).toString(36);
}

export function isAdminAuthed(): boolean {
  return sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTHED) === 'yes';
}
export function setAdminAuthed(yes: boolean): void {
  if (yes) sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTHED, 'yes');
  else sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTHED);
}

// ---------- HISTORY (last project autosave) ----------
export function saveHistory(name: string, data: any): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY) || '{}';
    const map = JSON.parse(raw);
    map[name] = { data, savedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(map));
  } catch (err) {
    console.error('Failed to save history:', err);
  }
}

export function loadHistory(name: string): any | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY) || '{}';
    const map = JSON.parse(raw);
    return map[name]?.data || null;
  } catch {
    return null;
  }
}

export function clearAllStorage(): void {
  Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTHED);
}
