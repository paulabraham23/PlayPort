import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { Screen } from '@/components/layout/Screen';
import { ProductCard } from '@/components/products/ProductCard';
import { SearchBar } from '@/components/search/SearchBar';
import { colors, fonts, spacing } from '@/constants/theme';
import { PRODUCTS } from '@/data/mock';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';
import { useCatalogStore } from '@/store/catalogStore';

export default function ExploreScreen() {
  const { horizontalPadding, productColumns, gap, isDesktop, isMobile } = useResponsive();
  const addProductToCart = useAppStore((s) => s.addProductToCart);
  const catalogProducts = useCatalogStore((s) => s.products);
  const products = catalogProducts.length ? catalogProducts : PRODUCTS;

  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
      >
        <View style={styles.header}>
          <Text style={styles.kicker}>AVAILABLE NOW</Text>
          <Text style={[styles.title, isDesktop && styles.titleLg]}>Explore</Text>
          <Text style={styles.subtitle}>Rent what we have ready at the hub tonight</Text>
        </View>

        <SearchBar
          value=""
          onChangeText={() => {}}
          placeholder="Search kits..."
          onPress={() => router.push('/search')}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All kits</Text>
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
  sectionTitle: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 20 },
});
