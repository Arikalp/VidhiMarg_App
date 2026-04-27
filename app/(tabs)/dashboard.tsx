import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

import { BrandTheme } from '@/constants/theme';
import { useAuthSession } from '@/hooks/use-auth-session';
import { db } from '@/lib/firebase';

type RequestStatus = 'Pending' | 'Accepted' | 'Rejected';

type BookingRequest = {
  id: string;
  category?: string;
  serviceType?: string;
  price?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  status?: RequestStatus;
  createdAt?: {
    toDate?: () => Date;
    seconds?: number;
  };
};

function getRequestTimestamp(createdAt: BookingRequest['createdAt']) {
  if (!createdAt) {
    return 0;
  }

  if (typeof createdAt.toDate === 'function') {
    return createdAt.toDate().getTime();
  }

  if (typeof createdAt.seconds === 'number') {
    return createdAt.seconds * 1000;
  }

  return 0;
}

function formatRequestDate(createdAt: BookingRequest['createdAt']) {
  const timestamp = getRequestTimestamp(createdAt);

  if (!timestamp) {
    return 'Just now';
  }

  return new Date(timestamp).toLocaleString();
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuthSession();
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!user?.uid) {
      setBookings([]);
      setLoading(false);
      setLoadError('');
      return;
    }

    setLoading(true);
    setLoadError('');

    const bookingsQuery = query(collection(db, 'bookings'), where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(
      bookingsQuery,
      (snapshot) => {
        const requests = snapshot.docs
          .map((docSnapshot) => {
            const data = docSnapshot.data() as Omit<BookingRequest, 'id'>;

            return {
              id: docSnapshot.id,
              ...data,
            };
          })
          .sort(
            (first, second) =>
              getRequestTimestamp(second.createdAt) - getRequestTimestamp(first.createdAt)
          );

        setBookings(requests);
        setLoading(false);
      },
      () => {
        setLoadError('Could not load booking insights right now.');
        setBookings([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const metrics = useMemo(() => {
    const pending = bookings.filter((request) => (request.status ?? 'Pending') === 'Pending').length;
    const accepted = bookings.filter((request) => request.status === 'Accepted').length;
    const rejected = bookings.filter((request) => request.status === 'Rejected').length;

    return {
      total: bookings.length,
      pending,
      accepted,
      rejected,
    };
  }, [bookings]);

  const recentRequests = useMemo(() => bookings.slice(0, 3), [bookings]);

  const latestRequest = bookings[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Track booking status, payment progress, and jump into key actions.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.actionRow}>
            <Pressable style={styles.primaryButton} onPress={() => router.push('/(tabs)/services')}>
              <Text style={styles.primaryButtonText}>Browse Services</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => router.push('/(tabs)/profile')}>
              <Text style={styles.secondaryButtonText}>My Profile</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.ghostButton}
            onPress={() =>
              router.push({
                pathname: '/booking',
                params: {
                  title: 'Consultation',
                  category: 'Consultation',
                  serviceType: 'Consultation',
                  price: '₹4,499',
                },
              })
            }>
            <Text style={styles.ghostButtonText}>Quick Book: Consultation</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Booking Overview</Text>

          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color={BrandTheme.colors.primary} />
              <Text style={styles.cardText}>Loading your booking insights...</Text>
            </View>
          ) : null}

          {!loading && loadError ? <Text style={styles.errorText}>{loadError}</Text> : null}

          {!loading && !loadError ? (
            <View style={styles.metricGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Total</Text>
                <Text style={styles.metricValue}>{metrics.total}</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Pending</Text>
                <Text style={styles.metricValue}>{metrics.pending}</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Accepted</Text>
                <Text style={styles.metricValue}>{metrics.accepted}</Text>
              </View>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Rejected</Text>
                <Text style={styles.metricValue}>{metrics.rejected}</Text>
              </View>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Latest Request</Text>

          {loading ? null : !latestRequest ? (
            <Text style={styles.cardText}>No requests yet. Book your first legal service to populate your dashboard.</Text>
          ) : (
            <View style={styles.latestRequestCard}>
              <Text style={styles.latestTitle}>{latestRequest.serviceType ?? latestRequest.category ?? 'Service request'}</Text>
              <Text style={styles.latestDate}>Requested on {formatRequestDate(latestRequest.createdAt)}</Text>
              <Text style={styles.latestMeta}>Status: {latestRequest.status ?? 'Pending'}</Text>
              <Text style={styles.latestMeta}>Payment: {latestRequest.paymentStatus ?? 'Not available'}</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Requests</Text>

          {loading ? null : recentRequests.length === 0 ? (
            <Text style={styles.cardText}>No recent requests available.</Text>
          ) : (
            recentRequests.map((request) => (
              <View key={request.id} style={styles.requestItem}>
                <View style={styles.requestTopRow}>
                  <Text style={styles.requestName}>{request.serviceType ?? request.category ?? 'Service request'}</Text>
                  <Text style={styles.requestStatus}>{request.status ?? 'Pending'}</Text>
                </View>
                <Text style={styles.requestMeta}>Price: {request.price ?? 'Not available'}</Text>
                <Text style={styles.requestMeta}>Requested on {formatRequestDate(request.createdAt)}</Text>
              </View>
            ))
          )}
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
  container: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 14,
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
    marginBottom: 2,
  },
  card: {
    borderRadius: BrandTheme.radius.xxl,
    borderWidth: 1,
    borderColor: BrandTheme.colors.outlineVariant,
    backgroundColor: BrandTheme.colors.surfaceLowest,
    padding: 16,
    gap: 10,
  },
  cardTitle: {
    color: BrandTheme.colors.onSurface,
    fontSize: 17,
    fontWeight: '700',
  },
  cardText: {
    color: BrandTheme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    borderRadius: BrandTheme.radius.xl,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: BrandTheme.colors.primary,
  },
  primaryButtonText: {
    color: BrandTheme.colors.onPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    borderRadius: BrandTheme.radius.xl,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BrandTheme.colors.outlineVariant,
  },
  secondaryButtonText: {
    color: BrandTheme.colors.onSurface,
    fontSize: 14,
    fontWeight: '600',
  },
  ghostButton: {
    borderRadius: BrandTheme.radius.xl,
    borderWidth: 1,
    borderColor: BrandTheme.colors.outlineVariant,
    alignItems: 'center',
    paddingVertical: 11,
    backgroundColor: BrandTheme.colors.surfaceContainerLow,
  },
  ghostButtonText: {
    color: BrandTheme.colors.onSurface,
    fontSize: 13,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricCard: {
    minWidth: '48%',
    flexGrow: 1,
    borderRadius: BrandTheme.radius.xl,
    borderWidth: 1,
    borderColor: BrandTheme.colors.outlineVariant,
    padding: 12,
    backgroundColor: BrandTheme.colors.surfaceContainerLow,
  },
  metricLabel: {
    color: BrandTheme.colors.onSurfaceVariant,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontWeight: '700',
  },
  metricValue: {
    marginTop: 4,
    color: BrandTheme.colors.onSurface,
    fontSize: 22,
    fontWeight: '800',
  },
  latestRequestCard: {
    borderRadius: BrandTheme.radius.xl,
    borderWidth: 1,
    borderColor: BrandTheme.colors.outlineVariant,
    backgroundColor: BrandTheme.colors.surfaceContainerLow,
    padding: 12,
    gap: 4,
  },
  latestTitle: {
    color: BrandTheme.colors.onSurface,
    fontSize: 15,
    fontWeight: '700',
  },
  latestDate: {
    color: BrandTheme.colors.onSurfaceVariant,
    fontSize: 12,
  },
  latestMeta: {
    color: BrandTheme.colors.onSurface,
    fontSize: 13,
  },
  requestItem: {
    borderRadius: BrandTheme.radius.xl,
    borderWidth: 1,
    borderColor: BrandTheme.colors.outlineVariant,
    backgroundColor: BrandTheme.colors.surfaceContainerLow,
    padding: 12,
    gap: 4,
  },
  requestTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  requestName: {
    flex: 1,
    color: BrandTheme.colors.onSurface,
    fontSize: 14,
    fontWeight: '700',
  },
  requestStatus: {
    color: BrandTheme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  requestMeta: {
    color: BrandTheme.colors.onSurfaceVariant,
    fontSize: 12,
  },
  errorText: {
    color: BrandTheme.colors.error,
    fontSize: 13,
  },
});
