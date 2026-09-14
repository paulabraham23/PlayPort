import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, fonts, radii, spacing } from '@/constants/theme';

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
  /** When set, renders a non-editable pressable search chrome (avoids nested buttons). */
  onPress?: () => void;
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Search 'PS5', 'karaoke', 'projector'...",
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
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open search"
        onPress={onPress}
        style={styles.row}
      >
        <View style={styles.inputWrap}>
          <Ionicons name="search" size={18} color={colors.secondaryText} />
          <Text style={styles.placeholder} numberOfLines={1}>
            {value || placeholder}
          </Text>
          <Ionicons name="mic-outline" size={18} color={colors.secondaryText} />
        </View>
        {onFilterPress ? (
          <View style={styles.sideBtn}>
            <Ionicons name="options-outline" size={18} color={colors.primaryText} />
          </View>
        ) : null}
      </Pressable>
    );
  }

  return (
    <View style={styles.row}>
      {showBack ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={onBack} style={styles.sideBtn}>
          <Ionicons name="arrow-back" size={18} color={colors.primaryText} />
        </Pressable>
      ) : null}
      <View style={styles.inputWrap}>
        <Ionicons name="search" size={18} color={colors.secondaryText} />
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
        ) : (
          <Ionicons name="mic-outline" size={18} color={colors.secondaryText} />
        )}
      </View>
      {onFilterPress ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Filters" onPress={onFilterPress} style={styles.sideBtn}>
          <Ionicons name="options-outline" size={18} color={colors.primaryText} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  input: {
    flex: 1,
    color: colors.primaryText,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  placeholder: {
    flex: 1,
    color: colors.mutedText,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  sideBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
