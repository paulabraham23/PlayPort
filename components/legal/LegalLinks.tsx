import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, fonts, spacing, typeScale } from '@/constants/theme';
import { BUSINESS, LEGAL_DOCS } from '@/constants/legal';

/** Compact policy footer: Terms · Privacy · Refunds · contact. */
export function LegalLinks({ style, showContact = true }: { style?: StyleProp<ViewStyle>; showContact?: boolean }) {
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.row}>
        {Object.values(LEGAL_DOCS).map((doc, i) => (
          <View key={doc.slug} style={styles.item}>
            {i > 0 ? <Text style={styles.dot}>·</Text> : null}
            <Pressable accessibilityRole="link" onPress={() => router.push(`/legal/${doc.slug}` as never)} hitSlop={6}>
              <Text style={styles.link}>{doc.title}</Text>
            </Pressable>
          </View>
        ))}
      </View>
      {showContact ? (
        <Text style={styles.contact}>
          {BUSINESS.name} · {BUSINESS.address} · {BUSINESS.phone} · {BUSINESS.email}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 6, paddingVertical: spacing.lg },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', rowGap: 4 },
  item: { flexDirection: 'row', alignItems: 'center' },
  dot: { color: colors.mutedText, marginHorizontal: 8, fontSize: typeScale.small },
  link: { color: colors.secondaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.small, textDecorationLine: 'underline' },
  contact: { color: colors.mutedText, fontFamily: fonts.body, fontSize: typeScale.caption, textAlign: 'center' },
});
