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

  const breakpoint: Breakpoint = isXs
    ? 'xs'
    : width < 768
      ? 'sm'
      : width < 1024
        ? 'md'
        : width < 1280
          ? 'lg'
          : 'xl';

  const horizontalPadding = isXs ? 12 : isMobile ? 16 : isTablet ? 24 : 32;
  const maxContent = isWide
    ? layout.desktopMaxWidth
    : isDesktop
      ? 1000
      : isTablet
        ? 840
        : width;

  const contentWidth = Math.min(width, maxContent);
  const innerWidth = Math.max(contentWidth - horizontalPadding * 2, 0);

  const experienceColumns = isDesktop ? 2 : isTablet ? 2 : 1;
  const productColumns = isWide ? 3 : isDesktop || isTablet ? 2 : 1;
  const categoryColumns = isWide ? 5 : isDesktop ? 4 : isTablet ? 3 : 2;
  const valuePropColumns = isDesktop ? 4 : 2;

  const gap = isMobile ? 12 : 16;

  const columnWidth = (columns: number, customGap = gap) => {
    if (columns <= 1) return innerWidth;
    return (innerWidth - customGap * (columns - 1)) / columns;
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
    contentWidth,
    innerWidth,
    horizontalPadding,
    gap,
    columns: productColumns,
    experienceColumns,
    productColumns,
    categoryColumns,
    valuePropColumns,
    columnWidth,
    /** Readable width for auth / checkout forms on large screens */
    formMaxWidth: isMobile ? undefined : 520,
    /** Two-pane commerce layouts */
    useSplitPane: isDesktop,
  };
}
