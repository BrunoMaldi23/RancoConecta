import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ComponentProps } from "react";
import { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import { useAppData, type AppCategory } from "../contexts/app-data";
import { useAuth } from "../contexts/auth";
import {
  CONTACT_ADMIN_EMAIL,
  CONTACT_ADMIN_PHONE,
  CONTACT_ADMIN_WHATSAPP,
  mailtoUrl,
  telUrl,
  whatsappUrl,
} from "../lib/contact-config";

type IconName = ComponentProps<typeof Ionicons>["name"];

type LocationId =
  | "lago-ranco"
  | "futrono"
  | "llifen"
  | "riñinahue";

type Location = {
  id: LocationId;
  name: string;
  area: string;
  description: string;
};

type CategoryWithCounts = AppCategory & {
  locations: Partial<Record<LocationId, number>>;
};

const APP_FONT = Platform.select({
  web:
    'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  ios: "System",
  android: "sans-serif",
  default: "System",
});

const APP_FONT_MEDIUM = Platform.select({
  web:
    'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  ios: "System",
  android: "sans-serif-medium",
  default: "System",
});

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
  {
    id: "home",
    label: "Inicio",
    icon: "home-outline",
    route: "/home",
  },
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

  const {
    providers,
    providersStatus,
    categories,
    categoriesStatus,
  } = useAppData();

  const [menuVisible, setMenuVisible] = useState(false);
  const [locationVisible, setLocationVisible] =
    useState(false);

  const [selectedLocationId, setSelectedLocationId] =
    useState<LocationId>("lago-ranco");

  const [search, setSearch] = useState("");

  const { width } = useWindowDimensions();

  const compact = width < 390;

  const numberOfColumns =
    width >= 1100 ? 4 : width >= 720 ? 3 : 2;

  const cardGap = 11;

  const listWidth = Math.min(width, 1240) - 32;

  const categoryCardWidth =
    (listWidth - cardGap * (numberOfColumns - 1)) /
    numberOfColumns;

  const selectedLocation = LOCATIONS.find(
    (item) => item.id === selectedLocationId,
  )!;

  const isMunicipalAdmin =
    user?.role === "municipal_admin";

  const isCommerce =
    user?.role === "commerce";

  const primaryActionLabel = isMunicipalAdmin
    ? "Panel"
    : isCommerce
      ? "Mi ficha"
      : "Inscribir";

  const primaryActionIcon: IconName =
    isMunicipalAdmin
      ? "shield-checkmark-outline"
      : "storefront-outline";

  const primaryActionRoute = isMunicipalAdmin
    ? "/admin"
    : "/provider-register";

  const categoriesWithCounts =
    useMemo<CategoryWithCounts[]>(() => {
      const visible = providers.filter(
        (provider) =>
          provider.publicationStatus === "Publicado",
      );

      return categories.map((category) => {
        const inCategory = visible.filter(
          (provider) =>
            provider.categoryId === category.id,
        );

        const locations = LOCATIONS.reduce<
          Partial<Record<LocationId, number>>
        >((acc, location) => {
          acc[location.id] = inCategory.filter(
            (provider) =>
              provider.coverage.includes(location.name),
          ).length;

          return acc;
        }, {});

        return {
          ...category,
          locations,
        };
      });
    }, [categories, providers]);

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase();

    return categoriesWithCounts.filter(
      (category) => {
        const available =
          (category.locations[selectedLocationId] ??
            0) > 0;

        const matches =
          !term ||
          category.name
            .toLowerCase()
            .includes(term) ||
          category.description
            .toLowerCase()
            .includes(term);

        return available && matches;
      },
    );
  }, [
    search,
    selectedLocationId,
    categoriesWithCounts,
  ]);

  const providerTotal = filteredCategories.reduce(
    (total, category) =>
      total +
      (category.locations[selectedLocationId] ??
        0),
    0,
  );

  const selectLocation = (
    location: Location,
  ) => {
    setSelectedLocationId(location.id);
    setSearch("");
    setLocationVisible(false);
  };

  const contactAdministrator = () => {
    const contactMessage =
      "Hola, quiero contactar al equipo de Ranco Conecta.";

    const options = [];

    if (CONTACT_ADMIN_WHATSAPP) {
      options.push({
        text: "WhatsApp",
        onPress: () =>
          Linking.openURL(
            whatsappUrl(
              CONTACT_ADMIN_WHATSAPP,
              contactMessage,
            ),
          ),
      });
    }

    if (CONTACT_ADMIN_PHONE) {
      options.push({
        text: "Llamar",
        onPress: () =>
          Linking.openURL(
            telUrl(CONTACT_ADMIN_PHONE),
          ),
      });
    }

    if (CONTACT_ADMIN_EMAIL) {
      options.push({
        text: "Correo",
        onPress: () =>
          Linking.openURL(
            mailtoUrl(
              CONTACT_ADMIN_EMAIL,
              "Contacto RancoConecta",
            ),
          ),
      });
    }

    if (options.length === 0) {
      Alert.alert(
        "Contacto no disponible",
        "Ranco Conecta aún no ha publicado un canal de contacto. Inténtalo más tarde.",
      );

      return;
    }

    Alert.alert(
      "Contactar soporte",
      "Elige cómo quieres solicitar alta, corrección o información de un servicio.",
      [
        ...options,
        {
          text: "Cancelar",
          style: "cancel",
        },
      ],
    );
  };

  const handleMenuPress = (
    option: (typeof MENU_OPTIONS)[number],
  ) => {
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

    if (
      option.route &&
      option.route !== "/home"
    ) {
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
                onPress={() =>
                  setMenuVisible(true)
                }
                style={({ pressed }) => [
                  styles.headerButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name="menu"
                  size={23}
                  color="#2F7353"
                />
              </Pressable>

              <Pressable
                onPress={() => setSearch("")}
                style={({ pressed }) => [
                  styles.brand,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.brandPrimary}>
                  Ranco
                </Text>

                <Text style={styles.brandAccent}>
                  Conecta
                </Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  router.push(
                    user ? "/profile" : "/",
                  )
                }
                style={({ pressed }) => [
                  styles.headerButton,
                  user &&
                    styles.headerButtonActive,
                  !user &&
                    styles.headerLoginButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons
                  name={
                    user
                      ? "person"
                      : "log-in-outline"
                  }
                  size={user ? 18 : 21}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>

            <View style={styles.topDivider} />

            <View
              style={[
                styles.hero,
                compact && styles.heroCompact,
              ]}
            >
              <Text
                style={[
                  styles.heroTitle,
                  compact &&
                    styles.heroTitleCompact,
                ]}
              >
                ¿Qué servicio necesitas?
              </Text>

              <Text style={styles.heroSubtitle}>
                Encuentra servicios locales cerca de ti.
              </Text>
            </View>

            <View style={styles.searchContainer}>
              <View style={styles.searchIconBox}>
                <Ionicons
                  name="search-outline"
                  size={19}
                  color="#2F7353"
                />
              </View>

              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={`Buscar servicios en ${selectedLocation.name}`}
                placeholderTextColor="#7B8982"
                style={styles.searchInput}
              />

              {search.length > 0 && (
                <Pressable
                  onPress={() => setSearch("")}
                  style={styles.clearSearchButton}
                >
                  <Ionicons
                    name="close-circle"
                    size={20}
                    color="#8A9690"
                  />
                </Pressable>
              )}
            </View>

            <View style={styles.homeActions}>
              <Pressable
                onPress={() =>
                  setLocationVisible(true)
                }
                style={({ pressed }) => [
                  styles.locationSelector,
                  pressed &&
                    styles.locationSelectorPressed,
                ]}
              >
                <View style={styles.locationIcon}>
                  <Ionicons
                    name="location"
                    size={19}
                    color="#FFFFFF"
                  />
                </View>

                <View
                  style={
                    styles.locationInformation
                  }
                >
                  <Text
                    style={styles.locationLabel}
                  >
                    BUSCAR SERVICIOS EN
                  </Text>

                  <Text
                    style={styles.locationName}
                  >
                    {selectedLocation.name}
                  </Text>
                </View>

                <View style={styles.chevronCircle}>
                  <Ionicons
                    name="chevron-down"
                    size={17}
                    color="#1D5F4A"
                  />
                </View>
              </Pressable>

              <Pressable
                onPress={() =>
                  router.push(
                    primaryActionRoute,
                  )
                }
                style={({ pressed }) => [
                  styles.commerceCta,
                  user &&
                    styles.commerceCtaActive,
                  pressed &&
                    styles.locationSelectorPressed,
                ]}
              >
                <Ionicons
                  name={primaryActionIcon}
                  size={18}
                  color={
                    user
                      ? "#FFFFFF"
                      : "#1D5F4A"
                  }
                />

                <Text
                  style={[
                    styles.commerceCtaText,
                    user &&
                      styles.commerceCtaTextActive,
                  ]}
                >
                  {primaryActionLabel}
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={15}
                  color={
                    user
                      ? "#FFFFFF"
                      : "#1D5F4A"
                  }
                />
              </Pressable>
            </View>

            <View style={styles.contextRow}>
              <View
                style={styles.contextLocation}
              >
                <Ionicons
                  name="navigate-outline"
                  size={14}
                  color="#1D5F4A"
                />

                <Text
                  numberOfLines={1}
                  style={styles.contextText}
                >
                  {selectedLocation.description}
                </Text>
              </View>

              <View style={styles.providerBadge}>
                <Ionicons
                  name="people-outline"
                  size={13}
                  color="#1D5F4A"
                />

                <Text
                  style={styles.providerCount}
                >
                  {providersStatus === "loading"
                    ? "Cargando…"
                    : `${providerTotal} prestadores`}
                </Text>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionCopy}>
                <Text
                  style={styles.sectionTitle}
                >
                  Rubros principales
                </Text>

                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Explora los servicios disponibles en tu sector
                </Text>
              </View>

              <View style={styles.counter}>
                <Text
                  style={styles.counterText}
                >
                  {filteredCategories.length}
                </Text>
              </View>
            </View>
          </>
        }
        renderItem={({ item }) => {
          const count =
            item.locations[
              selectedLocationId
            ] ?? 0;

          return (
            <Pressable
              onPress={() =>
                router.push({
                  pathname:
                    "/category/[categoryId]",
                  params: {
                    categoryId: item.id,
                    locationId:
                      selectedLocation.id,
                    locationName:
                      selectedLocation.name,
                  },
                })
              }
              style={({ pressed }) => [
                styles.categoryCard,
                {
                  width:
                    categoryCardWidth,
                },
                pressed &&
                  styles.categoryCardPressed,
              ]}
            >
              <View
                style={styles.cardTopRow}
              >
                <View
                  style={
                    styles.categoryIcon
                  }
                >
                  <Ionicons
                    name={
                      item.icon as IconName
                    }
                    size={21}
                    color="#1D5F4A"
                  />
                </View>

                <View
                  style={
                    styles.availableBadge
                  }
                >
                  <View
                    style={
                      styles.availableDot
                    }
                  />

                  <Text
                    style={
                      styles.availableText
                    }
                  >
                    {count}
                  </Text>
                </View>
              </View>

              <Text
                numberOfLines={2}
                style={styles.categoryName}
              >
                {item.name}
              </Text>

              <Text
                numberOfLines={2}
                style={
                  styles.categoryDescription
                }
              >
                {item.description}
              </Text>

              <View
                style={
                  styles.exploreContainer
                }
              >
                <Text
                  style={styles.exploreText}
                >
                  Ver servicios
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={14}
                  color="#1D5F4A"
                />
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          categoriesStatus === "loading" ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="grid-outline"
                  size={34}
                  color="#2F7353"
                />
              </View>

              <Text
                style={styles.emptyDescription}
              >
                Cargando categorías…
              </Text>
            </View>
          ) : categoriesStatus === "error" ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="alert-circle-outline"
                  size={34}
                  color="#A9634C"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No se pudieron cargar los rubros
              </Text>

              <Text
                style={styles.emptyDescription}
              >
                Revisa la conexión e intenta de nuevo.
              </Text>
            </View>
          ) : categories.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="grid-outline"
                  size={35}
                  color="#2F7353"
                />
              </View>

              <Text style={styles.emptyTitle}>
                Aún no hay categorías
              </Text>

              <Text
                style={styles.emptyDescription}
              >
                Estamos preparando el directorio para ti.
              </Text>

              <Text
                style={styles.emptySecondary}
              >
                Muy pronto podrás explorar servicios locales de Lago Ranco.
              </Text>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="search-outline"
                  size={35}
                  color="#2F7353"
                />
              </View>

              <Text style={styles.emptyTitle}>
                Sin resultados en{" "}
                {selectedLocation.name}
              </Text>

              <Text
                style={styles.emptyDescription}
              >
                Prueba con otro término o cambia de localidad.
              </Text>
            </View>
          )
        }
      />

      <Modal
        visible={locationVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setLocationVisible(false)
        }
      >
        <View style={styles.centeredModal}>
          <Pressable
            style={styles.modalOverlay}
            onPress={() =>
              setLocationVisible(false)
            }
          />

          <View style={styles.locationSheet}>
            <View style={styles.sheetHandle} />

            <View style={styles.sheetHeader}>
              <View style={styles.sheetHeaderCopy}>
                <Text style={styles.sheetTitle}>
                  Elige una localidad
                </Text>

                <Text
                  style={styles.sheetSubtitle}
                >
                  Mostraremos los servicios disponibles en ese sector.
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  setLocationVisible(false)
                }
                style={styles.closeButton}
              >
                <Ionicons
                  name="close"
                  size={21}
                  color="#34443D"
                />
              </Pressable>
            </View>

            <View style={styles.locationList}>
              {LOCATIONS.map((location) => {
                const active =
                  location.id ===
                  selectedLocationId;

                const total =
                  categoriesWithCounts.reduce(
                    (sum, category) =>
                      sum +
                      (category.locations[
                        location.id
                      ] ?? 0),
                    0,
                  );

                return (
                  <Pressable
                    key={location.id}
                    onPress={() =>
                      selectLocation(location)
                    }
                    style={({ pressed }) => [
                      styles.locationOption,
                      active &&
                        styles.locationOptionActive,
                      pressed &&
                        styles.pressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.optionIcon,
                        active &&
                          styles.optionIconActive,
                      ]}
                    >
                      <Ionicons
                        name={
                          active
                            ? "location"
                            : "location-outline"
                        }
                        size={20}
                        color={
                          active
                            ? "#FFFFFF"
                            : "#1D5F4A"
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.optionInformation
                      }
                    >
                      <Text
                        style={[
                          styles.optionName,
                          active &&
                            styles.optionNameActive,
                        ]}
                      >
                        {location.name}
                      </Text>

                      <Text
                        style={
                          styles.optionArea
                        }
                      >
                        {location.area} ·{" "}
                        {total} prestadores
                      </Text>
                    </View>

                    {active ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color="#1D5F4A"
                      />
                    ) : (
                      <Ionicons
                        name="chevron-forward"
                        size={17}
                        color="#9AA59F"
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
        onRequestClose={() =>
          setMenuVisible(false)
        }
      >
        <View style={styles.modalContainer}>
          <Pressable
            onPress={() =>
              setMenuVisible(false)
            }
            style={styles.modalOverlay}
          />

          <SafeAreaView style={styles.drawer}>
            <ScrollView
              contentContainerStyle={
                styles.drawerContent
              }
              showsVerticalScrollIndicator={
                false
              }
            >
              <View style={styles.drawerHeader}>
                <View style={styles.drawerLogo}>
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color="#1D5F4A"
                  />
                </View>

                <View style={styles.drawerBrand}>
                  <Text
                    style={
                      styles.drawerBrandPrimary
                    }
                  >
                    Ranco
                  </Text>

                  <Text
                    style={
                      styles.drawerBrandAccent
                    }
                  >
                    Conecta
                  </Text>
                </View>

                <Pressable
                  onPress={() =>
                    setMenuVisible(false)
                  }
                  style={styles.closeButton}
                >
                  <Ionicons
                    name="close"
                    size={21}
                    color="#34443D"
                  />
                </Pressable>
              </View>

              <Pressable
                onPress={() => {
                  setMenuVisible(false);
                  setLocationVisible(true);
                }}
                style={styles.drawerLocation}
              >
                <View
                  style={
                    styles.drawerLocationIcon
                  }
                >
                  <Ionicons
                    name="location-outline"
                    size={18}
                    color="#1D5F4A"
                  />
                </View>

                <View
                  style={
                    styles.drawerLocationInformation
                  }
                >
                  <Text
                    style={
                      styles.drawerLocationLabel
                    }
                  >
                    Ubicación seleccionada
                  </Text>

                  <Text
                    style={
                      styles.drawerLocationValue
                    }
                  >
                    {selectedLocation.name},
                    Los Ríos
                  </Text>
                </View>

                <Ionicons
                  name="swap-horizontal"
                  size={17}
                  color="#1D5F4A"
                />
              </Pressable>

              <View style={styles.accountBox}>
                <View style={styles.accountIcon}>
                  <Ionicons
                    name={
                      user
                        ? "person"
                        : "person-outline"
                    }
                    size={19}
                    color="#1D5F4A"
                  />
                </View>

                <View style={styles.accountInfo}>
                  <Text
                    numberOfLines={1}
                    style={styles.accountTitle}
                  >
                    {user
                      ? user.name
                      : "Modo visitante"}
                  </Text>

                  <Text
                    numberOfLines={1}
                    style={styles.accountText}
                  >
                    {user
                      ? user.email
                      : "Explora servicios sin iniciar sesión."}
                  </Text>
                </View>

                <Pressable
                  onPress={() => {
                    setMenuVisible(false);

                    router.push(
                      user ? "/profile" : "/",
                    );
                  }}
                  style={styles.accountAction}
                >
                  <Ionicons
                    name={
                      user
                        ? "chevron-forward"
                        : "person-add-outline"
                    }
                    size={17}
                    color="#FFFFFF"
                  />
                </Pressable>
              </View>

              <View style={styles.menuList}>
                {MENU_OPTIONS.map(
                  (option, index) => (
                    <Pressable
                      key={option.id}
                      onPress={() =>
                        handleMenuPress(option)
                      }
                      style={({ pressed }) => [
                        styles.menuOption,
                        index === 0 &&
                          styles.activeMenuOption,
                        pressed &&
                          styles.pressed,
                      ]}
                    >
                      <View
                        style={[
                          styles.menuIconBox,
                          index === 0 &&
                            styles.menuIconBoxActive,
                        ]}
                      >
                        <Ionicons
                          name={option.icon}
                          size={19}
                          color={
                            index === 0
                              ? "#1D5F4A"
                              : "#697870"
                          }
                        />
                      </View>

                      <Text
                        style={[
                          styles.menuOptionText,
                          index === 0 &&
                            styles.activeMenuOptionText,
                        ]}
                      >
                        {option.label}
                      </Text>

                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color="#9AA59F"
                      />
                    </Pressable>
                  ),
                )}
              </View>

              <Pressable
                onPress={contactAdministrator}
                style={({ pressed }) => [
                  styles.adminContact,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={
                    styles.adminContactIcon
                  }
                >
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={18}
                    color="#1D5F4A"
                  />
                </View>

                <View
                  style={
                    styles.adminContactText
                  }
                >
                  <Text
                    style={
                      styles.adminContactTitle
                    }
                  >
                    Contactar soporte
                  </Text>

                  <Text
                    style={
                      styles.adminContactDescription
                    }
                  >
                    Solicita agregar, corregir o destacar un servicio.
                  </Text>
                </View>

                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color="#1D5F4A"
                />
              </Pressable>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#EAF3F0",
  },

  pageContent: {
    width: "100%",
    maxWidth: 1240,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingBottom: 42,
  },

  pressed: {
    opacity: 0.74,
  },

  /* HEADER NUEVO */

  header: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D5E0DA",

    shadowColor: "#244B3B",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 7,

    elevation: 1,
  },

  headerButtonActive: {
    backgroundColor: "#2F7353",
    borderColor: "#2F7353",
  },

  headerLoginButton: {
    backgroundColor: "#BF6842",
    borderColor: "#BF6842",
  },

  brand: {
    flex: 1,
    minHeight: 42,

    marginHorizontal: 12,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "transparent",
    borderWidth: 0,
  },

  brandPrimary: {
    color: "#2F7353",

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 16,
    fontWeight: "700",

    letterSpacing: -0.1,
  },

  brandAccent: {
    color: "#BF6842",

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 16,
    fontWeight: "700",

    letterSpacing: -0.1,
  },

  topDivider: {
    height: 1,
    marginBottom: 14,

    backgroundColor: "#DDE7E2",
  },

  /* HERO */

  hero: {
    paddingTop: 4,
    paddingBottom: 3,
  },

  heroCompact: {},

  heroTitle: {
    maxWidth: 540,

    color: "#245F47",

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 22,
    lineHeight: 28,

    fontWeight: "700",

    letterSpacing: -0.1,
  },

  heroTitleCompact: {
    fontSize: 20,
    lineHeight: 26,
  },

  heroSubtitle: {
    marginTop: 4,

    color: "#6E7D75",

    fontFamily: APP_FONT,
    fontSize: 11.5,
    lineHeight: 17,

    fontWeight: "400",
  },

  /* BUSCADOR */

  searchContainer: {
    minHeight: 54,

    marginTop: 13,
    paddingHorizontal: 11,

    borderRadius: 16,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#D5E0DA",

    shadowColor: "#244B3B",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.035,
    shadowRadius: 8,

    elevation: 1,
  },

  searchIconBox: {
    width: 34,
    height: 34,

    borderRadius: 11,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#F1F7F4",
  },

  searchInput: {
    flex: 1,

    marginLeft: 9,
    marginRight: 6,

    paddingVertical: 14,

    color: "#34443D",

    fontFamily: APP_FONT,
    fontSize: 13,
    fontWeight: "400",

    ...Platform.select({
      web: {
        outlineStyle: "none",
      } as any,
      default: {},
    }),
  },

  clearSearchButton: {
    width: 34,
    height: 34,

    alignItems: "center",
    justifyContent: "center",
  },

  /* ACCIONES */

  homeActions: {
    marginTop: 10,

    flexDirection: "row",
    alignItems: "center",

    gap: 8,
  },

  locationSelector: {
    minHeight: 52,

    flex: 1,

    padding: 8,

    borderRadius: 15,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#D5E0DA",
  },

  locationSelectorPressed: {
    transform: [
      {
        scale: 0.99,
      },
    ],

    opacity: 0.93,
  },

  locationIcon: {
    width: 35,
    height: 35,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#2F7353",
  },

  locationInformation: {
    flex: 1,
    marginLeft: 9,
  },

  locationLabel: {
    color: "#77867E",

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 7.5,

    fontWeight: "600",

    letterSpacing: 0.7,
  },

  locationName: {
    marginTop: 2,

    color: "#2F7353",

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 12.5,

    fontWeight: "700",
  },

  chevronCircle: {
    width: 29,
    height: 29,

    borderRadius: 11,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#E4EFE9",
  },

  commerceCta: {
    minHeight: 52,
    minWidth: 91,

    paddingHorizontal: 9,

    borderRadius: 14,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    gap: 5,

    backgroundColor: "#DDECE4",

    borderWidth: 1,
    borderColor: "#D4E5DC",
  },

  commerceCtaActive: {
    backgroundColor: "#2F7353",
    borderColor: "#2F7353",
  },

  commerceCtaText: {
    color: "#1D5F4A",

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 10.5,

    fontWeight: "700",
  },

  commerceCtaTextActive: {
    color: "#FFFFFF",
  },

  /* CONTEXTO */

  contextRow: {
    minHeight: 39,

    marginTop: 9,
    paddingHorizontal: 10,

    borderRadius: 13,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    gap: 8,

    backgroundColor: "#F4F8F6",

    borderWidth: 1,
    borderColor: "#DDE7E2",
  },

  contextLocation: {
    flex: 1,

    flexDirection: "row",
    alignItems: "center",

    gap: 6,
  },

  contextText: {
    flex: 1,

    color: "#687970",

    fontFamily: APP_FONT,
    fontSize: 10.5,

    fontWeight: "400",
  },

  providerBadge: {
    flexDirection: "row",
    alignItems: "center",

    gap: 4,
  },

  providerCount: {
    color: "#1D5F4A",

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 10,

    fontWeight: "700",
  },

  /* SECTION */

  sectionHeader: {
    marginTop: 22,
    marginBottom: 13,

    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  sectionCopy: {
    flex: 1,
  },

  sectionTitle: {
    color: "#286A4D",

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 20,

    fontWeight: "700",

    letterSpacing: -0.1,
  },

  sectionSubtitle: {
    marginTop: 3,

    color: "#718078",

    fontFamily: APP_FONT,
    fontSize: 10.5,
    lineHeight: 15,

    fontWeight: "400",
  },

  counter: {
    minWidth: 34,

    paddingHorizontal: 9,
    paddingVertical: 6,

    borderRadius: 11,

    backgroundColor: "#DDECE4",
  },

  counterText: {
    color: "#1D5F4A",

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 11,

    fontWeight: "700",

    textAlign: "center",
  },

  /* CARDS */

  categoryRow: {
    gap: 9,
  },

  categoryCard: {
    minHeight: 155,

    marginBottom: 9,
    padding: 13,

    borderRadius: 17,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#D5E0DA",

    shadowColor: "#244B3B",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.035,
    shadowRadius: 8,

    elevation: 1,
  },

  categoryCardPressed: {
    opacity: 0.84,

    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  categoryIcon: {
    width: 41,
    height: 41,

    borderRadius: 13,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#E4EFE9",
  },

  availableBadge: {
    paddingHorizontal: 7,
    paddingVertical: 4,

    borderRadius: 9,

    flexDirection: "row",
    alignItems: "center",

    gap: 5,

    backgroundColor: "#F1F6F3",
  },

  availableDot: {
    width: 6,
    height: 6,

    borderRadius: 3,

    backgroundColor: "#2F7353",
  },

  availableText: {
    color: "#2F7353",

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 9.5,

    fontWeight: "700",
  },

  categoryName: {
    minHeight: 35,

    marginTop: 11,

    color: "#34443D",

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 13.5,
    lineHeight: 18,

    fontWeight: "700",
  },

  categoryDescription: {
    marginTop: 3,

    color: "#718078",

    fontFamily: APP_FONT,
    fontSize: 10,
    lineHeight: 14,

    fontWeight: "400",
  },

  exploreContainer: {
    marginTop: 10,

    flexDirection: "row",
    alignItems: "center",

    gap: 5,
  },

  exploreText: {
    color: "#1D5F4A",

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 10,

    fontWeight: "700",
  },

  /* EMPTY */

  emptyContainer: {
    paddingTop: 48,
    paddingBottom: 60,
    paddingHorizontal: 24,

    alignItems: "center",
  },

  emptyIcon: {
    width: 76,
    height: 76,

    borderRadius: 38,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#DDECE4",

    borderWidth: 1,
    borderColor: "#D3E5DB",
  },

  emptyTitle: {
    marginTop: 16,

    color: "#34443D",

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 15,

    fontWeight: "700",

    textAlign: "center",
  },

  emptyDescription: {
    marginTop: 7,

    color: "#74827B",

    fontFamily: APP_FONT,
    fontSize: 11.5,
    lineHeight: 17,

    fontWeight: "400",

    textAlign: "center",
  },

  emptySecondary: {
    maxWidth: 280,

    marginTop: 3,

    color: "#93A099",

    fontFamily: APP_FONT,
    fontSize: 10.5,
    lineHeight: 16,

    fontWeight: "400",

    textAlign: "center",
  },

  /* MODAL */

  centeredModal: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modalContainer: {
    flex: 1,
    flexDirection: "row",
  },

  modalOverlay: {
    ...StyleSheet.absoluteFill,

    backgroundColor:
      "rgba(28, 54, 45, 0.46)",
  },

  locationSheet: {
    width: "100%",
    maxHeight: "80%",

    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,

    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,

    backgroundColor: "#F7FAF9",
  },

  sheetHandle: {
    width: 42,
    height: 5,

    marginBottom: 18,

    borderRadius: 3,

    alignSelf: "center",

    backgroundColor: "#D5E0DA",
  },

  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",

    gap: 15,
  },

  sheetHeaderCopy: {
    flex: 1,
  },

  sheetTitle: {
    color: "#286A4D",

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 21,

    fontWeight: "700",
  },

  sheetSubtitle: {
    maxWidth: 290,

    marginTop: 5,

    color: "#718078",

    fontFamily: APP_FONT,
    fontSize: 11.5,
    lineHeight: 17,

    fontWeight: "400",
  },

  locationList: {
    marginTop: 20,

    gap: 9,
  },

  locationOption: {
    minHeight: 68,

    padding: 11,

    borderRadius: 17,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#D5E0DA",
  },

  locationOptionActive: {
    backgroundColor: "#E4EFE9",
    borderColor: "#B5CFC0",
  },

  optionIcon: {
    width: 43,
    height: 43,

    borderRadius: 14,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#EAF3EE",
  },

  optionIconActive: {
    backgroundColor: "#2F7353",
  },

  optionInformation: {
    flex: 1,
    marginLeft: 12,
  },

  optionName: {
    color: "#34443D",

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 14,

    fontWeight: "700",
  },

  optionNameActive: {
    color: "#286A4D",
  },

  optionArea: {
    marginTop: 3,

    color: "#718078",

    fontFamily: APP_FONT,
    fontSize: 10.5,

    fontWeight: "400",
  },

  closeButton: {
    width: 38,
    height: 38,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#E4EFE9",
  },

  /* DRAWER */

  drawer: {
    width: "82%",
    maxWidth: 350,
    height: "100%",

    backgroundColor: "#EAF3F0",
  },

  drawerContent: {
    flexGrow: 1,
    padding: 16,
  },

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
    borderColor: "#D5E0DA",
  },

  drawerBrand: {
    flex: 1,
    marginLeft: 10,

    flexDirection: "row",
  },

  drawerBrandPrimary: {
    color: "#2F7353",

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 15,

    fontWeight: "700",
  },

  drawerBrandAccent: {
    color: "#BF6842",

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 15,

    fontWeight: "700",
  },

  drawerLocation: {
    minHeight: 52,

    marginTop: 16,
    paddingHorizontal: 10,

    borderRadius: 15,

    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#DDECE4",

    borderWidth: 1,
    borderColor: "#D1E2D9",
  },

  drawerLocationIcon: {
    width: 32,
    height: 32,

    borderRadius: 11,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#F5F9F7",
  },

  drawerLocationInformation: {
    flex: 1,
    marginLeft: 9,
  },

  drawerLocationLabel: {
    color: "#718078",

    fontFamily: APP_FONT,
    fontSize: 9.5,

    fontWeight: "400",
  },

  drawerLocationValue: {
    marginTop: 2,

    color: "#286A4D",

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 12.5,

    fontWeight: "700",
  },

  /* CUENTA */

  accountBox: {
    minHeight: 67,

    marginTop: 12,
    padding: 10,

    borderRadius: 16,

    flexDirection: "row",
    alignItems: "center",

    gap: 9,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#D5E0DA",
  },

  accountIcon: {
    width: 36,
    height: 36,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#EAF3EE",
  },

  accountInfo: {
    flex: 1,
    minWidth: 0,
  },

  accountTitle: {
    color: "#286A4D",

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 12.5,

    fontWeight: "700",
  },

  accountText: {
    marginTop: 3,

    color: "#75837C",

    fontFamily: APP_FONT,
    fontSize: 9.5,
    lineHeight: 14,

    fontWeight: "400",
  },

  accountAction: {
    width: 34,
    height: 34,

    borderRadius: 11,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#BF6842",
  },

  /* MENU */

  menuList: {
    marginTop: 12,

    paddingVertical: 5,

    borderRadius: 17,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#D5E0DA",
  },

  menuOption: {
    minHeight: 47,

    paddingHorizontal: 10,

    borderRadius: 13,

    flexDirection: "row",
    alignItems: "center",
  },

  activeMenuOption: {
    marginHorizontal: 5,

    backgroundColor: "#DDECE4",
  },

  menuIconBox: {
    width: 31,
    height: 31,

    borderRadius: 10,

    alignItems: "center",
    justifyContent: "center",
  },

  menuIconBoxActive: {
    backgroundColor: "#F5F9F7",
  },

  menuOptionText: {
    flex: 1,

    marginLeft: 7,

    color: "#66766E",

    fontFamily: APP_FONT,
    fontSize: 12.5,

    fontWeight: "500",
  },

  activeMenuOptionText: {
    color: "#1D5F4A",

    fontFamily: APP_FONT_MEDIUM,
    fontWeight: "700",
  },

  /* SOPORTE */

  adminContact: {
    minHeight: 68,

    marginTop: 12,
    padding: 11,

    borderRadius: 17,

    flexDirection: "row",
    alignItems: "center",

    gap: 10,

    backgroundColor: "#FFFFFF",

    borderWidth: 1,
    borderColor: "#D5E0DA",
  },

  adminContactIcon: {
    width: 37,
    height: 37,

    borderRadius: 12,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#DDECE4",
  },

  adminContactText: {
    flex: 1,
  },

  adminContactTitle: {
    color: "#286A4D",

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 12.5,

    fontWeight: "700",
  },

  adminContactDescription: {
    marginTop: 3,

    color: "#75837C",

    fontFamily: APP_FONT,
    fontSize: 9.5,
    lineHeight: 14,

    fontWeight: "400",
  },
});
