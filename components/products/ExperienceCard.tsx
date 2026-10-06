import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { colors, fonts, radii, spacing } from '@/constants/theme';
import { formatINR } from '@/utils/format';
import { defaultExperiencePlan, experiencePlans } from '@/utils/rentalPricing';
import type { Experience } from '@/types';

interface Props {
  experience: Experience;
  onPress?: () => void;
  onBook?: (planId: string) => void;
}

export function ExperienceCard({ experience, onPress, onBook }: Props) {
  const plans = experiencePlans(experience);
  const [planId, setPlanId] = useState(defaultExperiencePlan(experience).id);
  const plan = plans.find((item) => item.id === planId) ?? defaultExperiencePlan(experience);
  return (
    <View style={styles.card}>
      <Pressable accessibilityRole="button" accessibilityLabel={experience.name} onPress={onPress}>
        <View style={styles.topRow}>
          <Badge label={experience.tag} />
          <Badge
            label={`${experience.etaMinutes} mins`}
            color={colors.secondaryText}
            left={<Ionicons name="time-outline" size={12} color={colors.secondaryText} />}
          />
        </View>
        <Image source={{ uri: experience.image }} style={styles.image} contentFit="cover" />
        <View style={styles.body}>
          <Text style={styles.title}>{experience.name}</Text>
          <Text style={styles.desc}>{experience.description}</Text>
          <View style={styles.chips}>
            {experience.chips.map((chip) => (
              <Badge key={chip} label={chip} />
            ))}
          </View>
        </View>
      </Pressable>
      <View style={styles.planRow}>
        {plans.map((item) => {
          const on = item.id === plan.id;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => setPlanId(item.id)}
              style={[styles.planChip, on && styles.planChipOn]}
            >
              <Text style={[styles.planText, on && styles.planTextOn]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.footer}>
        <Text style={styles.price}>
          {formatINR(plan.price)} <Text style={styles.duration}>{plan.label}</Text>
        </Text>
        <Button title="Quick Book" size="sm" onPress={() => (onBook ? onBook(plan.id) : onPress?.())} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    overflow: 'hidden',
  },
  topRow: {
    position: 'absolute',
    zIndex: 2,
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  image: { width: '100%', aspectRatio: 16 / 9 },
  body: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: 10 },
  title: { color: colors.primaryText, fontFamily: fonts.heading, fontSize: 19 },
  desc: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 13, lineHeight: 19 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  planRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingHorizontal: spacing.lg },
  planChip: {
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  planChipOn: { borderColor: colors.playportOrange, backgroundColor: colors.orangeTint },
  planText: { color: colors.secondaryText, fontFamily: fonts.bodyMedium, fontSize: 12 },
  planTextOn: { color: colors.primaryText },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: 8,
  },
  price: { color: colors.primaryText, fontFamily: fonts.monoMedium, fontSize: 18 },
  duration: { color: colors.secondaryText, fontFamily: fonts.body, fontSize: 13 },
});
