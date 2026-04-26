import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandTheme } from '@/constants/theme';
import { getServiceById } from '@/services/serviceCatalog';

export default function ServiceDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const service = getServiceById(id);

  if (!service) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.title}>Service not found</Text>
          <Text style={styles.description}>The selected service is unavailable. Please go back and choose another option.</Text>
          <Pressable style={styles.primaryButton} onPress={() => router.replace('/(tabs)/services')}>
            <Text style={styles.primaryButtonText}>Back to services</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleBookNow = () => {
    router.push({
      pathname: '/booking',
      params: {
        id: service.id,
        title: service.title,
        price: service.price,
        category: service.category,
        serviceType: service.serviceType,
      },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.heroCard}>
          <Text style={styles.title}>{service.title}</Text>
          <Text style={styles.price}>{service.price}</Text>
          <Text style={styles.description}>{service.description}</Text>
          <View style={styles.metaPill}>
            <Text style={styles.metaPillText}>Estimated turnaround: {service.estimatedTurnaround}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle}>What is included</Text>
          {service.includes.map((item) => (
            <View key={item} style={styles.includeRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.includeText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actionRow}>
          <Pressable style={styles.secondaryButton} onPress={() => router.replace('/(tabs)/services')}>
            <Text style={styles.secondaryButtonText}>Browse more</Text>
          </Pressable>
          <Pressable style={styles.primaryButton} onPress={handleBookNow}>
            <Text style={styles.primaryButtonText}>Continue to booking</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BrandTheme.colors.background,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 14,
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
  price: {
    color: BrandTheme.colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  description: {
    color: BrandTheme.colors.onSurfaceVariant,
    fontSize: 15,
    lineHeight: 22,
  },
  heroCard: {
    borderRadius: BrandTheme.radius.xxl,
    borderWidth: 1,
    borderColor: BrandTheme.colors.outlineVariant,
    backgroundColor: BrandTheme.colors.surfaceLowest,
    padding: 16,
    gap: 10,
  },
  infoCard: {
    borderRadius: BrandTheme.radius.xxl,
    borderWidth: 1,
    borderColor: BrandTheme.colors.outlineVariant,
    backgroundColor: BrandTheme.colors.surfaceLowest,
    padding: 16,
    gap: 8,
  },
  sectionTitle: {
    color: BrandTheme.colors.onSurface,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  includeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bullet: {
    color: BrandTheme.colors.primary,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
  includeText: {
    flex: 1,
    color: BrandTheme.colors.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    borderRadius: BrandTheme.radius.xl,
    backgroundColor: BrandTheme.colors.primary,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: BrandTheme.colors.onPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    borderRadius: BrandTheme.radius.xl,
    borderWidth: 1,
    borderColor: BrandTheme.colors.outlineVariant,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: BrandTheme.colors.onSurface,
    fontSize: 14,
    fontWeight: '600',
  },
  metaPill: {
    alignSelf: 'flex-start',
    borderRadius: BrandTheme.radius.pill,
    backgroundColor: BrandTheme.colors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaPillText: {
    color: BrandTheme.colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '600',
  },
});
