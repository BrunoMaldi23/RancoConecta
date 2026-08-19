import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Linking, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { useAppData } from '../contexts/app-data';
import { safeGoBack } from '../lib/navigation';

export default function HistoryScreen() {
  const { getProvider, requests, requestsStatus } = useAppData();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.bar}>
          <Pressable onPress={() => safeGoBack('/home')} style={styles.backButton}>
            <Ionicons name="arrow-back" size={23} color="#2F7353" />
          </Pressable>
          <Text style={styles.barTitle}>Historial</Text>
          <Pressable onPress={() => router.replace('/home')} style={styles.backButton}>
            <Ionicons name="home-outline" size={21} color="#1D5F4A" />
          </Pressable>
        </View>

        <Text style={styles.title}>Servicios contactados</Text>
        <Text style={styles.subtitle}>Vuelve rápido a prestadores que ya consultaste o solicitaste.</Text>

        {requestsStatus === 'loading' ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Cargando historial…</Text>
          </View>
        ) : requests.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="time-outline" size={45} color="#9B9A90" />
            <Text style={styles.emptyTitle}>Sin historial todavía</Text>
            <Text style={styles.emptyText}>Tus solicitudes aparecerán aquí cuando contactes un prestador.</Text>
          </View>
        ) : (
          requests.map((request) => {
            const provider = getProvider(request.providerId);

            return (
              <Pressable
                key={request.id}
                onPress={() => {
                  if (provider) {
                    router.push({
                      pathname: '/provider/[providerId]',
                      params: { providerId: provider.id },
                    });
                  }
                }}
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              >
                <View style={styles.avatar}>
                  <Ionicons name="time-outline" size={23} color="#1D5F4A" />
                </View>
                <View style={styles.info}>
                  <View style={styles.nameRow}>
                    <Text numberOfLines={1} style={styles.name}>
                      {provider ? provider.name : request.providerName}
                    </Text>
                    <Text style={styles.date}>{formatDate(request.createdAt)}</Text>
                  </View>
                  <Text style={styles.service}>{request.serviceName}</Text>
                  <Text numberOfLines={2} style={styles.note}>
                    {request.address} · {request.status}
                  </Text>
                  {provider && (
                    <View style={styles.actions}>
                      <Pressable onPress={() => Linking.openURL(`tel:${provider.phone}`)} style={styles.actionButton}>
                        <Ionicons name="call-outline" size={16} color="#1D5F4A" />
                        <Text style={styles.actionText}>Llamar</Text>
                      </Pressable>
                      <Pressable onPress={() => Linking.openURL(`https://wa.me/${provider.whatsapp}`)} style={styles.actionButton}>
                        <Ionicons name="logo-whatsapp" size={16} color="#1D5F4A" />
                        <Text style={styles.actionText}>WhatsApp</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })
        )}
      </View>
    </SafeAreaView>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short' }).format(new Date(value));
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3ECDD' },
  content: { width: '100%', maxWidth: 720, alignSelf: 'center', padding: 16, paddingBottom: 40 },
  bar: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DED8CB' },
  barTitle: { color: '#2F7353', fontSize: 16, fontWeight: '800' },
  title: { marginTop: 10, color: '#2F7353', fontSize: 27, fontWeight: '800' },
  subtitle: { marginTop: 6, marginBottom: 20, color: '#7A827A', fontSize: 13, lineHeight: 19 },
  card: { minHeight: 132, marginBottom: 11, padding: 14, borderRadius: 20, flexDirection: 'row', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DED8CB' },
  cardPressed: { opacity: 0.84, transform: [{ scale: 0.99 }] },
  avatar: { width: 49, height: 49, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E2ECE1' },
  info: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flex: 1, color: '#34443D', fontSize: 14, fontWeight: '800' },
  date: { color: '#8A9288', fontSize: 10, fontWeight: '700' },
  service: { marginTop: 3, color: '#7A827A', fontSize: 11, fontWeight: '600' },
  note: { marginTop: 6, color: '#34443D', fontSize: 12, lineHeight: 17 },
  actions: { marginTop: 11, flexDirection: 'row', gap: 8 },
  actionButton: { minHeight: 34, paddingHorizontal: 10, borderRadius: 11, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#E6EFE6' },
  actionText: { color: '#1D5F4A', fontSize: 11, fontWeight: '800' },
  empty: { paddingTop: 90, alignItems: 'center' },
  emptyTitle: { marginTop: 12, fontSize: 15, fontWeight: '800', color: '#34443D' },
  emptyText: { marginTop: 6, maxWidth: 280, textAlign: 'center', fontSize: 12, lineHeight: 18, color: '#71808C' },
});
