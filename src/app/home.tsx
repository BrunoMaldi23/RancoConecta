import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ComponentProps } from "react";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];
type LocationId = "lago-ranco" | "futrono" | "llifen" | "riñinahue";

type Location = {
  id: LocationId;
  name: string;
  area: string;
  description: string;
};

type Category = {
  id: string;
  name: string;
  description: string;
  icon: IconName;
  iconColor: string;
  iconBackground: string;
  locations: Partial<Record<LocationId, number>>;
};

const LOCATIONS: Location[] = [
  {
    id: "lago-ranco",
    name: "Lago Ranco",
    area: "Comuna de Lago Ranco",
    description: "Lago Ranco y sectores cercanos",
  },
  {
    id: "futrono",
    name: "Futrono",
    area: "Comuna de Futrono",
    description: "Futrono y sectores cercanos",
  },
  {
    id: "llifen",
    name: "Llifen",
    area: "Comuna de Futrono",
    description: "Llifen y sectores cercanos",
  },
  {
    id: "riñinahue",
    name: "Riñinahue",
    area: "Comuna de Lago Ranco",
    description: "Riñinahue y sectores cercanos",
  },
];

const CATEGORIES: Category[] = [
  {
    id: "hogar",
    name: "Hogar y reparaciones",
    description: "Gasfitería, electricidad, carpintería y pintura.",
    icon: "hammer-outline",
    iconColor: "#8B6421",
    iconBackground: "#F8ECD5",
    locations: { "lago-ranco": 12, futrono: 16, llifen: 5, riñinahue: 4 },
  },
  {
    id: "calefaccion",
    name: "Calefacción",
    description: "Estufas, pellet, leña y mantenciones.",
    icon: "flame-outline",
    iconColor: "#9A641D",
    iconBackground: "#F8ECD5",
    locations: { "lago-ranco": 8, futrono: 11, llifen: 4, riñinahue: 3 },
  },
  {
    id: "campo",
    name: "Jardín y parcela",
    description: "Poda, terrenos, cercos, riego y maquinaria.",
    icon: "leaf-outline",
    iconColor: "#287A51",
    iconBackground: "#E2F2E8",
    locations: { "lago-ranco": 14, futrono: 13, llifen: 7, riñinahue: 8 },
  },
  {
    id: "fletes",
    name: "Fletes y carga",
    description: "Mudanzas, carga, escombros y limpieza de fosas.",
    icon: "car-outline",
    iconColor: "#224D78",
    iconBackground: "#E8EEF4",
    locations: { "lago-ranco": 7, futrono: 10, llifen: 3, riñinahue: 4 },
  },
  {
    id: "gastronomia",
    name: "Comida y gastronomía",
    description: "Comida casera, reparto, repostería y catering.",
    icon: "restaurant-outline",
    iconColor: "#8B6421",
    iconBackground: "#F8ECD5",
    locations: { "lago-ranco": 18, futrono: 22, llifen: 6, riñinahue: 5 },
  },
  {
    id: "vehiculos",
    name: "Vehículos y asistencia",
    description: "Mecánica, vulcanización, grúas y baterías.",
    icon: "construct-outline",
    iconColor: "#647584",
    iconBackground: "#EEF3F7",
    locations: { "lago-ranco": 9, futrono: 14, llifen: 4, riñinahue: 3 },
  },
  {
    id: "agua",
    name: "Agua y sistemas hídricos",
    description: "Pozos, bombas, estanques, filtros y purificación.",
    icon: "water-outline",
    iconColor: "#2C689A",
    iconBackground: "#EAF1F7",
    locations: { "lago-ranco": 6, futrono: 8, llifen: 3, riñinahue: 5 },
  },
  {
    id: "energia",
    name: "Energía y conectividad",
    description: "Paneles solares, generadores, internet y alarmas.",
    icon: "flash-outline",
    iconColor: "#8B6421",
    iconBackground: "#F8ECD5",
    locations: { "lago-ranco": 5, futrono: 7, llifen: 2, riñinahue: 2 },
  },
  {
    id: "aseo",
    name: "Aseo y propiedades",
    description: "Aseo doméstico y cuidado de viviendas.",
    icon: "sparkles-outline",
    iconColor: "#6C5590",
    iconBackground: "#EEE8F7",
    locations: { "lago-ranco": 11, futrono: 15, llifen: 4 },
  },
  {
    id: "cuidados",
    name: "Salud y cuidados",
    description: "Enfermería, belleza, personas y mascotas.",
    icon: "heart-outline",
    iconColor: "#A74E6C",
    iconBackground: "#F8E4EB",
    locations: { "lago-ranco": 10, futrono: 17, llifen: 3, riñinahue: 2 },
  },
  {
    id: "profesionales",
    name: "Servicios profesionales",
    description: "Topografía, trámites, tecnología y fotografía.",
    icon: "briefcase-outline",
    iconColor: "#224D78",
    iconBackground: "#E8EEF4",
    locations: { "lago-ranco": 8, futrono: 12, llifen: 2, riñinahue: 2 },
  },
];

const MENU_OPTIONS: Array<{
  id: string;
  label: string;
  icon: IconName;
  route?:
    | "/home"
    | "/featured"
    | "/favorites"
    | "/history"
    | "/contacts";
}> = [
  { id: "home", label: "Inicio", icon: "home-outline", route: "/home" },
  { id: "categories", label: "Categorías", icon: "grid-outline" },
  {
    id: "featured",
    label: "Destacados",
    icon: "star-outline",
    route: "/featured",
  },
  {
    id: "favorites",
    label: "Favoritos",
    icon: "heart-outline",
    route: "/favorites",
  },
  {
    id: "history",
    label: "Historial",
    icon: "time-outline",
    route: "/history",
  },
  {
    id: "contacts",
    label: "Mis contactos",
    icon: "chatbubble-outline",
    route: "/contacts",
  },
];

export default function HomeScreen() {
  const [menuVisible, setMenuVisible] = useState(false);
  const [locationVisible, setLocationVisible] = useState(false);
  const [selectedLocationId, setSelectedLocationId] =
    useState<LocationId>("lago-ranco");
  const [search, setSearch] = useState("");
  const { width } = useWindowDimensions();
  const compact = width < 390;
  const numberOfColumns = width >= 1100 ? 4 : width >= 720 ? 3 : 2;
  const cardGap = 11;
  const listWidth = Math.min(width, 1240) - 32;
  const categoryCardWidth =
    (listWidth - cardGap * (numberOfColumns - 1)) / numberOfColumns;
  const selectedLocation = LOCATIONS.find(
    (item) => item.id === selectedLocationId,
  )!;

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();
    return CATEGORIES.filter((category) => {
      const available = (category.locations[selectedLocationId] ?? 0) > 0;
      const matches =
        !term ||
        category.name.toLowerCase().includes(term) ||
        category.description.toLowerCase().includes(term);
      return available && matches;
    });
  }, [search, selectedLocationId]);

  const providerTotal = filteredCategories.reduce(
    (total, category) => total + (category.locations[selectedLocationId] ?? 0),
    0,
  );

  const selectLocation = (location: Location) => {
    setSelectedLocationId(location.id);
    setSearch("");
    setLocationVisible(false);
  };

  const contactAdministrator = () => {
    Alert.alert(
      "Contactar administrador",
      "Elige cómo quieres solicitar alta, corrección o información de un servicio.",
      [
        {
          text: "WhatsApp",
          onPress: () =>
            Linking.openURL(
              "https://wa.me/56987654321?text=Hola%2C%20quiero%20contactar%20al%20administrador%20de%20RancoConecta.",
            ),
        },
        { text: "Llamar", onPress: () => Linking.openURL("tel:+56987654321") },
        {
          text: "Correo",
          onPress: () =>
            Linking.openURL(
              "mailto:administracion@rancoconecta.cl?subject=Contacto%20RancoConecta",
            ),
        },
        { text: "Cancelar", style: "cancel" },
      ],
    );
  };

  const openAdministratorAccess = () => {
    setMenuVisible(false);
    router.push("/admin");
  };

  const handleMenuPress = (option: (typeof MENU_OPTIONS)[number]) => {
    setMenuVisible(false);

    if (option.id === "categories") {
      setSearch("");
      return;
    }

    if (option.route && option.route !== "/home") {
      router.push(option.route);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        key={numberOfColumns}
        data={filteredCategories}
        numColumns={numberOfColumns}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.categoryRow}
        contentContainerStyle={styles.pageContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Pressable
                onPress={() => setMenuVisible(true)}
                style={({ pressed }) => [
                  styles.headerButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="menu" size={25} color="#1F446A" />
              </Pressable>
              <View style={styles.brand}>
                <Text style={styles.brandPrimary}>Ranco</Text>
                <Text style={styles.brandAccent}>Conecta</Text>
              </View>
              <View style={styles.headerButtonSpacer} />
            </View>

            <View style={[styles.hero, compact && styles.heroCompact]}>
              <Text style={styles.heroEyebrow}>SERVICIOS LOCALES</Text>
              <Text
                style={[styles.heroTitle, compact && styles.heroTitleCompact]}
              >
                Encuentra ayuda cerca de ti
              </Text>
              <Text style={styles.heroDescription}>
                Busca prestadores disponibles en la localidad que necesitas.
              </Text>
              <Pressable
                onPress={() => setLocationVisible(true)}
                style={({ pressed }) => [
                  styles.locationSelector,
                  pressed && styles.locationSelectorPressed,
                ]}
              >
                <View style={styles.locationIcon}>
                  <Ionicons name="location" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.locationInformation}>
                  <Text style={styles.locationLabel}>BUSCAR SERVICIOS EN</Text>
                  <Text style={styles.locationName}>
                    {selectedLocation.name}
                  </Text>
                </View>
                <View style={styles.chevronCircle}>
                  <Ionicons name="chevron-down" size={18} color="#224D78" />
                </View>
              </Pressable>
            </View>

            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={21} color="#687786" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={`Buscar servicios en ${selectedLocation.name}`}
                placeholderTextColor="#5F7080"
                style={styles.searchInput}
              />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch("")}>
                  <Ionicons name="close-circle" size={21} color="#87929E" />
                </Pressable>
              )}
            </View>

            <View style={styles.contextRow}>
              <View style={styles.contextLocation}>
                <Ionicons name="navigate-outline" size={15} color="#224D78" />
                <Text numberOfLines={1} style={styles.contextText}>
                  {selectedLocation.description}
                </Text>
              </View>
              <Text style={styles.providerCount}>
                {providerTotal} prestadores
              </Text>
            </View>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionCopy}>
                <Text style={styles.sectionTitle}>Rubros principales</Text>
                <Text style={styles.sectionSubtitle}>
                  Entra a un rubro para ver sus servicios específicos
                </Text>
              </View>
              <View style={styles.counter}>
                <Text style={styles.counterText}>
                  {filteredCategories.length}
                </Text>
              </View>
            </View>
          </>
        }
        renderItem={({ item }) => {
          const count = item.locations[selectedLocationId] ?? 0;
          return (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/category/[categoryId]",
                  params: {
                    categoryId: item.id,
                    locationId: selectedLocation.id,
                    locationName: selectedLocation.name,
                  },
                })
              }
              style={({ pressed }) => [
                styles.categoryCard,
                { width: categoryCardWidth },
                pressed && styles.categoryCardPressed,
              ]}
            >
              <View style={styles.cardTopRow}>
                <View
                  style={[
                    styles.categoryIcon,
                    { backgroundColor: item.iconBackground },
                  ]}
                >
                  <Ionicons name={item.icon} size={25} color={item.iconColor} />
                </View>
                <View style={styles.availableBadge}>
                  <View style={styles.availableDot} />
                  <Text style={styles.availableText}>{count}</Text>
                </View>
              </View>
              <Text numberOfLines={2} style={styles.categoryName}>
                {item.name}
              </Text>
              <Text numberOfLines={2} style={styles.categoryDescription}>
                {item.description}
              </Text>
              <View style={styles.exploreContainer}>
                <Text style={styles.exploreText}>Ver servicios</Text>
                <Ionicons name="arrow-forward" size={15} color="#224D78" />
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={42} color="#99A4AF" />
            <Text style={styles.emptyTitle}>
              Sin resultados en {selectedLocation.name}
            </Text>
            <Text style={styles.emptyDescription}>
              Prueba con otro término o cambia de localidad.
            </Text>
          </View>
        }
      />

      <Modal
        visible={locationVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLocationVisible(false)}
      >
        <View style={styles.centeredModal}>
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setLocationVisible(false)}
          />
          <View style={styles.locationSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Elige una localidad</Text>
                <Text style={styles.sheetSubtitle}>
                  Mostraremos los servicios disponibles en ese sector.
                </Text>
              </View>
              <Pressable
                onPress={() => setLocationVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={22} color="#33485D" />
              </Pressable>
            </View>
            <View style={styles.locationList}>
              {LOCATIONS.map((location) => {
                const active = location.id === selectedLocationId;
                const total = CATEGORIES.reduce(
                  (sum, category) =>
                    sum + (category.locations[location.id] ?? 0),
                  0,
                );
                return (
                  <Pressable
                    key={location.id}
                    onPress={() => selectLocation(location)}
                    style={({ pressed }) => [
                      styles.locationOption,
                      active && styles.locationOptionActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.optionIcon,
                        active && styles.optionIconActive,
                      ]}
                    >
                      <Ionicons
                        name={active ? "location" : "location-outline"}
                        size={20}
                        color={active ? "#FFFFFF" : "#224D78"}
                      />
                    </View>
                    <View style={styles.optionInformation}>
                      <Text
                        style={[
                          styles.optionName,
                          active && styles.optionNameActive,
                        ]}
                      >
                        {location.name}
                      </Text>
                      <Text style={styles.optionArea}>
                        {location.area} · {total} prestadores
                      </Text>
                    </View>
                    {active ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={23}
                        color="#224D78"
                      />
                    ) : (
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color="#99A4AF"
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalContainer}>
          <Pressable
            onPress={() => setMenuVisible(false)}
            style={styles.modalOverlay}
          />
          <SafeAreaView style={styles.drawer}>
            <ScrollView
              contentContainerStyle={styles.drawerContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.drawerHeader}>
                <View style={styles.drawerLogo}>
                  <Ionicons name="location" size={25} color="#FFFFFF" />
                </View>
                <View style={styles.drawerBrand}>
                  <Text style={styles.drawerBrandPrimary}>Ranco</Text>
                  <Text style={styles.drawerBrandAccent}>Conecta</Text>
                </View>
                <Pressable
                  onPress={() => setMenuVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={22} color="#33485D" />
                </Pressable>
              </View>
              <Pressable
                onPress={() => {
                  setMenuVisible(false);
                  setLocationVisible(true);
                }}
                style={styles.drawerLocation}
              >
                <Ionicons name="location-outline" size={20} color="#224D78" />
                <View style={styles.drawerLocationInformation}>
                  <Text style={styles.drawerLocationLabel}>
                    Ubicación seleccionada
                  </Text>
                  <Text style={styles.drawerLocationValue}>
                    {selectedLocation.name}, Los Ríos
                  </Text>
                </View>
                <Ionicons name="swap-horizontal" size={18} color="#224D78" />
              </Pressable>
              <View style={styles.menuList}>
                {MENU_OPTIONS.map((option, index) => (
                  <Pressable
                    key={option.id}
                    onPress={() => handleMenuPress(option)}
                    style={({ pressed }) => [
                      styles.menuOption,
                      index === 0 && styles.activeMenuOption,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Ionicons
                      name={option.icon}
                      size={21}
                      color={index === 0 ? "#224D78" : "#647584"}
                    />
                    <Text
                      style={[
                        styles.menuOptionText,
                        index === 0 && styles.activeMenuOptionText,
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={17}
                      color="#99A4AF"
                    />
                  </Pressable>
                ))}
              </View>
              <Pressable
                onPress={contactAdministrator}
                style={({ pressed }) => [
                  styles.adminContact,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={20}
                  color="#224D78"
                />
                <View style={styles.adminContactText}>
                  <Text style={styles.adminContactTitle}>
                    Contactar administrador
                  </Text>
                  <Text style={styles.adminContactDescription}>
                    Solicita agregar, corregir o destacar un servicio.
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={17} color="#224D78" />
              </Pressable>

              <Pressable
                onPress={openAdministratorAccess}
                style={styles.adminAccess}
              >
                <Text style={styles.adminAccessText}>Acceso a administración</Text>
              </Pressable>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F7F8F4" },
  pageContent: {
    width: "100%",
    maxWidth: 1240,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingBottom: 42,
  },
  header: {
    height: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E6EB",
  },
  headerButtonSpacer: {
    width: 43,
    height: 43,
  },
  pressed: { opacity: 0.72 },
  brand: { flexDirection: "row" },
  brandPrimary: {
    color: "#1F446A",
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: 0,
  },
  brandAccent: {
    color: "#D89222",
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: 0,
  },
  hero: {
    minHeight: 246,
    padding: 25,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E6EB",
    overflow: "hidden",
  },
  heroCompact: { paddingHorizontal: 21 },
  heroEyebrow: {
    color: "#B97012",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  heroTitle: {
    maxWidth: 520,
    marginTop: 10,
    color: "#1F446A",
    fontSize: 31,
    lineHeight: 37,
    fontWeight: "800",
    letterSpacing: 0,
  },
  heroTitleCompact: { fontSize: 29, lineHeight: 35 },
  heroDescription: {
    maxWidth: 520,
    marginTop: 9,
    color: "#42586C",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
  },
  locationSelector: {
    minHeight: 70,
    marginTop: 23,
    padding: 10,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F8F4",
    borderWidth: 1,
    borderColor: "#E1E6EB",
  },
  locationSelectorPressed: { transform: [{ scale: 0.99 }], opacity: 0.94 },
  locationIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D89222",
  },
  locationInformation: { flex: 1, marginLeft: 12 },
  locationLabel: {
    color: "#647584",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  locationName: {
    marginTop: 3,
    color: "#1F446A",
    fontSize: 17,
    fontWeight: "800",
  },
  chevronCircle: {
    width: 35,
    height: 35,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF1F7",
  },
  searchContainer: {
    minHeight: 56,
    marginTop: 14,
    paddingHorizontal: 17,
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
    color: "#1F446A",
    fontSize: 14,
    fontWeight: "500",
  },
  contextRow: {
    marginTop: 12,
    paddingHorizontal: 3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  contextLocation: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  contextText: { flex: 1, color: "#4F6171", fontSize: 12, fontWeight: "500" },
  providerCount: { color: "#224D78", fontSize: 12, fontWeight: "800" },
  sectionHeader: {
    marginTop: 28,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  sectionCopy: { flex: 1 },
  sectionTitle: {
    color: "#1F446A",
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: 0,
  },
  sectionSubtitle: { marginTop: 4, color: "#4F6171", fontSize: 12, fontWeight: "500" },
  counter: {
    minWidth: 35,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 11,
    backgroundColor: "#EAF1F7",
  },
  counterText: {
    color: "#224D78",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },
  categoryRow: { gap: 11 },
  categoryCard: {
    minHeight: 205,
    marginBottom: 11,
    padding: 15,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E6EB",
  },
  categoryCardPressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  availableBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#EDF3F7",
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2C689A",
  },
  availableText: { color: "#285B87", fontSize: 11, fontWeight: "800" },
  categoryName: {
    minHeight: 42,
    marginTop: 14,
    color: "#243F59",
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
  },
  categoryDescription: {
    flex: 1,
    marginTop: 4,
    color: "#536678",
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "500",
  },
  exploreContainer: {
    marginTop: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  exploreText: { color: "#224D78", fontSize: 11, fontWeight: "800" },
  emptyContainer: { paddingVertical: 60, alignItems: "center" },
  emptyTitle: {
    marginTop: 14,
    color: "#33485D",
    fontSize: 16,
    fontWeight: "700",
  },
  emptyDescription: { marginTop: 6, color: "#7A8793", fontSize: 12 },
  centeredModal: { flex: 1, justifyContent: "flex-end" },
  modalContainer: { flex: 1, flexDirection: "row" },
  modalOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(24,54,83,0.52)",
  },
  locationSheet: {
    width: "100%",
    maxHeight: "80%",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: "#FFFFFF",
  },
  sheetHandle: {
    width: 42,
    height: 5,
    marginBottom: 18,
    borderRadius: 3,
    alignSelf: "center",
    backgroundColor: "#DDE5EC",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 15,
  },
  sheetTitle: { color: "#1F446A", fontSize: 22, fontWeight: "800" },
  sheetSubtitle: {
    maxWidth: 290,
    marginTop: 5,
    color: "#4F6171",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
  },
  locationList: { marginTop: 20, gap: 9 },
  locationOption: {
    minHeight: 68,
    padding: 11,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E1E6EB",
  },
  locationOptionActive: { backgroundColor: "#E8EEF4", borderColor: "#B8CADB" },
  optionIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8EEF4",
  },
  optionIconActive: { backgroundColor: "#224D78" },
  optionInformation: { flex: 1, marginLeft: 12 },
  optionName: { color: "#33485D", fontSize: 15, fontWeight: "700" },
  optionNameActive: { color: "#1F446A", fontWeight: "800" },
  optionArea: { marginTop: 3, color: "#536678", fontSize: 11, fontWeight: "500" },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF3F7",
  },
  drawer: {
    width: "84%",
    maxWidth: 365,
    height: "100%",
    backgroundColor: "#FFFFFF",
  },
  drawerContent: { flexGrow: 1, padding: 21 },
  drawerHeader: { flexDirection: "row", alignItems: "center" },
  drawerLogo: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#224D78",
  },
  drawerBrand: { flex: 1, marginLeft: 10, flexDirection: "row" },
  drawerBrandPrimary: { color: "#1F446A", fontSize: 18, fontWeight: "800" },
  drawerBrandAccent: { color: "#D89222", fontSize: 18, fontWeight: "800" },
  drawerLocation: {
    marginTop: 25,
    padding: 14,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF3F7",
  },
  drawerLocationInformation: { flex: 1, marginLeft: 10 },
  drawerLocationLabel: { color: "#536678", fontSize: 10, fontWeight: "700" },
  drawerLocationValue: {
    marginTop: 2,
    color: "#284B6E",
    fontSize: 13,
    fontWeight: "700",
  },
  menuList: { marginTop: 22, gap: 5 },
  menuOption: {
    minHeight: 50,
    paddingHorizontal: 12,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  activeMenuOption: { backgroundColor: "#EAF1F7" },
  menuOptionText: {
    flex: 1,
    marginLeft: 12,
    color: "#647584",
    fontSize: 14,
    fontWeight: "600",
  },
  activeMenuOptionText: { color: "#224D78", fontWeight: "700" },
  adminContact: {
    minHeight: 74,
    marginTop: 28,
    padding: 14,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE5EC",
  },
  adminContactText: { flex: 1 },
  adminContactTitle: {
    color: "#1F446A",
    fontSize: 13,
    fontWeight: "800",
  },
  adminContactDescription: {
    marginTop: 3,
    color: "#687786",
    fontSize: 11,
    lineHeight: 15,
  },
  adminAccess: {
    marginTop: 18,
    alignSelf: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  adminAccessText: {
    color: "#9AA5AF",
    fontSize: 10,
    fontWeight: "600",
  },
});
