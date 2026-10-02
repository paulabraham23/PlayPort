import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useCatalogStore } from '@/store/catalogStore';

export default function UnitGamesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { horizontalPadding } = useResponsive();
  const units = useCatalogStore((s) => s.units);
  const products = useCatalogStore((s) => s.products);

  const unit = units.find((u) => u.id === id);
  const product = unit ? products.find((p) => p.id === unit.productId) : null;
  const games = unit?.games ?? [];

  return (
    <Screen showHeader={false}>
      <ScreenHeader
        title="Games on this kit"
        subtitle={unit ? `${unit.skuLabel} · pre-loaded` : undefined}
        onBack={() => router.back()}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
      >
        {!unit ? (
          <EmptyState
            icon="game-controller-outline"
            title="Kit not found"
            subtitle="This unit may have moved hubs or been retired."
            actionLabel="Back"
            onAction={() => router.back()}
          />
        ) : (
          <>
            <View style={styles.headCard}>
              <View style={styles.iconWrap}>
                <Ionicons name="game-controller" size={22} color={colors.playportOrange} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={styles.unitName}>{unit.skuLabel}</Text>
                <Text style={styles.productName}>{product?.name ?? 'PlayPort kit'}</Text>
              </View>
              <Badge
                label={`${games.length} GAMES`}
                color={colors.playportOrange}
                backgroundColor={colors.orangeTint}
              />
            </View>

            {games.length ? (
              <View style={styles.gameGrid}>
                {games.map((game, index) => (
                  <View key={`${game}-${index}`} style={styles.gameCard}>
                    <Text style={styles.gameName} numberOfLines={2}>
                      {game}
                    </Text>
                    <View style={styles.gameFoot}>
                      <Ionicons name="disc-outline" size={12} color={colors.mutedText} />
                      <Text style={styles.gameMeta}>Installed</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <EmptyState
                icon="albums-outline"
                title="Games not listed yet"
                subtitle="Ops hasn't published the lineup for this unit. It still ships ready-to-play."
              />
            )}

            <View style={styles.noteWrap}>
              <Ionicons name="information-circle-outline" size={15} color={colors.mutedText} />
              <Text style={styles.noteText}>
                Each physical kit carries its own game library. Ask ops to update the lineup in
                Admin → Inventory if something's missing.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxxl, gap: spacing.lg, paddingTop: spacing.sm },
  headCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitName: { color: colors.primaryText, fontFamily: fonts.headingMedium, fontSize: typeScale.bodyLg },
  productName: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: typeScale.small },
  gameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gameCard: {
    flexGrow: 1,
    flexBasis: '46%',
    maxWidth: '100%',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    padding: spacing.md,
    gap: 8,
  },
  gameName: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.body },
  gameFoot: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  gameMeta: { color: colors.mutedText, fontFamily: fonts.body, fontSize: typeScale.caption },
  noteWrap: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', paddingHorizontal: 2 },
  noteText: {
    flex: 1,
    color: colors.mutedText,
    fontFamily: fonts.body,
    fontSize: typeScale.small,
    lineHeight: 17,
  },
});
