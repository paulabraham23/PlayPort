import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { Screen } from '@/components/layout/Screen';
import { ProductCard } from '@/components/products/ProductCard';
import { SearchBar } from '@/components/search/SearchBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { PRODUCTS } from '@/data/mock';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';
import { useCatalogStore } from '@/store/catalogStore';

const VALUE_PROPS = [
  { icon: 'flash-outline' as const, title: '30–45 min', subtitle: 'Hub-to-door delivery' },
  { icon: 'sparkles-outline' as const, title: 'Pro sanitized', subtitle: 'Every kit UV-cleaned' },
  { icon: 'construct-outline' as const, title: 'White-glove', subtitle: 'Setup included' },
  { icon: 'shield-checkmark-outline' as const, title: '₹0 deposit', subtitle: 'With DigiLocker KYC' },
];

export default function HomeScreen() {
  const {
    horizontalPadding,
    isDesktop,
    isMobile,
    productColumns,
    valuePropColumns,
    gap,
  } = useResponsive();
  const addProductToCart = useAppStore((s) => s.addProductToCart);
  const catalogProducts = useCatalogStore((s) => s.products);
  const products = catalogProducts.length ? catalogProducts : PRODUCTS;

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
      >
        <SearchBar value="" onChangeText={() => {}} onPress={() => router.push('/search')} />

        <View style={[styles.promo, isDesktop && styles.promoDesktop]}>
          <View style={[styles.promoInner, isDesktop && styles.promoInnerDesktop]}>
            <View style={styles.promoCopy}>
              <View style={styles.promoTop}>
                <Badge label="LIVE" left={<View style={styles.liveDot} />} />
                <Text style={styles.promoEta}>Tonight · Indiranagar</Text>
              </View>
              <Text style={[styles.promoTitle, isDesktop && styles.promoTitleLg]}>
                Fun delivered in 30–45 mins
              </Text>
              <Text style={[styles.promoSub, isDesktop && styles.promoSubLg]}>
                Book a sanitized entertainment kit. We drop, set up, and pick up — you just press play.
              </Text>
              <Button
                title="Browse kits"
                size={isDesktop ? 'lg' : 'md'}
                style={styles.promoCta}
                iconRight={<Ionicons name="arrow-forward" size={16} color={colors.white} />}
                onPress={() => router.push('/(tabs)/explore')}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>What&apos;s the vibe tonight?</Text>
            <Pressable onPress={() => router.push('/(tabs)/explore')}>
              <Text style={styles.link}>See all</Text>
            </Pressable>
          </View>
          <ResponsiveGrid columns={productColumns} gap={gap}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                compact={isMobile && productColumns === 1}
                onPress={() => router.push(`/product/${product.id}`)}
                onRent={() => {
                  addProductToCart(product.id, '12h');
                  router.push('/cart');
                }}
              />
            ))}
          </ResponsiveGrid>
        </View>

        <View style={[styles.section, styles.valueSection]}>
          <Text style={styles.sectionTitle}>Why PlayPort</Text>
          <ResponsiveGrid columns={valuePropColumns} gap={gap}>
            {VALUE_PROPS.map((item) => (
              <View key={item.title} style={styles.valueCard}>
                <View style={styles.valueIcon}>
                  <Ionicons name={item.icon} size={18} color={colors.secondaryText} />
                </View>
                <Text style={styles.valueTitle}>{item.title}</Text>
                <Text style={styles.valueSub}>{item.subtitle}</Text>
              </View>
            ))}
          </ResponsiveGrid>
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
  },
  promoDesktop: { padding: spacing.xxxl },
  promoInner: { gap: spacing.sm },
  promoInnerDesktop: { maxWidth: 640 },
  promoCopy: { gap: spacing.sm },
  promoTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.secondaryText },
  promoEta: { color: colors.secondaryText, fontFamily: fonts.mono, fontSize: 11 },
  promoTitle: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 22 },
  promoTitleLg: { fontSize: 36, lineHeight: 42 },
  promoSub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  promoSubLg: { fontSize: 16, lineHeight: 24, maxWidth: 520 },
  promoCta: { alignSelf: 'flex-start', marginTop: spacing.xs },
  section: { gap: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sectionTitle: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 20, flexShrink: 1 },
  link: { color: colors.secondaryText, fontFamily: fonts.bodyMedium, fontSize: 13 },
  valueSection: { marginBottom: spacing.lg },
  valueCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 6,
    minHeight: 120,
  },
  valueIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  valueTitle: { color: colors.primaryText, fontFamily: fonts.headingMedium, fontSize: 15 },
  valueSub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12 },
});
