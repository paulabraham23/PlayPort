import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { CategoryCard } from '@/components/products/CategoryCard';
import { ExperienceCard } from '@/components/products/ExperienceCard';
import { ProductCard } from '@/components/products/ProductCard';
import { SearchBar } from '@/components/search/SearchBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { CATEGORIES, EXPERIENCES, PRODUCTS } from '@/data/mock';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';

const VALUE_PROPS = [
  { icon: 'flash-outline' as const, title: '30–45 min', subtitle: 'Hub-to-door delivery' },
  { icon: 'sparkles-outline' as const, title: 'Pro sanitized', subtitle: 'Every kit UV-cleaned' },
  { icon: 'construct-outline' as const, title: 'White-glove', subtitle: 'Setup included' },
  { icon: 'shield-checkmark-outline' as const, title: '₹0 deposit', subtitle: 'With DigiLocker KYC' },
];

export default function HomeScreen() {
  const { horizontalPadding, isDesktop, isTablet } = useResponsive();
  const addExperienceToCart = useAppStore((s) => s.addExperienceToCart);
  const addProductToCart = useAppStore((s) => s.addProductToCart);
  const multiCol = isDesktop || isTablet;

  const popular = PRODUCTS.filter((p) => p.popular);

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
      >
        <SearchBar value="" onChangeText={() => {}} onPress={() => router.push('/search')} />

        <View style={styles.promo}>
          <View style={styles.promoGlow} />
          <View style={styles.promoTop}>
            <Badge
              label="LIVE"
              color={colors.success}
              backgroundColor="rgba(74,222,128,0.15)"
              left={<View style={styles.liveDot} />}
            />
            <Text style={styles.promoEta}>Tonight · Indiranagar</Text>
          </View>
          <Text style={styles.promoTitle}>
            Fun delivered in <Text style={styles.promoAccent}>30–45 mins</Text>
          </Text>
          <Text style={styles.promoSub}>
            Book a sanitized entertainment kit. We drop, set up, and pick up — you just press play.
          </Text>
          <Button
            title="Browse kits"
            size="md"
            style={styles.promoCta}
            iconRight={<Ionicons name="arrow-forward" size={16} color={colors.white} />}
            onPress={() => router.push('/(tabs)/explore')}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>What&apos;s the vibe tonight?</Text>
            <Pressable onPress={() => router.push('/(tabs)/explore')}>
              <Text style={styles.link}>All Vibes</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hRow}>
            {CATEGORIES.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onPress={() => router.push(`/category/${category.id}`)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Experiences</Text>
            <Pressable onPress={() => router.push('/(tabs)/explore')}>
              <Text style={styles.link}>See all</Text>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Near You</Text>
          <View style={styles.productList}>
            {popular.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                compact
                onPress={() => router.push(`/product/${product.id}`)}
                onRent={() => {
                  addProductToCart(product.id, '12h');
                  router.push('/cart');
                }}
              />
            ))}
          </View>
        </View>

        <View style={[styles.section, styles.valueSection]}>
          <Text style={styles.sectionTitle}>Why PlayPort</Text>
          <View style={styles.valueGrid}>
            {VALUE_PROPS.map((item) => (
              <View key={item.title} style={styles.valueCard}>
                <View style={styles.valueIcon}>
                  <Ionicons name={item.icon} size={18} color={colors.playportOrange} />
                </View>
                <Text style={styles.valueTitle}>{item.title}</Text>
                <Text style={styles.valueSub}>{item.subtitle}</Text>
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
  promo: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    overflow: 'hidden',
    gap: spacing.sm,
  },
  promoGlow: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,87,34,0.18)',
  },
  promoTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  promoEta: { color: colors.secondaryText, fontFamily: fonts.mono, fontSize: 11 },
  promoTitle: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 22 },
  promoAccent: { color: colors.playportOrange },
  promoSub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  promoCta: { alignSelf: 'flex-start', marginTop: spacing.xs },
  section: { gap: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 20 },
  link: { color: colors.playportOrange, fontFamily: fonts.bodyMedium, fontSize: 13 },
  hRow: { gap: 12, paddingRight: 8 },
  expList: { gap: spacing.lg },
  expListMulti: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  expMultiItem: { width: '48%', flexBasis: '48%' },
  productList: { gap: spacing.md },
  valueSection: { marginBottom: spacing.lg },
  valueGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  valueCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 6,
  },
  valueIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2A1A14',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  valueTitle: { color: colors.primaryText, fontFamily: fonts.headingMedium, fontSize: 15 },
  valueSub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12 },
});
