import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function LoginScreen() {
  const handleEnter = () => {
    router.replace('/home');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.logo}>
            <Ionicons
              name="location"
              size={44}
              color="#FFFFFF"
            />
          </View>

          <View style={styles.brand}>
            <Text style={styles.brandPrimary}>Ranco</Text>
            <Text style={styles.brandAccent}>Conecta</Text>
          </View>

          <Text style={styles.description}>
            Encuentra servicios confiables cerca de ti
          </Text>
        </View>

        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            onPress={handleEnter}
            style={({ pressed }) => [
              styles.enterButton,
              pressed && styles.enterButtonPressed,
            ]}
          >
            <Text style={styles.enterButtonText}>Ingresar</Text>

            <Ionicons
              name="arrow-forward"
              size={20}
              color="#FFFFFF"
            />
          </Pressable>

          <Text style={styles.location}>
            Lago Ranco · Futrono · Alrededores
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8F3',
  },

  container: {
    flex: 1,
    width: '100%',
    maxWidth: 500,
    minHeight: 600,
    alignSelf: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 30,
    backgroundColor: '#F7F8F3',
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logo: {
    width: 88,
    height: 88,
    marginBottom: 27,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#276749',
    shadowColor: '#17382A',
    shadowOffset: {
      width: 0,
      height: 9,
    },
    shadowOpacity: 0.17,
    shadowRadius: 15,
    elevation: 7,
  },

  brand: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  brandPrimary: {
    color: '#17382A',
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '800',
    letterSpacing: -1.5,
  },

  brandAccent: {
    color: '#D17B3F',
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '800',
    letterSpacing: -1.5,
  },

  description: {
    maxWidth: 300,
    marginTop: 15,
    color: '#66766D',
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '500',
    textAlign: 'center',
  },

  footer: {
    width: '100%',
  },

  enterButton: {
    minHeight: 58,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    backgroundColor: '#276749',
    shadowColor: '#17382A',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.17,
    shadowRadius: 14,
    elevation: 7,
  },

  enterButtonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.99 }],
  },

  enterButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  location: {
    marginTop: 18,
    color: '#8A968F',
    fontSize: 12,
    textAlign: 'center',
  },
});