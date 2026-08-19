import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAppData } from '../contexts/app-data';
import { useAuth } from '../contexts/auth';
import { uploadImage } from '../services/firebase-storage';

const isRemoteUrl = (uri: string) => /^https?:\/\//.test(uri);

export default function ProviderRegister() {
  const { user, profile, updateOwnProfile } = useAuth();
  const { categories, categoriesStatus, providers, createPendingProvider, updateProvider } =
    useAppData();
  const commerceProfile = profile && profile.role === 'commerce' ? profile : undefined;
  const [businessName, setBusinessName] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [phone, setPhone] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const businessNameValue = businessName || commerceProfile?.businessName || '';
  const serviceNameValue = serviceName || commerceProfile?.serviceName || '';
  const phoneValue = phone || commerceProfile?.phone || '';
  const [membershipState, setMembershipState] = useState<'loading' | 'active' | 'inactive'>('loading');

  useEffect(() => {
    if (!user) {
      return;
    }

    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    import('../services/firebase-memberships')
      .then(({ observeMembership }) => {
        unsubscribe = observeMembership(
          user.id,
          (membership) => {
            if (mounted) {
              setMembershipState(membership?.status === 'active' ? 'active' : 'inactive');
            }
          },
          () => {
            if (mounted) {
              setMembershipState('inactive');
            }
          },
        );
      })
      .catch(() => {
        if (mounted) {
          setMembershipState('inactive');
        }
      });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [user]);

  if (!user) {
    return (
      <Redirect
        href={{
          pathname: '/',
          params: { role: 'commerce', returnTo: '/provider-register' },
        }}
      />
    );
  }

  if (user.role !== 'commerce') {
    return <Redirect href="/home" />;
  }

  if (membershipState === 'loading') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.membershipLoading}>
          <ActivityIndicator size="large" color="#2F7353" />
          <Text style={styles.membershipLoadingText}>Cargando estado de tu membresía…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (membershipState !== 'active') {
    return <Redirect href="/inscribir" />;
  }

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Acceso requerido', 'Necesitamos acceso a tus fotos para cargar imágenes del servicio.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.82,
      allowsMultipleSelection: true,
      selectionLimit: 6,
    });

    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri).filter(Boolean) as string[];
      setImages((current) => [...current, ...uris].slice(0, 6));
    }
  };

  const submit = async () => {
    if (submitting) {
      return;
    }

    if (!businessNameValue.trim() || !serviceNameValue.trim() || !phoneValue.trim()) {
      Alert.alert('Faltan datos', 'Completa nombre, servicio y telefono.');
      return;
    }

    if (!categoryId || !subcategoryId) {
      Alert.alert('Faltan datos', 'Elige un rubro y un servicio de la lista.');
      return;
    }

    setSubmitting(true);

    try {
      const resolvedImages = await Promise.all(
        images.map((uri) =>
          isRemoteUrl(uri) ? Promise.resolve(uri) : uploadImage(uri, 'provider-images'),
        ),
      );
      const payload = {
        name: businessNameValue.trim(),
        service: serviceNameValue.trim(),
        phone: phoneValue.trim(),
        images: resolvedImages,
        categoryId,
        subcategoryId,
      };
      const existing = providers.find((provider) => provider.ownerId === user.id);

      if (existing) {
        await updateProvider(existing.id, payload);
      } else {
        await createPendingProvider({ ...payload, ownerId: user.id });
      }

      await updateOwnProfile({
        businessName: businessNameValue.trim(),
        serviceName: serviceNameValue.trim(),
        phone: phoneValue.trim(),
      });
      setSubmitted(true);
    } catch (error) {
      Alert.alert(
        'No se pudo enviar',
        error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const status = commerceProfile?.status;
  const statusTitle =
    status === 'ACTIVE_COMMERCE' ? 'Membresía activa' : 'Esperando aprobación municipal';
  const statusText =
    status === 'ACTIVE_COMMERCE'
      ? 'Tu ficha está lista para ser publicada en el directorio público.'
      : 'Tu ficha se publicará cuando administración la apruebe.';
  const permissionValue =
    status === 'ACTIVE_COMMERCE' ? 'Validado' : status === 'PENDING_MUNICIPAL_APPROVAL' ? 'Pendiente' : 'Por definir';
  const selectedCategory = categories.find((category) => category.id === categoryId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.topbar}>
          <Pressable onPress={() => router.replace('/home')} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={22} color="#2F7353" />
          </Pressable>
          <Text style={styles.barTitle}>Presencia digital</Text>
          <Pressable onPress={() => router.replace('/home')} style={styles.iconButton}>
            <Ionicons name="home-outline" size={21} color="#1D5F4A" />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>MEMBRESÍA</Text>
          <Text style={styles.title}>{commerceProfile?.businessName || 'Inscribir comercio o servicio'}</Text>
          <Text style={styles.subtitle}>
            Administra tu presencia digital y revisa el estado de tu plan.
          </Text>
        </View>

        {commerceProfile && (
          <View style={styles.statusStrip}>
            <View style={styles.statusDot} />
            <View style={styles.statusCopy}>
              <Text style={styles.statusStripTitle}>{statusTitle}</Text>
              <Text style={styles.statusStripText}>{statusText}</Text>
            </View>
          </View>
        )}

        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Ionicons name="document-text-outline" size={18} color="#1D5F4A" />
            <Text style={styles.summaryLabel}>Membresía</Text>
            <Text style={styles.summaryValue}>{permissionValue}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="card-outline" size={18} color="#1D5F4A" />
            <Text style={styles.summaryLabel}>Pago</Text>
            <Text style={styles.summaryValue}>Membresía activa</Text>
          </View>
        </View>

        {submitted ? (
          <View style={styles.statusCard}>
            <View style={styles.statusIcon}>
              <Ionicons name="time-outline" size={25} color="#8A5A37" />
            </View>
            <Text style={styles.statusTitle}>Solicitud enviada</Text>
            <Text style={styles.statusText}>
              {statusTitle}. Tu ficha no sera visible publicamente hasta la activacion.
            </Text>
            <Pressable onPress={() => router.replace('/home')} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Volver al inicio</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Datos iniciales</Text>
            <Text style={styles.sectionText}>
              Estos datos preparan la ficha que revisará administración antes de publicarla.
            </Text>
            <TextInput
              value={businessNameValue}
              onChangeText={setBusinessName}
              placeholder="Nombre del negocio o prestador"
              placeholderTextColor="#8A9288"
              style={styles.input}
            />
            <TextInput
              value={serviceNameValue}
              onChangeText={setServiceName}
              placeholder="Servicio principal"
              placeholderTextColor="#8A9288"
              style={styles.input}
            />
            <TextInput
              value={phoneValue}
              onChangeText={setPhone}
              placeholder="Telefono o WhatsApp"
              placeholderTextColor="#8A9288"
              keyboardType="phone-pad"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>Rubro (categoría)</Text>
            {categoriesStatus === 'loading' ? (
              <Text style={styles.hintText}>Cargando rubros…</Text>
            ) : categoriesStatus === 'error' || categories.length === 0 ? (
              <Text style={styles.hintText}>
                Aún no hay rubros disponibles. Intenta más tarde.
              </Text>
            ) : (
              <View style={styles.chipRow}>
                {categories.map((category) => (
                  <OptionChip
                    key={category.id}
                    label={category.name}
                    active={categoryId === category.id}
                    onPress={() => {
                      setCategoryId(category.id);
                      setSubcategoryId('');
                    }}
                  />
                ))}
              </View>
            )}

            {!!selectedCategory && (
              <>
                <Text style={styles.fieldLabel}>Servicio dentro del rubro</Text>
                <View style={styles.chipRow}>
                  {selectedCategory.subcategories.map((subcategory) => (
                    <OptionChip
                      key={subcategory.id}
                      label={subcategory.name}
                      active={subcategoryId === subcategory.id}
                      onPress={() => setSubcategoryId(subcategory.id)}
                    />
                  ))}
                </View>
              </>
            )}

            <Text style={styles.fieldLabel}>Fotos del servicio</Text>
            <View style={styles.imageGrid}>
              {images.map((uri, index) => (
                <View key={`${uri}-${index}`} style={styles.imageTile}>
                  <Image source={{ uri }} style={styles.imageTileImage} contentFit="cover" />
                  <Pressable
                    onPress={() => setImages((current) => current.filter((_, i) => i !== index))}
                    style={styles.imageRemove}
                  >
                    <Ionicons name="close" size={15} color="#FFFFFF" />
                  </Pressable>
                </View>
              ))}
            </View>
            <Pressable onPress={pickImages} style={styles.imageButton}>
              <Ionicons name="images-outline" size={17} color="#1D5F4A" />
              <Text style={styles.imageButtonText}>Elegir fotos de la galería</Text>
            </Pressable>

            <View style={styles.notice}>
              <Ionicons name="information-circle-outline" size={19} color="#1D5F4A" />
              <Text style={styles.noticeText}>
                Después de enviar, administración revisará tu ficha y la publicará en el directorio.
              </Text>
            </View>
            <Pressable onPress={submit} disabled={submitting} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>
                {submitting ? 'Enviando…' : 'Enviar a revisión'}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function OptionChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.optionChip, active && styles.optionChipActive]}
    >
      <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#EAF3F0' },
  content: {
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    padding: 16,
    paddingBottom: 40,
  },
  membershipLoading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  membershipLoadingText: { color: '#718078', fontSize: 13, fontWeight: '500' },
  topbar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5E0DA',
  },
  barTitle: { color: '#2F7353', fontSize: 16, fontWeight: '700' },
  hero: {
    marginTop: 10,
    padding: 23,
    borderRadius: 24,
    backgroundColor: '#1D5F4A',
  },
  eyebrow: {
    color: '#D8E7DD',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  title: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 29,
    lineHeight: 35,
    fontWeight: '700',
  },
  subtitle: { marginTop: 7, color: '#EEF5EE', fontSize: 13, lineHeight: 20 },
  statusStrip: {
    minHeight: 78,
    marginTop: 13,
    padding: 13,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FBF3EC',
    borderWidth: 1,
    borderColor: '#F0DFD0',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#BF6842',
  },
  statusCopy: { flex: 1, marginLeft: 11 },
  statusStripTitle: { color: '#8A5A37', fontSize: 13, fontWeight: '700' },
  statusStripText: { marginTop: 4, color: '#6D5A3B', fontSize: 11, lineHeight: 16 },
  summaryGrid: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
  },
  summaryItem: {
    flex: 1,
    minHeight: 86,
    padding: 13,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5E0DA',
  },
  summaryLabel: { marginTop: 8, color: '#7A827A', fontSize: 10, fontWeight: '700' },
  summaryValue: { marginTop: 3, color: '#2F7353', fontSize: 13, fontWeight: '700' },
  form: {
    marginTop: 13,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5E0DA',
  },
  sectionTitle: { color: '#2F7353', fontSize: 18, fontWeight: '700' },
  sectionText: { marginTop: 5, color: '#7A827A', fontSize: 12, lineHeight: 18 },
  input: {
    minHeight: 54,
    marginTop: 12,
    paddingHorizontal: 15,
    borderRadius: 16,
    color: '#34443D',
    backgroundColor: '#F7FAF9',
    borderWidth: 1,
    borderColor: '#D5E0DA',
    fontSize: 14,
  },
  fieldLabel: {
    marginTop: 15,
    marginBottom: 7,
    color: '#68736B',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  optionChip: {
    minHeight: 32,
    paddingHorizontal: 11,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7FAF9',
    borderWidth: 1,
    borderColor: '#D5E0DA',
  },
  optionChipActive: { backgroundColor: '#1D5F4A', borderColor: '#1D5F4A' },
  optionChipText: { color: '#68736B', fontSize: 11, fontWeight: '600' },
  optionChipTextActive: { color: '#FFFFFF' },
  hintText: { marginTop: 6, color: '#8A9288', fontSize: 12 },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  imageTile: {
    width: 82,
    height: 64,
    borderRadius: 13,
    overflow: 'hidden',
    backgroundColor: '#D5E0DA',
  },
  imageTileImage: { width: '100%', height: '100%' },
  imageRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(24,54,83,0.72)',
  },
  imageButton: {
    minHeight: 44,
    marginTop: 10,
    paddingHorizontal: 12,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#DDECE4',
  },
  imageButtonText: { color: '#1D5F4A', fontSize: 12, fontWeight: '700' },
  notice: {
    marginTop: 13,
    padding: 13,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 9,
    backgroundColor: '#DDECE4',
  },
  noticeText: { flex: 1, color: '#33506A', fontSize: 12, lineHeight: 17 },
  primaryButton: {
    height: 54,
    marginTop: 15,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1D5F4A',
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  statusCard: {
    marginTop: 13,
    padding: 20,
    borderRadius: 22,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5E0DA',
  },
  statusIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFE6D6',
  },
  statusTitle: { marginTop: 14, color: '#2F7353', fontSize: 20, fontWeight: '700' },
  statusText: {
    marginTop: 8,
    color: '#68736B',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  secondaryButton: {
    minHeight: 48,
    marginTop: 16,
    paddingHorizontal: 16,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DDECE4',
  },
  secondaryButtonText: { color: '#1D5F4A', fontSize: 13, fontWeight: '700' },
});
