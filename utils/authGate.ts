import { router } from 'expo-router';
import { useAppStore, type PendingCartAdd } from '@/store/appStore';

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

/** If signed out, remember the add and open login. Returns true when the caller should add now. */
export function gateCartAdd(next: string | undefined, add: PendingCartAdd): boolean {
  if (useAppStore.getState().isAuthenticated) return true;
  useAppStore.getState().queueCartAdd(add);
  ensureLoggedIn(next);
  return false;
}

export function resolveAuthNext(next?: string | string[] | null): string {
  const value = Array.isArray(next) ? next[0] : next;
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/(tabs)';
  }
  return value;
}
