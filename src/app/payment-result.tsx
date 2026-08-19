import { Ionicons } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../contexts/auth';

const firstParam = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

type ResultPhase = 'success' | 'cancelled' | 'failed';

export default function PaymentResultScreen() {
  const params = useLocalSearchParams<{
    paymentId?: string;
    result?: string;
  }>();
  const { authReady, user } = useAuth();

  if (!authReady) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2F7353" />
        </View>
      </SafeAreaView>
    );
  }

  const result = firstParam(params.result);
  const phase: ResultPhase =
    result === 'success' ? 'success' : result === 'cancelled' ? 'cancelled' : 'failed';

  if (!user) {
    return <Redirect href="/inscribir" />;
  }

  const isSuccess = phase === 'success';
  const isCancelled = phase === 'cancelled';
  const icon = isSuccess ? 'checkmark' : isCancelled ? 'close' : 'alert-circle-outline';
  const iconColor = isSuccess ? '#2F7353' : '#BF6842';
  const iconWrapper = isSuccess ? styles.iconSuccess : styles.iconFailed;
  const title = isSuccess ? '¡Pago confirmado!' : 'Pago no completado';
  const message = isSuccess
    ? 'Tu membresía fue activada correctamente.'
    : isCancelled
      ? 'Tu pago fue cancelado. Puedes volver a intentarlo cuando quieras.'
      : 'El pago no pudo completarse. Puedes volver a intentarlo cuando quieras.';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topbar}>
          <Pressable onPress={() => router.replace('/home')} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={21} color="#2F7353" />
          </Pressable>
          <Text style={styles.barTitle}>Resultado del pago</Text>
          <Pressable onPress={() => router.replace('/home')} style={styles.headerButton}>
            <Ionicons name="home-outline" size={20} color="#2F7353" />
          </Pressable>
        </View>

        <View style={styles.body}>
          <View style={styles.center}>
            <View style={[styles.iconCircle, iconWrapper]}>
              <Ionicons name={icon} size={34} color={iconColor} />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
            <Pressable
              onPress={() =>
                router.replace(isSuccess ? '/provider-register' : '/inscribir')
              }
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryButtonText}>
                {isSuccess ? 'Completar mi perfil' : 'Volver a intentar'}
              </Text>
              <Ionicons
                name={isSuccess ? 'arrow-forward' : 'refresh'}
                size={18}
                color="#FFFFFF"
              />
            </Pressable>
          </View>
        </View>
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
  },
  barTitle: { color: '#1D5F4A', fontSize: 15.5, fontWeight: '700' },
  body: { flex: 1, justifyContent: 'center', paddingBottom: 60 },
  center: { alignItems: 'center', paddingHorizontal: 20 },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  iconSuccess: { backgroundColor: '#DDECE4', borderColor: '#CBE3D5' },
  iconFailed: { backgroundColor: '#FBEBDD', borderColor: '#F2D8C4' },
  title: {
    marginTop: 18,
    color: '#1D5F4A',
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '700',
    textAlign: 'center',
  },
  message: {
    marginTop: 8,
    maxWidth: 380,
    color: '#718078',
    fontSize: 13.5,
    lineHeight: 20,
    textAlign: 'center',
  },
  primaryButton: {
    minHeight: 54,
    marginTop: 22,
    paddingHorizontal: 22,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2F7353',
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
});