import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { PressableScale } from '@/components/motion/PressableScale';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onClear?: () => void;
  onFilterPress?: () => void;
  showBack?: boolean;
  onBack?: () => void;
  autoFocus?: boolean;
  onPress?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search PS5, projector, VR…',
  onSubmit,
  onClear,
  onFilterPress,
  showBack,
  onBack,
  autoFocus,
  onPress,
}: Props) {
  if (onPress) {
    return (
      <PressableScale
        accessibilityLabel="Open search"
        onPress={onPress}
        scaleTo={0.98}
        style={styles.row}
      >
        <View style={styles.inputWrap}>
          <View style={styles.searchIcon}>
            <Ionicons name="search" size={18} color={colors.playportOrange} />
          </View>
          <Text style={styles.placeholder} numberOfLines={1}>
            {value || placeholder}
          </Text>
        </View>
      </PressableScale>
    );
  }

  return (
    <View style={styles.row}>
      {showBack ? (
        <PressableScale accessibilityLabel="Go back" onPress={onBack} scaleTo={0.92} style={styles.sideBtn}>
          <Ionicons name="arrow-back" size={18} color={colors.primaryText} />
        </PressableScale>
      ) : null}
      <View style={styles.inputWrap}>
        <View style={styles.searchIcon}>
          <Ionicons name="search" size={18} color={colors.playportOrange} />
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedText}
          style={styles.input}
          returnKeyType="search"
          onSubmitEditing={onSubmit}
          autoFocus={autoFocus}
          accessibilityLabel="Search entertainment"
        />
        {value ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={onClear} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={colors.secondaryText} />
          </Pressable>
        ) : null}
      </View>
      {onFilterPress ? (
        <PressableScale accessibilityLabel="Filters" onPress={onFilterPress} scaleTo={0.92} style={styles.sideBtn}>
          <Ionicons name="options-outline" size={18} color={colors.primaryText} />
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: spacing.md,
    minHeight: 50,
  },
  searchIcon: {
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.orangeTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    color: colors.primaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.bodyLg,
  },
  placeholder: {
    flex: 1,
    color: colors.mutedText,
    fontFamily: fonts.body,
    fontSize: typeScale.bodyLg,
  },
  sideBtn: {
    width: 46,
    height: 46,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
});
