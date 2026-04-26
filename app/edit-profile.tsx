import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandTheme } from '@/constants/theme';

export default function EditProfileScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Edit Profile</Text>
        <Text style={styles.subtitle}>Form scaffold ready. Firestore wiring will be implemented in Batch E.</Text>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          placeholderTextColor={BrandTheme.colors.onSurfaceVariant}
          style={styles.input}
        />

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor={BrandTheme.colors.onSurfaceVariant}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Save changes (placeholder)</Text>
        </Pressable>
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
    paddingTop: 12,
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
    marginBottom: 6,
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
  button: {
    marginTop: 6,
    borderRadius: BrandTheme.radius.xl,
    backgroundColor: BrandTheme.colors.primary,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: BrandTheme.colors.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
});
