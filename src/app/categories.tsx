import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import type { ComponentProps } from "react";
import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];
type LocationId = "lago-ranco" | "futrono" | "llifen" | "riñinahue";

type Category = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: IconName;
  color: string;
  background: string;
  locations: Partial<Record<LocationId, number>>;
};

const CATEGORIES: Category[] = [
  {
    id: "hogar",
    name: "Hogar y reparaciones",
    shortName: "Hogar",
    description: "Gasfiteria, electricidad, carpinteria y pintura.",
    icon: "hammer-outline",
    color: "#8B6421",
    background: "#F8ECD5",
    locations: { "lago-ranco": 12, futrono: 16, llifen: 5, riñinahue: 4 },
  },
  {
    id: "calefaccion",
    name: "Calefaccion",
    shortName: "Calefaccion",
    description: "Estufas, pellet, lena y mantenciones.",
    icon: "flame-outline",
    color: "#B94738",
    background: "#F9E4E0",
    locations: { "lago-ranco": 8, futrono: 11, llifen: 4, riñinahue: 3 },
  },
  {
    id: "campo",
    name: "Jardin y parcela",
    shortName: "Jardin y parcela",
    description: "Poda, terrenos, cercos, riego y maquinaria.",
    icon: "leaf-outline",
    color: "#287A51",
    background: "#E2F2E8",
    locations: { "lago-ranco": 14, futrono: 13, llifen: 7, riñinahue: 8 },
  },
  {
    id: "fletes",
    name: "Fletes y carga",
    shortName: "Fletes",
    description: "Mudanzas, carga, escombros y limpieza de fosas.",
    icon: "car-outline",
    color: "#224D78",
    background: "#E8EEF4",
    locations: { "lago-ranco": 7, futrono: 10, llifen: 3, riñinahue: 4 },
  },
  {
    id: "gastronomia",
    name: "Comida y gastronomia",
    shortName: "Gastronomia",
    description: "Comida casera, reparto, reposteria y catering.",
    icon: "restaurant-outline",
    color: "#A46B22",
    background: "#F8ECD5",
    locations: { "lago-ranco": 18, futrono: 22, llifen: 6, riñinahue: 5 },
  },
  {
    id: "vehiculos",
    name: "Vehiculos y asistencia",
    shortName: "Vehiculos",
    description: "Mecanica, vulcanizacion, gruas y baterias.",
    icon: "construct-outline",
    color: "#647584",
    background: "#EEF3F7",
    locations: { "lago-ranco": 9, futrono: 14, llifen: 4, riñinahue: 3 },
  },
  {
    id: "agua",
    name: "Agua y sistemas hidricos",
    shortName: "Agua",
    description: "Pozos, bombas, estanques, filtros y purificacion.",
    icon: "water-outline",
    color: "#26718A",
    background: "#DFF1F5",
    locations: { "lago-ranco": 6, futrono: 8, llifen: 3, riñinahue: 5 },
  },
  {
    id: "energia",
    name: "Energia y conectividad",
    shortName: "Energia",
    description: "Paneles solares, generadores, internet y alarmas.",
    icon: "flash-outline",
    color: "#8B6421",
    background: "#F8ECD5",
    locations: { "lago-ranco": 5, futrono: 7, llifen: 2, riñinahue: 2 },
  },
  {
    id: "aseo",
    name: "Aseo y propiedades",
    shortName: "Aseo",
    description: "Aseo domestico y cuidado de viviendas.",
    icon: "sparkles-outline",
    color: "#6C5590",
    background: "#EEE8F7",
    locations: { "lago-ranco": 11, futrono: 15, llifen: 4 },
  },
  {
    id: "cuidados",
    name: "Salud y cuidados",
    shortName: "Cuidados",
    description: "Enfermeria, belleza, personas y mascotas.",
    icon: "heart-outline",
    color: "#A74E6C",
    background: "#F8E4EB",
    locations: { "lago-ranco": 10, futrono: 17, llifen: 3, riñinahue: 2 },
  },
  {
    id: "profesionales",
    name: "Servicios profesionales",
    shortName: "Profesionales",
    description: "Topografia, tramites, tecnologia y fotografia.",
    icon: "briefcase-outline",
    color: "#224D78",
    background: "#E8EEF4",
    locations: { "lago-ranco": 8, futrono: 12, llifen: 2, riñinahue: 2 },
  },
];

const isLocationId = (value?: string): value is LocationId =>
  value === "lago-ranco" ||
  value === "futrono" ||
  value === "llifen" ||
  value === "riñinahue";

export default function CategoriesScreen() {
  const params = useLocalSearchParams<{
    locationId?: string;
    locationName?: string;
  }>();
  const rawLocationId = Array.isArray(params.locationId)
    ? params.locationId[0]
    : params.locationId;
  const rawLocationName = Array.isArray(params.locationName)
    ? params.locationName[0]
    : params.locationName;
  const locationId: LocationId = isLocationId(rawLocationId)
    ? rawLocationId
    : "lago-ranco";
  const locationName = rawLocationName || "Lago Ranco";
  const [search, setSearch] = useState("");

  const categories = useMemo(() => {
    const term = search.trim().toLowerCase();
    return CATEGORIES.filter((category) => {
      const count = category.locations[locationId] ?? 0;
      const matches =
        !term ||
        category.name.toLowerCase().includes(term) ||
        category.shortName.toLowerCase().includes(term) ||
        category.description.toLowerCase().includes(term);
      return count > 0 && matches;
    });
  }, [locationId, search]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.topbar}>
              <Pressable
                onPress={() => router.back()}
                style={({ pressed }) => [
                  styles.topbarButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="arrow-back" size={23} color="#1F446A" />
              </Pressable>
              <View style={styles.topbarTitleWrap}>
                <Text style={styles.topbarTitle}>Categorias</Text>
                <Text style={styles.topbarSubtitle}>{locationName}</Text>
              </View>
              <Pressable
                onPress={() => router.replace("/home")}
                style={({ pressed }) => [
                  styles.topbarButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="home-outline" size={21} color="#224D78" />
              </Pressable>
            </View>

            <View style={styles.sectionIntro}>
              <Text style={styles.sectionTitle}>Selecciona categoria</Text>
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={20} color="#687786" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar rubro: hogar, agua, energia..."
                placeholderTextColor="#87929E"
                style={styles.searchInput}
              />
              {!!search && (
                <Pressable onPress={() => setSearch("")}>
                  <Ionicons name="close-circle" size={20} color="#87929E" />
                </Pressable>
              )}
            </View>
          </>
        }
        renderItem={({ item }) => {
          const count = item.locations[locationId] ?? 0;

          return (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/category/[categoryId]",
                  params: {
                    categoryId: item.id,
                    locationId,
                    locationName,
                  },
                })
              }
              style={({ pressed }) => [
                styles.categoryRow,
                pressed && styles.rowPressed,
              ]}
            >
              <View style={[styles.iconBox, { backgroundColor: item.background }]}>
                <Ionicons name={item.icon} size={23} color={item.color} />
              </View>
              <View style={styles.categoryCopy}>
                <Text style={styles.categoryName}>{item.shortName}</Text>
                <Text numberOfLines={1} style={styles.categoryDescription}>
                  {item.description}
                </Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{count}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#99A4AF" />
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={38} color="#99A4AF" />
            <Text style={styles.emptyTitle}>Sin categorias</Text>
            <Text style={styles.emptyText}>Prueba con otra palabra.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F8F4" },
  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingBottom: 34,
  },
  topbar: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
  },
  topbarButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E6EB",
  },
  topbarTitleWrap: { flex: 1, marginHorizontal: 12, alignItems: "center" },
  topbarTitle: {
    color: "#1F446A",
    fontSize: 17,
    fontWeight: "800",
  },
  topbarSubtitle: {
    marginTop: 2,
    color: "#687786",
    fontSize: 11,
    fontWeight: "700",
  },
  pressed: { opacity: 0.72 },
  sectionIntro: {
    marginTop: 3,
    marginBottom: 2,
  },
  sectionTitle: {
    color: "#1F446A",
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
  },
  searchBox: {
    minHeight: 55,
    marginTop: 13,
    marginBottom: 14,
    paddingHorizontal: 16,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE5EC",
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 15,
    color: "#253F59",
    fontSize: 14,
  },
  categoryRow: {
    minHeight: 74,
    marginBottom: 9,
    padding: 12,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E6EB",
  },
  rowPressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryCopy: { flex: 1, minWidth: 0, marginLeft: 12 },
  categoryName: {
    color: "#243F59",
    fontSize: 15,
    fontWeight: "900",
  },
  categoryDescription: {
    marginTop: 4,
    color: "#71808C",
    fontSize: 11,
    lineHeight: 15,
  },
  countBadge: {
    minWidth: 32,
    height: 32,
    marginHorizontal: 8,
    paddingHorizontal: 8,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF1F7",
  },
  countText: {
    color: "#224D78",
    fontSize: 12,
    fontWeight: "900",
  },
  empty: {
    paddingVertical: 52,
    alignItems: "center",
  },
  emptyTitle: {
    marginTop: 13,
    color: "#33485D",
    fontSize: 16,
    fontWeight: "800",
  },
  emptyText: {
    marginTop: 5,
    color: "#7A8793",
    fontSize: 12,
  },
});
