import { Redirect } from 'expo-router';

import { useAuthSession } from '@/hooks/use-auth-session';

export default function IndexScreen() {
  const { user } = useAuthSession();

  if (user) {
    return <Redirect href="/(tabs)/services" />;
  }

  return <Redirect href="/(auth)/login" />;
}
