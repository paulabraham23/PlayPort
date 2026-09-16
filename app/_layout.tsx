import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { colors } from '@/constants/theme';
import { useAppStore } from '@/store/appStore';
import { useCatalogStore } from '@/store/catalogStore';
import { registerWebPushIfAvailable } from '@/lib/fcm';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

const PlayPortTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.playportOrange,
    background: colors.page,
    card: colors.surface,
    text: colors.primaryText,
    border: colors.border,
    notification: colors.badgeRed,
  },
};

export default function RootLayout() {
  const hydrateCatalog = useCatalogStore((s) => s.hydrate);
  const bootstrapAuth = useAppStore((s) => s.bootstrapAuth);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      void hydrateCatalog();
    }
  }, [loaded, hydrateCatalog]);

  useEffect(() => {
    const unsub = bootstrapAuth();
    return unsub;
  }, [bootstrapAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      void registerWebPushIfAvailable();
    }
  }, [isAuthenticated]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={PlayPortTheme}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.page },
          animation: 'fade_from_bottom',
          animationDuration: 280,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="search/index" options={{ animation: 'fade' }} />
        <Stack.Screen name="search/results" />
        <Stack.Screen name="product/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="experience/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="category/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="cart" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="checkout/index" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="checkout/payment" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="checkout/confirmation" options={{ animation: 'fade' }} />
        <Stack.Screen name="address/index" />
        <Stack.Screen name="address/add" />
        <Stack.Screen name="address/edit/[id]" />
        <Stack.Screen name="order/[id]" />
        <Stack.Screen name="order/track/[id]" />
        <Stack.Screen name="order/cancel/[id]" />
        <Stack.Screen name="order/return/[id]" />
        <Stack.Screen name="profile/addresses" />
        <Stack.Screen name="profile/payment-methods" />
        <Stack.Screen name="profile/notifications" />
        <Stack.Screen name="profile/settings" />
        <Stack.Screen name="profile/help" />
        <Stack.Screen name="profile/reviews" />
        <Stack.Screen name="modal" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      </Stack>
    </ThemeProvider>
  );
}
