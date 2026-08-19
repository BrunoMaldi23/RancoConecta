import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import type { ComponentProps } from 'react';
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

import {
  type AppCategory,
  type CategorySubcategory,
  useAppData,
} from '../../contexts/app-data';
import { safeGoBack } from '../../lib/navigation';

type IconName = ComponentProps<typeof Ionicons>['name'];
type LocationId = 'lago-ranco' | 'futrono' | 'llifen' | 'riñinahue';

type SubcategoryWithCount = CategorySubcategory & {
  count: number;
};

type Tone = {
  color: string;
  background: string;
};

const TONES = {
  brand: { color: '#1D5F4A', background: '#E2ECE1' },
  water: { color: '#2F7353', background: '#E6EFE6' },
  field: { color: '#2F7353', background: '#E6EFE6' },
  energy: { color: '#8A5A37', background: '#EFE6D6' },
  heat: { color: '#B94738', background: '#F9E4E0' },
  food: { color: '#8A5A37', background: '#EFE6D6' },
  care: { color: '#9A5C63', background: '#F1E1E2' },
  clean: { color: '#6E6356', background: '#E8E1D4' },
  neutral: { color: '#536171', background: '#E9EEE5' },
} satisfies Record<string, Tone>;

function getServiceTone(item: CategorySubcategory, category: AppCategory): Tone {
  if (
    item.id.includes('agua') ||
    item.id.includes('gasfiteria') ||
    item.id.includes('pozos') ||
    item.id.includes('bombas') ||
    item.id.includes('estanques') ||
    item.id.includes('filtros') ||
    item.icon === 'water-outline'
  ) {
    return TONES.water;
  }

  if (
    item.id.includes('electricidad') ||
    item.id.includes('solar') ||
    item.id.includes('generadores') ||
    item.id.includes('internet') ||
    item.id.includes('starlink') ||
    item.id.includes('camaras') ||
    item.icon === 'flash-outline' ||
    item.icon === 'wifi-outline' ||
    item.icon === 'sunny-outline'
  ) {
    return TONES.energy;
  }

  if (
    item.id.includes('poda') ||
    item.id.includes('despeje') ||
    item.id.includes('cercos') ||
    item.id.includes('riego') ||
    item.id.includes('lena') ||
    item.id.includes('maquinaria') ||
    item.icon === 'leaf-outline'
  ) {
    return TONES.field;
  }

  if (
    item.id.includes('estufas') ||
    item.id.includes('pellet') ||
    item.id.includes('climatizacion') ||
    item.id.includes('asados') ||
    item.icon === 'flame-outline'
  ) {
    return TONES.heat;
  }

  if (
    item.id.includes('comida') ||
    item.id.includes('reparto') ||
    item.id.includes('reposteria') ||
    item.id.includes('catering') ||
    item.icon === 'restaurant-outline'
  ) {
    return TONES.food;
  }

  if (
    item.id.includes('enfermeria') ||
    item.id.includes('adulto') ||
    item.id.includes('belleza') ||
    item.id.includes('masajes') ||
    item.id.includes('mascotas') ||
    item.icon === 'heart-outline' ||
    item.icon === 'medkit-outline'
  ) {
    return TONES.care;
  }

  if (
    item.id.includes('aseo') ||
    item.id.includes('limpieza') ||
    item.id.includes('tapices') ||
    item.icon === 'sparkles-outline'
  ) {
    return TONES.clean;
  }

  if (
    item.id.includes('fletes') ||
    item.id.includes('mudanzas') ||
    item.id.includes('mecanica') ||
    item.id.includes('gruas') ||
    item.id.includes('baterias') ||
    item.id.includes('topografia') ||
    item.id.includes('soporte') ||
    item.id.includes('drones')
  ) {
    return TONES.brand;
  }

  return { color: category.iconColor, background: category.iconBackground };
}

export default function CategoryScreen() {
  const params = useLocalSearchParams<{ categoryId?: string; locationId?: string; locationName?: string }>();
  const categoryId = Array.isArray(params.categoryId) ? params.categoryId[0] : params.categoryId;
  const rawLocationId = Array.isArray(params.locationId) ? params.locationId[0] : params.locationId;
  const locationNameParam = Array.isArray(params.locationName) ? params.locationName[0] : params.locationName;
  const locationId: LocationId = ['lago-ranco', 'futrono', 'llifen', 'riñinahue'].includes(rawLocationId ?? '') ? rawLocationId as LocationId : 'lago-ranco';
  const locationName = locationNameParam || 'Lago Ranco';
  const { providers, providersStatus, getCategory, categoriesStatus } = useAppData();
  const category = getCategory(String(categoryId || ''));
  const [search, setSearch] = useState('');

  const items = useMemo<SubcategoryWithCount[]>(() => {
    const term = search.trim().toLowerCase();

    if (!category) {
      return [];
    }

    return category.subcategories
      .map((subcategory) => {
        const count = providers.filter(
          (provider) =>
            provider.publicationStatus === 'Publicado' &&
            provider.categoryId === category.id &&
            provider.subcategoryId === subcategory.id &&
            provider.coverage.includes(locationName),
        ).length;

        return { ...subcategory, count };
      })
      .filter(
        (item) =>
          item.count > 0 &&
          (!term ||
            item.name.toLowerCase().includes(term) ||
            item.description.toLowerCase().includes(term)),
      );
  }, [category, locationName, providers, search]);

  if (categoriesStatus === 'loading') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.topbar}>
            <Pressable onPress={() => safeGoBack()} style={styles.backButton}><Ionicons name="arrow-back" size={23} color="#2F7353" /></Pressable>
            <View style={styles.topbarCenter} />
            <Pressable onPress={() => router.replace('/home')} style={styles.backButton}><Ionicons name="home-outline" size={21} color="#1D5F4A" /></Pressable>
          </View>
          <View style={styles.empty}><Text style={styles.emptyText}>Cargando categoría…</Text></View>
        </View>
      </SafeAreaView>
    );
  }

  if (!category) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.topbar}>
            <Pressable onPress={() => safeGoBack()} style={styles.backButton}><Ionicons name="arrow-back" size={23} color="#2F7353" /></Pressable>
            <View style={styles.topbarCenter} />
            <Pressable onPress={() => router.replace('/home')} style={styles.backButton}><Ionicons name="home-outline" size={21} color="#1D5F4A" /></Pressable>
          </View>
          <View style={styles.empty}>
            <Ionicons name="grid-outline" size={40} color="#9B9A90" />
            <Text style={styles.emptyTitle}>Categoría no encontrada</Text>
            <Text style={styles.emptyText}>Es posible que haya sido eliminada.</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.topbar}>
              <Pressable onPress={() => safeGoBack()} style={styles.backButton}><Ionicons name="arrow-back" size={23} color="#2F7353" /></Pressable>
              <View style={styles.topbarCenter}>
                <View style={[styles.topbarIcon, { backgroundColor: category.iconBackground }]}>
                  <Ionicons name={category.icon as IconName} size={18} color={category.iconColor} />
                </View>
                <View style={styles.topbarCopy}>
                  <Text numberOfLines={1} style={styles.topbarTitle}>{category.name}</Text>
                  <Text numberOfLines={1} style={styles.topbarSubtitle}>{locationName}</Text>
                </View>
              </View>
              <Pressable onPress={() => router.replace('/home')} style={styles.backButton}><Ionicons name="home-outline" size={21} color="#1D5F4A" /></Pressable>
            </View>
            <View style={styles.topDivider} />

            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={20} color="#7A827A" />
              <TextInput value={search} onChangeText={setSearch} placeholder="Buscar dentro de esta categoría" placeholderTextColor="#8A9288" style={styles.searchInput} />
              {!!search && <Pressable onPress={() => setSearch('')}><Ionicons name="close-circle" size={20} color="#8A9288" /></Pressable>}
            </View>

            <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Elige un servicio</Text><Text style={styles.sectionSubtitle}>{items.length} subcategorías disponibles</Text></View></View>
            <View style={styles.listDivider} />
          </>
        }
        renderItem={({ item }) => {
          const tone = getServiceTone(item, category);

          return (
            <Pressable
              onPress={() => router.push({ pathname: '/providers', params: { categoryId, subcategoryId: item.id, locationId, locationName, serviceName: item.name } })}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            >
              <View style={[styles.icon, { backgroundColor: tone.background }]}><Ionicons name={item.icon as IconName} size={24} color={tone.color} /></View>
              <View style={styles.cardCopy}>
                <Text numberOfLines={1} style={styles.cardTitle}>{item.name}</Text>
                <Text numberOfLines={2} style={styles.cardDescription}>{item.description}</Text>
              </View>
              <View style={styles.cardAction}>
                <View style={styles.countBadge}><View style={[styles.dot, { backgroundColor: tone.color }]} /><Text style={styles.countText}>{item.count}</Text></View>
                <Ionicons name="chevron-forward" size={18} color="#9B9A90" />
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          providersStatus === 'loading' ? (
            <View style={styles.empty}><Text style={styles.emptyText}>Cargando servicios…</Text></View>
          ) : (
            <View style={styles.empty}><Ionicons name="search-outline" size={40} color="#9B9A90" /><Text style={styles.emptyTitle}>No encontramos ese servicio</Text><Text style={styles.emptyText}>Por ahora no hay prestadores publicados en este rubro para tu localidad.</Text></View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3ECDD' },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 16, paddingBottom: 40 },
  topbar: { minHeight: 72, flexDirection: 'row', alignItems: 'center' },
  backButton: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DED8CB' },
  topbarCenter: { flex: 1, minHeight: 46, marginHorizontal: 10, paddingHorizontal: 11, borderRadius: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DED8CB' },
  topbarIcon: { width: 31, height: 31, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  topbarCopy: { flex: 1, minWidth: 0, marginLeft: 9 },
  topbarTitle: { color: '#2F7353', fontSize: 14, fontWeight: '900' },
  topbarSubtitle: { marginTop: 2, color: '#7A827A', fontSize: 10, fontWeight: '700' },
  topDivider: { height: 1, marginBottom: 13, backgroundColor: '#E6EBEF' },
  searchBox: { minHeight: 52, marginTop: 0, paddingHorizontal: 15, borderRadius: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DED8CB' },
  searchInput: { flex: 1, marginHorizontal: 10, paddingVertical: 15, color: '#253F59', fontSize: 14 },
  sectionHeader: { marginTop: 20, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  sectionTitle: { color: '#2F7353', fontSize: 21, fontWeight: '900' },
  sectionSubtitle: { marginTop: 4, color: '#7A827A', fontSize: 12 },
  listDivider: { height: 1, marginBottom: 9, backgroundColor: '#E6EBEF' },
  card: { minHeight: 78, marginBottom: 8, padding: 11, borderRadius: 17, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DED8CB' },
  cardPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  icon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  cardCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  cardTitle: { color: '#34443D', fontSize: 15, lineHeight: 19, fontWeight: '900' },
  cardDescription: { marginTop: 4, color: '#71808C', fontSize: 11, lineHeight: 16 },
  cardAction: { marginLeft: 8, alignItems: 'flex-end', gap: 7 },
  countBadge: { minWidth: 33, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: '#EDF3F7' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2F7353' },
  countText: { color: '#2F7353', fontSize: 10, fontWeight: '800' },
  empty: { paddingVertical: 60, alignItems: 'center' },
  emptyTitle: { marginTop: 14, color: '#34443D', fontSize: 16, fontWeight: '700' },
  emptyText: { marginTop: 5, color: '#7A8793', fontSize: 12 },
});
