import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';
import type { AppNotification } from '@/types';

const TYPE_ICON: Record<AppNotification['type'], keyof typeof Ionicons.glyphMap> = {
  order: 'cube-outline',
  delivery: 'bicycle-outline',
  reminder: 'alarm-outline',
  account: 'shield-checkmark-outline',
  payment: 'card-outline',
};

export default function NotificationsScreen() {
  const { horizontalPadding } = useResponsive();
  const notifications = useAppStore((s) => s.notifications);
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useAppStore((s) => s.markAllNotificationsRead);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Screen showHeader={false} narrow>
      <ScreenHeader
        title="Notifications"
        subtitle={unread ? `${unread} unread` : 'All caught up'}
        onBack={() => router.back()}
        right={
          unread > 0 ? (
            <Pressable accessibilityRole="button" onPress={markAllNotificationsRead} hitSlop={8}>
              <Text style={styles.markAll}>Mark all</Text>
            </Pressable>
          ) : undefined
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
      >
        {notifications.length === 0 ? (
          <EmptyState
            icon="notifications-outline"
            title="No notifications"
            subtitle="Order updates and return reminders will land here."
          />
        ) : (
          <>
            {unread > 0 ? (
              <Button
                title="Mark all as read"
                variant="ghost"
                size="sm"
                onPress={markAllNotificationsRead}
              />
            ) : null}
            <View style={styles.list}>
              {notifications.map((n) => (
                <Pressable
                  key={n.id}
                  accessibilityRole="button"
                  onPress={() => markNotificationRead(n.id)}
                >
                  <Card style={[styles.card, !n.read && styles.unread]}>
                    <View style={[styles.icon, !n.read && styles.iconUnread]}>
                      <Ionicons
                        name={TYPE_ICON[n.type]}
                        size={18}
                        color={colors.playportOrange}
                      />
                    </View>
                    <View style={{ flex: 1, gap: 4 }}>
                      <View style={styles.titleRow}>
                        <Text style={styles.title}>{n.title}</Text>
                        {!n.read ? <View style={styles.dot} /> : null}
                      </View>
                      <Text style={styles.body}>{n.body}</Text>
                      <Text style={styles.time}>{n.timeLabel}</Text>
                    </View>
                  </Card>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxxl, gap: spacing.md, paddingTop: spacing.sm },
  markAll: { color: colors.secondaryText, fontFamily: fonts.bodyMedium, fontSize: 13 },
  list: { gap: spacing.sm },
  card: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
  unread: { borderColor: colors.border },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconUnread: { backgroundColor: colors.surfaceAlt },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 15, flex: 1 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.playportOrange,
  },
  body: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  time: { color: colors.mutedText, fontFamily: fonts.mono, fontSize: 11, marginTop: 2 },
});
