import type { Address, User } from '@/types';

const PLACEHOLDER_NAMES = /^(playport member|guest|member\s+\d{2,4})$/i;

export function isPlaceholderName(name?: string | null): boolean {
  if (!name?.trim()) return true;
  return PLACEHOLDER_NAMES.test(name.trim());
}

/** New users need a real name + at least one delivery address. */
export function needsOnboarding(user: User | null, addresses: Address[]): boolean {
  if (!user) return false;
  if (user.onboardingComplete) return false;
  const hasName = !isPlaceholderName(user.name);
  const hasAddress = addresses.length > 0;
  // Already set up (even if the flag was never persisted) — treat as done.
  if (hasName && hasAddress) return false;
  return !hasName || !hasAddress;
}
