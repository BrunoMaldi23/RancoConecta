import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
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

import { useAuth } from "../contexts/auth";

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

const MENU_OPTIONS: {
  id: string;
  label: string;
  icon: IconName;
  route?:
    | "/home"
    | "/categories"
    | "/featured"
    | "/favorites"
    | "/history"
    | "/contacts";
}[] = [
  { id: "home", label: "Inicio", icon: "home-outline", route: "/home" },
  {
    id: "categories",
    label: "Categorías",
    icon: "grid-outline",
    route: "/categories",
  },
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
  const { user } = useAuth();
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
  const isMunicipalAdmin = user?.role === "municipal_admin";
  const isCommerce = user?.role === "commerce";
  const heroTitle = "¿Qué servicio necesitas?";
  const primaryActionLabel = isMunicipalAdmin
    ? "Panel"
    : isCommerce
      ? "Mi ficha"
      : "Inscribir";
  const primaryActionIcon: IconName = isMunicipalAdmin
    ? "shield-checkmark-outline"
    : "storefront-outline";
  const primaryActionRoute = isMunicipalAdmin ? "/admin" : "/provider-register";

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

  const handleMenuPress = (option: (typeof MENU_OPTIONS)[number]) => {
    setMenuVisible(false);

    if (option.id === "categories") {
      router.push({
        pathname: "/categories",
        params: {
          locationId: selectedLocation.id,
          locationName: selectedLocation.name,
        },
      });
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
              <Pressable
                onPress={() => {
                  setSearch("");
                }}
                style={({ pressed }) => [
                  styles.brand,
                  pressed && styles.pressed,
                ]}
              >
                <Image
                  source={require("../../assets/images/logo-ranco.png")}
                  style={styles.brandLogo}
                  contentFit="contain"
                />
                <View style={styles.brandCopy}>
                  <Text style={styles.brandPrimary}>Ranco</Text>
                  <Text style={styles.brandAccent}>Conecta</Text>
                </View>
              </Pressable>
              <Pressable
                onPress={() => router.push(user ? "/profile" : "/")}
                style={({ pressed }) => [
                  styles.headerButton,
                  user && styles.headerButtonActive,
                  !user && styles.headerLoginButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name={user ? "person" : "log-in-outline"}
                  size={user ? 20 : 22}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>
            <View style={styles.topDivider} />

            <View style={[styles.hero, compact && styles.heroCompact]}>
              <Text
                style={[styles.heroTitle, compact && styles.heroTitleCompact]}
              >
                {heroTitle}
              </Text>
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

            <View style={styles.homeActions}>
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
              <Pressable
                onPress={() => router.push(primaryActionRoute)}
                style={({ pressed }) => [
                  styles.commerceCta,
                  user && styles.commerceCtaActive,
                  pressed && styles.locationSelectorPressed,
                ]}
              >
                <Ionicons
                  name={primaryActionIcon}
                  size={19}
                  color={user ? "#FFFFFF" : "#224D78"}
                />
                <Text style={[styles.commerceCtaText, user && styles.commerceCtaTextActive]}>
                  {primaryActionLabel}
                </Text>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={user ? "#FFFFFF" : "#224D78"}
                />
              </Pressable>
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
                  <Ionicons name={item.icon} size={22} color={item.iconColor} />
                </View>
                <View style={styles.availableBadge}>
                  <View style={styles.availableDot} />
                  <Text style={styles.availableText}>{count}</Text>
                </View>
              </View>
              <Text numberOfLines={2} style={styles.categoryName}>
                {item.name}
              </Text>
              <Text numberOfLines={1} style={styles.categoryDescription}>
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
                  <Image
                    source={require("../../assets/images/logo-ranco.png")}
                    style={styles.drawerLogoImage}
                    contentFit="contain"
                  />
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
              <View style={styles.accountBox}>
                <View style={styles.accountIcon}>
                  <Ionicons
                    name={user ? "person" : "person-outline"}
                    size={20}
                    color="#224D78"
                  />
                </View>
                <View style={styles.accountInfo}>
                  <Text numberOfLines={1} style={styles.accountTitle}>
                    {user ? user.name : "Modo visitante"}
                  </Text>
                  <Text numberOfLines={1} style={styles.accountText}>
                    {user
                      ? user.email
                      : "Explora servicios sin iniciar sesión."}
                  </Text>
                </View>
                <Pressable
                  onPress={() => {
                    setMenuVisible(false);
                    router.push(user ? "/profile" : "/");
                  }}
                  style={styles.accountAction}
                >
                  <Ionicons
                    name={user ? "chevron-forward" : "person-add-outline"}
                    size={18}
                    color="#FFFFFF"
                  />
                </Pressable>
              </View>
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
                <View style={styles.adminContactIcon}>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={18}
                    color="#224D78"
                  />
                </View>
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
    minHeight: 72,
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
  headerButtonActive: {
    backgroundColor: "#224D78",
    borderColor: "#224D78",
  },
  headerLoginButton: {
    backgroundColor: "#B8423B",
    borderColor: "#C9362C",
  },
  headerButtonSpacer: {
    width: 43,
    height: 43,
  },
  pressed: { opacity: 0.72 },
  brand: {
    minHeight: 48,
    flex: 1,
    marginHorizontal: 10,
    paddingHorizontal: 10,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E6EB",
  },
  brandLogo: {
    width: 34,
    height: 34,
    marginRight: 9,
  },
  brandCopy: { flexDirection: "row", alignItems: "center" },
  brandPrimary: {
    color: "#1F446A",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0,
  },
  brandAccent: {
    color: "#D89222",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0,
  },
  hero: {
    paddingTop: 8,
    paddingBottom: 2,
  },
  topDivider: {
    height: 1,
    marginBottom: 14,
    backgroundColor: "#E6EBEF",
  },
  heroCompact: {},
  heroTitle: {
    maxWidth: 520,
    color: "#1F446A",
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700",
    letterSpacing: 0,
  },
  heroTitleCompact: { fontSize: 21, lineHeight: 27 },
  homeActions: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationSelector: {
    minHeight: 50,
    flex: 1,
    padding: 8,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E6EB",
  },
  locationSelectorPressed: { transform: [{ scale: 0.99 }], opacity: 0.94 },
  locationIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D89222",
  },
  locationInformation: { flex: 1, marginLeft: 10 },
  locationLabel: {
    color: "#647584",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  locationName: {
    marginTop: 2,
    color: "#1F446A",
    fontSize: 13,
    fontWeight: "700",
  },
  chevronCircle: {
    width: 29,
    height: 29,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF1F7",
  },
  commerceCta: {
    minHeight: 50,
    minWidth: 92,
    paddingHorizontal: 10,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    backgroundColor: "#EAF1F7",
  },
  commerceCtaActive: { backgroundColor: "#224D78" },
  commerceCtaText: {
    color: "#224D78",
    fontSize: 11,
    fontWeight: "700",
  },
  commerceCtaTextActive: { color: "#FFFFFF" },
  searchContainer: {
    minHeight: 52,
    marginTop: 12,
    paddingHorizontal: 15,
    borderRadius: 16,
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
    marginTop: 23,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  sectionCopy: { flex: 1 },
  sectionTitle: {
    color: "#1F446A",
    fontSize: 21,
    fontWeight: "700",
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
    fontWeight: "700",
    textAlign: "center",
  },
  categoryRow: { gap: 9 },
  categoryCard: {
    minHeight: 154,
    marginBottom: 9,
    padding: 12,
    borderRadius: 17,
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
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  availableBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 9,
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
  availableText: { color: "#285B87", fontSize: 10, fontWeight: "700" },
  categoryName: {
    minHeight: 36,
    marginTop: 11,
    color: "#243F59",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
  },
  categoryDescription: {
    marginTop: 3,
    color: "#536678",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "500",
  },
  exploreContainer: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  exploreText: { color: "#224D78", fontSize: 10, fontWeight: "700" },
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
    width: "82%",
    maxWidth: 350,
    height: "100%",
    backgroundColor: "#FBFCF8",
  },
  drawerContent: { flexGrow: 1, padding: 16 },
  drawerHeader: {
    minHeight: 50,
    flexDirection: "row",
    alignItems: "center",
  },
  drawerLogo: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E6EB",
  },
  drawerLogoImage: { width: 35, height: 35 },
  drawerBrand: { flex: 1, marginLeft: 10, flexDirection: "row" },
  drawerBrandPrimary: { color: "#1F446A", fontSize: 16, fontWeight: "700" },
  drawerBrandAccent: { color: "#D89222", fontSize: 16, fontWeight: "700" },
  drawerLocation: {
    minHeight: 47,
    marginTop: 16,
    paddingHorizontal: 11,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F5F8",
    borderWidth: 1,
    borderColor: "#E1E8EE",
  },
  drawerLocationInformation: { flex: 1, marginLeft: 9 },
  drawerLocationLabel: { color: "#536678", fontSize: 10, fontWeight: "600" },
  drawerLocationValue: {
    marginTop: 2,
    color: "#284B6E",
    fontSize: 13,
    fontWeight: "700",
  },
  accountBox: {
    minHeight: 66,
    marginTop: 12,
    padding: 10,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE5EC",
  },
  accountIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0F5F8",
  },
  accountInfo: { flex: 1, minWidth: 0 },
  accountTitle: {
    color: "#1F446A",
    fontSize: 13,
    fontWeight: "700",
  },
  accountText: {
    marginTop: 3,
    color: "#687786",
    fontSize: 10,
    lineHeight: 14,
  },
  accountAction: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C9362C",
  },
  menuList: {
    marginTop: 12,
    paddingVertical: 5,
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E1E6EB",
  },
  menuOption: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
  },
  activeMenuOption: { backgroundColor: "#EAF1F7" },
  menuOptionText: {
    flex: 1,
    marginLeft: 11,
    color: "#647584",
    fontSize: 13,
    fontWeight: "600",
  },
  activeMenuOptionText: { color: "#224D78", fontWeight: "700" },
  adminContact: {
    minHeight: 66,
    marginTop: 12,
    padding: 11,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDE5EC",
  },
  adminContactIcon: {
    width: 35,
    height: 35,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EAF1F7",
  },
  adminContactText: { flex: 1 },
  adminContactTitle: {
    color: "#1F446A",
    fontSize: 13,
    fontWeight: "700",
  },
  adminContactDescription: {
    marginTop: 3,
    color: "#687786",
    fontSize: 10,
    lineHeight: 14,
  },
});
