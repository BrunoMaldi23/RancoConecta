import { Ionicons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import { Image } from 'expo-image';
import Head from 'expo-router/head';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';

import { useAuth, type UserRole } from '../contexts/auth';

type LoginRole = Exclude<UserRole, 'guest'>;

const loginBackground = require('../../assets/images/ranco-login-bg-mobile.jpg');
const loginLogo = require('../../assets/images/logo-ranco-login.png');
const loginBackgroundUri = Asset.fromModule(loginBackground).uri;
const loginLogoUri = Asset.fromModule(loginLogo).uri;

export default function IndexScreen() {
  const params = useLocalSearchParams<{ returnTo?: string; role?: LoginRole }>();
  const requestedRole = params.role === 'municipal_admin' ? 'municipal_admin' : 'commerce';
  const role = requestedRole;
  const [email, setEmail] = useState(role === 'municipal_admin' ? 'admin@lagoranco.cl' : 'comercio@demo.cl');
  const [password, setPassword] = useState(role === 'municipal_admin' ? 'ranco-admin' : 'comercio-demo');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { height } = useWindowDimensions();
  const compact = height < 720;

  const returnTo = Array.isArray(params.returnTo) ? params.returnTo[0] : params.returnTo;

  const submit = async () => {
    if (isSubmitting) {
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const loginRole: LoginRole = normalizedEmail === 'admin@lagoranco.cl' ? 'municipal_admin' : role;

    setIsSubmitting(true);
    const result = await login({ email, password, role: loginRole });
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    router.replace(returnTo || (loginRole === 'municipal_admin' ? '/admin' : '/provider-register'));
  };

  return (
    <>
      <Head>
        <link rel="preload" as="image" href={loginBackgroundUri} fetchPriority="high" />
        <link rel="preload" as="image" href={loginLogoUri} fetchPriority="high" />
      </Head>
      <SafeAreaView style={styles.safeArea}>
        <Image
          source={loginBackground}
          style={styles.backgroundImage}
          cachePolicy="memory-disk"
          contentFit="cover"
          contentPosition="center"
          priority="high"
        />
        <View style={styles.backgroundOverlay} />
        <ScrollView
          contentContainerStyle={[styles.content, compact && styles.contentCompact]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.logoHeader, compact && styles.logoHeaderCompact]}>
            <Image
              source={loginLogo}
              style={[styles.logo, compact && styles.logoCompact]}
              cachePolicy="memory-disk"
              contentFit="contain"
              priority="high"
            />
            <Text style={[styles.title, compact && styles.titleCompact]}>Ranco Conecta</Text>
            <Text style={[styles.subtitle, compact && styles.subtitleCompact]}>
              Plataforma Oficial de Servicios Locales
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={[styles.fieldLabel, compact && styles.fieldLabelCompact]}>Correo</Text>
            <TextInput
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setError('');
              }}
              placeholder={role === 'municipal_admin' ? 'admin@lagoranco.cl' : 'comercio@demo.cl'}
              placeholderTextColor="#87929E"
              autoCapitalize="none"
              keyboardType="email-address"
              style={[styles.input, compact && styles.inputCompact]}
            />

            <Text style={[styles.fieldLabel, compact && styles.fieldLabelCompact]}>Contraseña</Text>
            <View style={[styles.passwordBox, compact && styles.passwordBoxCompact, !!error && styles.passwordBoxError]}>
              <TextInput
                value={password}
                onChangeText={(value) => {
                  setPassword(value);
                  setError('');
                }}
                placeholder={role === 'municipal_admin' ? 'ranco-admin' : 'comercio-demo'}
                placeholderTextColor="#87929E"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="go"
                onSubmitEditing={submit}
                style={[styles.passwordInput, compact && styles.passwordInputCompact]}
              />
              <Pressable onPress={() => setShowPassword((current) => !current)} style={styles.eyeButton}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#536678" />
              </Pressable>
            </View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <Pressable onPress={submit} style={[styles.primaryButton, compact && styles.primaryButtonCompact]}>
              <Text style={[styles.primaryButtonText, compact && styles.primaryButtonTextCompact]}>
                {isSubmitting ? 'Entrando' : 'Entrar'}
              </Text>
              <Ionicons name="arrow-forward" size={compact ? 22 : 28} color="#FFFFFF" />
            </Pressable>

            <Pressable onPress={() => router.replace('/home')} style={[styles.guestButton, compact && styles.guestButtonCompact]}>
              <Text style={[styles.guestButtonText, compact && styles.guestButtonTextCompact]}>
                Continuar como visitante
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#DDEAF0',
    // @ts-expect-error React Native Web accepts CSS background images.
    backgroundImage: `url(${loginBackgroundUri})`,
    backgroundPosition: 'center',
    backgroundSize: 'cover',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(251, 252, 248, 0.56)',
  },
  content: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 470,
    alignSelf: 'center',
    paddingHorizontal: 30,
    paddingTop: 72,
    paddingBottom: 54,
    justifyContent: 'center',
    position: 'relative',
  },
  contentCompact: {
    paddingHorizontal: 21,
    paddingTop: 38,
    paddingBottom: 28,
  },
  logoHeader: {
    alignItems: 'center',
    marginBottom: 52,
  },
  logoHeaderCompact: {
    marginBottom: 34,
  },
  logo: {
    width: 128,
    height: 128,
  },
  logoCompact: {
    width: 90,
    height: 90,
  },
  title: {
    marginTop: 18,
    color: '#1F446A',
    fontSize: 31,
    lineHeight: 37,
    fontWeight: '900',
    textAlign: 'center',
  },
  titleCompact: {
    marginTop: 11,
    fontSize: 24,
    lineHeight: 29,
  },
  subtitle: {
    marginTop: 8,
    color: '#687786',
    fontSize: 19,
    lineHeight: 25,
    textAlign: 'center',
  },
  subtitleCompact: {
    marginTop: 5,
    maxWidth: 260,
    fontSize: 14,
    lineHeight: 19,
  },
  form: {
    zIndex: 1,
  },
  fieldLabel: {
    marginTop: 16,
    marginBottom: 8,
    color: '#1F446A',
    fontSize: 15,
    fontWeight: '900',
  },
  fieldLabelCompact: {
    marginTop: 12,
    marginBottom: 6,
    fontSize: 12,
  },
  input: {
    minHeight: 64,
    paddingHorizontal: 19,
    borderRadius: 13,
    color: '#243F59',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D8DE',
    fontSize: 20,
  },
  inputCompact: {
    minHeight: 45,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  passwordBox: {
    minHeight: 64,
    paddingLeft: 19,
    paddingRight: 8,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D8DE',
  },
  passwordBoxCompact: {
    minHeight: 45,
    paddingLeft: 14,
  },
  passwordBoxError: { borderColor: '#C66A58' },
  passwordInput: {
    flex: 1,
    paddingVertical: 17,
    marginRight: 8,
    color: '#243F59',
    fontSize: 20,
    fontWeight: '500',
  },
  passwordInputCompact: {
    paddingVertical: 11,
    fontSize: 14,
  },
  eyeButton: {
    width: 48,
    height: 48,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: { marginTop: 9, color: '#9A4236', fontSize: 12, fontWeight: '700' },
  primaryButton: {
    height: 66,
    marginTop: 24,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#1F446A',
  },
  primaryButtonCompact: {
    height: 50,
    marginTop: 17,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 21, fontWeight: '900' },
  primaryButtonTextCompact: { fontSize: 15 },
  guestButton: {
    minHeight: 52,
    marginTop: 25,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  guestButtonCompact: {
    minHeight: 42,
    marginTop: 18,
  },
  guestButtonText: {
    color: '#1F446A',
    fontSize: 19,
    fontWeight: '900',
    textDecorationLine: 'underline',
  },
  guestButtonTextCompact: {
    fontSize: 14,
  },
});
