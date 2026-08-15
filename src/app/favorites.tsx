import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { useAppData } from '../contexts/app-data';
import { useAuth } from '../contexts/auth';

export default function Favorites() {
  const { user } = useAuth();
  const { favoriteIds, getProvider, toggleFavorite } = useAppData();
  const items = favoriteIds.map((id) => getProvider(id));

  if (!user) {
    return <Redirect href={{ pathname: '/', params: { returnTo: '/favorites' } }} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <Header />
            <Text style={styles.title}>Tus favoritos</Text>
            <Text style={styles.sub}>Prestadores guardados para volver a contactarlos rápido.</Text>
          </>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/provider/[providerId]', params: { providerId: item.id } })}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <Image source={{ uri: item.images[0] }} style={styles.thumb} contentFit="cover" />
            <View style={styles.info}>
              <Text numberOfLines={1} style={styles.name}>{item.name}</Text>
              <Text numberOfLines={1} style={styles.muted}>{item.service}</Text>
              <Text style={styles.rating}>★ {item.rating} · {item.locationName}</Text>
            </View>
            <Pressable onPress={() => toggleFavorite(item.id)} style={styles.heart}>
              <Ionicons name="heart" size={22} color="#D89222" />
            </Pressable>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={45} color="#99A4AF" />
            <Text style={styles.emptyTitle}>Todavía no tienes favoritos</Text>
            <Text style={styles.emptyText}>Guarda prestadores desde su perfil para verlos aquí.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function Header() {
  return (
    <View style={styles.bar}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Ionicons name="arrow-back" size={23} color="#1F446A" />
      </Pressable>
      <Text style={styles.barTitle}>Favoritos</Text>
      <Pressable onPress={() => router.replace('/home')} style={styles.back}>
        <Ionicons name="home-outline" size={21} color="#224D78" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8F4' },
  content: { width: '100%', maxWidth: 680, alignSelf: 'center', padding: 16, paddingBottom: 40 },
  bar: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E1E6EB' },
  barTitle: { fontWeight: '800', color: '#1F446A' },
  title: { fontSize: 27, fontWeight: '800', color: '#1F446A', marginTop: 10 },
  sub: { fontSize: 13, lineHeight: 19, color: '#687786', marginTop: 6, marginBottom: 20 },
  card: { minHeight: 92, padding: 12, marginBottom: 10, borderRadius: 19, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E1E6EB' },
  pressed: { opacity: 0.78 },
  thumb: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#E8EEF4' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 14, fontWeight: '800', color: '#243F59' },
  muted: { fontSize: 11, color: '#687786', marginTop: 3 },
  rating: { fontSize: 10, fontWeight: '700', color: '#657786', marginTop: 6 },
  heart: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8ECD5' },
  empty: { paddingTop: 90, alignItems: 'center' },
  emptyTitle: { marginTop: 12, fontSize: 15, fontWeight: '800', color: '#33485D' },
  emptyText: { marginTop: 6, maxWidth: 260, textAlign: 'center', fontSize: 12, lineHeight: 18, color: '#71808C' },
});
