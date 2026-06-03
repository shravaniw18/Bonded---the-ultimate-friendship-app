// lib/theme.ts
// ─────────────────────────────────────────────
// Bonded design system
// Import from here everywhere. No hardcoded values.
// Usage: import { colors, font, spacing, radius } from '@/lib/theme'
// ─────────────────────────────────────────────

export const colors = {
  // ── Brand ──────────────────────────────────
  primary:        '#6C63FF',   // purple — main buttons, active states
  primaryLight:   '#EEEDFE',   // purple tint — pill backgrounds, highlights
  primaryDark:    '#3C3489',   // purple deep — text on light purple bg

  accent:         '#FF6B9D',   // pink — reactions, pet module, love stuff
  accentLight:    '#FBEAF0',   // pink tint
  accentDark:     '#72243E',   // pink deep

  success:        '#1D9E75',   // green — online dot, streaks, completed
  successLight:   '#E1F5EE',   // green tint
  successDark:    '#085041',   // green deep

  warning:        '#F5A623',   // amber — cafe finder, notifications
  warningLight:   '#FAEEDA',   // amber tint
  warningDark:    '#633806',   // amber deep

  danger:         '#E8412A',   // red — destructive actions, errors
  dangerLight:    '#FAECE7',   // red tint
  dangerDark:     '#712B13',   // red deep

  // ── Neutrals ───────────────────────────────
  white:          '#FFFFFF',
  black:          '#0A0A0A',

  gray50:         '#F9F8F6',   // page background
  gray100:        '#F1EFE8',   // card background
  gray200:        '#E4E1D8',   // subtle borders
  gray300:        '#C8C4B8',   // disabled states
  gray400:        '#9C9890',   // placeholder text
  gray500:        '#6B6760',   // secondary text
  gray700:        '#3A3835',   // primary text (softer than pure black)
  gray900:        '#1A1916',   // headings

  // ── Module colours ─────────────────────────
  moments:        '#FF6B9D',   // pink
  study:          '#6C63FF',   // purple
  pet:            '#FF6B9D',   // pink
  diet:           '#1D9E75',   // green
  poop:           '#8B5E3C',   // brown (obviously)
  cafe:           '#F5A623',   // amber
  book:           '#E8412A',   // red-coral
  stats:          '#2D7DD2',   // blue

  // ── Transparent overlays ───────────────────
  overlay:        'rgba(10, 10, 10, 0.45)',
  overlayLight:   'rgba(10, 10, 10, 0.15)',
};

// ─────────────────────────────────────────────
// Typography
// ─────────────────────────────────────────────

export const font = {
  // sizes
  xs:     11,
  sm:     12,
  base:   14,
  md:     15,
  lg:     17,
  xl:     20,
  '2xl':  24,
  '3xl':  28,
  '4xl':  34,

  // weights (use with fontWeight in StyleSheet)
  regular:  '400' as const,
  medium:   '500' as const,
  semibold: '600' as const,
  bold:     '700' as const,

  // line heights
  tight:    1.2,
  normal:   1.5,
  relaxed:  1.7,
};

// ─────────────────────────────────────────────
// Spacing scale (multiples of 4)
// ─────────────────────────────────────────────

export const spacing = {
  0:    0,
  1:    4,
  2:    8,
  3:    12,
  4:    16,
  5:    20,
  6:    24,
  8:    32,
  10:   40,
  12:   48,
  16:   64,
  20:   80,
};

// ─────────────────────────────────────────────
// Border radius
// ─────────────────────────────────────────────

export const radius = {
  sm:     6,
  md:     10,
  lg:     14,
  xl:     20,
  full:   9999,   // use for pills and avatars
};

// ─────────────────────────────────────────────
// Shadows (pass as style prop)
// ─────────────────────────────────────────────

export const shadow = {
  sm: {
    shadowColor:   colors.black,
    shadowOffset:  { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius:  3,
    elevation:     2,           // Android
  },
  md: {
    shadowColor:   colors.black,
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius:  8,
    elevation:     5,
  },
  lg: {
    shadowColor:   colors.black,
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius:  16,
    elevation:     10,
  },
};

// ─────────────────────────────────────────────
// Usage examples
// ─────────────────────────────────────────────
//
// import { colors, font, spacing, radius, shadow } from '@/lib/theme'
//
// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: colors.white,
//     borderRadius:    radius.lg,
//     padding:         spacing[4],
//     ...shadow.sm,
//   },
//   title: {
//     fontSize:   font.lg,
//     fontWeight: font.semibold,
//     color:      colors.gray900,
//   },
//   pill: {
//     backgroundColor: colors.primaryLight,
//     borderRadius:    radius.full,
//     paddingHorizontal: spacing[3],
//     paddingVertical:   spacing[1],
//   },
// })