import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { CURRENT_USER } from '@/data/mock';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';

type MenuItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  href?: string;
  danger?: boolean;
  onPress?: () => void;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

export default function ProfileScreen() {
  const { horizontalPadding } = useResponsive();
  const user = useAppStore((s) => s.user) ?? CURRENT_USER;
  const orders = useAppStore((s) => s.orders);
  const logout = useAppStore((s) => s.logout);

  const activeOrder = orders.find((o) =>
    ['confirmed', 'preparing', 'out_for_delivery', 'delivered', 'active', 'returning'].includes(o.status)
  );

  const sections: MenuSection[] = [
    {
      title: 'My Activity',
      items: [
        { label: 'My Orders', icon: 'cube-outline', href: '/(tabs)/orders' },
        { label: 'Past rentals', icon: 'time-outline', href: '/(tabs)/orders' },
        { label: 'My Reviews', icon: 'star-outline', href: '/profile/reviews' },
      ],
    },
    {
      title: 'Account',
      items: [
        { label: 'Saved Addresses', icon: 'location-outline', href: '/profile/addresses' },
        { label: 'Payment Methods', icon: 'card-outline', href: '/profile/payment-methods' },
        { label: 'Notifications', icon: 'notifications-outline', href: '/profile/notifications' },
      ],
    },
    {
      title: 'Security',
      items: [
        {
          label: user.kycVerified ? 'KYC Verified' : 'Complete KYC',
          icon: 'shield-checkmark-outline',
          href: '/profile/settings',
        },
      ],
    },
    {
      title: 'Support',
      items: [
        { label: 'Help & FAQs', icon: 'help-circle-outline', href: '/profile/help' },
        { label: 'Sanitization Promise', icon: 'sparkles-outline', href: '/profile/help' },
        { label: 'Settings', icon: 'settings-outline', href: '/profile/settings' },
      ],
    },
  ];

  return (
    <Screen showCart={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
      >
        <Text style={styles.pageTitle}>Profile</Text>

        <Card style={styles.userCard}>
          <View style={styles.userRow}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} contentFit="cover" />
            <View style={styles.userMeta}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userPhone}>{user.phone}</Text>
            </View>
            {user.kycVerified ? (
              <Badge
                label="KYC"
                color={colors.success}
                backgroundColor="rgba(74,222,128,0.12)"
                left={<Ionicons name="checkmark-circle" size={12} color={colors.success} />}
              />
            ) : null}
          </View>
        </Card>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{user.sessionsCount}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>₹0</Text>
            <Text style={styles.statLabel}>Deposit</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue} numberOfLines={1}>
              {user.homeHub}
            </Text>
            <Text style={styles.statLabel}>Home hub</Text>
          </View>
        </View>

        {activeOrder ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(`/order/track/${activeOrder.id}`)}
          >
            <Card style={styles.trackCard}>
              <View style={styles.trackTop}>
                <Badge
                  label="ACTIVE ORDER"
                  color={colors.playportOrange}
                  backgroundColor={colors.orangeTint}
                />
                <Ionicons name="chevron-forward" size={18} color={colors.secondaryText} />
              </View>
              <Text style={styles.trackTitle}>Track #{activeOrder.id}</Text>
              <Text style={styles.trackMeta}>
                ETA {activeOrder.etaLabel} · {activeOrder.items[0]?.name}
              </Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${activeOrder.progressPercent}%` }]} />
              </View>
            </Card>
          </Pressable>
        ) : null}

        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Card padded={false}>
              {section.items.map((item, index) => (
                <Pressable
                  key={item.label}
                  accessibilityRole="button"
                  onPress={() => {
                    if (item.onPress) item.onPress();
                    else if (item.href) router.push(item.href as never);
                  }}
                  style={[
                    styles.menuRow,
                    index < section.items.length - 1 && styles.menuBorder,
                  ]}
                >
                  <View
                    style={[
                      styles.menuIcon,
                      item.danger && { backgroundColor: 'rgba(239,68,68,0.12)' },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={18}
                      color={item.danger ? colors.danger : colors.playportOrange}
                    />
                  </View>
                  <Text style={[styles.menuLabel, item.danger && { color: colors.danger }]}>
                    {item.label}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={item.danger ? colors.danger : colors.mutedText}
                  />
                </Pressable>
              ))}
            </Card>
          </View>
        ))}

        <Button
          title="Log out"
          variant="danger"
          fullWidth
          style={styles.logout}
          icon={<Ionicons name="log-out-outline" size={18} color={colors.danger} />}
          onPress={() => {
            logout();
            router.replace('/(auth)/login');
          }}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxxl, gap: spacing.lg, paddingTop: spacing.sm },
  pageTitle: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: 30,
    letterSpacing: -0.4,
  },
  userCard: { gap: 0 },
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  userMeta: { flex: 1, gap: 4 },
  userName: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 20 },
  userPhone: { color: colors.secondaryText, fontFamily: fonts.mono, fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 10 },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 72,
    gap: 4,
  },
  statValue: { color: colors.primaryText, fontFamily: fonts.headingMedium, fontSize: 16 },
  statLabel: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 11 },
  trackCard: {
    gap: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.playportOrange,
    borderColor: colors.border,
  },
  trackTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trackTitle: { color: colors.primaryText, fontFamily: fonts.headingMedium, fontSize: 16 },
  trackMeta: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 13 },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressFill: { height: '100%', backgroundColor: colors.playportOrange, borderRadius: 3 },
  section: { gap: spacing.sm },
  sectionTitle: {
    color: colors.mutedText,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.orangeTint,
    borderWidth: 1,
    borderColor: 'rgba(255,87,34,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 15 },
  logout: { marginTop: spacing.xl },
});
