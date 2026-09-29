import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '@/components/layout/Screen';
import { colors, fonts, spacing, typeScale } from '@/constants/theme';

export default function ExperiencesScreen() {
  return (
    <Screen pageTitle="Experiences" showCart={false}>
      <View style={styles.wrap}>
        <View style={styles.icon}>
          <Ionicons name="sparkles-outline" size={28} color={colors.playportOrange} />
        </View>
        <Text style={styles.title}>Coming soon</Text>
        <Text style={styles.body}>Experiences are launching soon. Check back for hosted nights and events.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    gap: spacing.sm,
    backgroundColor: colors.page,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: typeScale.headline,
  },
  body: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.body,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
});
