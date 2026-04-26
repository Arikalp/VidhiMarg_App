import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandTheme } from '@/constants/theme';
import { serviceCatalog } from '@/services/serviceCatalog';

export default function ServiceDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const service = serviceCatalog.find((item) => item.id === id);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>{service?.title ?? 'Service Detail'}</Text>
        <Text style={styles.price}>{service?.price ?? 'Price unavailable'}</Text>
        <Text style={styles.description}>
          {service?.description ?? 'Service detail screen scaffolded for Batch B.'}
        </Text>
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
    gap: 10,
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
});
