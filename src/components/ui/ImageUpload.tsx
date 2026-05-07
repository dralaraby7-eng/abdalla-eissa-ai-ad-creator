import { useRef } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { motion } from 'motion/react';
import {
  processFiles,
  extractFilesFromPaste,
  type ProcessedFile,
} from '../../utils/files';
import { t } from '../../utils/i18n';

interface ImageUploadProps {
  files: ProcessedFile[];
  onChange: (files: ProcessedFile[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  label?: string;
  hint?: string;
  compact?: boolean;
}

export function ImageUpload({
  files,
  onChange,
  multiple = true,
  maxFiles = 10,
  label,
  hint,
  compact = false,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: ProcessedFile[]) => {
    const merged = multiple ? [...files, ...incoming] : incoming.slice(0, 1);
    onChange(merged.slice(0, maxFiles));
  };

  const removeAt = (idx: number) => {
    onChange(files.filter((_, i) => i !== idx));
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const processed = await processFiles(e.target.files);
    addFiles(processed);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    e.stopPropagation();
    const pasted = extractFilesFromPaste(e);
    if (pasted.length === 0) return;
    const processed = await processFiles(pasted);
    addFiles(processed);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/')
    );
    if (dropped.length === 0) return;
    const processed = await processFiles(dropped);
    addFiles(processed);
  };

  const canAdd = files.length < maxFiles;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-zinc-400">
          <UploadCloud className="w-3.5 h-3.5" />
          <span>{label}</span>
        </div>
      )}

      <div
        className={`grid ${compact ? 'grid-cols-4' : 'grid-cols-3'} gap-2`}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {files.map((file, idx) => (
          <motion.div
            key={`${file.preview.slice(-20)}-${idx}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-square rounded-2xl overflow-hidden border border-[var(--border-color)] group"
          >
            <img
              src={file.preview}
              alt={`upload ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removeAt(idx)}
              className="absolute top-1.5 right-1.5 bg-rose-500/80 hover:bg-rose-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-all"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="absolute bottom-1.5 left-1.5 text-[9px] font-bold text-white/90 bg-black/50 px-1.5 py-0.5 rounded">
              #{idx + 1}
            </div>
          </motion.div>
        ))}

        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-2xl border-2 border-dashed border-[var(--border-color)] hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all flex flex-col items-center justify-center text-[var(--text-muted)] hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <UploadCloud className="w-5 h-5 mb-1" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-center px-1">
              {t('Add', 'إضافة')}
            </span>
          </button>
        )}
      </div>

      {hint && (
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">
          {hint}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
