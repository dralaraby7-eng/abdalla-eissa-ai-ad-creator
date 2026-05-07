import { motion } from 'motion/react';
import {
  Home,
  Sparkles,
  LayoutGrid,
  FileText,
  Volume2,
  Grid3X3,
  Settings,
  Sun,
  Moon,
  Languages,
  Camera,
  Type,
} from 'lucide-react';
import { useState } from 'react';
import type { Tool, Theme, Direction, FontSize } from '../types';
import { t } from '../utils/i18n';

interface SidebarProps {
  active: Tool;
  onChange: (tool: Tool) => void;
  theme: Theme;
  toggleTheme: () => void;
  direction: Direction;
  toggleDirection: () => void;
  fontSize: FontSize;
  toggleFontSize: () => void;
  onOpenSettings: () => void;
}

const NAV_ITEMS: Array<{
  id: Tool;
  icon: any;
  label: string;
  labelAr: string;
  badge?: string;
}> = [
  { id: 'home', icon: Home, label: 'Home', labelAr: 'الرئيسية' },
  { id: 'brand-dna', icon: Sparkles, label: 'Brand DNA', labelAr: 'الهوية', badge: 'NEW' },
  { id: 'storyboard', icon: LayoutGrid, label: 'Storyboard', labelAr: 'لوحة القصة' },
  { id: 'ad-script', icon: FileText, label: 'Ad Script', labelAr: 'نص الإعلان' },
  { id: 'sound-effects', icon: Volume2, label: 'Sound FX', labelAr: 'مؤثرات صوتية' },
  { id: 'extractor', icon: Grid3X3, label: 'Extractor', labelAr: 'مستخرج' },
];

export function Sidebar({
  active,
  onChange,
  theme,
  toggleTheme,
  direction,
  toggleDirection,
  fontSize,
  toggleFontSize,
  onOpenSettings,
}: SidebarProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <aside className="w-20 lg:w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col py-8 gap-8 sticky top-0 h-screen z-50">
      {/* Logo */}
      <div className="flex flex-col items-center px-6">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-3"
        >
          <Camera className="w-6 h-6 text-white" />
        </motion.div>
        <div className="hidden lg:block text-center">
          <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-[0.3em]">
            {t('Designed by', 'تصميم')}
          </div>
          <div className="text-sm font-black text-[var(--text-primary)] tracking-tight">
            ABDALLA EISSA
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1.5 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`w-full p-3 rounded-2xl transition-all flex items-center gap-3 group ${
                isActive
                  ? 'bg-white/10 text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'
              }`}
            >
              <div
                className={`p-2 rounded-xl transition-colors shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'bg-white/5 group-hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold hidden lg:block tracking-tight flex-1 text-left">
                {t(item.label, item.labelAr)}
              </span>
              {item.badge && (
                <span className="hidden lg:inline-block text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Controls */}
      <div className="px-3 space-y-2">
        <div className="hidden lg:grid grid-cols-3 gap-1.5">
          <button
            onClick={toggleTheme}
            className="aspect-square rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center transition-all"
            title={t('Theme', 'الوضع')}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleDirection}
            className="aspect-square rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center transition-all"
            title={t('Direction', 'الاتجاه')}
          >
            <Languages className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFontSize}
            className="aspect-square rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-center transition-all"
            title={t('Font Size', 'حجم الخط')}
          >
            <Type className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onOpenSettings}
          className="w-full p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-3 transition-all"
        >
          <div className="p-2 rounded-xl bg-white/5 shrink-0">
            <Settings className="w-4 h-4" />
          </div>
          <span className="hidden lg:block text-sm font-bold">{t('Settings', 'الإعدادات')}</span>
        </button>
      </div>
    </aside>
  );
}
