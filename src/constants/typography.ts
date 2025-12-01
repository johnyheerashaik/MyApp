
export const FONT_FAMILY = {
  REGULAR: 'System',
  MEDIUM: 'System',
  BOLD: 'System',
  SEMI_BOLD: 'System',
} as const;

export const FONT_SIZE = {
  XS: 12,
  SM: 13,
  BASE: 14,
  MD: 15,
  LG: 16,
  XL: 18,
  XXL: 20,
  XXXL: 22,
  XXXXL: 24,
  XXXXXL: 26,
} as const;

export const FONT_WEIGHT = {
  REGULAR: '400' as const,
  MEDIUM: '500' as const,
  SEMI_BOLD: '600' as const,
  BOLD: '700' as const,
  EXTRA_BOLD: '800' as const,
};

export const LINE_HEIGHT = {
  TIGHT: 1.2,
  NORMAL: 1.5,
  RELAXED: 1.75,
  LOOSE: 2,
} as const;
