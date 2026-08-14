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
  useWindowDimensions,
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

const CATALOG: Record<string, CategoryCatalog> = {
  hogar: {
    name: 'Hogar y reparaciones',
    subtitle: 'Soluciones para mantener, reparar y mejorar tu hogar.',
    icon: 'hammer-outline',
    color: '#A8582B',
    background: '#FBE9DE',
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
    color: '#B94738',
    background: '#F9E4E0',
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
    icon: 'car-outline', color: '#3C6288', background: '#E5EDF6',
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
    icon: 'restaurant-outline', color: '#A46B22', background: '#F9EED7',
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
    icon: 'construct-outline', color: '#536171', background: '#E9EDF1',
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
    icon: 'flash-outline', color: '#8B7421', background: '#F8F1D3',
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
    icon: 'briefcase-outline', color: '#38636B', background: '#E2EFF1',
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
  const { width } = useWindowDimensions();
  const columns = width >= 920 ? 3 : 2;

  const items = useMemo(() => {
    const term = search.trim().toLowerCase();
    return category.items.filter((item) => item.counts[locationId] > 0 && (!term || item.name.toLowerCase().includes(term) || item.description.toLowerCase().includes(term)));
  }, [category, locationId, search]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        key={columns}
        data={items}
        numColumns={columns}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.topbar}>
              <Pressable onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={23} color="#17382A" /></Pressable>
              <Text numberOfLines={1} style={styles.topbarTitle}>{category.name}</Text>
              <View style={styles.topbarSpacer} />
            </View>

            <View style={styles.hero}>
              <View style={[styles.heroIcon, { backgroundColor: category.background }]}><Ionicons name={category.icon} size={30} color={category.color} /></View>
              <Text style={styles.eyebrow}>SERVICIOS EN {locationName.toUpperCase()}</Text>
              <Text style={styles.title}>{category.name}</Text>
              <Text style={styles.subtitle}>{category.subtitle}</Text>
              <View style={styles.locationBadge}><Ionicons name="location" size={15} color="#276749" /><Text style={styles.locationText}>{locationName}</Text></View>
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={20} color="#718077" />
              <TextInput value={search} onChangeText={setSearch} placeholder="Buscar dentro de esta categoría" placeholderTextColor="#8B9890" style={styles.searchInput} />
              {!!search && <Pressable onPress={() => setSearch('')}><Ionicons name="close-circle" size={20} color="#8B9890" /></Pressable>}
            </View>

            <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Elige un servicio</Text><Text style={styles.sectionSubtitle}>{items.length} subcategorías disponibles</Text></View><View style={styles.counter}><Text style={styles.counterText}>{items.length}</Text></View></View>
          </>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/providers', params: { categoryId, subcategoryId: item.id, locationId, locationName, serviceName: item.name } })}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <View style={[styles.icon, { backgroundColor: category.background }]}><Ionicons name={item.icon} size={24} color={category.color} /></View>
            <Text numberOfLines={2} style={styles.cardTitle}>{item.name}</Text>
            <Text numberOfLines={2} style={styles.cardDescription}>{item.description}</Text>
            <View style={styles.cardFooter}><View style={styles.countBadge}><View style={styles.dot} /><Text style={styles.countText}>{item.counts[locationId]} disponibles</Text></View><Ionicons name="arrow-forward" size={16} color="#276749" /></View>
          </Pressable>
        )}
        ListEmptyComponent={<View style={styles.empty}><Ionicons name="search-outline" size={40} color="#98A49C" /><Text style={styles.emptyTitle}>No encontramos ese servicio</Text><Text style={styles.emptyText}>Prueba buscando con otra palabra.</Text></View>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F5F7F2' },
  content: { width: '100%', maxWidth: 920, alignSelf: 'center', paddingHorizontal: 16, paddingBottom: 40 },
  topbar: { height: 72, flexDirection: 'row', alignItems: 'center' },
  backButton: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E6E1' },
  topbarTitle: { flex: 1, marginHorizontal: 12, color: '#17382A', fontSize: 16, fontWeight: '800', textAlign: 'center' },
  topbarSpacer: { width: 43 },
  hero: { padding: 23, borderRadius: 26, backgroundColor: '#193E2E' },
  heroIcon: { width: 55, height: 55, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { marginTop: 19, color: '#BFD3C4', fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  title: { marginTop: 7, color: '#FFFFFF', fontSize: 29, lineHeight: 35, fontWeight: '800', letterSpacing: -0.8 },
  subtitle: { maxWidth: 550, marginTop: 8, color: '#C7D5CB', fontSize: 13, lineHeight: 20 },
  locationBadge: { alignSelf: 'flex-start', marginTop: 18, paddingHorizontal: 11, paddingVertical: 8, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF' },
  locationText: { color: '#276749', fontSize: 12, fontWeight: '800' },
  searchBox: { minHeight: 55, marginTop: 13, paddingHorizontal: 16, borderRadius: 17, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DEE5DF' },
  searchInput: { flex: 1, marginHorizontal: 10, paddingVertical: 15, color: '#213A2D', fontSize: 14 },
  sectionHeader: { marginTop: 27, marginBottom: 14, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  sectionTitle: { color: '#193A2C', fontSize: 22, fontWeight: '800' },
  sectionSubtitle: { marginTop: 4, color: '#718077', fontSize: 12 },
  counter: { minWidth: 35, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 11, backgroundColor: '#E3EEE6' },
  counterText: { color: '#276749', fontSize: 12, fontWeight: '800', textAlign: 'center' },
  row: { gap: 11 },
  card: { flex: 1, minWidth: 0, minHeight: 190, marginBottom: 11, padding: 15, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E6E1' },
  cardPressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  icon: { width: 47, height: 47, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { minHeight: 40, marginTop: 13, color: '#243D30', fontSize: 15, lineHeight: 19, fontWeight: '800' },
  cardDescription: { flex: 1, marginTop: 4, color: '#748078', fontSize: 11, lineHeight: 16 },
  cardFooter: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  countBadge: { flexShrink: 1, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EDF5EF' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3C8B5A' },
  countText: { color: '#397550', fontSize: 10, fontWeight: '800' },
  empty: { paddingVertical: 60, alignItems: 'center' },
  emptyTitle: { marginTop: 14, color: '#31483A', fontSize: 16, fontWeight: '700' },
  emptyText: { marginTop: 5, color: '#7D8981', fontSize: 12 },
});
