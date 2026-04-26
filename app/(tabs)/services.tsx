import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandTheme } from '@/constants/theme';
import { serviceCatalog } from '@/services/serviceCatalog';

export default function ServicesScreen() {
  const router = useRouter();

  const handleOpenDetail = (serviceId: string) => {
    router.push({ pathname: '/service/[id]', params: { id: serviceId } });
  };

  const handleBookNow = (service: (typeof serviceCatalog)[number]) => {
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
      <View style={styles.header}>
        <Text style={styles.title}>Services</Text>
        <Text style={styles.subtitle}>Choose a service and continue to mobile checkout powered by the same Firebase data model.</Text>
      </View>

      <FlatList
        data={serviceCatalog}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => handleOpenDetail(item.id)}>
            <View style={styles.cardTop}>
              <Ionicons name={item.icon} size={22} color={BrandTheme.colors.primary} />
              {item.featured ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Popular</Text>
                </View>
              ) : null}
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>

            <View style={styles.cardMetaRow}>
              <Text style={styles.metaText}>ETA: {item.estimatedTurnaround}</Text>
              <Text style={styles.price}>{item.price}</Text>
            </View>

            <View style={styles.cardActionRow}>
              <Pressable style={styles.secondaryButton} onPress={() => handleOpenDetail(item.id)}>
                <Text style={styles.secondaryButtonText}>View details</Text>
              </Pressable>

              <Pressable style={styles.primaryButton} onPress={() => handleBookNow(item)}>
                <Text style={styles.primaryButtonText}>Book now</Text>
              </Pressable>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BrandTheme.colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: BrandTheme.colors.onSurface,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: BrandTheme.colors.onSurfaceVariant,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
    gap: 12,
  },
  card: {
    backgroundColor: BrandTheme.colors.surfaceLowest,
    borderWidth: 1,
    borderColor: BrandTheme.colors.outlineVariant,
    borderRadius: BrandTheme.radius.xxl,
    padding: 16,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badge: {
    backgroundColor: BrandTheme.colors.surfaceContainerLow,
    borderRadius: BrandTheme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: BrandTheme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BrandTheme.colors.onSurface,
  },
  cardDescription: {
    marginTop: 8,
    color: BrandTheme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: BrandTheme.colors.primary,
  },
  cardMetaRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: BrandTheme.colors.onSurfaceVariant,
  },
  cardActionRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: BrandTheme.colors.primary,
    borderRadius: BrandTheme.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
  },
  primaryButtonText: {
    color: BrandTheme.colors.onPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: BrandTheme.colors.outlineVariant,
    borderRadius: BrandTheme.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
  },
  secondaryButtonText: {
    color: BrandTheme.colors.onSurface,
    fontSize: 14,
    fontWeight: '600',
  },
});
