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

import { useAppData, type AppCategory } from "../contexts/app-data";
import { safeGoBack } from "../lib/navigation";

type IconName = ComponentProps<typeof Ionicons>["name"];
type LocationId = "lago-ranco" | "futrono" | "llifen" | "riñinahue";

type CategoryRow = AppCategory & {
  count: number;
};

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
  const { providers, categories: catalogCategories, categoriesStatus } = useAppData();
  const [search, setSearch] = useState("");

  const categories = useMemo(() => {
    const term = search.trim().toLowerCase();
    const enriched: CategoryRow[] = catalogCategories.map((category) => {
      const count = providers.filter(
        (provider) =>
          provider.publicationStatus === "Publicado" &&
          provider.categoryId === category.id &&
          provider.coverage.includes(locationName),
      ).length;

      return { ...category, count };
    });

    return enriched.filter((category) => {
      const matches =
        !term ||
        category.name.toLowerCase().includes(term) ||
        category.description.toLowerCase().includes(term);
      return category.count > 0 && matches;
    });
  }, [catalogCategories, locationName, providers, search]);

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
                onPress={() => safeGoBack("/home")}
                style={({ pressed }) => [
                  styles.topbarButton,
                  pressed && styles.pressed,
                ]}
              >
                <Ionicons name="arrow-back" size={23} color="#2F7353" />
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
                <Ionicons name="home-outline" size={21} color="#1D5F4A" />
              </Pressable>
            </View>

            <View style={styles.sectionIntro}>
              <Text style={styles.sectionTitle}>Selecciona categoria</Text>
            </View>

            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={20} color="#7A827A" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar rubro: hogar, agua, energia..."
                placeholderTextColor="#8A9690"
                style={styles.searchInput}
              />
              {!!search && (
                <Pressable onPress={() => setSearch("")}>
                  <Ionicons name="close-circle" size={20} color="#9AA59F" />
                </Pressable>
              )}
            </View>
          </>
        }
        renderItem={({ item }) => {
          const count = item.count;

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
              <View style={[styles.iconBox, { backgroundColor: item.iconBackground }]}>
                <Ionicons name={item.icon as IconName} size={23} color={item.iconColor} />
              </View>
              <View style={styles.categoryCopy}>
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text numberOfLines={1} style={styles.categoryDescription}>
                  {item.description}
                </Text>
              </View>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{count}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9AA59F" />
            </Pressable>
          );
        }}
        ListEmptyComponent={
          categoriesStatus === "loading" ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Cargando categorías…</Text>
            </View>
          ) : catalogCategories.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="grid-outline" size={38} color="#9AA59F" />
              <Text style={styles.emptyTitle}>Aún no hay categorías</Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={38} color="#9AA59F" />
              <Text style={styles.emptyTitle}>Sin resultados</Text>
              <Text style={styles.emptyText}>Prueba con otra palabra.</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#EAF3F0" },
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
    borderColor: "#D5E0DA",
  },
  topbarTitleWrap: { flex: 1, marginHorizontal: 12, alignItems: "center" },
  topbarTitle: {
    color: "#2F7353",
    fontSize: 17,
    fontWeight: "800",
  },
  topbarSubtitle: {
    marginTop: 2,
    color: "#6E7D75",
    fontSize: 11,
    fontWeight: "700",
  },
  pressed: { opacity: 0.72 },
  sectionIntro: {
    marginTop: 3,
    marginBottom: 2,
  },
  sectionTitle: {
    color: "#2F7353",
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
    borderColor: "#D5E0DA",
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 15,
    color: "#34443D",
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
    borderColor: "#D5E0DA",
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
    color: "#34443D",
    fontSize: 15,
    fontWeight: "900",
  },
  categoryDescription: {
    marginTop: 4,
    color: "#718078",
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
    backgroundColor: "#E4EFE9",
  },
  countText: {
    color: "#1D5F4A",
    fontSize: 12,
    fontWeight: "900",
  },
  empty: {
    paddingVertical: 52,
    alignItems: "center",
  },
  emptyTitle: {
    marginTop: 13,
    color: "#34443D",
    fontSize: 16,
    fontWeight: "800",
  },
  emptyText: {
    marginTop: 5,
    color: "#74827B",
    fontSize: 12,
  },
});
