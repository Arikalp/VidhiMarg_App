import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandTheme } from '@/constants/theme';

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Utility widgets and booking insights will be added in Batch F.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Architecture ready</Text>
          <Text style={styles.cardText}>Tabs, service routes, and Firebase client are configured.</Text>
        </View>
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
  },
  title: {
    color: BrandTheme.colors.onSurface,
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    color: BrandTheme.colors.onSurfaceVariant,
    marginTop: 6,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  card: {
    borderRadius: BrandTheme.radius.xxl,
    borderWidth: 1,
    borderColor: BrandTheme.colors.outlineVariant,
    backgroundColor: BrandTheme.colors.surfaceLowest,
    padding: 16,
  },
  cardTitle: {
    color: BrandTheme.colors.onSurface,
    fontSize: 17,
    fontWeight: '700',
  },
  cardText: {
    marginTop: 8,
    color: BrandTheme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
});
