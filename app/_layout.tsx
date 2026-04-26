import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export default function RootLayout() {
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
