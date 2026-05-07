import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import type { ProcessedFile } from '../../utils/files';
import { t } from '../../utils/i18n';

interface Props {
  images: ProcessedFile[];
  onPick: (hex: string) => void;
  onClose: () => void;
}

export function ImageColorPicker({ images, onPick, onClose }: Props) {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const [hoverColor, setHoverColor] = useState('');
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    images.forEach((img, i) => {
      const canvas = canvasRefs.current[i];
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const image = new Image();
      image.onload = () => {
        const W = 300, H = 200;
        canvas.width = W;
        canvas.height = H;
        ctx.fillStyle = '#111111';
        ctx.fillRect(0, 0, W, H);
        const ratio = Math.min(W / image.naturalWidth, H / image.naturalHeight);
        const w = image.naturalWidth * ratio;
        const h = image.naturalHeight * ratio;
        ctx.drawImage(image, (W - w) / 2, (H - h) / 2, w, h);
      };
      image.src = `data:${img.mimeType};base64,${img.base64}`;
    });
  }, [images]);

  function pickPixel(canvas: HTMLCanvasElement, clientX: number, clientY: number): string {
    const ctx = canvas.getContext('2d');
    if (!ctx) return '#000000';
    const rect = canvas.getBoundingClientRect();
    const px = Math.max(0, Math.min(Math.floor((clientX - rect.left) * (canvas.width / rect.width)), canvas.width - 1));
    const py = Math.max(0, Math.min(Math.floor((clientY - rect.top) * (canvas.height / rect.height)), canvas.height - 1));
    const [r, g, b] = ctx.getImageData(px, py, 1, 1).data;
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>, i: number) {
    const canvas = canvasRefs.current[i];
    if (!canvas) return;
    setHoverColor(pickPixel(canvas, e.clientX, e.clientY));
    setCursorPos({ x: e.clientX, y: e.clientY });
  }

  function handleClick(e: React.MouseEvent<HTMLCanvasElement>, i: number) {
    const canvas = canvasRefs.current[i];
    if (!canvas) return;
    onPick(pickPixel(canvas, e.clientX, e.clientY));
    onClose();
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="bg-zinc-950 border border-white/10 rounded-3xl shadow-2xl p-5 w-full max-w-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                {t('Pick color from image', 'اختر لوناً من الصورة')}
              </span>
              {hoverColor && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5">
                  <div className="w-4 h-4 rounded border border-white/20" style={{ background: hoverColor }} />
                  <span className="text-xs font-mono text-zinc-300">{hoverColor}</span>
                </div>
              )}
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-500">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-zinc-600 mb-3">
            {t('Hover to preview · Click to select', 'مرر للمعاينة · انقر للاختيار')}
          </p>

          <div className={`grid gap-3 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {images.map((_, i) => (
              <canvas
                key={i}
                ref={(el) => { canvasRefs.current[i] = el; }}
                className="w-full rounded-2xl border border-white/10"
                style={{ cursor: 'crosshair', display: 'block' }}
                onMouseMove={(e) => handleMouseMove(e, i)}
                onMouseLeave={() => setHoverColor('')}
                onClick={(e) => handleClick(e, i)}
              />
            ))}
          </div>
        </motion.div>

        {/* Floating preview near cursor */}
        {hoverColor && (
          <div
            className="fixed z-[201] pointer-events-none flex items-center gap-1.5 bg-zinc-900 border border-white/20 rounded-lg px-2 py-1 shadow-xl"
            style={{ left: cursorPos.x + 14, top: cursorPos.y - 32 }}
          >
            <div className="w-4 h-4 rounded border border-white/20" style={{ background: hoverColor }} />
            <span className="text-xs font-mono text-white">{hoverColor}</span>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
