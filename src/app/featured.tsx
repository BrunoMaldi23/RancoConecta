import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ProviderCover } from '../components/provider-cover';
import { useAppData } from '../contexts/app-data';
import { safeGoBack } from '../lib/navigation';

const APP_FONT = Platform.select({
  web: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  ios: 'System',
  android: 'sans-serif',
  default: 'System',
});

const APP_FONT_MEDIUM = Platform.select({
  web: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  ios: 'System',
  android: 'sans-serif-medium',
  default: 'System',
});

export default function FeaturedScreen() {
  const { featuredProviders, providersStatus } = useAppData();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* =====================================================
            HEADER
        ===================================================== */}

        <View style={styles.bar}>
          <Pressable
            onPress={() => safeGoBack('/home')}
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="arrow-back"
              size={21}
              color="#2F7353"
            />
          </Pressable>

          <Text style={styles.barTitle}>
            Destacados
          </Text>

          <Pressable
            onPress={() => router.replace('/home')}
            style={({ pressed }) => [
              styles.headerButton,
              pressed && styles.pressed,
            ]}
          >
            <Ionicons
              name="home-outline"
              size={20}
              color="#2F7353"
            />
          </Pressable>
        </View>

        {/* =====================================================
            INTRODUCCIÓN
        ===================================================== */}

        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons
              name="heart-outline"
              size={22}
              color="#2F7353"
            />
          </View>

          <Text style={styles.eyebrow}>
            RECOMENDADOS POR LA COMUNIDAD
          </Text>

          <Text style={styles.title}>
            Servicios destacados
          </Text>

          <Text style={styles.subtitle}>
            Prestadores que han sido recomendados por
            usuarios de Ranco Conecta.
          </Text>

          <View style={styles.heroInfo}>
            <Ionicons
              name="people-outline"
              size={15}
              color="#2F7353"
            />

            <Text style={styles.heroInfoText}>
              Las recomendaciones de la comunidad ayudan
              a otros a encontrar buenos servicios.
            </Text>
          </View>
        </View>

        {/* =====================================================
            ESTADOS
        ===================================================== */}

        {providersStatus === 'loading' ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="heart-outline"
                size={31}
                color="#2F7353"
              />
            </View>

            <Text style={styles.emptyText}>
              Cargando recomendaciones…
            </Text>
          </View>
        ) : providersStatus === 'error' ? (
          <View style={styles.empty}>
            <View
              style={[
                styles.emptyIcon,
                styles.emptyIconError,
              ]}
            >
              <Ionicons
                name="alert-circle-outline"
                size={31}
                color="#A9634C"
              />
            </View>

            <Text style={styles.emptyTitle}>
              No pudimos cargar los destacados
            </Text>

            <Text style={styles.emptyText}>
              Revisa tu conexión e intenta nuevamente.
            </Text>
          </View>
        ) : featuredProviders.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="heart-outline"
                size={32}
                color="#2F7353"
              />
            </View>

            <Text style={styles.emptyTitle}>
              Aún no hay servicios destacados
            </Text>

            <Text style={styles.emptyText}>
              Cuando los usuarios recomienden servicios,
              comenzarán a aparecer aquí.
            </Text>

            <View style={styles.emptyTip}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color="#2F7353"
              />

              <Text style={styles.emptyTipText}>
                Las recomendaciones nacen de la experiencia
                de la comunidad.
              </Text>
            </View>
          </View>
        ) : (
          /* ===================================================
              LISTADO
          =================================================== */

          <View style={styles.list}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Recomendados
                </Text>

                <Text style={styles.sectionSubtitle}>
                  Servicios valorados por la comunidad
                </Text>
              </View>

              <View style={styles.counter}>
                <Text style={styles.counterText}>
                  {featuredProviders.length}
                </Text>
              </View>
            </View>

            {featuredProviders.map((provider) => (
              <Pressable
                key={provider.id}
                onPress={() =>
                  router.push({
                    pathname: '/provider/[providerId]',
                    params: {
                      providerId: provider.id,
                    },
                  })
                }
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.cardPressed,
                ]}
              >
                {/* FOTO */}

                <ProviderCover
                  uri={provider.images[0]}
                  style={styles.cover}
                />

                {/* INFORMACIÓN */}

                <View style={styles.info}>
                  <View style={styles.nameRow}>
                    <Text
                      numberOfLines={1}
                      style={styles.name}
                    >
                      {provider.name}
                    </Text>

                    {provider.verified && (
                      <View style={styles.verified}>
                        <Ionicons
                          name="checkmark"
                          size={10}
                          color="#FFFFFF"
                        />
                      </View>
                    )}
                  </View>

                  <Text
                    numberOfLines={1}
                    style={styles.service}
                  >
                    {provider.service}
                  </Text>

                  {/* RATING */}

                  <View style={styles.ratingRow}>
                    <Ionicons
                      name="star"
                      size={13}
                      color="#BF6842"
                    />

                    <Text style={styles.rating}>
                      {provider.rating}
                    </Text>

                    <Text style={styles.reviews}>
                      ({provider.reviews} opiniones)
                    </Text>
                  </View>

                  {/* UBICACIÓN */}

                  <View style={styles.locationRow}>
                    <Ionicons
                      name="location-outline"
                      size={12}
                      color="#718078"
                    />

                    <Text
                      numberOfLines={1}
                      style={styles.location}
                    >
                      {provider.locationName}
                    </Text>
                  </View>

                  {/* ACCIONES */}

                  <View style={styles.footer}>
                    <Pressable
                      onPress={(event) => {
                        event.stopPropagation();

                        Linking.openURL(
                          `https://wa.me/${provider.whatsapp}?text=${encodeURIComponent(
                            `Hola, vi tu servicio en Ranco Conecta y quiero consultar por ${provider.service}.`,
                          )}`,
                        ).catch(() => undefined);
                      }}
                      style={({ pressed }) => [
                        styles.whatsapp,
                        pressed &&
                          styles.whatsappPressed,
                      ]}
                    >
                      <Ionicons
                        name="logo-whatsapp"
                        size={15}
                        color="#1D5F4A"
                      />

                      <Text
                        style={styles.whatsappText}
                      >
                        Contactar
                      </Text>
                    </Pressable>

                    <View style={styles.viewProfile}>
                      <Text
                        style={styles.viewProfileText}
                      >
                        Ver perfil
                      </Text>

                      <Ionicons
                        name="arrow-forward"
                        size={14}
                        color="#2F7353"
                      />
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* =====================================================
     BASE
  ===================================================== */

  safeArea: {
    flex: 1,
    backgroundColor: '#EAF3F0',
  },

  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',

    paddingHorizontal: 16,
    paddingBottom: 42,
  },

  pressed: {
    opacity: 0.74,
  },

  /* =====================================================
     HEADER
  ===================================================== */

  bar: {
    height: 64,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerButton: {
    width: 40,
    height: 40,

    borderRadius: 13,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#D5E0DA',

    shadowColor: '#244B3B',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.04,
    shadowRadius: 7,

    elevation: 1,
  },

  barTitle: {
    color: '#286A4D',

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 16,
    fontWeight: '700',

    letterSpacing: -0.1,
  },

  /* =====================================================
     HERO
  ===================================================== */

  hero: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 17,

    borderRadius: 21,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#D5E0DA',

    shadowColor: '#244B3B',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 9,

    elevation: 1,
  },

  heroIcon: {
    width: 42,
    height: 42,

    marginBottom: 13,

    borderRadius: 14,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#DDECE4',
  },

  eyebrow: {
    color: '#2F7353',

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 9,

    fontWeight: '700',

    letterSpacing: 1,
  },

  title: {
    marginTop: 6,

    color: '#245F47',

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 25,
    lineHeight: 30,

    fontWeight: '700',

    letterSpacing: -0.3,
  },

  subtitle: {
    maxWidth: 470,

    marginTop: 6,

    color: '#66776F',

    fontFamily: APP_FONT,
    fontSize: 12,
    lineHeight: 18,

    fontWeight: '400',
  },

  heroInfo: {
    marginTop: 15,

    paddingHorizontal: 11,
    paddingVertical: 10,

    borderRadius: 12,

    flexDirection: 'row',
    alignItems: 'flex-start',

    gap: 7,

    backgroundColor: '#F3F8F5',
  },

  heroInfoText: {
    flex: 1,

    color: '#65766D',

    fontFamily: APP_FONT,
    fontSize: 10.5,
    lineHeight: 15,

    fontWeight: '400',
  },

  /* =====================================================
     SECCIÓN
  ===================================================== */

  list: {
    marginTop: 20,
  },

  sectionHeader: {
    marginBottom: 11,

    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  sectionTitle: {
    color: '#286A4D',

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 18,

    fontWeight: '700',
  },

  sectionSubtitle: {
    marginTop: 2,

    color: '#718078',

    fontFamily: APP_FONT,
    fontSize: 10.5,

    fontWeight: '400',
  },

  counter: {
    minWidth: 33,

    paddingHorizontal: 9,
    paddingVertical: 5,

    borderRadius: 10,

    backgroundColor: '#DDECE4',
  },

  counterText: {
    color: '#1D5F4A',

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 10.5,

    fontWeight: '700',

    textAlign: 'center',
  },

  /* =====================================================
     CARD
  ===================================================== */

  card: {
    minHeight: 122,

    marginBottom: 10,
    padding: 11,

    borderRadius: 18,

    flexDirection: 'row',

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#D5E0DA',

    shadowColor: '#244B3B',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.03,
    shadowRadius: 7,

    elevation: 1,
  },

  cardPressed: {
    opacity: 0.86,

    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  cover: {
    width: 82,
    height: 100,

    borderRadius: 14,

    backgroundColor: '#E4ECE8',
  },

  info: {
    flex: 1,
    minWidth: 0,

    marginLeft: 12,
  },

  /* =====================================================
     NOMBRE
  ===================================================== */

  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 5,
  },

  name: {
    flex: 1,

    color: '#34443D',

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 14,

    fontWeight: '700',
  },

  verified: {
    width: 17,
    height: 17,

    borderRadius: 9,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#2F7353',
  },

  service: {
    marginTop: 3,

    color: '#687970',

    fontFamily: APP_FONT,
    fontSize: 10.5,

    fontWeight: '400',
  },

  /* =====================================================
     RATING
  ===================================================== */

  ratingRow: {
    marginTop: 7,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 4,
  },

  rating: {
    color: '#46564E',

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 10.5,

    fontWeight: '700',
  },

  reviews: {
    color: '#87938D',

    fontFamily: APP_FONT,
    fontSize: 9.5,

    fontWeight: '400',
  },

  /* =====================================================
     UBICACIÓN
  ===================================================== */

  locationRow: {
    marginTop: 5,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 3,
  },

  location: {
    flex: 1,

    color: '#78867F',

    fontFamily: APP_FONT,
    fontSize: 9.5,

    fontWeight: '400',
  },

  /* =====================================================
     FOOTER CARD
  ===================================================== */

  footer: {
    marginTop: 9,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    gap: 8,
  },

  whatsapp: {
    minHeight: 32,

    paddingHorizontal: 9,

    borderRadius: 10,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 5,

    backgroundColor: '#DDECE4',

    borderWidth: 1,
    borderColor: '#D1E2D9',
  },

  whatsappPressed: {
    opacity: 0.82,

    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  whatsappText: {
    color: '#1D5F4A',

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 10,

    fontWeight: '700',
  },

  viewProfile: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 4,
  },

  viewProfileText: {
    color: '#2F7353',

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 9.5,

    fontWeight: '600',
  },

  /* =====================================================
     EMPTY STATE
  ===================================================== */

  empty: {
    paddingTop: 56,
    paddingHorizontal: 20,

    alignItems: 'center',
  },

  emptyIcon: {
    width: 72,
    height: 72,

    borderRadius: 36,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#DDECE4',

    borderWidth: 1,
    borderColor: '#D3E5DB',
  },

  emptyIconError: {
    backgroundColor: '#F7EAE6',
    borderColor: '#EED7CF',
  },

  emptyTitle: {
    marginTop: 15,

    color: '#34443D',

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 15,

    fontWeight: '700',

    textAlign: 'center',
  },

  emptyText: {
    maxWidth: 310,

    marginTop: 7,

    color: '#718078',

    fontFamily: APP_FONT,
    fontSize: 11.5,
    lineHeight: 18,

    fontWeight: '400',

    textAlign: 'center',
  },

  emptyTip: {
    maxWidth: 310,

    marginTop: 18,

    paddingHorizontal: 12,
    paddingVertical: 10,

    borderRadius: 12,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 7,

    backgroundColor: '#F3F8F5',

    borderWidth: 1,
    borderColor: '#DDE7E2',
  },

  emptyTipText: {
    flex: 1,

    color: '#66776F',

    fontFamily: APP_FONT,
    fontSize: 10.5,
    lineHeight: 15,

    fontWeight: '400',
  },
});
