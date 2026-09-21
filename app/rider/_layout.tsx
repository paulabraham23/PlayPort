import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Stack, router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, typeScale } from '@/constants/theme';
import { checkIsRider, resolveRiderProfile } from '@/lib/riderFirestore';
import { useAppStore } from '@/store/appStore';
import { useRiderStore } from '@/store/riderStore';
import { useRiderLocationTracking } from '@/hooks/useRiderLocationTracking';

const NAV = [
  { href: '/rider', label: 'Available', match: (p: string) => p === '/rider' || p === '/rider/' },
  { href: '/rider/mine', label: 'My runs', match: (p: string) => p.startsWith('/rider/mine') },
] as const;

export default function RiderLayout() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const pathname = usePathname();
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const bootstrap = useRiderStore((s) => s.bootstrap);
  const rider = useRiderStore((s) => s.rider);
  const mine = useRiderStore((s) => s.mine);
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const desktop = width >= 900;

  useRiderLocationTracking(allowed ? rider : null, allowed ? mine : []);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    (async () => {
      if (!isAuthenticated) {
        if (!cancelled) {
          setAllowed(false);
          setChecking(false);
        }
        return;
      }
      const ok = await checkIsRider();
      if (cancelled) return;
      if (ok) {
        const profile = await resolveRiderProfile();
        if (profile?.active) {
          setAllowed(true);
          cleanup = await bootstrap();
        } else {
          setAllowed(false);
        }
      } else {
        setAllowed(false);
      }
      setChecking(false);
    })();
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [isAuthenticated, bootstrap]);

  if (checking) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={colors.playportOrange} />
        <Text style={styles.hint}>Checking rider access…</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.title}>Rider sign-in</Text>
        <Text style={styles.hint}>
          Use the same PlayPort OTP login with your registered delivery phone number.
        </Text>
        <Pressable
          style={styles.btn}
          onPress={() =>
            router.replace({ pathname: '/(auth)/login', params: { next: '/rider' } } as never)
          }
        >
          <Text style={styles.btnText}>Log in</Text>
        </Pressable>
      </View>
    );
  }

  if (!allowed) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.title}>Not a rider yet</Text>
        <Text style={styles.hint}>
          Ask ops to add your phone under Admin → Riders and mark you active. Then open /rider again.
        </Text>
        <Pressable style={styles.btn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.btnText}>Back to shop</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={[styles.shell, desktop && styles.shellRow]}>
        <View style={[styles.nav, desktop && styles.navSide]}>
          <View style={styles.brandRow}>
            <Text style={styles.brand}>PlayPort Rider</Text>
            <Pressable onPress={() => router.push('/(tabs)')}>
              <Text style={styles.exit}>Exit</Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal={!desktop}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={desktop ? styles.navCol : styles.navRow}
          >
            {NAV.map((item) => {
              const active = item.match(pathname);
              return (
                <Pressable
                  key={item.href}
                  style={[styles.navItem, active && styles.navItemActive]}
                  onPress={() => router.push(item.href as never)}
                >
                  <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
        <View style={styles.content}>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.page } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="mine" />
            <Stack.Screen name="order/[id]" />
          </Stack>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.page },
  shell: { flex: 1 },
  shellRow: { flexDirection: 'row' },
  nav: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  navSide: {
    width: 200,
    borderBottomWidth: 0,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingTop: spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  brand: {
    fontFamily: fonts.heading,
    fontSize: typeScale.title,
    color: colors.primaryText,
  },
  exit: {
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.small,
    color: colors.playportOrange,
  },
  navRow: { flexDirection: 'row', gap: spacing.sm, paddingBottom: spacing.sm },
  navCol: { flexDirection: 'column', gap: spacing.xs },
  navItem: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  navItemActive: { backgroundColor: colors.orangeTint },
  navLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.body,
    color: colors.secondaryText,
  },
  navLabelActive: { color: colors.playportOrange },
  content: { flex: 1 },
  center: {
    flex: 1,
    backgroundColor: colors.page,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.md,
  },
  title: {
    fontFamily: fonts.heading,
    fontSize: typeScale.headline,
    color: colors.primaryText,
    textAlign: 'center',
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: typeScale.body,
    color: colors.secondaryText,
    textAlign: 'center',
    maxWidth: 400,
    lineHeight: 22,
  },
  btn: {
    marginTop: spacing.md,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.playportOrange,
  },
  btnText: {
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.body,
    color: colors.white,
  },
});
