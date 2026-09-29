/**
 * PlayPort — light, Airbnb-like canvas with the matte orange brand.
 */
export const colors = {
  // ── Surfaces — white canvas, soft gray wells ───────────────────────────
  baseBlack: '#222222',
  page: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceRaised: '#FFFFFF',
  surfaceAlt: '#F7F7F7',
  surfaceHover: '#EBEBEB',
  border: '#DDDDDD',
  borderSubtle: '#EBEBEB',
  borderFocus: 'rgba(184, 106, 50, 0.45)',

  // ── Text ───────────────────────────────────────────────────────────────
  primaryText: '#222222',
  secondaryText: '#6A6A6A',
  mutedText: '#717171',

  // ── Brand — matte neutral orange (desaturated clay, not neon) ─────────
  playportOrange: '#B86A32',
  ctaPrimary: '#B86A32',
  ctaPrimaryText: '#FFFFFF',
  ctaPrimaryHover: '#C87A42',
  orangeSoft: '#945528',
  orangeDeep: '#73401E',
  orangeTint: 'rgba(184, 106, 50, 0.12)',
  orangeTintStrong: 'rgba(184, 106, 50, 0.20)',
  orangeGlow: 'rgba(184, 106, 50, 0.18)',
  orangeBorder: 'rgba(184, 106, 50, 0.42)',

  // ── Status ─────────────────────────────────────────────────────────────
  success: '#14804A',
  successBg: 'rgba(20, 128, 74, 0.10)',
  info: '#2F6FED',
  infoBg: 'rgba(47, 111, 237, 0.10)',
  warning: '#F5C242',
  danger: '#F26D6D',
  dangerBg: 'rgba(242, 109, 109, 0.12)',

  // ── Primitives ─────────────────────────────────────────────────────────
  white: '#FFFFFF',
  black: '#000000',
  badgeRed: '#EF4444',
  overlay: 'rgba(4, 6, 10, 0.72)',
  heroScrim: 'rgba(7, 8, 12, 0.55)',
  heroScrimStrong: 'rgba(7, 8, 12, 0.85)',

  // ── Delivery ───────────────────────────────────────────────────────────
  etaBg: 'rgba(20, 128, 74, 0.10)',
  etaText: '#14804A',

  // ── Category accents — muted corporate jewel tones ────────────────────
  categories: {
    gaming: '#A78BFA',
    movieNights: '#F0A6CA',
    musicKaraoke: '#5EA8FF',
    partySocial: '#B86A32',
    family: '#3DD68C',
    kids: '#F5C242',
    dateNight: '#F27E7E',
    racing: '#5EA8FF',
    vr: '#C084FC',
    boardGames: '#94A3B8',
  },
} as const;

/** Signature vertical gradients (module-level: shared style objects). */
export const gradients = {
  brand: ['#C87A42', '#B86A32', '#945528'] as const,
  brandSubtle: ['#B86A32', '#945528'] as const,
  heroScrim: ['rgba(7,8,12,0)', 'rgba(7,8,12,0.82)', 'rgba(7,8,12,0.97)'] as const,
  heroVeil: ['rgba(7,8,12,0.45)', 'rgba(7,8,12,0.35)'] as const,
  cardSheen: ['rgba(255,255,255,0.045)', 'rgba(255,255,255,0)'] as const,
  cta: ['#C87A42', '#A35A28'] as const,
  statusbar: ['rgba(11,13,18,0.92)', 'rgba(11,13,18,0.75)', 'rgba(11,13,18,0.92)'] as const,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

export const radii = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 26,
  xxl: 34,
  full: 999,
} as const;

export const fonts = {
  heading: 'NunitoSans_700Bold',
  headingMedium: 'NunitoSans_600SemiBold',
  body: 'NunitoSans_400Regular',
  bodyMedium: 'NunitoSans_500Medium',
  mono: 'NunitoSans_500Medium',
  monoMedium: 'NunitoSans_600SemiBold',
} as const;

export const typeScale = {
  caption: 11,
  small: 12,
  body: 14,
  bodyLg: 15,
  title: 17,
  headline: 22,
  display: 28,
  hero: 34,
} as const;

export const layout = {
  maxContentWidth: 840,
  desktopMaxWidth: 1200,
  ultrawideMaxWidth: 1320,
  headerHeight: 64,
  tabBarHeight: 64,
  bottomBarHeight: 76,
  floatingCartHeight: 56,
} as const;

/** Airbnb-like soft elevation on a white canvas. */
export const shadows = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  soft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  glow: {
    shadowColor: colors.playportOrange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 3,
  },
  lift: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 6,
  },
} as const;

export const webShadows = {
  card: '0 6px 16px rgba(0,0,0,0.12)',
  soft: '0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)',
  glow: '0 6px 16px rgba(184,106,50,0.22)',
  lift: '0 8px 28px rgba(0,0,0,0.16)',
} as const;
