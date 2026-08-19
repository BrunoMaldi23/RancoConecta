import { Ionicons } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '../contexts/auth';
import { MEMBERSHIP_PERIOD_LABEL, MEMBERSHIP_PRICE_LABEL } from '../constants/membership';
import { safeGoBack } from '../lib/navigation';
import { openWebpayCheckout } from '../lib/webpay-navigation';
import {
  clearPendingInscription,
  completeInscriptionSignIn,
  isInscriptionSignIn,
  sendInscriptionLink,
} from '../services/firebase-invites';
import type { Membership } from '../types/backend';
import { createWebpayPayment, webpayReturnUrl } from '../services/webpay';

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

const BENEFITS = [
  'Perfil público de tu servicio',
  'Aparición en búsquedas y categorías',
  'Datos de contacto visibles',
  'Gestión de tu ficha',
];

export default function InscribeScreen() {
  const params = useLocalSearchParams<{
    mode?: string;
    oobCode?: string;
  }>();

  const { authReady, user, profile, refreshProfile } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [paying, setPaying] = useState(false);
  const [membership, setMembership] = useState<Membership | null | undefined>(undefined);

  const completedRef = useRef(false);

  const isCommerce = Boolean(user && user.role === 'commerce');
  const commerceId = isCommerce && user ? user.id : null;
  const membershipActive = membership?.status === 'active';

  useEffect(() => {
    if (completedRef.current || !isInscriptionSignIn(params)) {
      return;
    }

    completedRef.current = true;

    (async () => {
      try {
        await completeInscriptionSignIn();
        await refreshProfile();
        clearPendingInscription();

        router.replace('/inscribir');
      } catch (error) {
        Alert.alert(
          'No se pudo completar la inscripción',
          error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
          [{ text: 'Aceptar' }],
        );
      }
    })();
  }, [params, refreshProfile]);

  useEffect(() => {
    if (!commerceId) {
      return;
    }

    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    import('../services/firebase-memberships')
      .then(({ observeMembership }) => {
        unsubscribe = observeMembership(
          commerceId,
          (value) => {
            if (mounted) {
              setMembership(value);
            }
          },
          () => {
            if (mounted) {
              setMembership(null);
            }
          },
        );
      })
      .catch(() => {
        if (mounted) {
          setMembership(null);
        }
      });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [commerceId]);

  const send = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!name.trim() || !cleanEmail) {
      Alert.alert('Faltan datos', 'Ingresa tu nombre y tu correo para continuar.');
      return;
    }

    if (sending) {
      return;
    }

    setSending(true);

    try {
      await sendInscriptionLink(name.trim(), cleanEmail);
      setSent(true);
    } catch (error) {
      Alert.alert(
        'No se pudo enviar el enlace',
        error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
      );
    } finally {
      setSending(false);
    }
  };

  const pay = async () => {
    if (paying || !user) {
      return;
    }

    setPaying(true);

    try {
      const returnUrl = webpayReturnUrl();

      if (!returnUrl) {
        throw new Error('El servicio de pagos no está configurado.');
      }

      const payment = await createWebpayPayment({
        email: profile?.email || user.email,
        name: profile?.name || user.name,
        returnUrl,
      });

      openWebpayCheckout(payment.token, payment.url);
    } catch (error) {
      Alert.alert(
        'No pudimos iniciar el pago',
        error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
      );
    } finally {
      setPaying(false);
    }
  };

  if (!authReady) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2F7353" />
        </View>
      </SafeAreaView>
    );
  }

  if (user && user.role !== 'commerce') {
    return <Redirect href="/home" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topbar}>
          <Pressable onPress={() => safeGoBack('/home')} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
            <Ionicons name="arrow-back" size={21} color="#2F7353" />
          </Pressable>
          <Text style={styles.barTitle}>Inscribir mi servicio</Text>
          <Pressable onPress={() => router.replace('/home')} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
            <Ionicons name="home-outline" size={20} color="#2F7353" />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="storefront-outline" size={23} color="#2F7353" />
          </View>
          <Text style={styles.eyebrow}>RANCO CONECTA</Text>
          <Text style={styles.title}>Haz visible tu servicio</Text>
          <Text style={styles.subtitle}>
            Completa tu inscripción, activa tu membresía y crea tu perfil para
            formar parte del directorio de servicios locales.
          </Text>
        </View>

        {!isCommerce ? (
          sent ? (
            <View style={styles.center}>
              <View style={styles.successIcon}>
                <Ionicons name="mail-unread-outline" size={31} color="#2F7353" />
              </View>
              <Text style={styles.sectionTitle}>Revisa tu correo</Text>
              <Text style={styles.sectionText}>
                Enviamos un enlace a{' '}
                <Text style={styles.highlight}>{email.trim().toLowerCase()}</Text>. Ábrelo para
                confirmar tu cuenta y continuar con el registro de tu servicio.
              </Text>
              <Pressable onPress={() => router.replace('/home')} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
                <Text style={styles.primaryButtonText}>Volver al inicio</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepHeaderCopy}>
                  <Text style={styles.stepTitle}>Registra tus datos</Text>
                  <Text style={styles.stepDescription}>
                    Te enviaremos un enlace seguro para confirmar tu cuenta.
                  </Text>
                </View>
              </View>

              <Text style={styles.fieldLabel}>Nombre</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={17} color="#6E7D75" />
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Tu nombre o el de tu negocio"
                  placeholderTextColor="#89958F"
                  autoCapitalize="words"
                  style={styles.input}
                />
              </View>

              <Text style={styles.fieldLabel}>Correo</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={17} color="#6E7D75" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="tu@correo.cl"
                  placeholderTextColor="#89958F"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  style={styles.input}
                />
              </View>

              <Pressable
                onPress={send}
                disabled={sending}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, sending && styles.disabled]}
              >
                <Text style={styles.primaryButtonText}>
                  {sending ? 'Enviando…' : 'Enviar enlace de inscripción'}
                </Text>
                {!sending && <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
              </Pressable>

              <View style={styles.securityRow}>
                <Ionicons name="shield-checkmark-outline" size={14} color="#718078" />
                <Text style={styles.securityText}>Recibirás un enlace seguro en tu correo.</Text>
              </View>
            </>
          )
        ) : (
          <>
            {membershipActive ? (
              <View style={styles.activeSection}>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark" size={30} color="#2F7353" />
                </View>
                <Text style={styles.sectionTitle}>Tu membresía está activa</Text>
                <Text style={styles.sectionText}>
                  Tu servicio puede aparecer en el directorio. Completa o administra tu ficha
                  cuando quieras.
                </Text>
                <Pressable
                  onPress={() => router.replace('/provider-register')}
                  style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                >
                  <Text style={styles.primaryButtonText}>Completar / administrar mi perfil</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                </Pressable>
              </View>
            ) : (
              <>
                <View style={styles.stepHeader}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <View style={styles.stepHeaderCopy}>
                    <Text style={styles.stepTitle}>Activa tu membresía</Text>
                    <Text style={styles.stepDescription}>
                      Activa tu membresía anual para habilitar tu perfil de servicio.
                    </Text>
                  </View>
                </View>

                <View style={styles.verifiedRow}>
                  <Ionicons name="checkmark-circle" size={15} color="#2F7353" />
                  <Text style={styles.verifiedText}>Cuenta verificada</Text>
                </View>

                <View style={styles.membershipPanel}>
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>{MEMBERSHIP_PRICE_LABEL}</Text>
                    <Text style={styles.pricePeriod}>{MEMBERSHIP_PERIOD_LABEL}</Text>
                  </View>
                  <Text style={styles.priceCaption}>Membresía Ranco Conecta · pago único anual</Text>

                  <View style={styles.divider} />

                  <Text style={styles.benefitsTitle}>Incluye</Text>
                  {BENEFITS.map((benefit) => (
                    <View key={benefit} style={styles.benefitRow}>
                      <Ionicons name="checkmark" size={15} color="#2F7353" />
                      <Text style={styles.benefitText}>{benefit}</Text>
                    </View>
                  ))}
                </View>

                {membership === undefined ? (
                  <View style={styles.center}>
                    <ActivityIndicator size="small" color="#2F7353" />
                  </View>
                ) : (
                  <Pressable
                    onPress={pay}
                    disabled={paying}
                    style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, paying && styles.disabled]}
                  >
                    <Text style={styles.primaryButtonText}>
                      {paying ? 'Iniciando pago…' : 'Continuar al pago'}
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </Pressable>
                )}

                <View style={styles.securityRow}>
                  <Ionicons name="shield-checkmark-outline" size={14} color="#718078" />
                  <Text style={styles.securityText}>Pago seguro mediante Webpay.</Text>
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#EAF3F0' },
  content: {
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingBottom: 42,
    flexGrow: 1,
  },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.6 },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  topbar: {
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
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 7,
    elevation: 1,
  },
  barTitle: { color: '#286A4D', fontFamily: APP_FONT_MEDIUM, fontSize: 15.5, fontWeight: '700' },
  hero: { paddingTop: 16, paddingBottom: 24 },
  heroIcon: {
    width: 44,
    height: 44,
    marginBottom: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DDECE4',
    borderWidth: 1,
    borderColor: '#D2E4DA',
  },
  eyebrow: {
    color: '#2F7353',
    fontFamily: APP_FONT_MEDIUM,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  title: {
    marginTop: 6,
    color: '#245F47',
    fontFamily: APP_FONT_MEDIUM,
    fontSize: 27,
    lineHeight: 32,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  subtitle: {
    maxWidth: 490,
    marginTop: 7,
    color: '#687970',
    fontFamily: APP_FONT,
    fontSize: 12.5,
    lineHeight: 19,
  },
  stepHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  stepNumber: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2F7353',
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontFamily: APP_FONT_MEDIUM,
    fontSize: 13,
    fontWeight: '700',
  },
  stepHeaderCopy: { flex: 1, marginLeft: 11 },
  stepTitle: {
    color: '#286A4D',
    fontFamily: APP_FONT_MEDIUM,
    fontSize: 15,
    fontWeight: '700',
  },
  stepDescription: {
    maxWidth: 420,
    marginTop: 3,
    color: '#718078',
    fontFamily: APP_FONT,
    fontSize: 10.5,
    lineHeight: 16,
  },
  verifiedRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  verifiedText: {
    color: '#2F7353',
    fontFamily: APP_FONT_MEDIUM,
    fontSize: 11,
    fontWeight: '600',
  },
  membershipPanel: {
    marginTop: 16,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5E0DA',
  },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  price: {
    color: '#1D5F4A',
    fontFamily: APP_FONT_MEDIUM,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  pricePeriod: {
    color: '#718078',
    fontFamily: APP_FONT,
    fontSize: 14,
    fontWeight: '500',
  },
  priceCaption: {
    marginTop: 2,
    color: '#718078',
    fontFamily: APP_FONT,
    fontSize: 11,
  },
  divider: { height: 1, marginVertical: 15, backgroundColor: '#E4ECE6' },
  benefitsTitle: {
    color: '#34443D',
    fontFamily: APP_FONT_MEDIUM,
    fontSize: 11.5,
    fontWeight: '700',
    marginBottom: 9,
  },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  benefitText: {
    color: '#34443D',
    fontFamily: APP_FONT,
    fontSize: 12,
    lineHeight: 17,
  },
  fieldLabel: {
    marginTop: 20,
    marginBottom: 7,
    color: '#496057',
    fontFamily: APP_FONT_MEDIUM,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputContainer: {
    minHeight: 54,
    paddingLeft: 14,
    paddingRight: 10,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5E0DA',
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: '#34443D',
    fontFamily: APP_FONT,
    fontSize: 13.5,
    ...Platform.select({
      web: { outlineStyle: 'none' } as any,
      default: {},
    }),
  },
  primaryButton: {
    minHeight: 54,
    marginTop: 20,
    paddingHorizontal: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2F7353',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontFamily: APP_FONT_MEDIUM,
    fontSize: 13,
    fontWeight: '700',
  },
  securityRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  securityText: {
    color: '#718078',
    fontFamily: APP_FONT,
    fontSize: 10,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DDECE4',
    borderWidth: 1,
    borderColor: '#D2E4DA',
  },
  sectionTitle: {
    marginTop: 16,
    color: '#245F47',
    fontFamily: APP_FONT_MEDIUM,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  sectionText: {
    maxWidth: 410,
    marginTop: 8,
    color: '#687970',
    fontFamily: APP_FONT,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
  },
  highlight: {
    color: '#286A4D',
    fontFamily: APP_FONT_MEDIUM,
    fontWeight: '700',
  },
  activeSection: { alignItems: 'center', paddingTop: 20 },
});