import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Platform,
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

export default function IndexScreen() {
  const params = useLocalSearchParams<{
    returnTo?: string;
    role?: LoginRole;
  }>();

  const role =
    params.role === 'municipal_admin'
      ? 'municipal_admin'
      : 'commerce';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();

  const { width, height } = useWindowDimensions();

  const compact = height < 720;

  const screenWidth = Math.min(width, 430);
  const availableWidth = screenWidth - 40;

  const LOGO_ASPECT_RATIO = 1448 / 1086;

  const logoWidth = Math.min(
    availableWidth,
    compact ? 245 : 295,
  );

  const logoHeight =
    logoWidth / LOGO_ASPECT_RATIO;

  const returnTo = Array.isArray(params.returnTo)
    ? params.returnTo[0]
    : params.returnTo;

  const submit = async () => {
    if (isSubmitting) {
      return;
    }

    const loginRole: LoginRole = role;

    setIsSubmitting(true);

    const result = await login({
      email,
      password,
      role: loginRole,
    });

    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    if (loginRole === 'commerce' && result.mustChangePassword) {
      router.replace('/set-password');
      return;
    }

    router.replace(
      returnTo ||
        (loginRole === 'municipal_admin'
          ? '/admin'
          : '/provider-register'),
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          compact && styles.contentCompact,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* LOGO */}
        <View
          style={[
            styles.brandContainer,
            compact && styles.brandContainerCompact,
          ]}
        >
          <Image
            source={require('../../assets/images/logo-login.png')}
            style={{
              width: logoWidth,
              height: logoHeight,
              transform: [
                {
                  scale: 1.05,
                },
              ],
            }}
            contentFit="contain"
            accessibilityLabel="Ranco Conecta"
          />
        </View>

        {/* FORMULARIO */}
        <View style={styles.form}>
          {/* CORREO */}
          <Text
            style={[
              styles.fieldLabel,
              compact && styles.fieldLabelCompact,
            ]}
          >
            Correo
          </Text>

          <View
            style={[
              styles.inputContainer,
              compact && styles.inputContainerCompact,
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={17}
              color="#6F8077"
            />

            <TextInput
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setError('');
              }}
              placeholder="tu correo electrónico"
              placeholderTextColor="#89958F"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              style={styles.textInput}
            />
          </View>

          {/* CONTRASEÑA */}
          <Text
            style={[
              styles.fieldLabel,
              compact && styles.fieldLabelCompact,
            ]}
          >
            Contraseña
          </Text>

          <View
            style={[
              styles.inputContainer,
              compact && styles.inputContainerCompact,
              !!error && styles.inputContainerError,
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={17}
              color="#6F8077"
            />

            <TextInput
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setError('');
              }}
              placeholder="tu contraseña"
              placeholderTextColor="#89958F"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              onSubmitEditing={submit}
              textContentType="password"
              style={styles.textInput}
            />

            <Pressable
              onPress={() =>
                setShowPassword((current) => !current)
              }
              style={styles.eyeButton}
              hitSlop={8}
            >
              <Ionicons
                name={
                  showPassword
                    ? 'eye-off-outline'
                    : 'eye-outline'
                }
                size={19}
                color="#68766F"
              />
            </Pressable>
          </View>

          {/* ERROR */}
          {!!error && (
            <View style={styles.errorContainer}>
              <Ionicons
                name="alert-circle-outline"
                size={15}
                color="#A6543C"
              />

              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>
          )}

          {/* ENTRAR */}
          <Pressable
            onPress={submit}
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.primaryButton,
              compact && styles.primaryButtonCompact,
              pressed && styles.primaryButtonPressed,
              isSubmitting &&
                styles.primaryButtonDisabled,
            ]}
          >
            <Text
              style={[
                styles.primaryButtonText,
                compact &&
                  styles.primaryButtonTextCompact,
              ]}
            >
              {isSubmitting
                ? 'Entrando...'
                : 'Entrar'}
            </Text>

            <Ionicons
              name="arrow-forward"
              size={21}
              color="#FFFFFF"
            />
          </Pressable>

          {/* VISITANTE */}
          <Pressable
            onPress={() =>
              router.replace('/home')
            }
            style={({ pressed }) => [
              styles.guestButton,
              pressed && styles.guestButtonPressed,
            ]}
          >
            <Ionicons
              name="compass-outline"
              size={16}
              color="#2F7353"
            />

            <Text style={styles.guestButtonText}>
              Continuar como visitante
            </Text>
          </Pressable>

          {/* DIVISOR */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />

            <Text style={styles.dividerText}>
              o
            </Text>

            <View style={styles.dividerLine} />
          </View>

          {/* INSCRIPCIÓN */}
          <Pressable
            onPress={() =>
              router.push('/inscribir')
            }
            style={({ pressed }) => [
              styles.joinButton,
              pressed && styles.joinButtonPressed,
            ]}
          >
            <View
              style={styles.joinIconContainer}
            >
              <Ionicons
                name="storefront-outline"
                size={18}
                color="#2F7353"
              />
            </View>

            <View style={styles.joinContent}>
              <Text style={styles.joinTitle}>
                ¿Eres un servicio local?
              </Text>

              <Text style={styles.joinSubtitle}>
                Inscríbete en Ranco Conecta
              </Text>
            </View>

            <Ionicons
              name="arrow-forward"
              size={18}
              color="#2F7353"
            />
          </Pressable>
        </View>

        {/* FOOTER */}
        <Text style={styles.footer}>
          Conectando personas y servicios locales
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* ========================================
     PANTALLA
  ======================================== */

  safeArea: {
    flex: 1,
    backgroundColor: '#EAF3F0',
  },

  content: {
    flexGrow: 1,

    width: '100%',
    maxWidth: 430,

    alignSelf: 'center',

    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,

    justifyContent: 'center',
  },

  contentCompact: {
    paddingTop: 14,
    paddingBottom: 16,
  },

  /* ========================================
     LOGOTIPO
  ======================================== */

  brandContainer: {
    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 5,
  },

  brandContainerCompact: {
    marginBottom: 1,
  },

  /* ========================================
     TARJETA LOGIN
  ======================================== */

  form: {
    width: '100%',

    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,

    borderRadius: 21,

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#D5E0DA',

    shadowColor: '#244B3B',

    shadowOffset: {
      width: 0,
      height: 6,
    },

    shadowOpacity: 0.06,
    shadowRadius: 14,

    elevation: 2,
  },

  /* ========================================
     ETIQUETAS
  ======================================== */

  fieldLabel: {
    marginTop: 12,
    marginBottom: 7,

    color: '#286A4D',

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 13,
    fontWeight: '700',

    letterSpacing: 0.15,
  },

  fieldLabelCompact: {
    marginTop: 9,
    marginBottom: 5,

    fontSize: 12,
  },

  /* ========================================
     INPUTS
  ======================================== */

  inputContainer: {
    minHeight: 50,

    paddingLeft: 14,
    paddingRight: 7,

    borderRadius: 14,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 9,

    backgroundColor: '#F7FAF9',

    borderWidth: 1,
    borderColor: '#CCD9D3',
  },

  inputContainerCompact: {
    minHeight: 45,
  },

  inputContainerError: {
    borderColor: '#C66A58',
  },

  textInput: {
    flex: 1,

    paddingVertical: 12,

    color: '#34443D',

    fontFamily: APP_FONT,
    fontSize: 14,
    fontWeight: '400',

    letterSpacing: 0.05,

    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
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

  /* ========================================
     ERROR
  ======================================== */

  errorContainer: {
    marginTop: 9,

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

  /* ========================================
     BOTÓN PRINCIPAL
  ======================================== */

  primaryButton: {
    height: 52,

    marginTop: 18,

    borderRadius: 14,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 9,

    backgroundColor: '#2F7353',
  },

  primaryButtonCompact: {
    height: 48,
    marginTop: 15,
  },

  primaryButtonPressed: {
    opacity: 0.92,

    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  primaryButtonDisabled: {
    opacity: 0.65,
  },

  primaryButtonText: {
    color: '#FFFFFF',

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 15,
    fontWeight: '700',

    letterSpacing: 0.15,
  },

  primaryButtonTextCompact: {
    fontSize: 14,
  },

  /* ========================================
     VISITANTE
  ======================================== */

  guestButton: {
    minHeight: 42,

    marginTop: 10,

    alignSelf: 'center',

    paddingHorizontal: 10,

    borderRadius: 12,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 6,
  },

  guestButtonPressed: {
    backgroundColor: '#F1F6F3',
  },

  guestButtonText: {
    color: '#2F7353',

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 12.5,
    fontWeight: '700',

    letterSpacing: 0.05,
  },

  /* ========================================
     DIVISOR
  ======================================== */

  dividerContainer: {
    marginVertical: 3,

    flexDirection: 'row',
    alignItems: 'center',

    gap: 9,
  },

  dividerLine: {
    flex: 1,

    height: 1,

    backgroundColor: '#E3EBE7',
  },

  dividerText: {
    color: '#96A09B',

    fontFamily: APP_FONT,
    fontSize: 10,
    fontWeight: '500',
  },

  /* ========================================
     INSCRIBIR SERVICIO
  ======================================== */

  joinButton: {
    minHeight: 60,

    paddingHorizontal: 11,
    paddingVertical: 9,

    borderRadius: 14,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#DDECE4',

    borderWidth: 1,
    borderColor: '#D4E5DC',
  },

  joinButtonPressed: {
    opacity: 0.88,

    transform: [
      {
        scale: 0.995,
      },
    ],
  },

  joinIconContainer: {
    width: 38,
    height: 38,

    marginRight: 9,

    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#F3F8F5',
  },

  joinContent: {
    flex: 1,
  },

  joinTitle: {
    color: '#286A4D',

    fontFamily: APP_FONT_MEDIUM,
    fontSize: 12.5,
    fontWeight: '700',

    letterSpacing: 0.05,
  },

  joinSubtitle: {
    marginTop: 2,

    color: '#667A70',

    fontFamily: APP_FONT,
    fontSize: 10.5,
    fontWeight: '400',

    lineHeight: 14,
  },

  /* ========================================
     FOOTER
  ======================================== */

  footer: {
    marginTop: 13,

    color: '#76867E',

    fontFamily: APP_FONT,
    fontSize: 9.5,
    fontWeight: '400',

    letterSpacing: 0.1,

    textAlign: 'center',
  },
});
