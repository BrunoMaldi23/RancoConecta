import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { ProviderCover } from '../components/provider-cover';
import { useAppData, type DirectoryProvider } from '../contexts/app-data';
import { useAuth } from '../contexts/auth';
import { safeGoBack } from '../lib/navigation';

export default function Favorites() {
  const { user } = useAuth();
  const { favoriteIds, getProvider, toggleFavorite } = useAppData();
  const items = favoriteIds
    .map((id) => getProvider(id))
    .filter((item): item is DirectoryProvider => Boolean(item));

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
            <ProviderCover uri={item.images[0]} style={styles.thumb} />
            <View style={styles.info}>
              <Text numberOfLines={1} style={styles.name}>{item.name}</Text>
              <Text numberOfLines={1} style={styles.muted}>{item.service}</Text>
              <Text style={styles.rating}>★ {item.rating} · {item.locationName}</Text>
            </View>
            <Pressable onPress={() => toggleFavorite(item.id)} style={styles.heart}>
              <Ionicons name="heart" size={22} color="#BF6842" />
            </Pressable>
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={45} color="#9AA59F" />
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
      <Pressable onPress={() => safeGoBack('/home')} style={styles.back}>
        <Ionicons name="arrow-back" size={23} color="#2F7353" />
      </Pressable>
      <Text style={styles.barTitle}>Favoritos</Text>
      <Pressable onPress={() => router.replace('/home')} style={styles.back}>
        <Ionicons name="home-outline" size={21} color="#1D5F4A" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#EAF3F0' },
  content: { width: '100%', maxWidth: 680, alignSelf: 'center', padding: 16, paddingBottom: 40 },
  bar: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D5E0DA' },
  barTitle: { fontWeight: '800', color: '#2F7353' },
  title: { fontSize: 27, fontWeight: '800', color: '#2F7353', marginTop: 10 },
  sub: { fontSize: 13, lineHeight: 19, color: '#6E7D75', marginTop: 6, marginBottom: 20 },
  card: { minHeight: 92, padding: 12, marginBottom: 10, borderRadius: 19, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D5E0DA' },
  pressed: { opacity: 0.78 },
  thumb: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#E4EFE9' },
  info: { flex: 1, marginLeft: 12 },
  name: { fontSize: 14, fontWeight: '800', color: '#34443D' },
  muted: { fontSize: 11, color: '#6E7D75', marginTop: 3 },
  rating: { fontSize: 10, fontWeight: '700', color: '#6E7D75', marginTop: 6 },
  heart: { width: 38, height: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FBE9E2' },
  empty: { paddingTop: 90, alignItems: 'center' },
  emptyTitle: { marginTop: 12, fontSize: 15, fontWeight: '800', color: '#34443D' },
  emptyText: { marginTop: 6, maxWidth: 260, textAlign: 'center', fontSize: 12, lineHeight: 18, color: '#718078' },
});
