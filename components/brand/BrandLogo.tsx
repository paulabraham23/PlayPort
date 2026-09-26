import { Image } from 'expo-image';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

const LOGO = require('../../assets/images/playport-logo.png');

type Size = 'sm' | 'md' | 'lg' | 'xl';

const SIZES: Record<Size, number> = {
  sm: 28,
  md: 36,
  lg: 48,
  xl: 72,
};

interface Props {
  size?: Size | number;
  style?: StyleProp<ViewStyle>;
}

/** Official PlayPort mark (gamepad + wordmark). */
export function BrandLogo({ size = 'md', style }: Props) {
  const px = typeof size === 'number' ? size : SIZES[size];
  return (
    <Image
      source={LOGO}
      style={[styles.logo, { width: px, height: px }, style as object]}
      contentFit="contain"
      accessibilityLabel="PlayPort"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    borderRadius: 999,
    backgroundColor: '#000000',
  },
});
