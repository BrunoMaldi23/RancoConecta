import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAuth } from '../contexts/auth';

export default function Profile() {
  const { user, logout } = useAuth();

  if (!user) {
    return <Redirect href={{ pathname: '/', params: { returnTo: '/profile' } }} />;
  }

  const closeSession = () => {
    logout();
    router.replace('/home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.topbar}>
          <Pressable onPress={() => router.replace('/home')} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={22} color="#1F446A" />
          </Pressable>
          <Text style={styles.barTitle}>Perfil</Text>
          <Pressable onPress={() => router.replace('/home')} style={styles.iconButton}>
            <Ionicons name="home-outline" size={21} color="#224D78" />
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.avatar}>
            <Ionicons
              name={user.role === 'municipal_admin' ? 'shield-checkmark-outline' : 'storefront-outline'}
              size={28}
              color="#FFFFFF"
            />
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.role}>
            {user.role === 'municipal_admin' ? 'Administrador municipal' : 'Comercio / prestador'}
          </Text>

          <Pressable
            onPress={() => router.push(user.role === 'municipal_admin' ? '/admin' : '/provider-register')}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>
              {user.role === 'municipal_admin' ? 'Ir al panel municipal' : 'Gestionar solicitud'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </Pressable>

          <Pressable onPress={closeSession} style={styles.secondaryButton}>
            <Ionicons name="log-out-outline" size={18} color="#224D78" />
            <Text style={styles.secondaryButtonText}>Cerrar sesion</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F8F4' },
  content: { width: '100%', maxWidth: 520, alignSelf: 'center', padding: 16 },
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
  card: {
    marginTop: 16,
    padding: 20,
    borderRadius: 22,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E6EB',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#224D78',
  },
  name: { marginTop: 14, color: '#1F446A', fontSize: 22, fontWeight: '800' },
  email: { marginTop: 5, color: '#687786', fontSize: 13, fontWeight: '600' },
  role: {
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 11,
    overflow: 'hidden',
    color: '#224D78',
    backgroundColor: '#EAF1F7',
    fontSize: 11,
    fontWeight: '800',
  },
  primaryButton: {
    height: 52,
    width: '100%',
    marginTop: 18,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#224D78',
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  secondaryButton: {
    height: 50,
    width: '100%',
    marginTop: 10,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EAF1F7',
  },
  secondaryButtonText: { color: '#224D78', fontSize: 13, fontWeight: '800' },
});
