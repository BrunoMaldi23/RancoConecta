import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { Alert, Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { useAppData } from '../../contexts/app-data';
import { useAuth } from '../../contexts/auth';
import { safeGoBack } from '../../lib/navigation';

export default function ProviderProfile() {
  const { providerId } = useLocalSearchParams<{ providerId?: string }>();
  const { width } = useWindowDimensions();
  const { getProvider, isFavorite, providersStatus, rateProvider, toggleFavorite } = useAppData();
  const { user } = useAuth();
  const provider = getProvider(String(providerId || ''));
  const [warRating, setWarRating] = useState(5);
  const isFavoriteId = provider ? isFavorite(provider.id) : false;
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  if (providersStatus === 'loading') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.bar}>
            <Pressable onPress={() => safeGoBack('/home')} style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={23} color="#2F7353" />
            </Pressable>
            <Text style={styles.barTitle}>Perfil del prestador</Text>
            <Pressable onPress={() => router.replace('/home')} style={styles.iconBtn}>
              <Ionicons name="home-outline" size={21} color="#1D5F4A" />
            </Pressable>
          </View>
          <View style={styles.notFound}>
            <Text style={styles.notFoundText}>Cargando perfil…</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!provider) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.bar}>
            <Pressable onPress={() => safeGoBack('/home')} style={styles.iconBtn}>
              <Ionicons name="arrow-back" size={23} color="#2F7353" />
            </Pressable>
            <Text style={styles.barTitle}>Perfil del prestador</Text>
            <Pressable onPress={() => router.replace('/home')} style={styles.iconBtn}>
              <Ionicons name="home-outline" size={21} color="#1D5F4A" />
            </Pressable>
          </View>
          <View style={styles.notFound}>
            <Ionicons name="alert-circle-outline" size={42} color="#9AA59F" />
            <Text style={styles.notFoundTitle}>Prestador no encontrado</Text>
            <Text style={styles.notFoundText}>
              El perfil consultado ya no está disponible en el directorio.
            </Text>
            <Pressable onPress={() => router.replace('/home')} style={styles.notFoundButton}>
              <Text style={styles.notFoundButtonText}>Volver al inicio</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const hasGallery = provider.images.length > 1;
  const coverWidth = Math.min(width, 720) - 32;

  const callProvider = () =>
    Linking.openURL(`tel:${provider.phone}`).catch(() => undefined);
  const openWhatsApp = () =>
    Linking.openURL(
      `https://wa.me/${provider.whatsapp}?text=${encodeURIComponent(
        `Hola, vi tu servicio en RancoConecta y quiero consultar por ${provider.service}.`,
      )}`,
    ).catch(() => undefined);

  const submitRating = async () => {
    if (isSubmittingRating) {
      return;
    }

    if (!user) {
      router.push({ pathname: '/', params: { returnTo: `/provider/${provider.id}` } });
      return;
    }

    setIsSubmittingRating(true);

    try {
      await rateProvider(provider.id, warRating);
      Alert.alert(
        'Valoración enviada',
        `Gracias. Registramos ${warRating} estrellas para ${provider.name}.`,
        [{ text: 'Aceptar', style: 'cancel' }],
      );
    } catch (error) {
      Alert.alert(
        'No se pudo valorar',
        error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
      );
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.bar}>
          <Pressable onPress={() => safeGoBack('/home')} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={23} color="#2F7353" />
          </Pressable>
          <Text style={styles.barTitle}>Perfil del prestador</Text>
          <Pressable onPress={() => router.replace('/home')} style={styles.iconBtn}>
            <Ionicons name="home-outline" size={21} color="#1D5F4A" />
          </Pressable>
        </View>

        <View style={styles.cover}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEnabled={hasGallery}
            style={styles.gallery}
          >
            {provider.images.map((image) => (
              <Image key={image} source={{ uri: image }} style={[styles.coverImage, { width: coverWidth }]} contentFit="cover" />
            ))}
          </ScrollView>
          <View style={styles.coverShade} />
          {provider.images.length === 0 && (
            <View style={styles.coverPlaceholder}>
              <Ionicons name="storefront-outline" size={44} color="rgba(255,255,255,0.85)" />
            </View>
          )}
          <View style={styles.coverCopy}>
            <Text numberOfLines={2} style={styles.name}>
              {provider.name}
            </Text>
            <View style={styles.serviceRow}>
              <Text numberOfLines={1} style={styles.service}>
                {provider.service}
              </Text>
              {provider.verified && <Ionicons name="checkmark-circle" size={18} color="#CDE9D8" />}
            </View>
            <View style={styles.rating}>
              <Ionicons name="star" size={16} color="#BF6842" />
              <Text style={styles.ratingText}>{provider.rating}</Text>
              <Text style={styles.light}>({provider.reviews} opiniones)</Text>
            </View>
          </View>
          {hasGallery && (
            <View style={styles.galleryBadge}>
              <Ionicons name="images-outline" size={15} color="#1D5F4A" />
              <Text style={styles.galleryBadgeText}>{provider.images.length}</Text>
            </View>
          )}
        </View>

        {hasGallery && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnails}
          >
            {provider.images.map((image, index) => (
              <Image
                key={`${image}-${index}`}
                source={{ uri: image }}
                style={styles.thumbnail}
                contentFit="cover"
              />
            ))}
          </ScrollView>
        )}

        <View style={styles.actions}>
          <Pressable onPress={callProvider} style={styles.outline}>
            <Ionicons name="call-outline" size={19} color="#1D5F4A" />
            <Text style={styles.outlineText}>Llamar</Text>
          </Pressable>
          <Pressable onPress={openWhatsApp} style={styles.primary}>
            <Ionicons name="logo-whatsapp" size={19} color="#FFFFFF" />
            <Text style={styles.primaryText}>WhatsApp</Text>
          </Pressable>
          <Pressable onPress={() => toggleFavorite(provider.id)} style={styles.favoriteButton}>
            <Ionicons name={isFavoriteId ? 'heart' : 'heart-outline'} size={20} color={isFavoriteId ? '#BF6842' : '#1D5F4A'} />
          </Pressable>
        </View>

        <View style={styles.feedbackRow}>
          <View style={styles.ratingCard}>
            <View style={styles.feedbackHeader}>
              <Ionicons name="star-outline" size={18} color="#BF6842" />
              <Text style={styles.feedbackTitle}>Valorar servicio</Text>
            </View>
            <View style={styles.recommendStars}>
              {Array.from({ length: 5 }, (_, index) => {
                const value = index + 1;
                return (
                  <Pressable
                    key={value}
                    onPress={() => setWarRating(value)}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={value <= warRating ? 'star' : 'star-outline'}
                      size={18}
                      color="#BF6842"
                    />
                  </Pressable>
                );
              })}
            </View>
            <Pressable
              onPress={submitRating}
              disabled={isSubmittingRating}
              style={styles.ratingButton}
            >
              <Text style={styles.ratingButtonText}>
                {isSubmittingRating ? 'Enviando…' : 'Enviar valoración'}
              </Text>
            </Pressable>
          </View>
        </View>

        <Section title="Acerca del servicio">
          <Text style={styles.body}>{provider.description}</Text>
        </Section>

        <Section title="Cobertura">
          <View style={styles.chips}>
            {provider.coverage.map((item) => (
              <View key={item} style={styles.chip}>
                <Ionicons name="location-outline" size={14} color="#1D5F4A" />
                <Text style={styles.chipText}>{item}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section title="Disponibilidad">
          <View style={styles.available}>
            <View style={styles.dot} />
            <Text style={styles.availableText}>
              {provider.available ? 'Disponible para recibir solicitudes' : 'Consultar próxima disponibilidad'}
            </Text>
          </View>
        </Section>

        <Pressable
          onPress={() =>
            router.push({
              pathname: '/request-service',
              params: {
                providerId: provider.id,
                providerName: provider.name,
                serviceName: provider.service,
              },
            })
          }
          style={styles.request}
        >
          <Text style={styles.requestText}>Solicitar servicio</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#EAF3F0' },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center', padding: 16, paddingBottom: 40 },
  bar: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D5E0DA' },
  barTitle: { fontSize: 16, fontWeight: '700', color: '#2F7353' },
  cover: { height: 238, borderRadius: 24, overflow: 'hidden', backgroundColor: '#D5E0DA' },
  gallery: { flex: 1 },
  coverImage: { height: 238 },
  coverShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(29,60,47,0.42)' },
  coverPlaceholder: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  coverCopy: { position: 'absolute', left: 18, right: 18, bottom: 18 },
  name: { color: '#FFFFFF', fontSize: 25, lineHeight: 30, fontWeight: '800' },
  serviceRow: { marginTop: 5, flexDirection: 'row', alignItems: 'center', gap: 6 },
  service: { color: '#F2F7F4', fontSize: 13, fontWeight: '700' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 11 },
  ratingText: { color: '#FFFFFF', fontWeight: '800' },
  light: { color: '#E4EFE9', fontSize: 11 },
  galleryBadge: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFFFFF' },
  galleryBadgeText: { color: '#1D5F4A', fontSize: 11, fontWeight: '800' },
  thumbnails: { gap: 8, paddingTop: 10 },
  thumbnail: { width: 54, height: 45, borderRadius: 12, backgroundColor: '#D5E0DA' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  outline: { flex: 1, height: 52, borderRadius: 16, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D5E0DA' },
  outlineText: { color: '#1D5F4A', fontWeight: '800' },
  primary: { flex: 1, height: 52, borderRadius: 16, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1D5F4A' },
  primaryText: { color: '#FFFFFF', fontWeight: '800' },
  favoriteButton: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D5E0DA' },
  feedbackRow: { marginTop: 12 },
  ratingCard: { minHeight: 122, padding: 13, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D5E0DA' },
  feedbackHeader: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  feedbackTitle: { color: '#2F7353', fontSize: 14, lineHeight: 18, fontWeight: '700' },
  recommendStars: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingButton: { minHeight: 34, marginTop: 13, paddingHorizontal: 10, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E4EFE9' },
  ratingButtonText: { color: '#1D5F4A', fontSize: 11, lineHeight: 14, fontWeight: '700' },
  section: { marginTop: 13, padding: 18, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D5E0DA' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#34443D', marginBottom: 10 },
  body: { fontSize: 13, lineHeight: 20, color: '#6E7D75' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 11, flexDirection: 'row', gap: 5, backgroundColor: '#E4EFE9' },
  chipText: { fontSize: 11, fontWeight: '700', color: '#1D5F4A' },
  available: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2F7353' },
  availableText: { fontSize: 12, fontWeight: '700', color: '#2F7353' },
  request: { height: 58, marginTop: 14, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: '#BF6842' },
  requestText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  notFound: { marginTop: 40, padding: 26, borderRadius: 24, alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D5E0DA' },
  notFoundTitle: { marginTop: 13, color: '#34443D', fontSize: 17, fontWeight: '800' },
  notFoundText: { marginTop: 6, color: '#6E7D75', fontSize: 13, lineHeight: 19, textAlign: 'center' },
  notFoundButton: { minHeight: 46, marginTop: 16, paddingHorizontal: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1D5F4A' },
  notFoundButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
});