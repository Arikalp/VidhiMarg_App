import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addDoc, collection, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { BrandTheme } from '@/constants/theme';
import { useAuthSession } from '@/hooks/use-auth-session';
import { db } from '@/lib/firebase';

type PaymentMethod = 'Pay via UPI' | 'Pay After In-Person Meeting';

type ProfileDetails = {
  fullName: string;
  email: string;
  contactNumber: string;
  homeAddress: string;
};

const EMPTY_PROFILE: ProfileDetails = {
  fullName: '',
  email: '',
  contactNumber: '',
  homeAddress: '',
};

export default function BookingScreen() {
  const router = useRouter();
  const { user } = useAuthSession();
  const params = useLocalSearchParams<{
    id?: string | string[];
    title?: string | string[];
    price?: string | string[];
    category?: string | string[];
    serviceType?: string | string[];
  }>();

  const [profileDetails, setProfileDetails] = useState<ProfileDetails>(EMPTY_PROFILE);
  const [profileLoading, setProfileLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Pay via UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const selectedService = useMemo(() => {
    const normalize = (value: string | string[] | undefined) =>
      Array.isArray(value) ? value[0] : value;

    const title = normalize(params.title)?.trim() || 'Consultation';
    const price = normalize(params.price)?.trim() || '₹0';
    const category = normalize(params.category)?.trim() || title;
    const serviceType = normalize(params.serviceType)?.trim() || title;

    return { title, price, category, serviceType };
  }, [params.category, params.price, params.serviceType, params.title]);

  const loadProfile = useCallback(async (showLoader: boolean) => {
    if (!user?.uid) {
      setProfileDetails(EMPTY_PROFILE);
      setProfileMessage('');
      if (showLoader) {
        setProfileLoading(false);
      }
      return;
    }

    if (showLoader) {
      setProfileLoading(true);
    }
    setProfileMessage('');

    const fallbackProfile: ProfileDetails = {
      fullName: user.displayName ?? '',
      email: user.email ?? '',
      contactNumber: user.phoneNumber ?? '',
      homeAddress: '',
    };

    try {
      const snapshot = await getDoc(doc(db, 'users', user.uid));

      if (!snapshot.exists()) {
        setProfileDetails(fallbackProfile);
        return;
      }

      const data = snapshot.data() as Partial<ProfileDetails>;

      setProfileDetails({
        fullName: data.fullName ?? fallbackProfile.fullName,
        email: data.email ?? fallbackProfile.email,
        contactNumber: data.contactNumber ?? fallbackProfile.contactNumber,
        homeAddress: data.homeAddress ?? fallbackProfile.homeAddress,
      });
    } catch {
      setProfileDetails(fallbackProfile);
      setProfileMessage('Unable to refresh profile details. Pull to retry.');
    } finally {
      if (showLoader) {
        setProfileLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    void loadProfile(true);
  }, [loadProfile]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfile(false);
    setRefreshing(false);
  };

  const handleConfirmBooking = async () => {
    if (!user?.uid) {
      router.replace('/(auth)/login');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'bookings'), {
        userId: user.uid,
        name: profileDetails.fullName.trim() || user.displayName || '',
        email: profileDetails.email.trim() || user.email || '',
        phone: profileDetails.contactNumber.trim() || user.phoneNumber || '',
        location: profileDetails.homeAddress.trim(),
        category: selectedService.category,
        serviceType: selectedService.serviceType,
        price: selectedService.price,
        paymentMethod,
        paymentStatus: paymentMethod === 'Pay via UPI' ? 'Pending UPI Payment' : 'Pay After Meeting',
        status: 'Pending',
        createdAt: serverTimestamp(),
      });

      router.replace('/(tabs)/profile');
    } catch {
      setErrorMessage('Unable to place your booking right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={BrandTheme.colors.primary}
          />
        }>
        <Text style={styles.title}>Checkout</Text>
        <Text style={styles.subtitle}>Confirm your service and payment method before submitting.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Selected service</Text>
          <Text style={styles.serviceName}>{selectedService.title}</Text>
          <View style={styles.serviceMetaRow}>
            <Text style={styles.serviceMetaLabel}>Category</Text>
            <Text style={styles.serviceMetaValue}>{selectedService.category}</Text>
          </View>
          <View style={styles.serviceMetaRow}>
            <Text style={styles.serviceMetaLabel}>Service type</Text>
            <Text style={styles.serviceMetaValue}>{selectedService.serviceType}</Text>
          </View>
          <View style={styles.serviceMetaRow}>
            <Text style={styles.serviceMetaLabel}>Price</Text>
            <Text style={styles.price}>{selectedService.price}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment method</Text>

          <Pressable
            style={[styles.paymentOption, paymentMethod === 'Pay via UPI' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('Pay via UPI')}>
            <Text style={styles.paymentTitle}>Pay via UPI</Text>
            <Text style={styles.paymentText}>Instant confirmation using UPI apps.</Text>
          </Pressable>

          <Pressable
            style={[
              styles.paymentOption,
              paymentMethod === 'Pay After In-Person Meeting' && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentMethod('Pay After In-Person Meeting')}>
            <Text style={styles.paymentTitle}>Pay After In-Person Meeting</Text>
            <Text style={styles.paymentText}>Reserve now, complete payment after consultation.</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Saved profile snapshot</Text>
          <Text style={styles.profileRow}>Name: {profileLoading ? 'Loading...' : profileDetails.fullName || 'Not provided'}</Text>
          <Text style={styles.profileRow}>Email: {profileLoading ? 'Loading...' : profileDetails.email || 'Not provided'}</Text>
          <Text style={styles.profileRow}>Phone: {profileLoading ? 'Loading...' : profileDetails.contactNumber || 'Not provided'}</Text>
          <Text style={styles.profileRow}>Address: {profileLoading ? 'Loading...' : profileDetails.homeAddress || 'Not provided'}</Text>

          {profileMessage ? <Text style={styles.profileMessage}>{profileMessage}</Text> : null}

          <Pressable style={styles.linkButton} onPress={() => router.push('/edit-profile')}>
            <Text style={styles.linkButtonText}>Edit profile details</Text>
          </Pressable>
        </View>

        <Pressable
          style={[styles.confirmButton, (isSubmitting || profileLoading) && styles.confirmButtonDisabled]}
          onPress={handleConfirmBooking}
          disabled={isSubmitting || profileLoading}>
          <Text style={styles.confirmButtonText}>
            {isSubmitting ? 'Placing your request...' : `Confirm & Book ${selectedService.title}`}
          </Text>
        </Pressable>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 12,
  },
  title: {
    color: BrandTheme.colors.onSurface,
    fontSize: 30,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 4,
    fontSize: 14,
    lineHeight: 20,
    color: BrandTheme.colors.onSurfaceVariant,
  },
  card: {
    borderRadius: BrandTheme.radius.xxl,
    borderWidth: 1,
    borderColor: BrandTheme.colors.outlineVariant,
    backgroundColor: BrandTheme.colors.surfaceLowest,
    padding: 16,
    gap: 8,
  },
  cardTitle: {
    color: BrandTheme.colors.onSurface,
    fontSize: 16,
    fontWeight: '700',
  },
  serviceName: {
    color: BrandTheme.colors.onSurface,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 2,
  },
  serviceMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  serviceMetaLabel: {
    color: BrandTheme.colors.onSurfaceVariant,
    fontSize: 13,
  },
  serviceMetaValue: {
    color: BrandTheme.colors.onSurface,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
  },
  price: {
    color: BrandTheme.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  paymentOption: {
    borderWidth: 1,
    borderColor: BrandTheme.colors.outlineVariant,
    borderRadius: BrandTheme.radius.xl,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  paymentOptionActive: {
    borderColor: BrandTheme.colors.primary,
    backgroundColor: BrandTheme.colors.surfaceContainerLow,
  },
  paymentTitle: {
    color: BrandTheme.colors.onSurface,
    fontSize: 14,
    fontWeight: '700',
  },
  paymentText: {
    color: BrandTheme.colors.onSurfaceVariant,
    fontSize: 12,
    lineHeight: 18,
  },
  profileRow: {
    color: BrandTheme.colors.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 19,
  },
  profileMessage: {
    color: BrandTheme.colors.error,
    fontSize: 12,
    lineHeight: 18,
  },
  linkButton: {
    marginTop: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: BrandTheme.colors.outlineVariant,
    borderRadius: BrandTheme.radius.pill,
  },
  linkButtonText: {
    color: BrandTheme.colors.onSurface,
    fontSize: 12,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: BrandTheme.colors.primary,
    borderRadius: BrandTheme.radius.xl,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: BrandTheme.colors.onPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    color: BrandTheme.colors.error,
    fontSize: 13,
    textAlign: 'center',
  },
});
