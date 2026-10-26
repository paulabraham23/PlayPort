import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { colors, fonts, spacing } from '@/constants/theme';
import { FAQS, HELP_TOPICS } from '@/constants/helpContent';
import { BUSINESS } from '@/constants/legal';
import { LegalLinks } from '@/components/legal/LegalLinks';
import { useResponsive } from '@/hooks/useResponsive';

export default function HelpScreen() {
  const { horizontalPadding } = useResponsive();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const open = async (url: string, fallback: string) => {
    try {
      const can = await Linking.canOpenURL(url);
      if (can) await Linking.openURL(url);
      else Alert.alert('Contact support', fallback);
    } catch {
      Alert.alert('Contact support', fallback);
    }
  };
  const whatsappSupport = () =>
    open(
      `https://wa.me/91${BUSINESS.phone}?text=${encodeURIComponent('Hi PlayPort, I need help with my booking.')}`,
      `WhatsApp us at ${BUSINESS.phone}`
    );
  const emailSupport = () =>
    open(`mailto:${BUSINESS.email}?subject=PlayPort%20Support`, `Email us at ${BUSINESS.email}`);

  return (
    <Screen showHeader={false}>
      <ScreenHeader title="Help & FAQs" subtitle="Tech desk & policies" onBack={() => router.back()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingHorizontal: horizontalPadding }]}
      >
        <Text style={styles.section}>Topics</Text>
        <View style={styles.topics}>
          {HELP_TOPICS.map((topic) => {
            const active = selectedTopic === topic.id;
            return (
              <Pressable
                key={topic.id}
                accessibilityRole="button"
                onPress={() => {
                  setSelectedTopic(topic.id);
                  if (topic.id === 'faqs') setOpenFaq(0);
                }}
              >
                <Card style={[styles.topicCard, active && styles.topicActive]}>
                  <View style={styles.topicIcon}>
                    <Ionicons name="help-buoy-outline" size={18} color={colors.playportOrange} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.topicTitle}>{topic.title}</Text>
                    <Text style={styles.topicSub}>{topic.subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.mutedText} />
                </Card>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.section}>FAQs</Text>
        <Card padded={false}>
          {FAQS.map((faq, index) => {
            const open = openFaq === index;
            return (
              <View key={faq.q} style={index < FAQS.length - 1 ? styles.faqBorder : undefined}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setOpenFaq(open ? null : index)}
                  style={styles.faqHead}
                >
                  <Text style={styles.faqQ}>{faq.q}</Text>
                  <Ionicons
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.secondaryText}
                  />
                </Pressable>
                {open ? <Text style={styles.faqA}>{faq.a}</Text> : null}
              </View>
            );
          })}
        </Card>

        <Button
          title={`WhatsApp us · ${BUSINESS.phone}`}
          fullWidth
          icon={<Ionicons name="logo-whatsapp" size={18} color={colors.white} />}
          onPress={() => void whatsappSupport()}
        />
        <Button
          title={`Email ${BUSINESS.email}`}
          variant="secondary"
          fullWidth
          icon={<Ionicons name="mail-outline" size={18} color={colors.primaryText} />}
          onPress={() => void emailSupport()}
        />
        <Text style={styles.grievance}>
          Grievance Officer: {BUSINESS.grievanceOfficer} · {BUSINESS.address}. We acknowledge complaints within 2
          working days and aim to resolve them within 30 days.
        </Text>
        <LegalLinks showContact={false} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: spacing.xxxl, gap: spacing.md, paddingTop: spacing.sm },
  section: {
    color: colors.mutedText,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: spacing.sm,
  },
  topics: { gap: spacing.sm },
  topicCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  topicActive: { borderColor: colors.playportOrange },
  topicIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicTitle: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 15 },
  topicSub: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 12, marginTop: 2 },
  faqBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  grievance: { color: colors.mutedText, fontFamily: fonts.body, fontSize: 12, lineHeight: 17, textAlign: 'center' },
  faqHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  faqQ: { flex: 1, color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: 14 },
  faqA: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
});
