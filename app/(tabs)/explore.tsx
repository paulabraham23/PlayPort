import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { Screen } from '@/components/layout/Screen';
import { CategoryCard } from '@/components/products/CategoryCard';
import { ExperienceCard } from '@/components/products/ExperienceCard';
import { SearchBar } from '@/components/search/SearchBar';
import { colors, fonts, spacing } from '@/constants/theme';
import { CATEGORIES, EXPERIENCES } from '@/data/mock';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';

export default function ExploreScreen() {
  const { horizontalPadding, categoryColumns, experienceColumns, gap, isDesktop } = useResponsive();
  const addExperienceToCart = useAppStore((s) => s.addExperienceToCart);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
      >
        <View style={styles.header}>
          <Text style={styles.kicker}>DISCOVER</Text>
          <Text style={[styles.title, isDesktop && styles.titleLg]}>Explore</Text>
          <Text style={styles.subtitle}>Discover entertainment kits near you</Text>
        </View>

        <SearchBar
          value=""
          onChangeText={() => {}}
          placeholder="Search categories & kits..."
          onPress={() => router.push('/search')}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Categories</Text>
          <ResponsiveGrid columns={categoryColumns} gap={gap}>
            {CATEGORIES.map((category) => (
              <View key={category.id} style={styles.categoryWrap}>
                <CategoryCard
                  category={category}
                  wide
                  onPress={() => router.push(`/category/${category.id}`)}
                />
              </View>
            ))}
          </ResponsiveGrid>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Experiences</Text>
            <Pressable onPress={() => router.push('/search')} style={styles.searchLink}>
              <Text style={styles.link}>Search</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.secondaryText} />
            </Pressable>
          </View>
          <ResponsiveGrid columns={experienceColumns} gap={gap}>
            {EXPERIENCES.map((experience) => (
              <ExperienceCard
                key={experience.id}
                experience={experience}
                onPress={() => router.push(`/experience/${experience.id}`)}
                onBook={() => {
                  addExperienceToCart(experience.id);
                  router.push('/cart');
                }}
              />
            ))}
          </ResponsiveGrid>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxxl, gap: spacing.xxl, paddingTop: spacing.sm },
  header: { gap: 6, maxWidth: 640 },
  kicker: {
    color: colors.mutedText,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  title: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 32, lineHeight: 38 },
  titleLg: { fontSize: 40, lineHeight: 46 },
  subtitle: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  section: { gap: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sectionTitle: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 20, flexShrink: 1 },
  categoryWrap: { minHeight: 132, flex: 1 },
  searchLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  link: { color: colors.secondaryText, fontFamily: fonts.bodyMedium, fontSize: 13 },
});
