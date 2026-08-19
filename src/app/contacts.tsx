import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { useAppData } from '../contexts/app-data';
import { safeGoBack } from '../lib/navigation';

export default function Contacts() {
  const { requests, requestsStatus } = useAppData();

  return (
    <SafeAreaView style={styles.safe}>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <>
            <View style={styles.bar}>
              <Pressable onPress={() => safeGoBack('/home')} style={styles.back}>
                <Ionicons name="arrow-back" size={23} color="#2F7353" />
              </Pressable>
              <Text style={styles.barTitle}>Mis contactos</Text>
              <Pressable onPress={() => router.replace('/home')} style={styles.back}>
                <Ionicons name="home-outline" size={21} color="#1D5F4A" />
              </Pressable>
            </View>
            <Text style={styles.title}>Solicitudes y contactos</Text>
            <Text style={styles.sub}>Aquí aparecen las solicitudes enviadas desde perfiles de prestadores.</Text>
          </>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/provider/[providerId]', params: { providerId: item.providerId } })}
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <View style={styles.avatar}>
              <Ionicons name="chatbubble-ellipses-outline" size={23} color="#1D5F4A" />
            </View>
            <View style={styles.info}>
              <Text numberOfLines={1} style={styles.name}>{item.providerName}</Text>
              <Text numberOfLines={1} style={styles.muted}>{item.serviceName} · {item.dateOption}</Text>
              <Text numberOfLines={2} style={styles.detail}>{item.detail}</Text>
              <Text style={styles.status}>{item.status}</Text>
            </View>
            <Ionicons name="chevron-forward" size={19} color="#9AA59F" />
          </Pressable>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            {requestsStatus === 'loading' ? (
              <Text style={styles.emptyText}>Cargando solicitudes…</Text>
            ) : (
              <>
                <Ionicons name="chatbubble-outline" size={45} color="#9AA59F" />
                <Text style={styles.emptyTitle}>Aún no hay solicitudes</Text>
                <Text style={styles.emptyText}>Cuando solicites un servicio, quedará registrado en esta vista.</Text>
              </>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#EAF3F0' },
  content: { width: '100%', maxWidth: 680, alignSelf: 'center', padding: 16, paddingBottom: 40 },
  bar: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D5E0DA' },
  barTitle: { fontWeight: '800', color: '#2F7353' },
  title: { fontSize: 26, fontWeight: '800', color: '#2F7353', marginTop: 10 },
  sub: { fontSize: 13, lineHeight: 19, color: '#6E7D75', marginTop: 6, marginBottom: 20 },
  card: { minHeight: 112, padding: 14, marginBottom: 10, borderRadius: 19, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D5E0DA' },
  pressed: { opacity: 0.78 },
  avatar: { width: 49, height: 49, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E4EFE9' },
  info: { flex: 1, marginLeft: 11 },
  name: { fontSize: 14, fontWeight: '800', color: '#34443D' },
  muted: { fontSize: 11, color: '#6E7D75', marginTop: 3 },
  detail: { marginTop: 6, color: '#34443D', fontSize: 12, lineHeight: 17 },
  status: { alignSelf: 'flex-start', fontSize: 9, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, overflow: 'hidden', marginTop: 7, color: '#BF6842', backgroundColor: '#FBE9E2' },
  empty: { paddingTop: 90, alignItems: 'center' },
  emptyTitle: { marginTop: 12, fontSize: 15, fontWeight: '800', color: '#34443D' },
  emptyText: { marginTop: 6, maxWidth: 260, textAlign: 'center', fontSize: 12, lineHeight: 18, color: '#718078' },
});
