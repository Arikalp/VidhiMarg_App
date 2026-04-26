import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

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

type ProfileDetails = {
  fullName: string;
  contactNumber: string;
  email: string;
  homeAddress: string;
  profileImage: string;
};

const FALLBACK_PROFILE_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDL1njdGrcNm95dV5tDJ1saYXMJVCJpG_R8lrMYYPRmSASUIURJIPMFj4aeU3Cau4IpDULSROm_5spN0JRovf9SOd3G9ctBuqGZi7X6PWid9OBy2QVk5exkgBPHJSOCM_TnyK1vqmmVWcDHWYJyNfp47n69AcYo3B8dgAmwDJ0Wf-wsSNtU5pdaMMlOW1rBdgfvB91swQ50Pja0uxBt6iyyH0nQdUN1luy0swo52sHFp5AAsWxXtOJKChNZGYozC3cMDpRi_VnvKhY';

const EMPTY_PROFILE: ProfileDetails = {
  fullName: '',
  contactNumber: '',
  email: '',
  homeAddress: '',
  profileImage: FALLBACK_PROFILE_IMAGE,
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

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthSession();
  const [loggingOut, setLoggingOut] = useState(false);
  const [profileDetails, setProfileDetails] = useState<ProfileDetails>(EMPTY_PROFILE);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [isRequestsLoading, setIsRequestsLoading] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [loadMessage, setLoadMessage] = useState('');

  const resolvedName = useMemo(() => {
    if (profileDetails.fullName.trim()) {
      return profileDetails.fullName;
    }

    return user?.displayName?.trim() || 'Your Name';
  }, [profileDetails.fullName, user?.displayName]);

  useEffect(() => {
    let isMounted = true;

    const loadProfileAndRequests = async () => {
      if (!user?.uid) {
        if (isMounted) {
          setProfileDetails(EMPTY_PROFILE);
          setBookingRequests([]);
          setIsProfileLoading(false);
          setIsRequestsLoading(false);
          setLoadMessage('');
          setRequestMessage('');
        }
        return;
      }

      setLoadMessage('');
      setRequestMessage('');
      setIsProfileLoading(true);
      setIsRequestsLoading(true);

      const fallbackProfile: ProfileDetails = {
        fullName: user.displayName ?? '',
        contactNumber: user.phoneNumber ?? '',
        email: user.email ?? '',
        homeAddress: '',
        profileImage: user.photoURL ?? FALLBACK_PROFILE_IMAGE,
      };

      try {
        const profileSnapshot = await getDoc(doc(db, 'users', user.uid));

        if (!isMounted) {
          return;
        }

        if (profileSnapshot.exists()) {
          const data = profileSnapshot.data() as Partial<ProfileDetails>;

          setProfileDetails({
            fullName: data.fullName ?? fallbackProfile.fullName,
            contactNumber: data.contactNumber ?? fallbackProfile.contactNumber,
            email: data.email ?? fallbackProfile.email,
            homeAddress: data.homeAddress ?? fallbackProfile.homeAddress,
            profileImage: data.profileImage ?? fallbackProfile.profileImage,
          });
        } else {
          setProfileDetails(fallbackProfile);
        }
      } catch {
        if (isMounted) {
          setProfileDetails(fallbackProfile);
          setLoadMessage('Could not fetch saved profile details.');
        }
      } finally {
        if (isMounted) {
          setIsProfileLoading(false);
        }
      }

      try {
        const requestsSnapshot = await getDocs(query(collection(db, 'bookings'), where('userId', '==', user.uid)));

        if (!isMounted) {
          return;
        }

        const requests = requestsSnapshot.docs
          .map((snapshot) => {
            const data = snapshot.data() as Omit<BookingRequest, 'id'>;

            return {
              id: snapshot.id,
              ...data,
            };
          })
          .sort(
            (first, second) =>
              getRequestTimestamp(second.createdAt) - getRequestTimestamp(first.createdAt)
          );

        setBookingRequests(requests);
      } catch {
        if (isMounted) {
          setRequestMessage('Could not fetch your service requests right now.');
          setBookingRequests([]);
        }
      } finally {
        if (isMounted) {
          setIsRequestsLoading(false);
        }
      }
    };

    void loadProfileAndRequests();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await logout();
      router.replace('/(auth)/login');
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your details and review your service requests.</Text>

        <View style={styles.profileHeroCard}>
          <Image source={{ uri: profileDetails.profileImage }} style={styles.profileImage} />

          <View style={styles.profileIdentityBlock}>
            <Text style={styles.profileName}>{resolvedName}</Text>
            <Text style={styles.profileEmail}>{profileDetails.email || user?.email || 'No email available'}</Text>
          </View>

          <View style={styles.heroActionRow}>
            <Pressable style={styles.primaryButton} onPress={() => router.push('/edit-profile')}>
              <Text style={styles.primaryButtonText}>Edit profile</Text>
            </Pressable>

            <Pressable style={styles.secondaryButton} onPress={handleLogout} disabled={loggingOut}>
              <Text style={styles.secondaryButtonText}>{loggingOut ? 'Logging out...' : 'Logout'}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Saved Details</Text>
          <Text style={styles.detailRow}>Full name: {isProfileLoading ? 'Loading...' : profileDetails.fullName || 'Not provided'}</Text>
          <Text style={styles.detailRow}>Contact number: {isProfileLoading ? 'Loading...' : profileDetails.contactNumber || 'Not provided'}</Text>
          <Text style={styles.detailRow}>Email: {isProfileLoading ? 'Loading...' : profileDetails.email || 'Not provided'}</Text>
          <Text style={styles.detailRow}>Home address: {isProfileLoading ? 'Loading...' : profileDetails.homeAddress || 'Not provided'}</Text>
          {loadMessage ? <Text style={styles.errorText}>{loadMessage}</Text> : null}
        </View>

        <View style={styles.requestsCard}>
          <Text style={styles.sectionTitle}>My Service Requests</Text>

          {isRequestsLoading ? <Text style={styles.requestSubtle}>Loading your requests...</Text> : null}
          {!isRequestsLoading && requestMessage ? <Text style={styles.errorText}>{requestMessage}</Text> : null}
          {!isRequestsLoading && !requestMessage && bookingRequests.length === 0 ? (
            <Text style={styles.requestSubtle}>You have not made any service requests yet.</Text>
          ) : null}

          {!isRequestsLoading && bookingRequests.length > 0
            ? bookingRequests.map((request) => {
                const serviceType = request.serviceType ?? request.category ?? 'Service request';
                const requestStatus = request.status ?? 'Pending';

                return (
                  <View key={request.id} style={styles.requestItem}>
                    <View style={styles.requestTopRow}>
                      <View style={styles.requestHeadingBlock}>
                        <Text style={styles.requestTitle}>{serviceType}</Text>
                        <Text style={styles.requestDate}>Requested on {formatRequestDate(request.createdAt)}</Text>
                      </View>
                      <View
                        style={[
                          styles.statusPill,
                          requestStatus === 'Accepted'
                            ? styles.statusAccepted
                            : requestStatus === 'Rejected'
                            ? styles.statusRejected
                            : styles.statusPending,
                        ]}>
                        <Text
                          style={[
                            styles.statusText,
                            requestStatus === 'Accepted'
                              ? styles.statusTextAccepted
                              : requestStatus === 'Rejected'
                              ? styles.statusTextRejected
                              : styles.statusTextPending,
                          ]}>
                          {requestStatus}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.requestMetaGrid}>
                      <View style={styles.requestMetaCell}>
                        <Text style={styles.requestMetaLabel}>Price</Text>
                        <Text style={styles.requestMetaValue}>{request.price ?? 'Not available'}</Text>
                      </View>
                      <View style={styles.requestMetaCell}>
                        <Text style={styles.requestMetaLabel}>Payment Method</Text>
                        <Text style={styles.requestMetaValue}>{request.paymentMethod ?? 'Not available'}</Text>
                      </View>
                      <View style={styles.requestMetaCell}>
                        <Text style={styles.requestMetaLabel}>Payment Status</Text>
                        <Text style={styles.requestMetaValue}>{request.paymentStatus ?? 'Not available'}</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            : null}
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
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 2,
  },
  profileHeroCard: {
    borderRadius: BrandTheme.radius.xxl,
    borderWidth: 1,
    borderColor: BrandTheme.colors.outlineVariant,
    backgroundColor: BrandTheme.colors.surfaceLowest,
    padding: 16,
    gap: 12,
  },
  profileImage: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: BrandTheme.colors.surfaceContainer,
  },
  profileIdentityBlock: {
    gap: 3,
  },
  profileName: {
    color: BrandTheme.colors.onSurface,
    fontSize: 22,
    fontWeight: '800',
  },
  profileEmail: {
    color: BrandTheme.colors.onSurfaceVariant,
    fontSize: 14,
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: BrandTheme.colors.primary,
    borderRadius: BrandTheme.radius.xl,
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
    borderWidth: 1,
    borderColor: BrandTheme.colors.outlineVariant,
    borderRadius: BrandTheme.radius.xl,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: BrandTheme.colors.onSurface,
    fontSize: 14,
    fontWeight: '600',
  },
  detailsCard: {
    borderRadius: BrandTheme.radius.xxl,
    borderWidth: 1,
    borderColor: BrandTheme.colors.outlineVariant,
    backgroundColor: BrandTheme.colors.surfaceLowest,
    padding: 16,
    gap: 8,
  },
  requestsCard: {
    borderRadius: BrandTheme.radius.xxl,
    borderWidth: 1,
    borderColor: BrandTheme.colors.outlineVariant,
    backgroundColor: BrandTheme.colors.surfaceLowest,
    padding: 16,
    gap: 10,
  },
  sectionTitle: {
    color: BrandTheme.colors.onSurface,
    fontSize: 17,
    fontWeight: '700',
  },
  detailRow: {
    color: BrandTheme.colors.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 20,
  },
  requestSubtle: {
    color: BrandTheme.colors.onSurfaceVariant,
    fontSize: 13,
    lineHeight: 19,
  },
  requestItem: {
    borderRadius: BrandTheme.radius.xl,
    borderWidth: 1,
    borderColor: BrandTheme.colors.outlineVariant,
    backgroundColor: BrandTheme.colors.surfaceContainerLow,
    padding: 12,
    gap: 10,
  },
  requestTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  requestHeadingBlock: {
    flex: 1,
    gap: 4,
  },
  requestTitle: {
    color: BrandTheme.colors.onSurface,
    fontSize: 15,
    fontWeight: '700',
  },
  requestDate: {
    color: BrandTheme.colors.onSurfaceVariant,
    fontSize: 12,
  },
  statusPill: {
    borderRadius: BrandTheme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusPending: {
    backgroundColor: '#fef3c7',
  },
  statusAccepted: {
    backgroundColor: '#dcfce7',
  },
  statusRejected: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextPending: {
    color: '#854d0e',
  },
  statusTextAccepted: {
    color: '#166534',
  },
  statusTextRejected: {
    color: '#991b1b',
  },
  requestMetaGrid: {
    gap: 10,
  },
  requestMetaCell: {
    gap: 2,
  },
  requestMetaLabel: {
    color: BrandTheme.colors.onSurfaceVariant,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontWeight: '700',
  },
  requestMetaValue: {
    color: BrandTheme.colors.onSurface,
    fontSize: 13,
    fontWeight: '600',
  },
  errorText: {
    color: BrandTheme.colors.error,
    fontSize: 13,
  },
});
