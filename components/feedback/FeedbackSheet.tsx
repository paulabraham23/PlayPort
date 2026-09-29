import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Button } from '@/components/ui/Button';
import { colors, fonts, radii, spacing, typeScale } from '@/constants/theme';
import { submitFeedback } from '@/lib/feedback';
import { useFeelStore } from '@/store/feelStore';

type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognition(): (new () => SpeechRec) | null {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRec;
    webkitSpeechRecognition?: new () => SpeechRec;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function FeedbackSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const showToast = useFeelStore((s) => s.showToast);
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const [sending, setSending] = useState(false);
  const [channel, setChannel] = useState<'text' | 'voice'>('text');
  const canSpeak = getSpeechRecognition() != null;

  useEffect(() => {
    if (!visible) {
      setText('');
      setListening(false);
      setChannel('text');
    }
  }, [visible]);

  const startVoice = () => {
    const Ctor = getSpeechRecognition();
    if (!Ctor) {
      showToast('Voice input works in the browser');
      return;
    }
    const rec = new Ctor();
    rec.lang = 'en-IN';
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (event) => {
      const said = event.results[0]?.[0]?.transcript ?? '';
      if (said) {
        setChannel('voice');
        setText((prev) => (prev ? `${prev} ${said}` : said));
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    setListening(true);
    setChannel('voice');
    rec.start();
  };

  const send = async () => {
    const body = text.trim();
    if (!body) return;
    setSending(true);
    try {
      await submitFeedback({ text: body, channel });
      showToast('Thanks — feedback sent');
      onClose();
    } catch {
      showToast('Could not send feedback');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <Text style={styles.title}>What can be improved?</Text>
          <Text style={styles.sub}>Tell us by voice or text. We read every note.</Text>
          <TextInput
            value={text}
            onChangeText={(value) => {
              setChannel('text');
              setText(value);
            }}
            placeholder="What should we change?"
            placeholderTextColor={colors.mutedText}
            multiline
            style={styles.input}
          />
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Give feedback by voice"
              onPress={startVoice}
              style={[styles.voice, listening && styles.voiceOn]}
            >
              <Ionicons name="mic" size={18} color={listening ? colors.white : colors.primaryText} />
              <Text style={[styles.voiceText, listening && styles.voiceTextOn]}>
                {listening ? 'Listening…' : canSpeak ? 'Voice' : 'Voice'}
              </Text>
            </Pressable>
            <View style={{ flex: 1 }}>
              <Button title={sending ? 'Sending…' : 'Send'} onPress={() => void send()} disabled={!text.trim() || sending} />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  sheet: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.xl,
    gap: spacing.md,
    ...Platform.select({
      web: { boxShadow: '0 16px 40px rgba(0,0,0,0.18)' } as object,
      default: {},
    }),
  },
  title: {
    color: colors.primaryText,
    fontFamily: fonts.heading,
    fontSize: typeScale.headline,
  },
  sub: {
    color: colors.secondaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.body,
  },
  input: {
    minHeight: 120,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.primaryText,
    fontFamily: fonts.body,
    fontSize: typeScale.bodyLg,
    textAlignVertical: 'top',
    backgroundColor: colors.surfaceAlt,
  },
  actions: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  voice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 50,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  voiceOn: { backgroundColor: colors.playportOrange, borderColor: colors.playportOrange },
  voiceText: { color: colors.primaryText, fontFamily: fonts.bodyMedium, fontSize: typeScale.body },
  voiceTextOn: { color: colors.white },
});
