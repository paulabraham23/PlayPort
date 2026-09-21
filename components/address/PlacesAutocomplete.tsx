import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';
import {
  newPlacesSessionToken,
  resolvePlace,
  searchPlaces,
  type PlacesSuggestion,
  type ResolvedPlaceAddress,
} from '@/lib/places';

type Props = {
  label?: string;
  placeholder?: string;
  onPlaceSelected: (place: ResolvedPlaceAddress) => void;
  bias?: { latitude: number; longitude: number; radiusMeters?: number };
  disabled?: boolean;
};

export function PlacesAutocomplete({
  label = 'Search address',
  placeholder = 'Start typing area, landmark, or street…',
  onPlaceSelected,
  bias,
  disabled,
}: Props) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlacesSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const sessionToken = useRef(newPlacesSessionToken());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const runSearch = (text: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = text.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    debounceRef.current = setTimeout(() => {
      const id = ++requestId.current;
      void searchPlaces(trimmed, sessionToken.current, bias)
        .then((list) => {
          if (id !== requestId.current) return;
          setSuggestions(list);
          setOpen(list.length > 0);
        })
        .catch((e) => {
          if (id !== requestId.current) return;
          setSuggestions([]);
          setOpen(false);
          setError(e instanceof Error ? e.message : 'Couldn’t search places');
        })
        .finally(() => {
          if (id === requestId.current) setLoading(false);
        });
    }, 280);
  };

  const onChange = (text: string) => {
    setQuery(text);
    runSearch(text);
  };

  const onSelect = async (suggestion: PlacesSuggestion) => {
    setResolving(true);
    setError(null);
    setOpen(false);
    setQuery(suggestion.primaryText || suggestion.fullText);
    try {
      const place = await resolvePlace(suggestion.placeId, sessionToken.current);
      onPlaceSelected(place);
      sessionToken.current = newPlacesSessionToken();
      setSuggestions([]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Couldn’t load that place');
    } finally {
      setResolving(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, open && styles.inputRowOpen]}>
        <Ionicons name="search" size={18} color={colors.mutedText} />
        <TextInput
          value={query}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.mutedText}
          editable={!disabled && !resolving}
          style={styles.input}
          autoCorrect={false}
          autoCapitalize="words"
          accessibilityLabel={label}
          onFocus={() => {
            if (suggestions.length) setOpen(true);
          }}
        />
        {loading || resolving ? (
          <ActivityIndicator size="small" color={colors.playportOrange} />
        ) : query ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => {
              setQuery('');
              setSuggestions([]);
              setOpen(false);
              setError(null);
            }}
            hitSlop={8}
          >
            <Ionicons name="close-circle" size={18} color={colors.mutedText} />
          </Pressable>
        ) : null}
      </View>

      {open ? (
        <View style={styles.dropdown}>
          {suggestions.map((s) => (
            <Pressable
              key={s.placeId}
              accessibilityRole="button"
              onPress={() => void onSelect(s)}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            >
              <Ionicons name="location-outline" size={18} color={colors.playportOrange} />
              <View style={styles.rowText}>
                <Text style={styles.primary} numberOfLines={1}>
                  {s.primaryText}
                </Text>
                {s.secondaryText ? (
                  <Text style={styles.secondary} numberOfLines={1}>
                    {s.secondaryText}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          ))}
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Text style={styles.hint}>Powered by Google · results biased to your hub city</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6, zIndex: 20 },
  label: {
    color: colors.mutedText,
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1.5,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  },
  inputRowOpen: {
    borderColor: colors.playportOrange,
    backgroundColor: colors.orangeTint,
  },
  input: {
    flex: 1,
    color: colors.primaryText,
    fontFamily: fonts.body,
    fontSize: 15,
    paddingVertical: 12,
    outlineStyle: 'none' as unknown as undefined,
  },
  dropdown: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radii.md,
    overflow: 'hidden',
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  rowPressed: { backgroundColor: colors.orangeTint },
  rowText: { flex: 1, gap: 2 },
  primary: {
    color: colors.primaryText,
    fontFamily: fonts.bodyMedium,
    fontSize: typeScale.body,
  },
  secondary: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.caption,
  },
  error: {
    color: colors.badgeRed,
    fontFamily: fonts.body,
    fontSize: typeScale.caption,
  },
  hint: {
    color: colors.mutedText,
    fontFamily: fonts.body,
    fontSize: 10,
  },
});
