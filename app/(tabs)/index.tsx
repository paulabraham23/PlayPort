import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CategoryTile } from '@/components/home/CategoryTile';
import { HeroBanner } from '@/components/home/HeroBanner';
import { TrustStrip } from '@/components/home/TrustStrip';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { Screen } from '@/components/layout/Screen';
import { EnterUp } from '@/components/motion/Enter';
import { PressableScale } from '@/components/motion/PressableScale';
import { ProductCard } from '@/components/products/ProductCard';
import { SearchBar } from '@/components/search/SearchBar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';
import { CATEGORIES, HUB, PRODUCTS } from '@/data/mock';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';
import { useCatalogStore } from '@/store/catalogStore';
import { useFeelStore } from '@/store/feelStore';

const SHORTCUTS = [
  { id: 'gaming', label: 'Consoles', icon: 'game-controller-outline' as const },
  { id: 'vr', label: 'VR', icon: 'glasses-outline' as const },
  { id: 'racing', label: 'Racing', icon: 'car-sport-outline' as const },
  { id: 'movie-nights', label: 'Cinema', icon: 'film-outline' as const },
];

export default function HomeScreen() {
  const { horizontalPadding, productColumns, categoryColumns, gap } = useResponsive();
  const addProductToCart = useAppStore((s) => s.addProductToCart);
  const updateCartQuantity = useAppStore((s) => s.updateCartQuantity);
  const cart = useAppStore((s) => s.cart);
  const showToast = useFeelStore((s) => s.showToast);
  const catalogProducts = useCatalogStore((s) => s.products);
  const catalogCategories = useCatalogStore((s) => s.categories);
  const hub = useCatalogStore((s) => s.hub);
  const products = catalogProducts.length ? catalogProducts : PRODUCTS;
  const categories = catalogCategories.length ? catalogCategories : CATEGORIES;
  const gridCols = Math.max(2, productColumns);
  const featured = products[0];
  const eta = hub?.etaMinutes ?? HUB.etaMinutes;

  const qtyFor = (productId: string) =>
    cart.filter((c) => c.productId === productId).reduce((sum, c) => sum + c.quantity, 0);

  const cartItemIdFor = (productId: string) =>
    cart.find((c) => c.productId === productId && c.durationId === '12h')?.id;

  const addKit = (product: (typeof products)[0]) => {
    addProductToCart(product.id, '12h');
    showToast(`Added ${product.shortName}`);
  };

  const renderProductCard = (product: (typeof products)[0], index: number) => (
    <EnterUp key={product.id} index={index} style={{ width: '100%' }}>
      <ProductCard
        product={product}
        quantityInCart={qtyFor(product.id)}
        onPress={() => router.push(`/product/${product.id}`)}
        onAdd={() => addKit(product)}
        onIncrement={() => addKit(product)}
        onDecrement={() => {
          const id = cartItemIdFor(product.id);
          const qty = qtyFor(product.id);
          if (id) updateCartQuantity(id, qty - 1);
        }}
      />
    </EnterUp>
  );

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
          <SearchBar value="" onChangeText={() => {}} onPress={() => router.push('/search')} />
        </EnterUp>

        <EnterUp index={1}>
          <HeroBanner
            product={featured}
            etaMinutes={eta}
            onPress={() => router.push('/(tabs)/explore')}
          />
        </EnterUp>

        <EnterUp index={2}>
          <TrustStrip />
        </EnterUp>

        <EnterUp index={3}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
            {SHORTCUTS.map((chip) => (
              <PressableScale
                key={chip.id}
                onPress={() => router.push(`/category/${chip.id}`)}
                scaleTo={0.94}
                style={styles.chip}
              >
                <Ionicons name={chip.icon} size={16} color={colors.playportOrange} />
                <Text style={styles.chipText}>{chip.label}</Text>
              </PressableScale>
            ))}
          </ScrollView>
        </EnterUp>

        <View style={styles.section}>
          <SectionHeader
            eyebrow="Popular"
            title="Bestsellers near you"
            actionLabel="See all"
            onAction={() => router.push('/(tabs)/explore')}
          />
          <ResponsiveGrid columns={gridCols} gap={gap}>
            {products.map((product, index) => renderProductCard(product, index))}
          </ResponsiveGrid>
        </View>

        {categories.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader eyebrow="Discover" title="Shop by vibe" />
            <ResponsiveGrid columns={Math.min(categoryColumns, 4)} gap={10}>
              {categories.slice(0, 8).map((cat, index) => (
                <EnterUp key={cat.id} index={index}>
                  <CategoryTile
                    category={cat}
                    onPress={() => router.push(`/category/${cat.id}`)}
                  />
                </EnterUp>
              ))}
            </ResponsiveGrid>
          </View>
        ) : null}

        <EnterUp index={2}>
          <View style={styles.promiseCard}>
            <View style={styles.promiseIcon}>
              <Ionicons name="shield-checkmark" size={22} color={colors.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.promiseTitle}>PlayPort Promise</Text>
              <Text style={styles.promiseBody}>
                Every kit is sanitized, pre-tested at the hub, and delivered with white-glove setup. No deposit for verified users.
              </Text>
            </View>
          </View>
        </EnterUp>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: spacing.xxl, paddingTop: spacing.sm },
  chips: { gap: 10, paddingRight: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radii.full,
  },
  chipText: {
    color: colors.primaryText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.body,
  },
  section: { gap: spacing.lg },
  promiseCard: {
    flexDirection: 'row',
    gap: spacing.lg,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.xl,
  },
  promiseIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.successBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promiseTitle: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: typeScale.title,
    marginBottom: 4,
  },
  promiseBody: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.body,
    lineHeight: 20,
  },
});
