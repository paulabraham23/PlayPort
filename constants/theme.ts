/**
 * PlayPort colour system — minimal dark UI.
 * One brand accent (CTA orange). Category / status colours stay muted.
 */
export const colors = {
  // Core
  baseBlack: '#0F0F10',
  surface: '#171719',
  surfaceAlt: '#222226',
  border: '#2C2C31',
  primaryText: '#F2F2F3',
  secondaryText: '#8B8B93',
  mutedText: '#6B6B73',

  // Primary CTA — single bright signal
  playportOrange: '#D4552A',
  ctaPrimary: '#D4552A',
  ctaPrimaryText: '#FFFFFF',
  ctaPrimaryHover: '#E0663C',
  orangeSoft: '#C4785A',
  orangeTint: '#1C1B1A',
  orangeTintStrong: '#211F1C',

  // Status — desaturated, semantic only
  success: '#7A9E82',
  successBg: '#161C18',
  info: '#7A8FA0',
  infoBg: '#161A1E',
  warning: '#B89A6E',
  danger: '#C46B6B',
  dangerBg: 'rgba(196,107,107,0.12)',

  white: '#FFFFFF',
  black: '#000000',
  badgeRed: '#C45C56',
  overlay: 'rgba(0,0,0,0.65)',

  // Category accents — quiet, near-neutral (icons only)
  categories: {
    gaming: '#9A9A9E',
    movieNights: '#A39E94',
    musicKaraoke: '#A398A0',
    partySocial: '#949A96',
    family: '#A39E94',
    kids: '#A398A0',
    dateNight: '#A398A0',
    racing: '#9A9A9E',
    vr: '#949AA3',
    boardGames: '#949A96',
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
  heading: 'PlusJakartaSans_600SemiBold',
  headingMedium: 'PlusJakartaSans_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  /** Prices / compact labels — same family as UI for a calmer corporate look */
  mono: 'Inter_500Medium',
  monoMedium: 'Inter_600SemiBold',
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
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
} as const;
