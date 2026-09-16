/** User-facing message when Cloud Functions are not deployed (Spark / pre-Blaze). */
export function formatFunctionsError(err: unknown): string {
  const code =
    err && typeof err === 'object' && 'code' in err
      ? String((err as { code: string }).code)
      : '';
  const message =
    err && typeof err === 'object' && 'message' in err
      ? String((err as { message: string }).message)
      : err instanceof Error
        ? err.message
        : 'Something went wrong';

  if (
    code === 'functions/not-found' ||
    code === 'functions/unavailable' ||
    code === 'functions/internal' ||
    message.includes('NOT_FOUND') ||
    message.includes('Failed to fetch')
  ) {
    return 'Checkout server is not live yet (Firebase Blaze upgrade pending). Browse, cart, and addresses still work — try again after Functions are deployed, or use local emulators for testing.';
  }
  if (code === 'functions/deadline-exceeded' || message.includes('hold expired')) {
    return 'Your payment window expired. Start checkout again.';
  }
  if (code === 'functions/resource-exhausted') {
    return 'Not enough gear free for that slot. Try another time or shorter duration.';
  }
  return message;
}
