// lib/theme.ts
// ─────────────────────────────────────────────
// Bonded design system
// Import from here everywhere. No hardcoded values.
// ─────────────────────────────────────────────

export const colors = {
  // ── Brand ──────────────────────────────────
  primary:        '#6C63FF',
  primaryLight:   '#EEEDFE',
  primaryDark:    '#3C3489',

  accent:         '#FF6B9D',
  accentLight:    '#FBEAF0',
  accentDark:     '#72243E',

  success:        '#1D9E75',
  successLight:   '#E1F5EE',
  successDark:    '#085041',

  warning:        '#F5A623',
  warningLight:   '#FAEEDA',
  warningDark:    '#633806',

  danger:         '#E8412A',
  dangerLight:    '#FAECE7',
  dangerDark:     '#712B13',

  // ── Neutrals ───────────────────────────────
  white:          '#FFFFFF',
  black:          '#0A0A0A',

  gray50:         '#F9F8F6',
  gray100:        '#F1EFE8',
  gray200:        '#E4E1D8',
  gray300:        '#C8C4B8',
  gray400:        '#9C9890',
  gray500:        '#6B6760',
  gray700:        '#3A3835',
  gray900:        '#1A1916',

  // ── Aliases (used by login/home/index screens) ──
  background:     '#0A0A0A',   // dark background
  surface:        '#1A1916',   // card/input background
  text:           '#FFFFFF',   // primary text on dark bg
  textSecondary:  '#9C9890',   // secondary text
  textMuted:      '#6B6760',   // placeholder text

  // ── Module colours ─────────────────────────
  moments:        '#FF6B9D',
  study:          '#6C63FF',
  pet:            '#FF6B9D',
  diet:           '#1D9E75',
  poop:           '#8B5E3C',
  cafe:           '#F5A623',
  book:           '#E8412A',
  stats:          '#2D7DD2',

  // ── Transparent overlays ───────────────────
  overlay:        'rgba(10, 10, 10, 0.45)',
  overlayLight:   'rgba(10, 10, 10, 0.15)',
};

// ─────────────────────────────────────────────
// Typography
// ─────────────────────────────────────────────

export const font = {
  xs:       11,
  sm:       12,
  base:     14,
  md:       15,
  lg:       17,
  xl:       20,
  '2xl':    24,
  '3xl':    28,
  '4xl':    34,

  regular:  '400' as const,
  medium:   '500' as const,
  semibold: '600' as const,
  bold:     '700' as const,

  tight:    1.2,
  normal:   1.5,
  relaxed:  1.7,
};

// ─────────────────────────────────────────────
// Spacing — two formats supported:
//   spacing[4]  → 16px  (object style)
//   spacing.md  → 16px  (dot style)
// ─────────────────────────────────────────────

export const spacing: Record<string | number, number> = {
  // numeric keys
  0:   0,
  1:   4,
  2:   8,
  3:   12,
  4:   16,
  5:   20,
  6:   24,
  8:   32,
  10:  40,
  12:  48,
  16:  64,
  20:  80,

  // named aliases
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

// ─────────────────────────────────────────────
// Border radius
// ─────────────────────────────────────────────

export const radius = {
  sm:   6,
  md:   10,
  lg:   14,
  xl:   20,
  full: 9999,
};

// alias for files that import borderRadius
export const borderRadius = radius;

// ─────────────────────────────────────────────
// Shadows
// ─────────────────────────────────────────────

export const shadow = {
  sm: {
    shadowColor:   '#0A0A0A',
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius:  3,
    elevation:     2,
  },
  md: {
    shadowColor:   '#0A0A0A',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius:  8,
    elevation:     5,
  },
  lg: {
    shadowColor:   '#0A0A0A',
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius:  16,
    elevation:     10,
  },
};