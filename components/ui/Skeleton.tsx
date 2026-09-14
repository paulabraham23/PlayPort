import { StyleSheet, View } from 'react-native';
import { colors, radii } from '@/constants/theme';

export function Skeleton({ height = 16, width = '100%', radius = radii.sm }: { height?: number; width?: number | `${number}%`; radius?: number }) {
  return <View style={[styles.bone, { height, width, borderRadius: radius }]} />;
}

const styles = StyleSheet.create({
  bone: {
    backgroundColor: colors.surfaceAlt,
    opacity: 0.85,
  },
});
