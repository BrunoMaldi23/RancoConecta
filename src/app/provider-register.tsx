import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '../contexts/auth';

export default function ProviderRegister() {
  const { user, managedUsers } = useAuth();
  const commerceProfile = managedUsers.find((item) => item.email === user?.email);
  const [businessName, setBusinessName] = useState(commerceProfile?.businessName || '');
  const [serviceName, setServiceName] = useState(commerceProfile?.serviceName || '');
  const [phone, setPhone] = useState(commerceProfile?.phone || '');
  const [submitted, setSubmitted] = useState(false);

  if (!user) {
    return (
      <Redirect
        href={{
          pathname: '/',
          params: { role: 'commerce', returnTo: '/provider-register' },
        }}
      />
    );
  }

  if (user.role !== 'commerce') {
    return <Redirect href="/home" />;
  }

  const submit = () => {
    if (!businessName.trim() || !serviceName.trim() || !phone.trim()) {
      Alert.alert('Faltan datos', 'Completa nombre, servicio y telefono.');
      return;
    }

    setSubmitted(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.topbar}>
          <Pressable onPress={() => router.replace('/home')} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={22} color="#1F446A" />
          </Pressable>
          <Text style={styles.barTitle}>Presencia digital</Text>
          <Pressable onPress={() => router.replace('/home')} style={styles.iconButton}>
            <Ionicons name="home-outline" size={21} color="#224D78" />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>PERMISO MUNICIPAL</Text>
          <Text style={styles.title}>{commerceProfile?.businessName || 'Inscribir comercio o servicio'}</Text>
          <Text style={styles.subtitle}>
            Administra tu presencia digital municipal y revisa el estado de validación.
          </Text>
        </View>

        {commerceProfile && (
          <View style={styles.statusStrip}>
            <View style={styles.statusDot} />
            <View style={styles.statusCopy}>
              <Text style={styles.statusStripTitle}>Esperando validación municipal</Text>
              <Text style={styles.statusStripText}>
                Estado: {commerceProfile.status}. La ficha pública se activará después del permiso.
              </Text>
            </View>
          </View>
        )}

        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Ionicons name="document-text-outline" size={18} color="#224D78" />
            <Text style={styles.summaryLabel}>Permiso</Text>
            <Text style={styles.summaryValue}>Pendiente</Text>
          </View>
          <View style={styles.summaryItem}>
            <Ionicons name="card-outline" size={18} color="#224D78" />
            <Text style={styles.summaryLabel}>Pago</Text>
            <Text style={styles.summaryValue}>Por asociar</Text>
          </View>
        </View>

        {submitted ? (
          <View style={styles.statusCard}>
            <View style={styles.statusIcon}>
              <Ionicons name="time-outline" size={25} color="#8B6421" />
            </View>
            <Text style={styles.statusTitle}>Solicitud enviada</Text>
            <Text style={styles.statusText}>
              Estado: PENDING_MUNICIPAL_APPROVAL. La ficha no sera visible publicamente hasta la validacion municipal.
            </Text>
            <Pressable onPress={() => router.replace('/home')} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Volver al inicio</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Datos iniciales</Text>
            <Text style={styles.sectionText}>
              Estos datos preparan la ficha que revisará administración municipal antes de publicarla.
            </Text>
            <TextInput
              value={businessName}
              onChangeText={setBusinessName}
              placeholder="Nombre del negocio o prestador"
              placeholderTextColor="#87929E"
              style={styles.input}
            />
            <TextInput
              value={serviceName}
              onChangeText={setServiceName}
              placeholder="Servicio principal"
              placeholderTextColor="#87929E"
              style={styles.input}
            />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Telefono o WhatsApp"
              placeholderTextColor="#87929E"
              keyboardType="phone-pad"
              style={styles.input}
            />
            <View style={styles.notice}>
              <Ionicons name="information-circle-outline" size={19} color="#224D78" />
              <Text style={styles.noticeText}>
                Después de enviar, administración podrá asociar el permiso o comprobante municipal.
              </Text>
            </View>
            <Pressable
              onPress={() => Alert.alert('Portal municipal', 'Aquí conectaremos el portal de pago municipal o Tesorería.')}
              style={styles.paymentButton}
            >
              <Ionicons name="card-outline" size={18} color="#224D78" />
              <Text style={styles.paymentButtonText}>Asociar permiso o pago municipal</Text>
            </Pressable>
            <Pressable onPress={submit} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Enviar a revision municipal</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F8F4' },
  content: {
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    padding: 16,
    paddingBottom: 40,
  },
  topbar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
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
    marginTop: 10,
    padding: 23,
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
    fontSize: 29,
    lineHeight: 35,
    fontWeight: '800',
  },
  subtitle: { marginTop: 7, color: '#DCE5ED', fontSize: 13, lineHeight: 20 },
  statusStrip: {
    minHeight: 78,
    marginTop: 13,
    padding: 13,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6EFE3',
    borderWidth: 1,
    borderColor: '#EBDCC4',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#D89222',
  },
  statusCopy: { flex: 1, marginLeft: 11 },
  statusStripTitle: { color: '#8B6421', fontSize: 13, fontWeight: '800' },
  statusStripText: { marginTop: 4, color: '#6D5A3B', fontSize: 11, lineHeight: 16 },
  summaryGrid: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
  },
  summaryItem: {
    flex: 1,
    minHeight: 86,
    padding: 13,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E6EB',
  },
  summaryLabel: { marginTop: 8, color: '#687786', fontSize: 10, fontWeight: '800' },
  summaryValue: { marginTop: 3, color: '#1F446A', fontSize: 13, fontWeight: '800' },
  form: {
    marginTop: 13,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E6EB',
  },
  sectionTitle: { color: '#1F446A', fontSize: 18, fontWeight: '800' },
  sectionText: { marginTop: 5, color: '#687786', fontSize: 12, lineHeight: 18 },
  input: {
    minHeight: 54,
    marginTop: 12,
    paddingHorizontal: 15,
    borderRadius: 16,
    color: '#243F59',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#DDE5EC',
    fontSize: 14,
  },
  notice: {
    marginTop: 13,
    padding: 13,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 9,
    backgroundColor: '#EAF1F7',
  },
  noticeText: { flex: 1, color: '#33506A', fontSize: 12, lineHeight: 17 },
  paymentButton: {
    minHeight: 48,
    marginTop: 12,
    paddingHorizontal: 14,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EAF1F7',
  },
  paymentButtonText: { color: '#224D78', fontSize: 12, fontWeight: '800' },
  primaryButton: {
    height: 54,
    marginTop: 15,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#224D78',
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  statusCard: {
    marginTop: 13,
    padding: 20,
    borderRadius: 22,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E6EB',
  },
  statusIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8ECD5',
  },
  statusTitle: { marginTop: 14, color: '#1F446A', fontSize: 20, fontWeight: '800' },
  statusText: {
    marginTop: 8,
    color: '#536678',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  secondaryButton: {
    minHeight: 48,
    marginTop: 16,
    paddingHorizontal: 16,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EAF1F7',
  },
  secondaryButtonText: { color: '#224D78', fontSize: 13, fontWeight: '800' },
});
