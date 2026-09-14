import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';

interface Props {
  children: React.ReactNode;
  columns: number;
  gap?: number;
  style?: StyleProp<ViewStyle>;
  itemStyle?: StyleProp<ViewStyle>;
}

/** Simple responsive wrap grid using measured column widths. */
export function ResponsiveGrid({ children, columns, gap, style, itemStyle }: Props) {
  const { gap: defaultGap, columnWidth } = useResponsive();
  const g = gap ?? defaultGap;
  const width = columnWidth(columns, g);
  const items = Array.isArray(children) ? children : [children];

  return (
    <View style={[styles.grid, { gap: g }, style]}>
      {items.filter(Boolean).map((child, index) => (
        <View key={index} style={[{ width }, itemStyle]}>
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
  },
});
