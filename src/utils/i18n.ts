/**
 * Tiny bilingual helper - returns "English / Arabic" string
 * Mirrors v1 behavior. Use direction state in App for layout.
 */
export const t = (en: string, ar: string) => `${en} / ${ar}`;

/**
 * For UI labels where you want only one language at a time based on direction.
 */
export const tDir = (en: string, ar: string, dir: 'ltr' | 'rtl') =>
  dir === 'rtl' ? ar : en;
