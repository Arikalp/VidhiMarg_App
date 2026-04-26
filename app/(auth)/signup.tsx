import { useMemo, useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { BrandTheme } from '@/constants/theme';
import { auth, db } from '@/lib/firebase';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(
    () => name.trim().length > 0 && email.trim().length > 0 && PASSWORD_REGEX.test(password),
    [name, email, password]
  );

  const handleSignup = async () => {
    if (!canSubmit) {
      setErrorMessage(
        'Name, email, and a strong password are required (6+ chars, uppercase, lowercase, number).'
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Password and confirm password do not match.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const fullName = name.trim();

      await updateProfile(credential.user, { displayName: fullName });

      await setDoc(
        doc(db, 'users', credential.user.uid),
        {
          fullName,
          email: email.trim(),
          contactNumber: '',
          homeAddress: '',
          profileImage: credential.user.photoURL ?? '',
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      router.replace('/(tabs)/services');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create account right now.';
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.kicker}>CREATE ACCOUNT</Text>
        <Text style={styles.title}>Signup</Text>
        <Text style={styles.subtitle}>Create your account and sync with the same website users.</Text>

        <TextInput
          placeholder="Full name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor={BrandTheme.colors.onSurfaceVariant}
        />

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

        <TextInput
          placeholder="Confirm password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          placeholderTextColor={BrandTheme.colors.onSurfaceVariant}
        />

        {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}

        <Pressable
          style={[styles.primaryButton, !canSubmit && styles.primaryButtonDisabled]}
          onPress={handleSignup}
          disabled={loading || !canSubmit}>
          <Text style={styles.primaryButtonText}>{loading ? 'Creating account...' : 'Create account'}</Text>
        </Pressable>

        <Link href="/(auth)/login" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Back to login</Text>
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
  primaryButtonDisabled: {
    opacity: 0.65,
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
