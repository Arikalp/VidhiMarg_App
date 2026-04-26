import { useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signInWithEmailAndPassword } from 'firebase/auth';

import { BrandTheme } from '@/constants/theme';
import { auth } from '@/lib/firebase';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/(tabs)/services');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to login right now.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.kicker}>VIDHIMARG</Text>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.subtitle}>Sign in with the same credentials used on the website.</Text>

        <TextInput
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor={BrandTheme.colors.onSurfaceVariant}
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          placeholderTextColor={BrandTheme.colors.onSurfaceVariant}
        />

        {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

        <Pressable style={styles.primaryButton} onPress={handleLogin} disabled={loading}>
          <Text style={styles.primaryButtonText}>{loading ? 'Logging in...' : 'Login'}</Text>
        </Pressable>

        <Link href="/(auth)/signup" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Create account</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BrandTheme.colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    gap: 12,
  },
  kicker: {
    color: BrandTheme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  title: {
    color: BrandTheme.colors.onSurface,
    fontSize: 34,
    fontWeight: '800',
  },
  subtitle: {
    color: BrandTheme.colors.onSurfaceVariant,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: BrandTheme.colors.outlineVariant,
    borderRadius: BrandTheme.radius.xl,
    backgroundColor: BrandTheme.colors.surfaceLowest,
    color: BrandTheme.colors.onSurface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  errorMessage: {
    color: BrandTheme.colors.error,
    fontSize: 13,
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: BrandTheme.colors.primary,
    borderRadius: BrandTheme.radius.xl,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: BrandTheme.colors.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: BrandTheme.colors.outlineVariant,
    borderRadius: BrandTheme.radius.xl,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: BrandTheme.colors.onSurface,
    fontSize: 16,
    fontWeight: '600',
  },
});
