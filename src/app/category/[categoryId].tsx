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

type IconName = ComponentProps<typeof Ionicons>['name'];
type LocationId = 'lago-ranco' | 'futrono' | 'llifen' | 'riñinahue';

type Subcategory = {
  id: string;
  name: string;
  description: string;
  icon: IconName;
  counts: Record<LocationId, number>;
};

type Tone = {
  color: string;
  background: string;
};

type CategoryCatalog = {
  name: string;
  subtitle: string;
  icon: IconName;
  color: string;
  background: string;
  items: Subcategory[];
};

const count = (
  lagoRanco: number,
  futrono: number,
  llifen: number,
  rininahue: number,
): Record<LocationId, number> => ({
  'lago-ranco': lagoRanco,
  futrono,
  llifen,
  riñinahue: rininahue,
});

const TONES = {
  brand: { color: '#224D78', background: '#E8EEF4' },
  water: { color: '#26718A', background: '#DFF1F5' },
  field: { color: '#287A51', background: '#E2F2E8' },
  energy: { color: '#9A641D', background: '#F8ECD5' },
  heat: { color: '#B94738', background: '#F9E4E0' },
  food: { color: '#A46B22', background: '#F8ECD5' },
  care: { color: '#A74E6C', background: '#F8E4EB' },
  clean: { color: '#6C5590', background: '#EEE8F7' },
  neutral: { color: '#536171', background: '#EEF3F7' },
} satisfies Record<string, Tone>;

function getServiceTone(item: Subcategory, category: CategoryCatalog): Tone {
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

  return { color: category.color, background: category.background };
}

const CATALOG: Record<string, CategoryCatalog> = {
  hogar: {
    name: 'Hogar y reparaciones',
    subtitle: 'Soluciones para mantener, reparar y mejorar tu hogar.',
    icon: 'hammer-outline',
    color: '#8B6421',
    background: '#F8ECD5',
    items: [
      { id: 'electricidad', name: 'Electricidad', description: 'Instalaciones, fallas, enchufes y tableros.', icon: 'flash-outline', counts: count(5, 7, 2, 2) },
      { id: 'gasfiteria', name: 'Gasfitería', description: 'Filtraciones, cañerías, grifería y artefactos.', icon: 'water-outline', counts: count(4, 6, 2, 1) },
      { id: 'carpinteria', name: 'Carpintería', description: 'Muebles, puertas, revestimientos y reparaciones.', icon: 'construct-outline', counts: count(3, 4, 2, 2) },
      { id: 'pintura', name: 'Pintura', description: 'Interiores, fachadas, barnices y terminaciones.', icon: 'color-palette-outline', counts: count(4, 5, 1, 1) },
      { id: 'cerrajeria', name: 'Cerrajería', description: 'Cerraduras, llaves y aperturas de emergencia.', icon: 'key-outline', counts: count(2, 3, 0, 1) },
      { id: 'techumbre', name: 'Techumbre y goteras', description: 'Reparación, sellado y mantención de techos.', icon: 'home-outline', counts: count(3, 4, 1, 2) },
    ],
  },
  calefaccion: {
    name: 'Calefacción',
    subtitle: 'Instalación, combustible y mantención para tu hogar.',
    icon: 'flame-outline',
    color: '#9A641D',
    background: '#F8ECD5',
    items: [
      { id: 'estufas-lena', name: 'Estufas a leña', description: 'Instalación, reparación y limpieza.', icon: 'flame-outline', counts: count(5, 6, 3, 2) },
      { id: 'pellet', name: 'Pellet', description: 'Venta, reparto y mantención de estufas.', icon: 'cube-outline', counts: count(4, 5, 2, 1) },
      { id: 'lena', name: 'Leña seca', description: 'Venta y despacho de leña certificada.', icon: 'leaf-outline', counts: count(7, 8, 4, 4) },
      { id: 'limpieza-cañones', name: 'Limpieza de cañones', description: 'Deshollinado y revisión preventiva.', icon: 'sparkles-outline', counts: count(3, 4, 2, 2) },
      { id: 'climatizacion', name: 'Climatización', description: 'Aire acondicionado y bombas de calor.', icon: 'snow-outline', counts: count(2, 4, 0, 0) },
    ],
  },
  campo: {
    name: 'Jardín y parcela',
    subtitle: 'Servicios para terrenos, jardines y sectores rurales.',
    icon: 'leaf-outline', color: '#287A51', background: '#E2F2E8',
    items: [
      { id: 'poda', name: 'Poda y tala', description: 'Árboles, frutales y retiro de ramas.', icon: 'cut-outline', counts: count(6, 7, 4, 4) },
      { id: 'despeje', name: 'Despeje de terrenos', description: 'Limpieza de maleza y preparación de sitios.', icon: 'leaf-outline', counts: count(5, 6, 3, 4) },
      { id: 'cercos', name: 'Cercos', description: 'Construcción y reparación de cierres.', icon: 'grid-outline', counts: count(5, 5, 3, 4) },
      { id: 'riego', name: 'Riego', description: 'Diseño, instalación y reparación de sistemas.', icon: 'water-outline', counts: count(3, 4, 2, 2) },
      { id: 'maquinaria', name: 'Maquinaria', description: 'Retroexcavadora, minicargador y faenas.', icon: 'build-outline', counts: count(4, 5, 2, 3) },
    ],
  },
  fletes: {
    name: 'Fletes y carga', subtitle: 'Traslados, carga y apoyo logístico local.',
    icon: 'car-outline', color: '#224D78', background: '#E8EEF4',
    items: [
      { id: 'fletes', name: 'Fletes', description: 'Traslado de compras, materiales y carga.', icon: 'car-outline', counts: count(5, 7, 2, 3) },
      { id: 'mudanzas', name: 'Mudanzas', description: 'Traslado de hogares y oficinas.', icon: 'home-outline', counts: count(3, 5, 1, 1) },
      { id: 'escombros', name: 'Retiro de escombros', description: 'Retiro de residuos de construcción.', icon: 'trash-outline', counts: count(3, 4, 1, 2) },
      { id: 'fosas', name: 'Limpieza de fosas', description: 'Vaciado y mantención de sistemas sanitarios.', icon: 'water-outline', counts: count(2, 3, 1, 2) },
      { id: 'carga-pesada', name: 'Carga pesada', description: 'Camiones y transporte de mayor volumen.', icon: 'trail-sign-outline', counts: count(2, 3, 0, 1) },
    ],
  },
  gastronomia: {
    name: 'Comida y gastronomía', subtitle: 'Sabores locales, preparación y reparto.',
    icon: 'restaurant-outline', color: '#A46B22', background: '#F8ECD5',
    items: [
      { id: 'comida-casera', name: 'Comida casera', description: 'Menús, colaciones y platos preparados.', icon: 'restaurant-outline', counts: count(9, 12, 4, 3) },
      { id: 'reparto', name: 'Reparto de comida', description: 'Delivery disponible en tu sector.', icon: 'bicycle-outline', counts: count(6, 10, 2, 1) },
      { id: 'reposteria', name: 'Repostería', description: 'Tortas, dulces y pedidos especiales.', icon: 'gift-outline', counts: count(7, 9, 3, 2) },
      { id: 'catering', name: 'Catering y eventos', description: 'Banquetería para reuniones y celebraciones.', icon: 'people-outline', counts: count(4, 6, 1, 1) },
      { id: 'asados', name: 'Asados', description: 'Parrilladas y servicio para eventos.', icon: 'flame-outline', counts: count(3, 5, 1, 2) },
    ],
  },
  vehiculos: {
    name: 'Vehículos y asistencia', subtitle: 'Mantención y ayuda para seguir en ruta.',
    icon: 'construct-outline', color: '#647584', background: '#EEF3F7',
    items: [
      { id: 'mecanica', name: 'Mecánica', description: 'Diagnóstico, mantención y reparaciones.', icon: 'construct-outline', counts: count(5, 8, 2, 2) },
      { id: 'vulcanizacion', name: 'Vulcanización', description: 'Neumáticos, pinchazos y balanceo.', icon: 'ellipse-outline', counts: count(3, 5, 1, 1) },
      { id: 'gruas', name: 'Grúas y rescate', description: 'Traslado y asistencia en ruta.', icon: 'car-outline', counts: count(2, 3, 1, 1) },
      { id: 'baterias', name: 'Baterías', description: 'Venta, instalación y arranque auxiliar.', icon: 'battery-charging-outline', counts: count(3, 4, 1, 1) },
      { id: 'lavado', name: 'Lavado de vehículos', description: 'Lavado exterior, interior y detailing.', icon: 'sparkles-outline', counts: count(4, 6, 1, 0) },
    ],
  },
  agua: {
    name: 'Agua y sistemas hídricos', subtitle: 'Captación, almacenamiento y calidad del agua.',
    icon: 'water-outline', color: '#26718A', background: '#DFF1F5',
    items: [
      { id: 'pozos', name: 'Pozos', description: 'Perforación, limpieza y recuperación.', icon: 'water-outline', counts: count(3, 4, 1, 3) },
      { id: 'bombas', name: 'Bombas de agua', description: 'Instalación, reparación y automatización.', icon: 'settings-outline', counts: count(4, 5, 2, 3) },
      { id: 'estanques', name: 'Estanques', description: 'Venta, instalación y limpieza.', icon: 'cube-outline', counts: count(3, 4, 2, 2) },
      { id: 'filtros', name: 'Filtros y purificación', description: 'Tratamiento y mejora de agua domiciliaria.', icon: 'funnel-outline', counts: count(2, 3, 1, 1) },
      { id: 'redes-agua', name: 'Redes de agua', description: 'Tuberías, matrices y distribución rural.', icon: 'git-network-outline', counts: count(3, 4, 1, 3) },
    ],
  },
  energia: {
    name: 'Energía y conectividad', subtitle: 'Energía, internet y seguridad para zonas urbanas y rurales.',
    icon: 'flash-outline', color: '#8B6421', background: '#F8ECD5',
    items: [
      { id: 'solar', name: 'Energía solar', description: 'Paneles, baterías e instalaciones fotovoltaicas.', icon: 'sunny-outline', counts: count(3, 4, 1, 1) },
      { id: 'generadores', name: 'Generadores', description: 'Venta, instalación y mantención.', icon: 'flash-outline', counts: count(3, 4, 1, 2) },
      { id: 'internet', name: 'Internet y Wi-Fi', description: 'Instalación, extensión de señal y soporte.', icon: 'wifi-outline', counts: count(4, 6, 2, 1) },
      { id: 'starlink', name: 'Starlink', description: 'Instalación, orientación y configuración.', icon: 'planet-outline', counts: count(3, 4, 1, 2) },
      { id: 'camaras', name: 'Cámaras y alarmas', description: 'Seguridad, monitoreo y control de acceso.', icon: 'videocam-outline', counts: count(3, 5, 1, 1) },
    ],
  },
  aseo: {
    name: 'Aseo y propiedades', subtitle: 'Limpieza y cuidado periódico de tus espacios.',
    icon: 'sparkles-outline', color: '#6C5590', background: '#EEE8F7',
    items: [
      { id: 'aseo-hogar', name: 'Aseo domiciliario', description: 'Limpieza regular para casas y departamentos.', icon: 'home-outline', counts: count(6, 9, 3, 0) },
      { id: 'limpieza-profunda', name: 'Limpieza profunda', description: 'Cocinas, baños, vidrios y espacios completos.', icon: 'sparkles-outline', counts: count(5, 7, 2, 0) },
      { id: 'cabanas', name: 'Aseo de cabañas', description: 'Recambio, limpieza y preparación turística.', icon: 'bed-outline', counts: count(7, 8, 3, 2) },
      { id: 'tapices', name: 'Tapices y alfombras', description: 'Lavado de sillones, colchones y alfombras.', icon: 'water-outline', counts: count(3, 5, 1, 0) },
      { id: 'cuidado-viviendas', name: 'Cuidado de viviendas', description: 'Supervisión y mantención en ausencia.', icon: 'shield-checkmark-outline', counts: count(4, 5, 1, 2) },
    ],
  },
  cuidados: {
    name: 'Salud y cuidados', subtitle: 'Bienestar y apoyo para personas y mascotas.',
    icon: 'heart-outline', color: '#A74E6C', background: '#F8E4EB',
    items: [
      { id: 'enfermeria', name: 'Enfermería', description: 'Curaciones, controles y atención domiciliaria.', icon: 'medkit-outline', counts: count(4, 7, 1, 1) },
      { id: 'adulto-mayor', name: 'Cuidado de personas', description: 'Acompañamiento y apoyo cotidiano.', icon: 'people-outline', counts: count(5, 8, 2, 1) },
      { id: 'belleza', name: 'Belleza a domicilio', description: 'Peluquería, manicure y cuidado personal.', icon: 'cut-outline', counts: count(6, 9, 2, 1) },
      { id: 'masajes', name: 'Masajes y bienestar', description: 'Relajación y atención corporal.', icon: 'body-outline', counts: count(3, 5, 1, 0) },
      { id: 'mascotas', name: 'Cuidado de mascotas', description: 'Paseos, alimentación y atención a domicilio.', icon: 'paw-outline', counts: count(5, 7, 2, 1) },
    ],
  },
  profesionales: {
    name: 'Servicios profesionales', subtitle: 'Especialistas para proyectos, trámites y tecnología.',
    icon: 'briefcase-outline', color: '#224D78', background: '#E8EEF4',
    items: [
      { id: 'topografia', name: 'Topografía', description: 'Mediciones, deslindes y levantamientos.', icon: 'map-outline', counts: count(3, 4, 1, 1) },
      { id: 'tramites', name: 'Trámites y asesoría', description: 'Apoyo documental y gestiones administrativas.', icon: 'document-text-outline', counts: count(4, 6, 1, 1) },
      { id: 'soporte', name: 'Soporte técnico', description: 'Computadores, redes, impresoras y configuración.', icon: 'laptop-outline', counts: count(5, 8, 2, 1) },
      { id: 'fotografia', name: 'Fotografía y video', description: 'Eventos, propiedades y contenido comercial.', icon: 'camera-outline', counts: count(4, 6, 1, 1) },
      { id: 'drones', name: 'Servicios con drones', description: 'Registro aéreo e inspección de terrenos.', icon: 'airplane-outline', counts: count(2, 3, 0, 1) },
    ],
  },
};

export default function CategoryScreen() {
  const params = useLocalSearchParams<{ categoryId?: string; locationId?: string; locationName?: string }>();
  const categoryId = Array.isArray(params.categoryId) ? params.categoryId[0] : params.categoryId;
  const rawLocationId = Array.isArray(params.locationId) ? params.locationId[0] : params.locationId;
  const locationNameParam = Array.isArray(params.locationName) ? params.locationName[0] : params.locationName;
  const locationId: LocationId = ['lago-ranco', 'futrono', 'llifen', 'riñinahue'].includes(rawLocationId ?? '') ? rawLocationId as LocationId : 'lago-ranco';
  const locationName = locationNameParam || 'Lago Ranco';
  const category = CATALOG[categoryId ?? 'hogar'] ?? CATALOG.hogar;
  const [search, setSearch] = useState('');

  const items = useMemo(() => {
    const term = search.trim().toLowerCase();
    return category.items.filter((item) => item.counts[locationId] > 0 && (!term || item.name.toLowerCase().includes(term) || item.description.toLowerCase().includes(term)));
  }, [category, locationId, search]);

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
              <Pressable onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={23} color="#1F446A" /></Pressable>
              <View style={styles.topbarCenter}>
                <View style={[styles.topbarIcon, { backgroundColor: category.background }]}>
                  <Ionicons name={category.icon} size={18} color={category.color} />
                </View>
                <View style={styles.topbarCopy}>
                  <Text numberOfLines={1} style={styles.topbarTitle}>{category.name}</Text>
                  <Text numberOfLines={1} style={styles.topbarSubtitle}>{locationName}</Text>
                </View>
              </View>
              <Pressable onPress={() => router.replace('/home')} style={styles.backButton}><Ionicons name="home-outline" size={21} color="#224D78" /></Pressable>
            </View>
            <View style={styles.topDivider} />

            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={20} color="#687786" />
              <TextInput value={search} onChangeText={setSearch} placeholder="Buscar dentro de esta categoría" placeholderTextColor="#87929E" style={styles.searchInput} />
              {!!search && <Pressable onPress={() => setSearch('')}><Ionicons name="close-circle" size={20} color="#87929E" /></Pressable>}
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
              <View style={[styles.icon, { backgroundColor: tone.background }]}><Ionicons name={item.icon} size={24} color={tone.color} /></View>
              <View style={styles.cardCopy}>
                <Text numberOfLines={1} style={styles.cardTitle}>{item.name}</Text>
                <Text numberOfLines={2} style={styles.cardDescription}>{item.description}</Text>
              </View>
              <View style={styles.cardAction}>
                <View style={styles.countBadge}><View style={[styles.dot, { backgroundColor: tone.color }]} /><Text style={styles.countText}>{item.counts[locationId]}</Text></View>
                <Ionicons name="chevron-forward" size={18} color="#99A4AF" />
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="search-outline" size={40} color="#99A4AF" /><Text style={styles.emptyTitle}>No encontramos ese servicio</Text><Text style={styles.emptyText}>Prueba buscando con otra palabra.</Text></View>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F8F4' },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 16, paddingBottom: 40 },
  topbar: { minHeight: 72, flexDirection: 'row', alignItems: 'center' },
  backButton: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E1E6EB' },
  topbarCenter: { flex: 1, minHeight: 46, marginHorizontal: 10, paddingHorizontal: 11, borderRadius: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E1E6EB' },
  topbarIcon: { width: 31, height: 31, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  topbarCopy: { flex: 1, minWidth: 0, marginLeft: 9 },
  topbarTitle: { color: '#1F446A', fontSize: 14, fontWeight: '900' },
  topbarSubtitle: { marginTop: 2, color: '#687786', fontSize: 10, fontWeight: '700' },
  topDivider: { height: 1, marginBottom: 13, backgroundColor: '#E6EBEF' },
  searchBox: { minHeight: 52, marginTop: 0, paddingHorizontal: 15, borderRadius: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDE5EC' },
  searchInput: { flex: 1, marginHorizontal: 10, paddingVertical: 15, color: '#253F59', fontSize: 14 },
  sectionHeader: { marginTop: 20, marginBottom: 10, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  sectionTitle: { color: '#1F446A', fontSize: 21, fontWeight: '900' },
  sectionSubtitle: { marginTop: 4, color: '#687786', fontSize: 12 },
  listDivider: { height: 1, marginBottom: 9, backgroundColor: '#E6EBEF' },
  card: { minHeight: 78, marginBottom: 8, padding: 11, borderRadius: 17, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E1E6EB' },
  cardPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  icon: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  cardCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  cardTitle: { color: '#243F59', fontSize: 15, lineHeight: 19, fontWeight: '900' },
  cardDescription: { marginTop: 4, color: '#71808C', fontSize: 11, lineHeight: 16 },
  cardAction: { marginLeft: 8, alignItems: 'flex-end', gap: 7 },
  countBadge: { minWidth: 33, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, backgroundColor: '#EDF3F7' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#2C689A' },
  countText: { color: '#285B87', fontSize: 10, fontWeight: '800' },
  empty: { paddingVertical: 60, alignItems: 'center' },
  emptyTitle: { marginTop: 14, color: '#33485D', fontSize: 16, fontWeight: '700' },
  emptyText: { marginTop: 5, color: '#7A8793', fontSize: 12 },
});
