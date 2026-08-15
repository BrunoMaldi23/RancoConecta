import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { PROVIDERS } from '../data/providers';

export default function ProvidersScreen() {
  const params = useLocalSearchParams<{
    serviceName?: string;
    locationName?: string;
    subcategoryId?: string;
  }>();
  const serviceName = String(params.serviceName || 'Prestadores');
  const locationName = String(params.locationName || 'Lago Ranco');
  const subcategoryId = Array.isArray(params.subcategoryId)
    ? params.subcategoryId[0]
    : params.subcategoryId;
  const [search, setSearch] = useState('');

  const data = useMemo(() => {
    const term = search.trim().toLowerCase();
    const scopedProviders = subcategoryId
      ? PROVIDERS.filter((item) => item.subcategoryId === subcategoryId)
      : PROVIDERS;
    const source = scopedProviders.length > 0 ? scopedProviders : PROVIDERS;

    return source.filter((item) => {
      return (
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.service.toLowerCase().includes(term)
      );
    });
  }, [search, subcategoryId]);

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.topbar}>
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="arrow-back" size={23} color="#1F446A" />
              </Pressable>
              <View style={styles.topbarCenter}>
                <View style={styles.topbarIcon}>
                  <Ionicons name="people-outline" size={18} color="#224D78" />
                </View>
                <View style={styles.topbarCopy}>
                  <Text numberOfLines={1} style={styles.topbarTitle}>
                    {serviceName}
                  </Text>
                  <Text numberOfLines={1} style={styles.topbarSubtitle}>
                    {locationName}
                  </Text>
                </View>
              </View>
              <Pressable
                onPress={() => router.replace('/home')}
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="home-outline" size={21} color="#224D78" />
              </Pressable>
            </View>
            <View style={styles.topDivider} />

            <View style={styles.summary}>
              <View style={styles.summaryIcon}>
                <Ionicons name="location-outline" size={21} color="#224D78" />
              </View>
              <View style={styles.summaryCopy}>
                <Text style={styles.eyebrow}>Prestadores disponibles</Text>
                <Text numberOfLines={2} style={styles.summaryTitle}>
                  {serviceName}
                </Text>
                <Text numberOfLines={2} style={styles.summaryText}>
                  {locationName} · revisa fotos, estrellas y disponibilidad.
                </Text>
              </View>
            </View>

            <View style={styles.search}>
              <Ionicons name="search-outline" size={20} color="#687786" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar prestador"
                placeholderTextColor="#87929E"
                style={styles.input}
              />
              {!!search && (
                <Pressable onPress={() => setSearch('')}>
                  <Ionicons name="close-circle" size={20} color="#87929E" />
                </Pressable>
              )}
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.section}>Resultados</Text>
              <Text style={styles.sectionCount}>{data.length}</Text>
            </View>
            <View style={styles.listDivider} />
          </>
        }
        renderItem={({ item }) => {
          const stars = Array.from({ length: 5 }, (_, index) => index < Math.round(item.rating));

          return (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/provider/[providerId]',
                  params: { providerId: item.id },
                })
              }
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <Image source={{ uri: item.images[0] }} style={styles.thumbnail} contentFit="cover" />
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text numberOfLines={1} style={styles.name}>
                    {item.name}
                  </Text>
                  {item.verified && (
                    <Ionicons name="checkmark-circle" size={16} color="#2C689A" />
                  )}
                </View>
                <Text numberOfLines={1} style={styles.muted}>
                  {item.service}
                </Text>
                <View style={styles.meta}>
                  <View style={styles.stars}>
                    {stars.map((filled, index) => (
                      <Ionicons
                        key={`${item.id}-${index}`}
                        name={filled ? 'star' : 'star-outline'}
                        size={12}
                        color="#D89222"
                      />
                    ))}
                  </View>
                  <Text style={styles.rating}>{item.rating}</Text>
                  <Text numberOfLines={1} style={styles.muted}>
                    ({item.reviews}) · {item.distance}
                  </Text>
                </View>
              </View>
              <View style={styles.cardRight}>
                <Text style={[styles.status, !item.available && styles.busy]}>
                  {item.available ? 'Disponible' : 'Consultar'}
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#99A4AF" />
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={38} color="#99A4AF" />
            <Text style={styles.emptyTitle}>Sin prestadores</Text>
            <Text style={styles.emptyText}>Prueba con otra busqueda.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8F4' },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  topbar: { minHeight: 72, flexDirection: 'row', alignItems: 'center' },
  iconButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E6EB',
  },
  topbarCenter: {
    flex: 1,
    minHeight: 46,
    marginHorizontal: 10,
    paddingHorizontal: 11,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E6EB',
  },
  topbarIcon: {
    width: 31,
    height: 31,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF1F7',
  },
  topbarCopy: { flex: 1, minWidth: 0, marginLeft: 9 },
  topbarTitle: { color: '#1F446A', fontSize: 14, fontWeight: '700' },
  topbarSubtitle: {
    marginTop: 2,
    color: '#687786',
    fontSize: 10,
    fontWeight: '600',
  },
  topDivider: { height: 1, marginBottom: 13, backgroundColor: '#E6EBEF' },
  pressed: { opacity: 0.72 },
  summary: {
    minHeight: 80,
    padding: 12,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E6EB',
  },
  summaryIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF1F7',
  },
  summaryCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  eyebrow: {
    color: '#B97012',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  summaryTitle: {
    marginTop: 3,
    color: '#1F446A',
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '700',
  },
  summaryText: {
    marginTop: 3,
    color: '#536678',
    fontSize: 12,
    lineHeight: 17,
  },
  search: {
    minHeight: 52,
    marginTop: 12,
    paddingHorizontal: 15,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE5EC',
  },
  input: { flex: 1, marginHorizontal: 10, color: '#253F59', fontSize: 14 },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  section: { color: '#1F446A', fontSize: 21, fontWeight: '700' },
  sectionCount: {
    minWidth: 32,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#EAF1F7',
    color: '#224D78',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  listDivider: { height: 1, marginBottom: 9, backgroundColor: '#E6EBEF' },
  card: {
    minHeight: 94,
    marginBottom: 9,
    padding: 12,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E6EB',
  },
  thumbnail: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: '#E8EEF4',
  },
  info: { flex: 1, minWidth: 0, marginLeft: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  name: { flexShrink: 1, color: '#243F59', fontSize: 15, fontWeight: '700' },
  muted: { color: '#687786', fontSize: 11, marginTop: 3 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 7 },
  stars: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  rating: { fontSize: 11, fontWeight: '700', color: '#4A594F' },
  cardRight: { marginLeft: 8, alignItems: 'flex-end', gap: 9 },
  status: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    overflow: 'hidden',
    backgroundColor: '#EDF3F7',
    color: '#285B87',
    fontSize: 9,
    fontWeight: '700',
  },
  busy: { backgroundColor: '#F6EFE3', color: '#8B6421' },
  empty: { paddingVertical: 52, alignItems: 'center' },
  emptyTitle: {
    marginTop: 13,
    color: '#33485D',
    fontSize: 16,
    fontWeight: '800',
  },
  emptyText: { marginTop: 5, color: '#7A8793', fontSize: 12 },
});
