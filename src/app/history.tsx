import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Linking, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { PROVIDERS } from '../data/providers';

const HISTORY = [
  {
    provider: PROVIDERS[0],
    date: '12 ago. 2026',
    note: 'Instalación eléctrica terminada',
    result: 'Excelente trabajo',
  },
  {
    provider: PROVIDERS[2],
    date: '28 jul. 2026',
    note: 'Reparación de filtración',
    result: 'Respondió rápido',
  },
  {
    provider: PROVIDERS[1],
    date: '04 jul. 2026',
    note: 'Cotización energía solar',
    result: 'Pendiente de contratar',
  },
];

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.bar}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={23} color="#1F446A" />
          </Pressable>
          <Text style={styles.barTitle}>Historial</Text>
          <Pressable onPress={() => router.replace('/home')} style={styles.backButton}>
            <Ionicons name="home-outline" size={21} color="#224D78" />
          </Pressable>
        </View>

        <Text style={styles.title}>Servicios contactados</Text>
        <Text style={styles.subtitle}>
          Vuelve rápido a prestadores que ya consultaste o contrataste.
        </Text>

        {HISTORY.map((item) => (
          <Pressable
            key={`${item.provider.id}-${item.date}`}
            onPress={() =>
              router.push({
                pathname: '/provider/[providerId]',
                params: { providerId: item.provider.id },
              })
            }
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <View style={styles.avatar}>
              <Ionicons name="time-outline" size={23} color="#224D78" />
            </View>
            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text numberOfLines={1} style={styles.name}>
                  {item.provider.name}
                </Text>
                <Text style={styles.date}>{item.date}</Text>
              </View>
              <Text style={styles.service}>{item.provider.service}</Text>
              <Text style={styles.note}>{item.note} · {item.result}</Text>
              <View style={styles.actions}>
                <Pressable
                  onPress={() => Linking.openURL(`tel:${item.provider.phone}`)}
                  style={styles.actionButton}
                >
                  <Ionicons name="call-outline" size={16} color="#224D78" />
                  <Text style={styles.actionText}>Llamar</Text>
                </Pressable>
                <Pressable
                  onPress={() => Linking.openURL(`https://wa.me/${item.provider.whatsapp}`)}
                  style={styles.actionButton}
                >
                  <Ionicons name="logo-whatsapp" size={16} color="#224D78" />
                  <Text style={styles.actionText}>WhatsApp</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F8F4' },
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: 16,
    paddingBottom: 40,
  },
  bar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E6EB',
  },
  barTitle: { color: '#1F446A', fontSize: 16, fontWeight: '800' },
  title: {
    marginTop: 10,
    color: '#1F446A',
    fontSize: 27,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 20,
    color: '#687786',
    fontSize: 13,
    lineHeight: 19,
  },
  card: {
    minHeight: 132,
    marginBottom: 11,
    padding: 14,
    borderRadius: 20,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E6EB',
  },
  cardPressed: { opacity: 0.84, transform: [{ scale: 0.99 }] },
  avatar: {
    width: 49,
    height: 49,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8EEF4',
  },
  info: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: {
    flex: 1,
    color: '#243F59',
    fontSize: 14,
    fontWeight: '800',
  },
  date: { color: '#87929E', fontSize: 10, fontWeight: '700' },
  service: {
    marginTop: 3,
    color: '#687786',
    fontSize: 11,
    fontWeight: '600',
  },
  note: {
    marginTop: 6,
    color: '#33485D',
    fontSize: 12,
    lineHeight: 17,
  },
  actions: { marginTop: 11, flexDirection: 'row', gap: 8 },
  actionButton: {
    minHeight: 34,
    paddingHorizontal: 10,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EAF1F7',
  },
  actionText: { color: '#224D78', fontSize: 11, fontWeight: '800' },
});
