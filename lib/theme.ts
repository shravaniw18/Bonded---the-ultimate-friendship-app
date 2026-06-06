// lib/theme.ts
// ─────────────────────────────────────────────
// Bonded design system
// Import from here everywhere. No hardcoded values.
// ─────────────────────────────────────────────

export const colors = {
  // ── Brand (from your palette) ──────────────
  primary:        '#4A8FA8',   // teal blue — main buttons, active states
  primaryLight:   '#E8F4F8',   // teal tint
  primaryDark:    '#2D6B80',   // teal deep

  accent:         '#D4A8C0',   // dusty pink — reactions, highlights
  accentLight:    '#F5E8EF',   // pink tint
  accentDark:     '#8B5A72',   // pink deep

  success:        '#7DB89A',   // sage green — online, streaks
  successLight:   '#E8F5EE',   // sage tint
  successDark:    '#3D7A5A',   // sage deep

  warning:        '#F5A623',   // keep as is
  warningLight:   '#FAEEDA',
  warningDark:    '#633806',

  danger:         '#E8412A',   // keep as is
  dangerLight:    '#FAECE7',
  dangerDark:     '#712B13',

  // ── Neutrals ───────────────────────────────
  white:          '#FFFFFF',
  black:          '#0A0A0A',

  gray50:         '#F7F5F8',   // soft lavender-white background
  gray100:        '#EDE8EF',   // card background
  gray200:        '#D8D0DC',   // borders
  gray300:        '#B8A8BF',   // disabled
  gray400:        '#8A7A92',   // placeholder
  gray500:        '#6B5C72',   // secondary text
  gray700:        '#3D2E44',   // primary text
  gray900:        '#1E1228',   // headings

  // ── rest stays the same ────────────────────
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