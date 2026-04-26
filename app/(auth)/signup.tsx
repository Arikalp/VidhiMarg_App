import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandTheme } from '@/constants/theme';

export default function SignupScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.kicker}>CREATE ACCOUNT</Text>
        <Text style={styles.title}>Signup</Text>
        <Text style={styles.subtitle}>
          Signup form and Firebase auth actions will be implemented in Batch C.
        </Text>

        <Link href="/services" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Continue to App</Text>
          </Pressable>
        </Link>

        <Link href="/login" asChild>
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
    marginBottom: 16,
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
