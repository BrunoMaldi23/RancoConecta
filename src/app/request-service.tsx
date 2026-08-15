import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const DATE_OPTIONS = ['Lo antes posible', 'Esta semana', 'Coordinar con el prestador'];

export default function RequestService() {
  const params = useLocalSearchParams<{ providerName?: string; serviceName?: string }>();
  const [address, setAddress] = useState('');
  const [detail, setDetail] = useState('');
  const [dateOption, setDateOption] = useState(DATE_OPTIONS[0]);
  const [photos, setPhotos] = useState<string[]>([]);

  const pickPhotos = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos permiso para adjuntar fotografías desde tu galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.82,
      selectionLimit: 4,
    });

    if (!result.canceled) {
      setPhotos((current) => [...current, ...result.assets.map((asset) => asset.uri)].slice(0, 4));
    }
  };

  const removePhoto = (uri: string) => {
    setPhotos((current) => current.filter((item) => item !== uri));
  };

  const send = () => {
    if (!address.trim() || !detail.trim()) {
      Alert.alert('Faltan datos', 'Ingresa el sector y describe lo que necesitas.');
      return;
    }

    Alert.alert(
      'Solicitud enviada',
      photos.length > 0
        ? `Se envió la solicitud con ${photos.length} fotografía(s) adjunta(s).`
        : 'Se envió la solicitud sin fotografías adjuntas.',
      [{ text: 'Aceptar', onPress: () => router.replace('/contacts') }],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Header title="Solicitar servicio" />

        <View style={styles.summaryLine}>
          <Text style={styles.eyebrow}>Solicitud para</Text>
          <Text numberOfLines={1} style={styles.title}>{String(params.providerName || 'Prestador')}</Text>
          <Text numberOfLines={1} style={styles.light}>{String(params.serviceName || 'Servicio local')}</Text>
        </View>

        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>1</Text>
            </View>
            <View style={styles.stepCopy}>
              <Text style={styles.stepTitle}>¿Dónde necesitas el servicio?</Text>
              <Text style={styles.stepHint}>Sector, calle o referencia cercana.</Text>
            </View>
          </View>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Ej: Futrono, sector urbano"
            placeholderTextColor="#87929E"
            style={styles.input}
          />
        </View>

        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>2</Text>
            </View>
            <View style={styles.stepCopy}>
              <Text style={styles.stepTitle}>Cuéntale qué necesitas</Text>
              <Text style={styles.stepHint}>Mientras más claro, mejor podrá responder.</Text>
            </View>
          </View>
          <TextInput
            value={detail}
            onChangeText={setDetail}
            placeholder="Describe el trabajo con el mayor detalle posible"
            placeholderTextColor="#87929E"
            multiline
            style={[styles.input, styles.area]}
          />
        </View>

        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>3</Text>
            </View>
            <View style={styles.stepCopy}>
              <Text style={styles.stepTitle}>¿Cuándo te acomoda?</Text>
              <Text style={styles.stepHint}>El prestador podrá confirmar disponibilidad.</Text>
            </View>
          </View>
          <View style={styles.dateOptions}>
            {DATE_OPTIONS.map((option) => {
              const active = option === dateOption;

              return (
                <Pressable
                  key={option}
                  onPress={() => setDateOption(option)}
                  style={[styles.dateChip, active && styles.dateChipActive]}
                >
                  <Text style={[styles.dateChipText, active && styles.dateChipTextActive]}>
                    {option}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.stepCard}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepBadge, styles.optionalBadge]}>
              <Ionicons name="camera-outline" size={15} color="#224D78" />
            </View>
            <View style={styles.stepCopy}>
              <Text style={styles.stepTitle}>Fotografías</Text>
              <Text style={styles.stepHint}>Opcional, pero ayuda a cotizar mejor.</Text>
            </View>
          </View>
          <Pressable onPress={pickPhotos} style={styles.attach}>
            <Ionicons name="camera-outline" size={21} color="#224D78" />
            <Text style={styles.attachText}>
              {photos.length > 0 ? `Agregar más (${photos.length}/4)` : 'Agregar fotografías'}
            </Text>
          </Pressable>

          {photos.length > 0 && (
            <View style={styles.photoGrid}>
              {photos.map((photo) => (
                <View key={photo} style={styles.photoItem}>
                  <Image source={{ uri: photo }} style={styles.photo} contentFit="cover" />
                  <Pressable onPress={() => removePhoto(photo)} style={styles.removePhoto}>
                    <Ionicons name="close" size={15} color="#FFFFFF" />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </View>

        <Pressable onPress={send} style={styles.send}>
          <Text style={styles.sendText}>Enviar solicitud</Text>
          <Ionicons name="send" size={18} color="#FFFFFF" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ title }: { title: string }) {
  return (
    <View style={styles.bar}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Ionicons name="arrow-back" size={23} color="#1F446A" />
      </Pressable>
      <Text style={styles.barTitle}>{title}</Text>
      <Pressable onPress={() => router.replace('/home')} style={styles.back}>
        <Ionicons name="home-outline" size={21} color="#224D78" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8F4' },
  content: { width: '100%', maxWidth: 680, alignSelf: 'center', padding: 16, paddingBottom: 40 },
  bar: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E1E6EB' },
  barTitle: { fontSize: 16, fontWeight: '700', color: '#1F446A' },
  summaryLine: { paddingTop: 4, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#E1E6EB' },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, color: '#B97012', textTransform: 'uppercase' },
  title: { fontSize: 22, lineHeight: 27, fontWeight: '700', color: '#1F446A', marginTop: 5 },
  light: { fontSize: 13, color: '#687786', marginTop: 4 },
  stepCard: { marginTop: 13, padding: 14, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E1E6EB' },
  stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  stepBadge: { width: 30, height: 30, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: '#224D78' },
  optionalBadge: { backgroundColor: '#EAF1F7' },
  stepBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  stepCopy: { flex: 1, minWidth: 0, marginLeft: 10 },
  stepTitle: { color: '#1F446A', fontSize: 15, fontWeight: '700' },
  stepHint: { marginTop: 3, color: '#687786', fontSize: 11, lineHeight: 15 },
  input: { minHeight: 52, paddingHorizontal: 14, borderRadius: 15, backgroundColor: '#FDFEFE', borderWidth: 1, borderColor: '#DDE5EC', fontSize: 14, color: '#243F59' },
  area: { height: 116, paddingTop: 14, textAlignVertical: 'top' },
  dateOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dateChip: { minHeight: 38, paddingHorizontal: 12, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F7F8F4', borderWidth: 1, borderColor: '#DDE5EC' },
  dateChipActive: { backgroundColor: '#224D78', borderColor: '#224D78' },
  dateChipText: { color: '#42586C', fontSize: 12, fontWeight: '700' },
  dateChipTextActive: { color: '#FFFFFF' },
  attach: { height: 48, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#EAF1F7' },
  attachText: { fontSize: 13, fontWeight: '700', color: '#224D78' },
  photoGrid: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoItem: { width: 78, height: 78, borderRadius: 16, overflow: 'hidden', backgroundColor: '#DDE5EC' },
  photo: { width: '100%', height: '100%' },
  removePhoto: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(24,54,83,0.82)' },
  send: { height: 56, marginTop: 16, borderRadius: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: '#D89222' },
  sendText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
