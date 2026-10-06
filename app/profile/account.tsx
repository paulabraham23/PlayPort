import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { useResponsive } from '@/hooks/useResponsive';
import { useAppStore } from '@/store/appStore';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AccountScreen() {
  const { horizontalPadding } = useResponsive();
  const user = useAppStore((s) => s.user);
  const updateUserProfile = useAppStore((s) => s.updateUserProfile);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!editing) {
      setName(user?.name ?? '');
      setEmail(user?.email ?? '');
    }
  }, [user?.name, user?.email, editing]);

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();
  const emailValid = trimmedEmail === '' || EMAIL_RE.test(trimmedEmail);
  const dirty =
    trimmedName !== (user?.name ?? '').trim() || trimmedEmail !== (user?.email ?? '').trim();
  const canSave = editing && !saving && trimmedName.length >= 2 && emailValid && dirty;

  const onSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateUserProfile({ name: trimmedName, email: trimmedEmail });
      setSaved(true);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn’t save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen showHeader={false} narrow>
      <ScreenHeader
        title="Account"
        subtitle="View and edit your profile"
        onBack={() => router.back()}
        right={
          !editing ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
              onPress={() => {
                setError(null);
                setSaved(false);
                setEditing(true);
              }}
              style={styles.editBtn}
            >
              <Ionicons name="pencil-outline" size={18} color={colors.playportOrange} />
              <Text style={styles.editText}>Edit</Text>
            </Pressable>
          ) : undefined
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
      >
        {saved ? <Text style={styles.saved}>Profile updated</Text> : null}

        <Card style={styles.row}>
          <Ionicons name="person-outline" size={18} color={colors.playportOrange} />
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={styles.label}>Name</Text>
            {editing ? (
              <>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Priya Nair"
                  placeholderTextColor={colors.mutedText}
                  autoCapitalize="words"
                  autoCorrect={false}
                  style={styles.input}
                  accessibilityLabel="Your name"
                  returnKeyType="done"
                />
                {trimmedName.length > 0 && trimmedName.length < 2 ? (
                  <Text style={styles.error}>Name needs at least 2 characters</Text>
                ) : null}
              </>
            ) : (
              <Text style={styles.sub}>{user?.name || 'Add your name'}</Text>
            )}
          </View>
        </Card>

        <Card style={styles.row}>
          <Ionicons name="mail-outline" size={18} color={colors.playportOrange} />
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={styles.label}>Email</Text>
            {editing ? (
              <>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.mutedText}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  style={styles.input}
                  accessibilityLabel="Email address"
                />
                {!emailValid ? <Text style={styles.error}>Enter a valid email</Text> : null}
              </>
            ) : (
              <Text style={styles.sub}>{user?.email || 'Add your email'}</Text>
            )}
          </View>
        </Card>

        <Card style={styles.row}>
          <Ionicons name="call-outline" size={18} color={colors.playportOrange} />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.sub}>{user?.phone || 'Not signed in'}</Text>
            <Text style={styles.hint}>Phone number is tied to login and can’t be edited here.</Text>
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

        {editing ? (
          <View style={styles.actions}>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button
              title={saving ? 'Saving…' : 'Save changes'}
              fullWidth
              disabled={!canSave}
              onPress={() => void onSave()}
            />
            <Button
              title="Cancel"
              variant="ghost"
              fullWidth
              disabled={saving}
              onPress={() => {
                setName(user?.name ?? '');
                setEmail(user?.email ?? '');
                setError(null);
                setEditing(false);
              }}
            />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxxl, gap: spacing.md, paddingTop: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  label: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 15 },
  sub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 13, marginTop: 2, lineHeight: 18 },
  hint: { color: colors.mutedText, fontFamily: fonts.body, fontSize: 12, marginTop: 4, lineHeight: 16 },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.primaryText,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: colors.orangeTint,
  },
  editText: { color: colors.playportOrange, fontFamily: fonts.bodyMedium, fontSize: 14 },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
  error: { color: colors.badgeRed, fontFamily: fonts.body, fontSize: 13 },
  saved: { color: colors.success, fontFamily: fonts.bodyMedium, fontSize: 13 },
});
