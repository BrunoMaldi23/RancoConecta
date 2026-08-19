import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
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

export default function SetPasswordScreen() {
  const { authReady, user } = useAuth();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const submit = async () => {
    if (saving) {
      return;
    }

    setError('');

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setSaving(true);

    try {
      const { changeOwnPassword } = await import('../services/firebase-users');
      await changeOwnPassword(password);
      router.replace('/provider-register');
    } catch (caught) {
      Alert.alert(
        'No se pudo cambiar la contraseña',
        caught instanceof Error ? caught.message : 'Ocurrió un error inesperado.',
      );
    } finally {
      setSaving(false);
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

  if (!user) {
    return <Redirect href="/" />;
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
          <Text style={styles.barTitle}>Crear mi contraseña</Text>
          <Pressable onPress={() => router.replace('/home')} style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}>
            <Ionicons name="home-outline" size={20} color="#2F7353" />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="lock-closed-outline" size={23} color="#2F7353" />
          </View>
          <Text style={styles.eyebrow}>RANCO CONECTA</Text>
          <Text style={styles.title}>Define tu contraseña</Text>
          <Text style={styles.subtitle}>
            Usaste una contraseña temporal para ingresar. Crea una propia para entrar desde
            ahora con más seguridad.
          </Text>
        </View>

        <Text style={styles.fieldLabel}>Nueva contraseña</Text>
        <View style={[styles.inputContainer, !!error && styles.inputContainerError]}>
          <Ionicons name="lock-closed-outline" size={17} color="#6E7D75" />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor="#89958F"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
          <Pressable onPress={() => setShowPassword((current) => !current)} hitSlop={8} style={styles.eyeButton}>
            <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={19} color="#68766F" />
          </Pressable>
        </View>

        <Text style={styles.fieldLabel}>Repite la contraseña</Text>
        <View style={[styles.inputContainer, !!error && styles.inputContainerError]}>
          <Ionicons name="lock-closed-outline" size={17} color="#6E7D75" />
          <TextInput
            value={confirm}
            onChangeText={setConfirm}
            placeholder="Repite tu contraseña"
            placeholderTextColor="#89958F"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={submit}
            style={styles.input}
          />
        </View>

        {!!error && (
          <View style={styles.errorRow}>
            <Ionicons name="alert-circle-outline" size={15} color="#A6543C" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Pressable
          onPress={submit}
          disabled={saving}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, saving && styles.disabled]}
        >
          <Text style={styles.primaryButtonText}>{saving ? 'Guardando…' : 'Guardar mi contraseña'}</Text>
          {!saving && <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
        </Pressable>
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
  },
  barTitle: { color: '#286A4D', fontFamily: APP_FONT_MEDIUM, fontSize: 15.5, fontWeight: '700' },
  hero: { paddingTop: 16, paddingBottom: 8 },
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
  inputContainerError: { borderColor: '#C66A58' },
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
  eyeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  errorRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  errorText: {
    flex: 1,
    color: '#9A4E38',
    fontFamily: APP_FONT_MEDIUM,
    fontSize: 11.5,
    fontWeight: '600',
    lineHeight: 16,
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
});