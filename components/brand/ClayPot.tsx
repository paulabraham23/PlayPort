import { StyleSheet, View } from 'react-native';
import { colors } from '@/constants/theme';

/** Small terracotta pot — a quiet brand mark. */
export function ClayPot({ size = 36 }: { size?: number }) {
  const rim = size * 0.62;
  const body = size * 0.78;
  return (
    <View style={[styles.wrap, { width: size, height: size * 1.05 }]} accessibilityElementsHidden>
      <View
        style={{
          width: size * 0.22,
          height: size * 0.1,
          borderRadius: 3,
          backgroundColor: colors.orangeDeep,
        }}
      />
      <View
        style={{
          width: rim,
          height: size * 0.1,
          marginTop: size * 0.02,
          borderRadius: rim,
          backgroundColor: colors.ctaPrimaryHover,
        }}
      />
      <View
        style={{
          width: body,
          height: size * 0.62,
          marginTop: -size * 0.02,
          backgroundColor: colors.playportOrange,
          borderTopLeftRadius: size * 0.16,
          borderTopRightRadius: size * 0.16,
          borderBottomLeftRadius: body / 2,
          borderBottomRightRadius: body / 2,
        }}
      />
      <View
        style={[
          styles.belly,
          {
            width: size * 0.16,
            height: size * 0.28,
            borderRadius: size,
            top: size * 0.42,
            left: size * 0.22,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  belly: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
});
