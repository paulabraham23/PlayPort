import { router, useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { LegalDocument } from '@/components/legal/LegalDocument';
import { EmptyState } from '@/components/ui/EmptyState';
import { LEGAL_DOCS } from '@/constants/legal';

export default function LegalScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const doc = LEGAL_DOCS[slug as keyof typeof LEGAL_DOCS];
  if (!doc) {
    return (
      <Screen showHeader={false} narrow>
        <ScreenHeader title="Policies" onBack={() => router.replace('/(tabs)')} />
        <EmptyState
          icon="document-text-outline"
          title="Page not found"
          subtitle="See our Terms & Conditions instead."
          actionLabel="Open Terms"
          onAction={() => router.replace('/legal/terms' as never)}
        />
      </Screen>
    );
  }
  return <LegalDocument doc={doc} />;
}
