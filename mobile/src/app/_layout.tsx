import { Stack } from 'expo-router';

import { MarketplaceProvider } from '@/hooks/use-marketplace';

export default function RootLayout() {
  return (
    <MarketplaceProvider>
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="image-credits" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="register" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="forgot-password" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="post-job" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="admin" />
        <Stack.Screen name="verification" />
        <Stack.Screen name="notifications" />
      </Stack>
    </MarketplaceProvider>
  );
}
