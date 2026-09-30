import { StyleSheet, Text, View } from 'react-native';
import { PlayPortWordmark } from '@/components/brand/PlayPortWordmark';
import { Screen } from '@/components/layout/Screen';
import { colors, fonts, spacing, typeScale } from '@/constants/theme';

export default function ExperiencesScreen() {
  return (
    <Screen showHeader={false}>
      <View style={styles.wrap}>
        <PlayPortWordmark size={40} />
        <Text style={styles.title}>Something's cooking.</Text>
        <Text style={styles.body}>We'll be back with experiences worth the wait.</Text>
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
  title: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: 40,
    letterSpacing: -1,
    textAlign: 'center',
  },
  body: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.title,
    textAlign: 'center',
    lineHeight: 26,
    maxWidth: 340,
  },
});
