import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { CategoryCard } from '@/components/products/CategoryCard';
import { ExperienceCard } from '@/components/products/ExperienceCard';
import { SearchBar } from '@/components/search/SearchBar';
import { colors, fonts, spacing } from '@/constants/theme';
import { CATEGORIES, EXPERIENCES } from '@/data/mock';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';

export default function ExploreScreen() {
  const { horizontalPadding, isDesktop, isTablet, width } = useResponsive();
  const addExperienceToCart = useAppStore((s) => s.addExperienceToCart);
  const columns = isDesktop ? 4 : isTablet ? 3 : 2;
  const gap = 12;
  const cardWidth = (Math.min(width, isDesktop ? 1100 : width) - horizontalPadding * 2 - gap * (columns - 1)) / columns;
  const multiCol = isDesktop || isTablet;

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
      >
        <View style={styles.header}>
          <Text style={styles.kicker}>DISCOVER</Text>
          <Text style={styles.title}>Explore</Text>
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
          <View style={[styles.grid, { gap }]}>
            {CATEGORIES.map((category) => (
              <View key={category.id} style={{ width: cardWidth, minHeight: 132 }}>
                <CategoryCard
                  category={category}
                  wide
                  onPress={() => router.push(`/category/${category.id}`)}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Experiences</Text>
            <Pressable onPress={() => router.push('/search')} style={styles.searchLink}>
              <Text style={styles.link}>Search</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.playportOrange} />
            </Pressable>
          </View>
          <View style={[styles.expList, multiCol && styles.expListMulti]}>
            {EXPERIENCES.map((experience) => (
              <View key={experience.id} style={multiCol ? styles.expMultiItem : undefined}>
                <ExperienceCard
                  experience={experience}
                  onPress={() => router.push(`/experience/${experience.id}`)}
                  onBook={() => {
                    addExperienceToCart(experience.id);
                    router.push('/cart');
                  }}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxxl, gap: spacing.xxl, paddingTop: spacing.sm },
  header: { gap: 6 },
  kicker: {
    color: colors.playportOrange,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  title: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 32, lineHeight: 38 },
  subtitle: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  section: { gap: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  expList: { gap: spacing.lg },
  expListMulti: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  expMultiItem: { width: '48%', flexBasis: '48%' },
  searchLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  link: { color: colors.playportOrange, fontFamily: fonts.bodyMedium, fontSize: 13 },
});
