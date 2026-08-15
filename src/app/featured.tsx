import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Linking, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { useAppData } from '../contexts/app-data';

export default function FeaturedScreen() {
  const { featuredProviders } = useAppData();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.bar}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={23} color="#1F446A" />
          </Pressable>
          <Text style={styles.barTitle}>Destacados</Text>
          <Pressable onPress={() => router.replace('/home')} style={styles.backButton}>
            <Ionicons name="home-outline" size={21} color="#224D78" />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>SERVICIOS RECOMENDADOS</Text>
          <Text style={styles.title}>Prestadores destacados</Text>
          <Text style={styles.subtitle}>
            Espacios priorizados por administración y recomendaciones de usuarios.
          </Text>
        </View>

        {featuredProviders.map((provider, index) => (
          <Pressable
            key={provider.id}
            onPress={() =>
              router.push({
                pathname: '/provider/[providerId]',
                params: { providerId: provider.id },
              })
            }
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <View style={styles.avatar}>
              <Ionicons name="star" size={23} color="#D89222" />
            </View>
            <View style={styles.info}>
              <View style={styles.nameRow}>
                <Text numberOfLines={1} style={styles.name}>
                  {provider.name}
                </Text>
                {provider.verified && (
                  <Ionicons name="checkmark-circle" size={17} color="#2C689A" />
                )}
              </View>
              <Text style={styles.service}>{provider.service}</Text>
              <Text style={styles.reason}>
                {index < 2
                  ? 'Espacio priorizado por administración municipal.'
                  : 'Recomendado por vecinos para revisión de destacados.'}
              </Text>
              <View style={styles.footer}>
                <Text style={styles.tag}>{index < 2 ? 'Espacio destacado' : 'Recomendado'}</Text>
                <Pressable
                  onPress={() => Linking.openURL(`https://wa.me/${provider.whatsapp}`)}
                  style={styles.whatsapp}
                >
                  <Ionicons name="logo-whatsapp" size={15} color="#224D78" />
                  <Text style={styles.whatsappText}>Contactar</Text>
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
  hero: {
    marginBottom: 13,
    padding: 22,
    borderRadius: 24,
    backgroundColor: '#183653',
  },
  eyebrow: {
    color: '#D2DEE8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 7,
    color: '#DCE5ED',
    fontSize: 13,
    lineHeight: 20,
  },
  card: {
    minHeight: 126,
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
    width: 51,
    height: 51,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8ECD5',
  },
  info: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  name: { flex: 1, color: '#243F59', fontSize: 15, fontWeight: '800' },
  service: { marginTop: 3, color: '#687786', fontSize: 11, fontWeight: '600' },
  reason: { marginTop: 7, color: '#33485D', fontSize: 12, lineHeight: 17 },
  footer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  tag: {
    flexShrink: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    overflow: 'hidden',
    color: '#8B6421',
    backgroundColor: '#F6EFE3',
    fontSize: 9,
    fontWeight: '800',
  },
  whatsapp: {
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EAF1F7',
  },
  whatsappText: { color: '#224D78', fontSize: 11, fontWeight: '800' },
});
