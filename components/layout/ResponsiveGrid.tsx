import { useState } from 'react';
import { StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';

interface Props {
  children: React.ReactNode;
  columns: number;
  gap?: number;
  style?: StyleProp<ViewStyle>;
  itemStyle?: StyleProp<ViewStyle>;
}

/**
 * Responsive wrap grid. Measures the parent width so columns stay accurate
 * across phones, tablets, and desktop (including nested padding / scrollbars).
 */
export function ResponsiveGrid({ children, columns, gap, style, itemStyle }: Props) {
  const { gap: defaultGap, innerWidth } = useResponsive();
  const g = gap ?? defaultGap;
  const cols = Math.max(1, columns);
  const [measured, setMeasured] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - measured) > 0.5) setMeasured(w);
  };

  const usable = measured > 0 ? measured : innerWidth;
  const itemWidth = cols <= 1 ? usable : (usable - g * (cols - 1)) / cols;
  const items = Array.isArray(children) ? children : [children];

  return (
    <View style={[styles.grid, { gap: g }, style]} onLayout={onLayout}>
      {items.filter(Boolean).map((child, index) => (
        <View key={index} style={[{ width: itemWidth, minWidth: 0 }, itemStyle]}>
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
  },
});
