/**
 * PlayPort colour system — source: playport-colour-palette.pdf
 * Background + CTA are global constants (never change per category).
 * Category accents are for icons / titles / badges only — never replace CTA.
 */
export const colors = {
  // Core (used everywhere)
  baseBlack: '#121212', // bg-base — page background
  surface: '#1A1A1F', // bg-surface — cards, panels, sections
  surfaceAlt: '#2A2A30', // bg-surface-alt — placeholders, dividers, inputs
  border: '#2A2A30', // hairline borders, dividers (same as surface-alt)
  primaryText: '#F5F5F5', // text-primary — headings, body
  secondaryText: '#9CA3AF', // text-secondary — captions, muted labels
  mutedText: '#9CA3AF',

  // Primary CTA (fixed brand — do not vary by category)
  playportOrange: '#FF5722', // cta-primary
  ctaPrimary: '#FF5722',
  ctaPrimaryText: '#FFFFFF',
  ctaPrimaryHover: '#FF6A3D',
  orangeSoft: '#FF6B4A', // gaming accent (warm coral)
  orangeTint: '#2A1A14', // soft orange surface for chips / selected states
  orangeTintStrong: '#241610',

  // Status (fixed, semantic)
  success: '#4ADE80',
  successBg: '#0A2F38',
  info: '#3B9EFF',
  infoBg: '#0A2A3D',
  warning: '#E8A33D',
  danger: '#EF4444',
  dangerBg: 'rgba(239,68,68,0.15)',

  white: '#FFFFFF',
  black: '#000000',
  badgeRed: '#FF3B30',
  overlay: 'rgba(0,0,0,0.65)',

  // Category accents (vary by experience type — not for CTAs)
  categories: {
    gaming: '#FF6B4A',
    movieNights: '#E8A33D',
    musicKaraoke: '#E2618F',
    partySocial: '#4ADE80',
    // Additional marketplace vibes mapped to nearest palette accents
    family: '#E8A33D',
    kids: '#E2618F',
    dateNight: '#E2618F',
    racing: '#FF6B4A',
    vr: '#3B9EFF',
    boardGames: '#4ADE80',
  },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
} as const;

export const fonts = {
  heading: 'SpaceGrotesk_600SemiBold',
  headingMedium: 'SpaceGrotesk_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
} as const;

export const layout = {
  maxContentWidth: 840,
  desktopMaxWidth: 1120,
  headerHeight: 56,
  tabBarHeight: 64,
  bottomBarHeight: 72,
} as const;

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
} as const;
