import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ResponsiveGrid } from '@/components/layout/ResponsiveGrid';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { ExperienceCard } from '@/components/products/ExperienceCard';
import { ProductCard } from '@/components/products/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { colors, fonts, spacing, typeScale } from '@/constants/theme';
import { CATEGORIES, EXPERIENCES, PRODUCTS } from '@/data/mock';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { horizontalPadding, productColumns, experienceColumns, gap } = useResponsive();
  const addProductToCart = useAppStore((s) => s.addProductToCart);
  const updateCartQuantity = useAppStore((s) => s.updateCartQuantity);
  const cart = useAppStore((s) => s.cart);
  const addExperienceToCart = useAppStore((s) => s.addExperienceToCart);

  const category = CATEGORIES.find((c) => c.id === id);
  const products = PRODUCTS.filter((p) => p.categoryId === id);
  const experiences = EXPERIENCES.filter((e) => e.categoryId === id);

  const qtyFor = (productId: string) =>
    cart.filter((c) => c.productId === productId).reduce((sum, c) => sum + c.quantity, 0);
  const cartItemIdFor = (productId: string) =>
    cart.find((c) => c.productId === productId && c.durationId === '12h')?.id;

  if (!category) {
    return (
      <Screen showHeader={false}>
        <ScreenHeader title="Category" onBack={() => router.back()} />
        <EmptyState
          title="Category not found"
          subtitle="Try exploring from Home or Search."
          actionLabel="Explore"
          onAction={() => router.replace('/(tabs)/explore')}
        />
      </Screen>
    );
  }

  return (
    <Screen showHeader={false}>
      <ScreenHeader
        title={category.name}
        subtitle={`${category.setupsReady} setups · ${category.etaMinutes}m drop`}
        onBack={() => router.back()}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
      >
        <Text style={styles.intro}>{category.description}</Text>

        {products.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader eyebrow="Gear" title="Kits & Gear" />
            <ResponsiveGrid columns={productColumns} gap={gap}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  compact={productColumns === 1}
                  quantityInCart={qtyFor(product.id)}
                  onPress={() => router.push(`/product/${product.id}`)}
                  onAdd={() => addProductToCart(product.id, '12h')}
                  onIncrement={() => addProductToCart(product.id, '12h')}
                  onDecrement={() => {
                    const cartId = cartItemIdFor(product.id);
                    const qty = qtyFor(product.id);
                    if (cartId) updateCartQuantity(cartId, qty - 1);
                  }}
                />
              ))}
            </ResponsiveGrid>
          </View>
        ) : null}

        {experiences.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader eyebrow="Curated" title="Experiences" />
            <ResponsiveGrid columns={experienceColumns} gap={gap}>
              {experiences.map((experience) => (
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
        ) : null}

        {!products.length && !experiences.length ? (
          <EmptyState
            title="Nothing in this vibe yet"
            subtitle="Check back soon or browse other categories."
            actionLabel="Browse all"
            onAction={() => router.push('/(tabs)/explore')}
          />
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxxl, gap: spacing.xl, paddingTop: spacing.sm },
  intro: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.body,
    lineHeight: 20,
  },
  section: { gap: spacing.md },
});
