import type { Address, User } from '@/types';

const PLACEHOLDER_NAMES = /^(playport member|guest|member\s+\d{2,4})$/i;

export function isPlaceholderName(name?: string | null): boolean {
  if (!name?.trim()) return true;
  return PLACEHOLDER_NAMES.test(name.trim());
}

/**
 * Gate post-login onboarding.
 * Once `onboardingComplete` is set it stays done — never re-prompt on every OTP.
 * Incomplete profiles still need a real name and at least one address.
 */
export function needsOnboarding(user: User | null, addresses: Address[]): boolean {
  if (!user) return false;
  if (user.onboardingComplete === true) return false;
  const hasName = !isPlaceholderName(user.name);
  const hasAddress = addresses.length > 0;
  if (hasName && hasAddress) return false;
  return !hasName || !hasAddress;
}

/** After OTP: name screen vs address vs home. */
export function onboardingRoute(
  user: User | null,
  addresses: Address[]
): 'home' | 'name' | 'address' {
  if (!user || user.onboardingComplete === true) return 'home';
  const hasName = !isPlaceholderName(user.name);
  const hasAddress = addresses.length > 0;
  if (hasName && hasAddress) return 'home';
  if (!hasName) return 'name';
  return 'address';
}
