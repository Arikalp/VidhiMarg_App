import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

import { BrandTheme } from '@/constants/theme';
import { useAuthSession } from '@/hooks/use-auth-session';
import { auth, db } from '@/lib/firebase';

const FALLBACK_PROFILE_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDL1njdGrcNm95dV5tDJ1saYXMJVCJpG_R8lrMYYPRmSASUIURJIPMFj4aeU3Cau4IpDULSROm_5spN0JRovf9SOd3G9ctBuqGZi7X6PWid9OBy2QVk5exkgBPHJSOCM_TnyK1vqmmVWcDHWYJyNfp47n69AcYo3B8dgAmwDJ0Wf-wsSNtU5pdaMMlOW1rBdgfvB91swQ50Pja0uxBt6iyyH0nQdUN1luy0swo52sHFp5AAsWxXtOJKChNZGYozC3cMDpRi_VnvKhY';

type EditableProfile = {
  fullName: string;
  contactNumber: string;
  email: string;
  homeAddress: string;
  profileImage: string;
};

export default function EditProfileScreen() {
  const router = useRouter();
  const { user } = useAuthSession();
  const [formData, setFormData] = useState<EditableProfile>({
    fullName: '',
    contactNumber: '',
    email: '',
    homeAddress: '',
    profileImage: FALLBACK_PROFILE_IMAGE,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!user?.uid) {
        if (isMounted) {
          setIsLoading(false);
        }
        router.replace('/(auth)/login');
        return;
      }

      setIsLoading(true);
      setMessage('');

      const fallbackProfile: EditableProfile = {
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

        if (!profileSnapshot.exists()) {
          setFormData(fallbackProfile);
          return;
        }

        const data = profileSnapshot.data() as Partial<EditableProfile>;

        setFormData({
          fullName: data.fullName ?? fallbackProfile.fullName,
          contactNumber: data.contactNumber ?? fallbackProfile.contactNumber,
          email: data.email ?? fallbackProfile.email,
          homeAddress: data.homeAddress ?? fallbackProfile.homeAddress,
          profileImage: data.profileImage ?? fallbackProfile.profileImage,
        });
      } catch {
        if (isMounted) {
          setFormData(fallbackProfile);
          setMessage('Could not fetch saved profile details.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [router, user]);

  const handleChange = (field: keyof EditableProfile, value: string) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!user?.uid) {
      router.replace('/(auth)/login');
      return;
    }

    setMessage('');
    setIsSaving(true);

    try {
      // Keep profile payload aligned with website profile document behavior.
      await setDoc(doc(db, 'users', user.uid), {
        fullName: formData.fullName,
        contactNumber: formData.contactNumber,
        email: formData.email,
        homeAddress: formData.homeAddress,
        profileImage: formData.profileImage,
        updatedAt: serverTimestamp(),
      });

      if (auth.currentUser && formData.fullName.trim()) {
        await updateProfile(auth.currentUser, {
          displayName: formData.fullName.trim(),
        });
      }

      router.replace('/(tabs)/profile');
    } catch {
      setMessage('Unable to save details right now. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Edit Profile</Text>
        <Text style={styles.subtitle}>Update your saved details used for checkout and service communication.</Text>

        <TextInput
          value={formData.fullName}
          onChangeText={(value) => handleChange('fullName', value)}
          placeholder="Full name"
          placeholderTextColor={BrandTheme.colors.onSurfaceVariant}
          style={styles.input}
          editable={!isLoading && !isSaving}
        />

        <TextInput
          value={formData.contactNumber}
          onChangeText={(value) => handleChange('contactNumber', value)}
          placeholder="Contact number"
          placeholderTextColor={BrandTheme.colors.onSurfaceVariant}
          keyboardType="phone-pad"
          style={styles.input}
          editable={!isLoading && !isSaving}
        />

        <TextInput
          value={formData.email}
          onChangeText={(value) => handleChange('email', value)}
          placeholder="Email"
          placeholderTextColor={BrandTheme.colors.onSurfaceVariant}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          editable={!isLoading && !isSaving}
        />

        <TextInput
          value={formData.homeAddress}
          onChangeText={(value) => handleChange('homeAddress', value)}
          placeholder="Home address"
          placeholderTextColor={BrandTheme.colors.onSurfaceVariant}
          style={styles.input}
          editable={!isLoading && !isSaving}
        />

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <Pressable style={styles.button} onPress={handleSave} disabled={isLoading || isSaving}>
          <Text style={styles.buttonText}>
            {isLoading ? 'Loading profile...' : isSaving ? 'Saving...' : 'Save Changes'}
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.replace('/(tabs)/profile')}
          disabled={isSaving}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
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
  message: {
    color: BrandTheme.colors.error,
    fontSize: 13,
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
  secondaryButton: {
    borderWidth: 1,
    borderColor: BrandTheme.colors.outlineVariant,
    borderRadius: BrandTheme.radius.xl,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: BrandTheme.colors.onSurface,
    fontSize: 15,
    fontWeight: '600',
  },
});
