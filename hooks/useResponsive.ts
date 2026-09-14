import { useWindowDimensions } from 'react-native';
import { layout } from '@/constants/theme';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const contentWidth = Math.min(width, isDesktop ? layout.desktopMaxWidth : layout.maxContentWidth);
  const horizontalPadding = isMobile ? 16 : 24;

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    contentWidth,
    horizontalPadding,
    columns: isDesktop ? 3 : isTablet ? 2 : 1,
  };
}
