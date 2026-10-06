import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { colors, fonts, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';

export default function AccountScreen() {
  const { horizontalPadding } = useResponsive();
  const user = useAppStore((s) => s.user);

  return (
    <Screen showHeader={false} narrow>
      <ScreenHeader title="Account" subtitle="This number is signed in" onBack={() => router.back()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
      >
        <Card style={styles.row}>
          <Ionicons name="person-outline" size={18} color={colors.playportOrange} />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.sub}>{user?.name || 'Add your name during setup'}</Text>
          </View>
        </Card>
        <Card style={styles.row}>
          <Ionicons name="call-outline" size={18} color={colors.playportOrange} />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.sub}>{user?.phone || 'Not signed in'}</Text>
          </View>
        </Card>
        <Card style={styles.row}>
          <Ionicons
            name={user?.kycVerified ? 'shield-checkmark' : 'shield-checkmark-outline'}
            size={18}
            color={colors.playportOrange}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>{user?.kycVerified ? 'Verified' : 'Phone confirmed'}</Text>
            <Text style={styles.sub}>
              {user?.kycVerified
                ? 'This account has an extra verification mark.'
                : 'Signing in with your OTP confirms this phone number. That is separate from app settings.'}
            </Text>
          </View>
        </Card>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxxl, gap: spacing.md, paddingTop: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  label: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 15 },
  sub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 13, marginTop: 2, lineHeight: 18 },
});
