import { router } from 'expo-router';
import { useAppStore } from '@/store/appStore';

/** Returns true if the user can continue; otherwise opens login and returns false. */
export function ensureLoggedIn(next?: string): boolean {
  const { isAuthenticated } = useAppStore.getState();
  if (isAuthenticated) return true;
  router.push({
    pathname: '/(auth)/login',
    params: next ? { next } : undefined,
  });
  return false;
}

export function resolveAuthNext(next?: string | string[] | null): string {
  const value = Array.isArray(next) ? next[0] : next;
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/(tabs)';
  }
  return value;
}
