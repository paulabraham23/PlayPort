import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';
import { BUSINESS, LEGAL_DOCS, LEGAL_UPDATED, type LegalBlock, type LegalDoc } from '@/constants/legal';
import { useResponsive } from '@/hooks/useResponsive';

function Block({ block }: { block: LegalBlock }) {
  if ('h' in block) return <Text style={styles.h}>{block.h}</Text>;
  if ('p' in block) return <Text style={styles.p}>{block.p}</Text>;
  if ('list' in block) {
    return (
      <View style={styles.list}>
        {block.list.map((item) => (
          <Text key={item} style={styles.p}>
            {item}
          </Text>
        ))}
      </View>
    );
  }
  return (
    <View style={styles.table}>
      <View style={[styles.row, styles.headRow]}>
        <Text style={[styles.cell, styles.headCell]}>{block.table.head[0]}</Text>
        <Text style={[styles.cell, styles.headCell]}>{block.table.head[1]}</Text>
      </View>
      {block.table.rows.map(([a, b], i) => (
        <View key={`${a}-${i}`} style={[styles.row, i < block.table.rows.length - 1 && styles.rowBorder]}>
          <Text style={[styles.cell, styles.cellLabel]}>{a}</Text>
          <Text style={styles.cell}>{b}</Text>
        </View>
      ))}
    </View>
  );
}

/** Full-page policy reader — public, no login needed (Razorpay and customers link here). */
export function LegalDocument({ doc }: { doc: LegalDoc }) {
  const { horizontalPadding } = useResponsive();
  const others = Object.values(LEGAL_DOCS).filter((d) => d.slug !== doc.slug);
  return (
    <Screen showHeader={false} narrow>
      <ScreenHeader
        title={doc.title}
        subtitle={`Last updated ${LEGAL_UPDATED}`}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/(tabs)'))}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
      >
        <Text style={styles.meta}>
          {BUSINESS.name} · {BUSINESS.address}
          {'\n'}Phone / WhatsApp {BUSINESS.phone} · {BUSINESS.email}
        </Text>
        {doc.blocks.map((block, i) => (
          <Block key={i} block={block} />
        ))}
        <View style={styles.others}>
          {others.map((d) => (
            <Pressable
              key={d.slug}
              accessibilityRole="link"
              onPress={() => router.replace(`/legal/${d.slug}` as never)}
            >
              <Text style={styles.link}>{d.title}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: spacing.sm, paddingBottom: spacing.xxxl, gap: spacing.sm },
  meta: { color: colors.mutedText, fontFamily: fonts.body, fontSize: typeScale.small, lineHeight: 18 },
  h: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: typeScale.bodyLg,
    marginTop: spacing.md,
  },
  p: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.body, lineHeight: 21 },
  list: { gap: spacing.sm },
  table: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    overflow: 'hidden',
    marginVertical: spacing.xs,
  },
  row: { flexDirection: 'row' },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderSubtle },
  headRow: { backgroundColor: colors.surfaceAlt },
  cell: {
    flex: 1,
    padding: spacing.sm,
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.small,
    lineHeight: 18,
  },
  cellLabel: { color: colors.primaryText },
  headCell: { color: colors.primaryText, fontFamily: fonts.bodyMedium },
  others: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg, marginTop: spacing.lg },
  link: { color: colors.playportOrange, fontFamily: fonts.bodyMedium, fontSize: typeScale.body },
});
