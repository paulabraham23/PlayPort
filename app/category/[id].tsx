import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { ExperienceCard } from '@/components/products/ExperienceCard';
import { ProductCard } from '@/components/products/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, fonts, spacing } from '@/constants/theme';
import { CATEGORIES, EXPERIENCES, PRODUCTS } from '@/data/mock';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { horizontalPadding } = useResponsive();
  const addProductToCart = useAppStore((s) => s.addProductToCart);
  const addExperienceToCart = useAppStore((s) => s.addExperienceToCart);

  const category = CATEGORIES.find((c) => c.id === id);
  const products = PRODUCTS.filter((p) => p.categoryId === id && p.id !== 'screen-addon');
  const experiences = EXPERIENCES.filter((e) => e.categoryId === id);

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
            <Text style={styles.sectionTitle}>Kits & Gear</Text>
            <View style={styles.list}>
              {products.map((product) => (
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
        ) : null}

        {experiences.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experiences</Text>
            <View style={styles.list}>
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
            </View>
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
  intro: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  section: { gap: spacing.md },
  sectionTitle: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 18 },
  list: { gap: spacing.md },
});
