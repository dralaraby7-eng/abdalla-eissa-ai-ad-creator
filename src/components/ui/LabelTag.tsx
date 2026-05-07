import type { ReactNode } from 'react';

interface LabelTagProps {
  icon?: ReactNode;
  children: ReactNode;
  variant?: 'indigo' | 'emerald' | 'amber' | 'rose';
}

export function LabelTag({
  icon,
  children,
  variant = 'indigo',
}: LabelTagProps) {
  const variants = {
    indigo: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.1)]',
    emerald: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
    amber: 'bg-amber-500/15 border-amber-500/30 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
    rose: 'bg-rose-500/15 border-rose-500/30 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.1)]',
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${variants[variant]} text-[10px] font-bold uppercase tracking-widest`}
    >
      {icon}
      <span>{children}</span>
    </div>
  );
}
