// =====================================================
// File handling utilities
// =====================================================

export interface ProcessedFile {
  preview: string;   // data URL
  base64: string;    // base64 only (no prefix)
  mimeType: string;
  name: string;
  size: number;
}

export function processFile(file: File): Promise<ProcessedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve({
        preview: result,
        base64,
        mimeType: file.type,
        name: file.name,
        size: file.size,
      });
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export async function processFiles(
  files: FileList | File[]
): Promise<ProcessedFile[]> {
  const fileArr = Array.from(files);
  return Promise.all(fileArr.map(processFile));
}

export function extractFilesFromPaste(e: ClipboardEvent | React.ClipboardEvent): File[] {
  const clipboardData =
    (e as React.ClipboardEvent).clipboardData ||
    (e as ClipboardEvent).clipboardData;
  const items = clipboardData?.items;
  if (!items) return [];

  const files: File[] = [];
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      const file = items[i].getAsFile();
      if (file) files.push(file);
    }
  }
  return files;
}

export function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function fileSizeKB(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
