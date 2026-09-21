import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { Screen } from '@/components/layout/Screen';
import { EnterUp } from '@/components/motion/Enter';
import { ExperienceCard } from '@/components/products/ExperienceCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, fonts, spacing, typeScale } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';
import { useCatalogStore } from '@/store/catalogStore';
import { useFeelStore } from '@/store/feelStore';
import { ensureLoggedIn } from '@/utils/authGate';

export default function CombosScreen() {
  const { horizontalPadding, experienceColumns, gap } = useResponsive();
  const experiences = useCatalogStore((s) => s.experiences);
  const ready = useCatalogStore((s) => s.ready);
  const hydrate = useCatalogStore((s) => s.hydrate);
  const addExperienceToCart = useAppStore((s) => s.addExperienceToCart);
  const showToast = useFeelStore((s) => s.showToast);
  const cols = Math.max(1, experienceColumns);

  const bookCombo = (id: string, name: string) => {
    if (!ensureLoggedIn()) return;
    addExperienceToCart(id);
    showToast(`Added ${name}`);
  };

  return (
    <Screen showFloatingCart>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingHorizontal: horizontalPadding, paddingBottom: spacing.huge + 120 },
        ]}
      >
        <EnterUp index={0}>
          <View>
            <SectionHeader eyebrow="Bundles" title="Combos" />
            <Text style={styles.sub}>
              Curated kits with everything included — {experiences.length} ready to book
            </Text>
          </View>
        </EnterUp>

        {experiences.length ? (
          <ResponsiveGrid columns={cols} gap={gap}>
            {experiences.map((experience, index) => (
              <EnterUp key={experience.id} index={index} style={{ width: '100%' }}>
                <ExperienceCard
                  experience={experience}
                  onPress={() => router.push(`/experience/${experience.id}`)}
                  onBook={() => bookCombo(experience.id, experience.name)}
                />
              </EnterUp>
            ))}
          </ResponsiveGrid>
        ) : (
          <EmptyState
            icon="layers-outline"
            title={ready ? 'No combos yet' : 'Loading combos…'}
            subtitle={
              ready
                ? 'Combos will appear here once ops publish them in Admin.'
                : 'Fetching the latest bundles from your hub.'
            }
            actionLabel={ready ? 'Retry' : undefined}
            onAction={ready ? () => void hydrate() : undefined}
          />
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: spacing.xl, paddingTop: spacing.sm },
  sub: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.body,
    marginTop: 4,
    lineHeight: 20,
  },
});
