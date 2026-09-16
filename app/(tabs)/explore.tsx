import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { Screen } from '@/components/layout/Screen';
import { EnterUp } from '@/components/motion/Enter';
import { PressableScale } from '@/components/motion/PressableScale';
import { ProductCard } from '@/components/products/ProductCard';
import { SearchBar } from '@/components/search/SearchBar';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';
import { CATEGORIES, PRODUCTS } from '@/data/mock';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';
import { useCatalogStore } from '@/store/catalogStore';
import { useFeelStore } from '@/store/feelStore';

export default function ExploreScreen() {
  const { horizontalPadding, productColumns, gap } = useResponsive();
  const addProductToCart = useAppStore((s) => s.addProductToCart);
  const updateCartQuantity = useAppStore((s) => s.updateCartQuantity);
  const cart = useAppStore((s) => s.cart);
  const showToast = useFeelStore((s) => s.showToast);
  const catalogProducts = useCatalogStore((s) => s.products);
  const products = catalogProducts.length ? catalogProducts : PRODUCTS;
  const gridCols = Math.max(2, productColumns);

  const qtyFor = (productId: string) =>
    cart.filter((c) => c.productId === productId).reduce((sum, c) => sum + c.quantity, 0);
  const cartItemIdFor = (productId: string) =>
    cart.find((c) => c.productId === productId && c.durationId === '12h')?.id;

  const addKit = (product: (typeof products)[0]) => {
    addProductToCart(product.id, '12h');
    showToast(`Added ${product.shortName}`);
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
            <SectionHeader eyebrow="Catalog" title="All kits" />
            <Text style={styles.availability}>{products.length} kits available at your hub</Text>
          </View>
        </EnterUp>

        <EnterUp index={1}>
          <SearchBar
            value=""
            onChangeText={() => {}}
            placeholder="Search kits…"
            onPress={() => router.push('/search')}
          />
        </EnterUp>

        <EnterUp index={2}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
            <PressableScale scaleTo={0.94} style={[styles.filterChip, styles.filterActive]}>
              <Text style={[styles.filterText, styles.filterTextActive]}>All</Text>
            </PressableScale>
            {CATEGORIES.slice(0, 6).map((cat) => (
              <PressableScale
                key={cat.id}
                onPress={() => router.push(`/category/${cat.id}`)}
                scaleTo={0.94}
                style={styles.filterChip}
              >
                <Ionicons name={cat.icon as keyof typeof Ionicons.glyphMap} size={14} color={colors.secondaryText} />
                <Text style={styles.filterText}>{cat.shortName}</Text>
              </PressableScale>
            ))}
          </ScrollView>
        </EnterUp>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="flash" size={16} color={colors.etaText} />
            <Text style={styles.statText}>30–45 min delivery</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="sparkles" size={16} color={colors.playportOrange} />
            <Text style={styles.statText}>Sanitized & setup</Text>
          </View>
        </View>

        <ResponsiveGrid columns={gridCols} gap={gap}>
          {products.map((product, index) => (
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
          ))}
        </ResponsiveGrid>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: spacing.xl, paddingTop: spacing.sm },
  availability: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.body,
    marginTop: 4,
  },
  filters: { gap: 8 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  filterActive: {
    backgroundColor: colors.orangeTintStrong,
    borderColor: colors.playportOrange,
  },
  filterText: {
    color: colors.secondaryText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.small,
  },
  filterTextActive: {
    color: colors.playportOrange,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  statText: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.small,
  },
});
