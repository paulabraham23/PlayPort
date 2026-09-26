import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { HeroBanner } from '@/components/home/HeroBanner';
import { StatsBand } from '@/components/home/StatsBand';
import { TrustStrip } from '@/components/home/TrustStrip';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { Screen } from '@/components/layout/Screen';
import { EnterUp } from '@/components/motion/Enter';
import { ProductCard } from '@/components/products/ProductCard';
import { SearchBar } from '@/components/search/SearchBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';
import { useCatalogStore } from '@/store/catalogStore';
import { useFeelStore } from '@/store/feelStore';
import { ensureLoggedIn } from '@/utils/authGate';

export default function HomeScreen() {
  const { horizontalPadding, productColumns, gap, sectionGap, isMobile } = useResponsive();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const addProductToCart = useAppStore((s) => s.addProductToCart);
  const updateCartQuantity = useAppStore((s) => s.updateCartQuantity);
  const cart = useAppStore((s) => s.cart);
  const showToast = useFeelStore((s) => s.showToast);
  const products = useCatalogStore((s) => s.products);
  const hub = useCatalogStore((s) => s.hub);
  const ready = useCatalogStore((s) => s.ready);
  const catalogError = useCatalogStore((s) => s.error);
  const hydrate = useCatalogStore((s) => s.hydrate);
  const featured = products[0];
  const eta = hub?.etaMinutes ?? 30;

  const qtyFor = (productId: string) =>
    cart.filter((c) => c.productId === productId).reduce((sum, c) => sum + c.quantity, 0);

  const cartItemIdFor = (productId: string) =>
    cart.find((c) => c.productId === productId)?.id;

  const addKit = (product: (typeof products)[0]) => {
    if (!ensureLoggedIn('/(tabs)')) return;
    addProductToCart(product.id);
    showToast(`Added ${product.shortName}`);
  };

  const availableCount = products.filter(
    (p) => p.availabilityLabel && !p.availabilityLabel.startsWith('No')
  ).length;

  return (
    <Screen showFloatingCart>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingHorizontal: horizontalPadding, paddingBottom: spacing.huge + 120, gap: sectionGap },
        ]}
      >
        <EnterUp index={0}>
          <SearchBar value="" onChangeText={() => {}} onPress={() => router.push('/search')} />
        </EnterUp>

        {featured ? (
          <EnterUp index={1}>
            <HeroBanner
              product={featured}
              etaMinutes={eta}
              onPress={() => router.push(`/product/${featured.id}`)}
            />
          </EnterUp>
        ) : null}

        <EnterUp index={2}>
          <TrustStrip />
        </EnterUp>

        <View style={styles.section}>
          <SectionHeader eyebrow="Catalog" title="All products" />
          {!ready ? (
            <ActivityIndicator color={colors.playportOrange} style={{ marginTop: 24 }} />
          ) : products.length ? (
            <>
              <Text style={styles.count}>
                {products.length} kits at your hub
                {availableCount > 0 ? ` · ${availableCount} ready now` : ''}
              </Text>
              <ResponsiveGrid columns={productColumns} gap={gap}>
                {products.map((product, index) => (
                  <EnterUp key={product.id} index={index} style={{ width: '100%' }}>
                    <ProductCard
                      product={product}
                      quantityInCart={qtyFor(product.id)}
                      onPress={() => router.push(`/product/${product.id}`)}
                      onAdd={() => addKit(product)}
                      onIncrement={() => addKit(product)}
                      onDecrement={() => {
                        if (!isAuthenticated) return;
                        const id = cartItemIdFor(product.id);
                        const qty = qtyFor(product.id);
                        if (id) updateCartQuantity(id, qty - 1);
                      }}
                    />
                  </EnterUp>
                ))}
              </ResponsiveGrid>
            </>
          ) : (
            <EmptyState
              icon="cube-outline"
              title="No products yet"
              subtitle={
                catalogError ||
                'The store catalog is empty. Check back soon or ask ops to add kits in Admin.'
              }
              actionLabel="Retry"
              onAction={() => void hydrate()}
            />
          )}
        </View>

        {!isMobile ? (
          <EnterUp index={4}>
            <StatsBand
              stats={[
                { value: '30 min', label: 'Avg. delivery' },
                { value: '100%', label: 'Sanitized kits' },
                { value: '4.8★', label: 'Rider rating' },
                { value: '24×7', label: 'Support' },
              ]}
            />
          </EnterUp>
        ) : null}

        <EnterUp index={5}>
          <View style={styles.promiseCard}>
            <View style={styles.promiseIcon}>
              <Ionicons name="shield-checkmark" size={22} color={colors.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.promiseTitle}>PlayPort Promise</Text>
              <Text style={styles.promiseBody}>
                Every kit is sanitized, pre-tested at the hub, and delivered with setup support.
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
  section: { gap: spacing.md },
  count: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.body,
    marginTop: -4,
  },
  promiseCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
  },
  promiseIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.successBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promiseTitle: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: typeScale.title,
  },
  promiseBody: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.body,
    lineHeight: 20,
    marginTop: 4,
  },
});
