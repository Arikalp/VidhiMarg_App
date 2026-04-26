import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { useEffect } from 'react';

import { BrandTheme } from '@/constants/theme';
import { AuthSessionProvider, useAuthSession } from '@/hooks/use-auth-session';

function AppNavigator() {
  const segments = useSegments();
  const router = useRouter();
  const { user, initializing } = useAuthSession();

  useEffect(() => {
    if (initializing) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    }

    if (user && inAuthGroup) {
      router.replace('/(tabs)/services');
    }
  }, [initializing, router, segments, user]);

  if (initializing) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={BrandTheme.colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerTitleAlign: 'center' }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="service/[id]" options={{ title: 'Service Detail' }} />
        <Stack.Screen name="edit-profile" options={{ title: 'Edit Profile' }} />
      </Stack>
      <StatusBar style="dark" />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthSessionProvider>
      <AppNavigator />
    </AuthSessionProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BrandTheme.colors.background,
  },
});
