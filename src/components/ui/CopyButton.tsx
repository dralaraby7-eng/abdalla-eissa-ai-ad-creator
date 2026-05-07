import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { copyToClipboard } from '../../utils/files';
import { t } from '../../utils/i18n';

interface CopyButtonProps {
  text: string;
  className?: string;
  variant?: 'icon' | 'full';
}

export function CopyButton({
  text,
  className = '',
  variant = 'icon',
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyToClipboard(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        className={`p-2 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-[var(--text-muted)] transition-all ${className}`}
        title={copied ? 'Copied!' : 'Copy'}
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`px-3 py-2 rounded-lg bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-[var(--text-muted)] transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${className}`}
    >
      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      {copied ? t('Copied', 'تم النسخ') : t('Copy', 'نسخ')}
    </button>
  );
}
