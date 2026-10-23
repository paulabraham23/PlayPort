import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';
import { colors, fonts, typeScale } from '@/constants/theme';

interface Props {
  text: string;
  style?: StyleProp<TextStyle>;
  /** Lines shown while collapsed. */
  lines?: number;
}

const MIN_CHARS_TO_COLLAPSE = 160;

/** Long copy collapsed to a few lines with a Show more / Show less toggle. */
export function ExpandableText({ text, style, lines = 3 }: Props) {
  const [expanded, setExpanded] = useState(false);
  const trimmed = text.trim();
  const collapsible = trimmed.length > MIN_CHARS_TO_COLLAPSE || trimmed.split('\n').length > lines;

  return (
    <View style={styles.wrap}>
      <Text style={style} numberOfLines={collapsible && !expanded ? lines : undefined}>
        {trimmed}
      </Text>
      {collapsible ? (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          hitSlop={8}
          onPress={() => setExpanded((v) => !v)}
          style={styles.toggle}
        >
          <Text style={styles.toggleText}>{expanded ? 'Show less' : 'Show more'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  toggle: { alignSelf: 'flex-start', paddingVertical: 2 },
  toggleText: {
    color: colors.playportOrange,
    fontFamily: fonts.headingMedium,
    fontSize: typeScale.body,
  },
});
