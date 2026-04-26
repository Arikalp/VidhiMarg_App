import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandTheme } from '@/constants/theme';
import { serviceCatalog } from '@/services/serviceCatalog';

export default function ServicesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Services</Text>
        <Text style={styles.subtitle}>Book legal services synced to the same Firebase backend.</Text>
      </View>

      <FlatList
        data={serviceCatalog}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => {
              router.push({ pathname: '/service/[id]', params: { id: item.id } });
            }}>
            <View style={styles.cardTop}>
              <Ionicons name={item.icon} size={22} color={BrandTheme.colors.primary} />
              <Text style={styles.price}>{item.price}</Text>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
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
    paddingBottom: 28,
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
});
