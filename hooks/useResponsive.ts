import { useWindowDimensions } from 'react-native';
import { layout } from '@/constants/theme';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export function useResponsive() {
  const { width, height } = useWindowDimensions();

  const isXs = width < 380;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const isWide = width >= 1280;
  const isUltrawide = width >= 1536;

  const breakpoint: Breakpoint = isXs
    ? 'xs'
    : width < 768
      ? 'sm'
      : width < 1024
        ? 'md'
        : width < 1280
          ? 'lg'
          : 'xl';

  const horizontalPadding = isXs ? 12 : isMobile ? 16 : isTablet ? 28 : isWide ? 40 : 32;

  const maxContent = isUltrawide
    ? layout.ultrawideMaxWidth
    : isWide
      ? layout.desktopMaxWidth
      : isDesktop
        ? 1040
        : isTablet
          ? 900
          : width;

  const contentWidth = Math.min(width, maxContent);
  const innerWidth = Math.max(contentWidth - horizontalPadding * 2, 0);

  // Commerce grids — denser as the viewport grows (Blinkit-style 2-col on phones)
  const productColumns = isUltrawide ? 4 : isWide ? 4 : isDesktop ? 3 : isTablet ? 3 : isXs ? 1 : 2;
  const experienceColumns = isWide ? 3 : isDesktop || isTablet ? 2 : 1;
  const categoryColumns = isUltrawide ? 6 : isWide ? 5 : isDesktop ? 4 : isTablet ? 3 : 2;
  const valuePropColumns = isDesktop ? 4 : 2;
  const orderColumns = isWide ? 2 : isDesktop ? 2 : 1;
  const adminColumns = isWide ? 3 : isDesktop || isTablet ? 2 : 1;

  const gap = isXs ? 10 : isMobile ? 12 : 16;
  const sectionGap = isMobile ? 24 : 32;
  const heroMinHeight = isDesktop ? 320 : isTablet ? 260 : isXs ? 180 : 220;

  const columnWidth = (columns: number, customGap = gap) => {
    if (columns <= 1) return innerWidth;
    return (innerWidth - customGap * (columns - 1)) / columns;
  };

  /** Styles to center a shell at contentWidth (header, sticky bars, tab chrome). */
  const shellStyle = {
    width: '100%' as const,
    maxWidth: contentWidth,
    alignSelf: 'center' as const,
  };

  /** Horizontal page gutter. */
  const padStyle = {
    paddingHorizontal: horizontalPadding,
  };

  return {
    width,
    height,
    breakpoint,
    isXs,
    isMobile,
    isTablet,
    isDesktop,
    isWide,
    isUltrawide,
    contentWidth,
    innerWidth,
    horizontalPadding,
    gap,
    sectionGap,
    heroMinHeight,
    columns: productColumns,
    experienceColumns,
    productColumns,
    categoryColumns,
    valuePropColumns,
    orderColumns,
    adminColumns,
    columnWidth,
    shellStyle,
    padStyle,
    /** Readable width for auth / checkout forms on large screens */
    formMaxWidth: isMobile ? undefined : 520,
    /** Admin / rider main pane */
    opsMaxWidth: isUltrawide ? 1280 : isWide ? 1120 : 960,
    /** Two-pane commerce layouts */
    useSplitPane: isDesktop,
    /** Hide secondary chrome on very small phones */
    compactChrome: isXs,
  };
}
