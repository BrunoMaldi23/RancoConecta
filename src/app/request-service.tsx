import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { AlertButton } from 'react-native';

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

  const chooseDate = () => {
    const buttons: AlertButton[] = [
      ...DATE_OPTIONS.map((option) => ({ text: option, onPress: () => setDateOption(option) })),
      { text: 'Cancelar', style: 'cancel' },
    ];

    Alert.alert(
      'Fecha preferida',
      'Selecciona cuándo necesitas el servicio.',
      buttons,
    );
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

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>SOLICITUD PARA</Text>
          <Text style={styles.title}>{String(params.providerName || 'Prestador')}</Text>
          <Text style={styles.light}>{String(params.serviceName || 'Servicio local')}</Text>
        </View>

        <Label text="Sector o dirección" />
        <TextInput
          value={address}
          onChangeText={setAddress}
          placeholder="Ej: Futrono, sector urbano"
          placeholderTextColor="#87929E"
          style={styles.input}
        />

        <Label text="¿Qué necesitas resolver?" />
        <TextInput
          value={detail}
          onChangeText={setDetail}
          placeholder="Describe el trabajo con el mayor detalle posible"
          placeholderTextColor="#87929E"
          multiline
          style={[styles.input, styles.area]}
        />

        <Label text="Fecha preferida" />
        <Pressable onPress={chooseDate} style={styles.selector}>
          <Ionicons name="calendar-outline" size={20} color="#224D78" />
          <Text style={styles.selectorText}>{dateOption}</Text>
          <Ionicons name="chevron-down" size={18} color="#87929E" />
        </Pressable>

        <Pressable onPress={pickPhotos} style={styles.attach}>
          <Ionicons name="camera-outline" size={21} color="#224D78" />
          <Text style={styles.attachText}>
            {photos.length > 0 ? `Agregar más fotografías (${photos.length}/4)` : 'Agregar fotografías'}
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

function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8F4' },
  content: { width: '100%', maxWidth: 680, alignSelf: 'center', padding: 16, paddingBottom: 40 },
  bar: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E1E6EB' },
  barTitle: { fontSize: 16, fontWeight: '800', color: '#1F446A' },
  hero: { padding: 21, borderRadius: 22, backgroundColor: '#183653' },
  eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.1, color: '#D2DEE8' },
  title: { fontSize: 23, fontWeight: '800', color: '#FFFFFF', marginTop: 7 },
  light: { fontSize: 12, color: '#DCE5ED', marginTop: 4 },
  label: { fontSize: 13, fontWeight: '800', color: '#243F59', marginTop: 18, marginBottom: 7 },
  input: { minHeight: 54, paddingHorizontal: 15, borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDE5EC', fontSize: 14, color: '#243F59' },
  area: { height: 130, paddingTop: 14, textAlignVertical: 'top' },
  selector: { height: 55, paddingHorizontal: 15, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#DDE5EC' },
  selectorText: { flex: 1, fontSize: 13, color: '#42586C' },
  attach: { height: 54, marginTop: 14, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#EAF1F7' },
  attachText: { fontSize: 13, fontWeight: '800', color: '#224D78' },
  photoGrid: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoItem: { width: 78, height: 78, borderRadius: 16, overflow: 'hidden', backgroundColor: '#DDE5EC' },
  photo: { width: '100%', height: '100%' },
  removePhoto: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(24,54,83,0.82)' },
  send: { height: 58, marginTop: 20, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, backgroundColor: '#D89222' },
  sendText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
});
