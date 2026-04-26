import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandTheme } from '@/constants/theme';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>
          Profile read and write with users collection will be connected in Batch E.
        </Text>

        <Link href="/edit-profile" asChild>
          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Edit profile</Text>
          </Pressable>
        </Link>

        <Link href="/login" asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Logout (placeholder)</Text>
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
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  title: {
    color: BrandTheme.colors.onSurface,
    fontSize: 30,
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
