import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import type { ReactNode } from 'react';
import { Alert, Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { getProvider } from '../../data/providers';

export default function ProviderProfile() {
  const { providerId } = useLocalSearchParams<{ providerId?: string }>();
  const { width } = useWindowDimensions();
  const provider = getProvider(String(providerId || ''));
  const hasGallery = provider.images.length > 1;
  const coverWidth = Math.min(width, 720) - 32;

  const callProvider = () => Linking.openURL(`tel:${provider.phone}`);
  const openWhatsApp = () =>
    Linking.openURL(
      `https://wa.me/${provider.whatsapp}?text=${encodeURIComponent(
        `Hola, vi tu servicio en RancoConecta y quiero consultar por ${provider.service}.`,
      )}`,
    );

  const recommendProvider = () => {
    Alert.alert(
      'Recomendación registrada',
      `Gracias. ${provider.name} quedó marcado para revisión y puede aparecer en Destacados.`,
      [
        { text: 'Ver destacados', onPress: () => router.push('/featured') },
        { text: 'Aceptar', style: 'cancel' },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.bar}>
          <Pressable onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={23} color="#1F446A" />
          </Pressable>
          <Text style={styles.barTitle}>Perfil del prestador</Text>
          <Pressable onPress={() => router.replace('/home')} style={styles.iconBtn}>
            <Ionicons name="home-outline" size={21} color="#224D78" />
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
          <View style={styles.coverCopy}>
            <Text numberOfLines={2} style={styles.name}>
              {provider.name}
            </Text>
            <View style={styles.serviceRow}>
              <Text numberOfLines={1} style={styles.service}>
                {provider.service}
              </Text>
              {provider.verified && <Ionicons name="checkmark-circle" size={18} color="#CDE6F7" />}
            </View>
            <View style={styles.rating}>
              <Ionicons name="star" size={16} color="#D89222" />
              <Text style={styles.ratingText}>{provider.rating}</Text>
              <Text style={styles.light}>({provider.reviews} opiniones)</Text>
            </View>
          </View>
          {hasGallery && (
            <View style={styles.galleryBadge}>
              <Ionicons name="images-outline" size={15} color="#224D78" />
              <Text style={styles.galleryBadgeText}>{provider.images.length}</Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <Pressable onPress={callProvider} style={styles.outline}>
            <Ionicons name="call-outline" size={19} color="#224D78" />
            <Text style={styles.outlineText}>Llamar</Text>
          </Pressable>
          <Pressable onPress={openWhatsApp} style={styles.primary}>
            <Ionicons name="logo-whatsapp" size={19} color="#FFFFFF" />
            <Text style={styles.primaryText}>WhatsApp</Text>
          </Pressable>
        </View>

        <Pressable onPress={recommendProvider} style={styles.recommend}>
          <Ionicons name="star-outline" size={18} color="#8B6421" />
          <View style={styles.recommendText}>
            <Text style={styles.recommendTitle}>Recomendar prestador</Text>
            <Text style={styles.recommendDescription}>
              Si te hizo un buen trabajo, puede aparecer en Destacados.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={17} color="#99A4AF" />
        </Pressable>

        <Section title="Acerca del servicio">
          <Text style={styles.body}>{provider.description}</Text>
        </Section>

        <Section title="Cobertura">
          <View style={styles.chips}>
            {provider.coverage.map((item) => (
              <View key={item} style={styles.chip}>
                <Ionicons name="location-outline" size={14} color="#224D78" />
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
  safe: { flex: 1, backgroundColor: '#F7F8F4' },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center', padding: 16, paddingBottom: 40 },
  bar: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconBtn: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E1E6EB' },
  barTitle: { fontSize: 16, fontWeight: '800', color: '#1F446A' },
  cover: { height: 238, borderRadius: 24, overflow: 'hidden', backgroundColor: '#DDE5EC' },
  gallery: { flex: 1 },
  coverImage: { height: 238 },
  coverShade: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(24,54,83,0.38)' },
  coverCopy: { position: 'absolute', left: 18, right: 18, bottom: 18 },
  name: { color: '#FFFFFF', fontSize: 25, lineHeight: 30, fontWeight: '800' },
  serviceRow: { marginTop: 5, flexDirection: 'row', alignItems: 'center', gap: 6 },
  service: { color: '#EEF5FA', fontSize: 13, fontWeight: '700' },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 11 },
  ratingText: { color: '#FFFFFF', fontWeight: '800' },
  light: { color: '#EAF1F7', fontSize: 11 },
  galleryBadge: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFFFFF' },
  galleryBadgeText: { color: '#224D78', fontSize: 11, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  outline: { flex: 1, height: 52, borderRadius: 16, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDE5EC' },
  outlineText: { color: '#224D78', fontWeight: '800' },
  primary: { flex: 1, height: 52, borderRadius: 16, flexDirection: 'row', gap: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: '#224D78' },
  primaryText: { color: '#FFFFFF', fontWeight: '800' },
  recommend: { minHeight: 66, marginTop: 12, padding: 13, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E1E6EB' },
  recommendText: { flex: 1 },
  recommendTitle: { color: '#1F446A', fontSize: 13, fontWeight: '800' },
  recommendDescription: { marginTop: 3, color: '#687786', fontSize: 11, lineHeight: 15 },
  section: { marginTop: 13, padding: 18, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E1E6EB' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#243F59', marginBottom: 10 },
  body: { fontSize: 13, lineHeight: 20, color: '#687786' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 11, flexDirection: 'row', gap: 5, backgroundColor: '#E8EEF4' },
  chipText: { fontSize: 11, fontWeight: '700', color: '#224D78' },
  available: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#2C689A' },
  availableText: { fontSize: 12, fontWeight: '700', color: '#285B87' },
  request: { height: 58, marginTop: 14, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: '#D89222' },
  requestText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
});
