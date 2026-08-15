import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { useMemo, useState } from 'react';
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

import { PROVIDERS, type Provider } from '../data/providers';

type IconName = ComponentProps<typeof Ionicons>['name'];

type SpaceStatus = 'Publicado' | 'Pendiente' | 'Pausado';

type AccessCredential = {
  code: string;
  role: string;
  scope: string;
  icon: IconName;
};

const ACCESS_CREDENTIALS: AccessCredential[] = [
  {
    code: 'ranco-admin',
    role: 'Administrador general',
    scope: 'Puede gestionar perfiles, categorías, subcategorías y destacados.',
    icon: 'shield-checkmark-outline',
  },
  {
    code: 'ranco-editor',
    role: 'Editor de contenidos',
    scope: 'Puede preparar perfiles y ordenar contenido pendiente.',
    icon: 'create-outline',
  },
  {
    code: 'ranco-soporte',
    role: 'Soporte municipal',
    scope: 'Puede revisar solicitudes y contactar prestadores.',
    icon: 'headset-outline',
  },
];

type ManagedProvider = Provider & {
  plan: 'Base' | 'Destacado';
  status: SpaceStatus;
};

type ManagedCategory = {
  id: string;
  name: string;
  description: string;
  status: SpaceStatus;
};

type ManagedSubcategory = {
  id: string;
  categoryId: string;
  name: string;
  status: SpaceStatus;
};

const INITIAL_PROVIDERS: ManagedProvider[] = PROVIDERS.map((provider, index) => ({
  ...provider,
  plan: index === 0 ? 'Destacado' : 'Base',
  status: provider.available ? 'Publicado' : 'Pausado',
}));

const INITIAL_CATEGORIES: ManagedCategory[] = [
  { id: 'hogar', name: 'Hogar y reparaciones', description: 'Oficios y reparaciones para viviendas.', status: 'Publicado' },
  { id: 'campo', name: 'Jardín y parcela', description: 'Servicios de campo, poda, riego y terrenos.', status: 'Publicado' },
  { id: 'energia', name: 'Energía y conectividad', description: 'Electricidad, energía solar e internet.', status: 'Publicado' },
];

const INITIAL_SUBCATEGORIES: ManagedSubcategory[] = [
  { id: 'electricidad', categoryId: 'hogar', name: 'Electricidad', status: 'Publicado' },
  { id: 'gasfiteria', categoryId: 'hogar', name: 'Gasfitería', status: 'Publicado' },
  { id: 'poda', categoryId: 'campo', name: 'Poda y tala', status: 'Publicado' },
  { id: 'solar', categoryId: 'energia', name: 'Energía solar', status: 'Publicado' },
];

export default function AdminScreen() {
  const [accessCode, setAccessCode] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [sessionRole, setSessionRole] = useState<AccessCredential | null>(null);
  const [showAccessCode, setShowAccessCode] = useState(false);
  const [accessError, setAccessError] = useState('');
  const [providers, setProviders] = useState(INITIAL_PROVIDERS);
  const [businessName, setBusinessName] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [phone, setPhone] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [subcategories, setSubcategories] = useState(INITIAL_SUBCATEGORIES);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [subcategoryName, setSubcategoryName] = useState('');
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editService, setEditService] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editImage, setEditImage] = useState('');

  const stats = useMemo(() => {
    const published = providers.filter((provider) => provider.status === 'Publicado').length;
    const featured = providers.filter((provider) => provider.plan === 'Destacado').length;
    const paused = providers.filter((provider) => provider.status === 'Pausado').length;

    return { published, featured, paused, total: providers.length };
  }, [providers]);

  const authorize = () => {
    const credential = ACCESS_CREDENTIALS.find(
      (item) => item.code === accessCode.trim().toLowerCase(),
    );

    if (!credential) {
      setAccessError('Revisa la clave e intenta nuevamente.');
      Alert.alert('Clave incorrecta', 'Este acceso es solo para administradores.');
      return;
    }

    setSessionRole(credential);
    setAccessError('');
    setAccessCode('');
    setIsAuthorized(true);
  };

  const closeSession = () => {
    setIsAuthorized(false);
    setSessionRole(null);
    setShowAccessCode(false);
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/home');
  };

  const startEditingProvider = (provider: ManagedProvider) => {
    setEditingProviderId(provider.id);
    setEditName(provider.name);
    setEditService(provider.service);
    setEditPhone(provider.phone);
    setEditImage(provider.images[0] ?? '');
  };

  const cancelEditingProvider = () => {
    setEditingProviderId(null);
    setEditName('');
    setEditService('');
    setEditPhone('');
    setEditImage('');
  };

  const pickProviderImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permiso requerido', 'Necesitamos permiso para cargar una imagen del servicio.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.82,
      allowsMultipleSelection: false,
    });

    if (!result.canceled) {
      setEditImage(result.assets[0]?.uri ?? '');
    }
  };

  const saveProviderChanges = () => {
    if (!editingProviderId || !editName.trim() || !editService.trim() || !editPhone.trim()) {
      Alert.alert('Faltan datos', 'Completa nombre, servicio y teléfono antes de guardar.');
      return;
    }

    setProviders((current) =>
      current.map((provider) =>
        provider.id === editingProviderId
          ? {
              ...provider,
              name: editName.trim(),
              service: editService.trim(),
              phone: editPhone.trim(),
              whatsapp: editPhone.replace(/\D/g, ''),
              images: editImage.trim() ? [editImage.trim(), ...provider.images.slice(1)] : provider.images,
            }
          : provider,
      ),
    );
    cancelEditingProvider();
    Alert.alert('Perfil actualizado', 'Los cambios quedaron preparados en el panel.');
  };

  const toggleStatus = (providerId: string) => {
    setProviders((current) =>
      current.map((provider) =>
        provider.id === providerId
          ? {
              ...provider,
              status: provider.status === 'Publicado' ? 'Pausado' : 'Publicado',
              available: provider.status !== 'Publicado',
            }
          : provider,
      ),
    );
  };

  const togglePlan = (providerId: string) => {
    setProviders((current) =>
      current.map((provider) =>
        provider.id === providerId
          ? {
              ...provider,
              plan: provider.plan === 'Destacado' ? 'Base' : 'Destacado',
            }
          : provider,
      ),
    );
  };

  const addPendingSpace = () => {
    if (!businessName.trim() || !serviceName.trim() || !phone.trim()) {
      Alert.alert('Faltan datos', 'Ingresa nombre, servicio y teléfono.');
      return;
    }

    const nextProvider: ManagedProvider = {
      id: businessName.trim().toLowerCase().replace(/\s+/g, '-'),
      name: businessName.trim(),
      service: serviceName.trim(),
      categoryId: 'hogar',
      subcategoryId: 'electricidad',
      locationId: 'lago-ranco',
      locationName: 'Lago Ranco',
      rating: 0,
      reviews: 0,
      distance: 'Por definir',
      verified: false,
      available: false,
      phone: phone.trim(),
      whatsapp: phone.replace(/\D/g, ''),
      description: 'Espacio pendiente de completar por administración.',
      coverage: ['Lago Ranco'],
      images: [
        imageUrl.trim() ||
          'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80',
      ],
      plan: 'Base',
      status: 'Pendiente',
    };

    setProviders((current) => [nextProvider, ...current]);
    setBusinessName('');
    setServiceName('');
    setPhone('');
    setImageUrl('');
    Alert.alert('Espacio preparado', 'Quedó agregado como pendiente para completar y publicar.');
  };

  const addCategory = () => {
    if (!categoryName.trim() || !categoryDescription.trim()) {
      Alert.alert('Faltan datos', 'Ingresa nombre y descripción de la categoría.');
      return;
    }

    setCategories((current) => [
      {
        id: categoryName.trim().toLowerCase().replace(/\s+/g, '-'),
        name: categoryName.trim(),
        description: categoryDescription.trim(),
        status: 'Pendiente',
      },
      ...current,
    ]);
    setCategoryName('');
    setCategoryDescription('');
  };

  const addSubcategory = () => {
    if (!subcategoryName.trim()) {
      Alert.alert('Faltan datos', 'Ingresa el nombre de la subcategoría.');
      return;
    }

    setSubcategories((current) => [
      {
        id: subcategoryName.trim().toLowerCase().replace(/\s+/g, '-'),
        categoryId: categories[0]?.id ?? 'hogar',
        name: subcategoryName.trim(),
        status: 'Pendiente',
      },
      ...current,
    ]);
    setSubcategoryName('');
  };

  const toggleCategory = (categoryId: string) => {
    setCategories((current) =>
      current.map((category) =>
        category.id === categoryId
          ? { ...category, status: category.status === 'Publicado' ? 'Pausado' : 'Publicado' }
          : category,
      ),
    );
  };

  const toggleSubcategory = (subcategoryId: string) => {
    setSubcategories((current) =>
      current.map((subcategory) =>
        subcategory.id === subcategoryId
          ? { ...subcategory, status: subcategory.status === 'Publicado' ? 'Pausado' : 'Publicado' }
          : subcategory,
      ),
    );
  };

  if (!isAuthorized) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.loginContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.loginTopbar}>
            <Pressable onPress={goBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color="#1F446A" />
            </Pressable>
            <Text style={styles.loginBrand}>RancoConecta</Text>
            <View style={styles.backButtonSpacer} />
          </View>

          <View style={styles.loginIntro}>
            <View style={styles.loginIntroText}>
              <Text style={styles.loginEyebrow}>ACCESO INTERNO</Text>
              <Text style={styles.loginTitle}>Panel de administración</Text>
              <Text style={styles.loginText}>
                Ingresa con una clave autorizada.
              </Text>
            </View>
          </View>

          <View style={styles.loginCard}>
            <Text style={styles.loginCardTitle}>Clave interna</Text>
            <View style={[styles.passwordBox, !!accessError && styles.passwordBoxError]}>
              <TextInput
                value={accessCode}
                onChangeText={(value) => {
                  setAccessCode(value);
                  setAccessError('');
                }}
                placeholder=""
                placeholderTextColor="#5F7080"
                secureTextEntry={!showAccessCode}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="go"
                onSubmitEditing={authorize}
                style={styles.passwordInput}
              />
              <Pressable onPress={() => setShowAccessCode((current) => !current)} style={styles.eyeButton}>
                <Ionicons name={showAccessCode ? 'eye-off-outline' : 'eye-outline'} size={20} color="#536678" />
              </Pressable>
            </View>
            {!!accessError && <Text style={styles.accessError}>{accessError}</Text>}
            <Pressable onPress={authorize} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Entrar al panel</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topbar}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#1F446A" />
          </Pressable>
          <Text style={styles.topbarTitle}>Panel de administración</Text>
          <Pressable onPress={closeSession} style={styles.backButton}>
            <Ionicons name="lock-closed-outline" size={20} color="#224D78" />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>DIRECTORIO ADMINISTRADO</Text>
          <Text style={styles.heroTitle}>Espacios y prestadores</Text>
          <Text style={styles.heroText}>
            Agrega, pausa y destaca servicios visibles en el directorio público.
          </Text>
          {sessionRole && (
            <View style={styles.sessionBadge}>
              <Ionicons name={sessionRole.icon} size={15} color="#FFFFFF" />
              <Text style={styles.sessionText}>Sesión: {sessionRole.role}</Text>
            </View>
          )}
        </View>

        <View style={styles.statsGrid}>
          <Stat label="Publicados" value={stats.published} icon="checkmark-circle-outline" />
          <Stat label="Destacados" value={stats.featured} icon="star-outline" />
          <Stat label="Pausados" value={stats.paused} icon="pause-circle-outline" />
          <Stat label="Total" value={stats.total} icon="albums-outline" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nuevo perfil de servicio</Text>
          <Text style={styles.sectionText}>
            Crea un cupo pendiente con imagen de portada para luego completar rubro, cobertura y detalles.
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
            placeholder="Teléfono o WhatsApp"
            placeholderTextColor="#87929E"
            keyboardType="phone-pad"
            style={styles.input}
          />
          <TextInput
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="URL de imagen de portada"
            placeholderTextColor="#87929E"
            autoCapitalize="none"
            style={styles.input}
          />
          <Pressable onPress={addPendingSpace} style={styles.secondaryButton}>
            <Ionicons name="add-circle-outline" size={19} color="#224D78" />
            <Text style={styles.secondaryButtonText}>Preparar perfil</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <Text style={styles.sectionText}>
            Administra los rubros visibles del directorio público.
          </Text>
          <TextInput
            value={categoryName}
            onChangeText={setCategoryName}
            placeholder="Nombre de la categoría"
            placeholderTextColor="#87929E"
            style={styles.input}
          />
          <TextInput
            value={categoryDescription}
            onChangeText={setCategoryDescription}
            placeholder="Descripción breve"
            placeholderTextColor="#87929E"
            style={styles.input}
          />
          <Pressable onPress={addCategory} style={styles.secondaryButton}>
            <Ionicons name="grid-outline" size={19} color="#224D78" />
            <Text style={styles.secondaryButtonText}>Agregar categoría</Text>
          </Pressable>

          {categories.map((category) => (
            <View key={category.id} style={styles.simpleRow}>
              <View style={styles.simpleInfo}>
                <Text style={styles.simpleTitle}>{category.name}</Text>
                <Text style={styles.simpleText}>{category.description}</Text>
              </View>
              <Pressable onPress={() => toggleCategory(category.id)} style={styles.actionButton}>
                <Text style={styles.actionText}>
                  {category.status === 'Publicado' ? 'Pausar' : 'Publicar'}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subcategorías</Text>
          <Text style={styles.sectionText}>
            Crea servicios específicos dentro del primer rubro activo por ahora.
          </Text>
          <TextInput
            value={subcategoryName}
            onChangeText={setSubcategoryName}
            placeholder="Nombre de la subcategoría"
            placeholderTextColor="#87929E"
            style={styles.input}
          />
          <Pressable onPress={addSubcategory} style={styles.secondaryButton}>
            <Ionicons name="list-outline" size={19} color="#224D78" />
            <Text style={styles.secondaryButtonText}>Agregar subcategoría</Text>
          </Pressable>

          {subcategories.map((subcategory) => (
            <View key={subcategory.id} style={styles.simpleRow}>
              <View style={styles.simpleInfo}>
                <Text style={styles.simpleTitle}>{subcategory.name}</Text>
                <Text style={styles.simpleText}>Rubro: {subcategory.categoryId}</Text>
              </View>
              <Pressable onPress={() => toggleSubcategory(subcategory.id)} style={styles.actionButton}>
                <Text style={styles.actionText}>
                  {subcategory.status === 'Publicado' ? 'Pausar' : 'Publicar'}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perfiles activos</Text>
          <Text style={styles.sectionText}>
            Esta lista simula la administración. Luego la conectamos a base de datos.
          </Text>

          {providers.map((provider) => (
            <View key={provider.id} style={styles.providerCard}>
              <Image source={{ uri: provider.images[0] }} style={styles.providerCover} contentFit="cover" />
              <View style={styles.providerInfo}>
                <View style={styles.providerHeader}>
                  <Text numberOfLines={1} style={styles.providerName}>
                    {provider.name}
                  </Text>
                  <Text
                    style={[
                      styles.statusBadge,
                      provider.status === 'Pendiente' && styles.pendingBadge,
                      provider.status === 'Pausado' && styles.pausedBadge,
                    ]}
                  >
                    {provider.status}
                  </Text>
                </View>
                <Text style={styles.providerService}>{provider.service}</Text>
                <Text style={styles.providerMeta}>
                  {provider.locationName} · Plan {provider.plan}
                </Text>
                <View style={styles.actions}>
                  <Pressable onPress={() => toggleStatus(provider.id)} style={styles.actionButton}>
                    <Text style={styles.actionText}>
                      {provider.status === 'Publicado' ? 'Pausar' : 'Publicar'}
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => togglePlan(provider.id)} style={styles.actionButton}>
                    <Text style={styles.actionText}>
                      {provider.plan === 'Destacado' ? 'Plan base' : 'Destacar'}
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => startEditingProvider(provider)} style={styles.actionButton}>
                    <Text style={styles.actionText}>Editar</Text>
                  </Pressable>
                </View>
                {editingProviderId === provider.id && (
                  <View style={styles.editPanel}>
                    {!!editImage && <Image source={{ uri: editImage }} style={styles.editCover} contentFit="cover" />}
                    <View style={styles.editActions}>
                      <Pressable onPress={pickProviderImage} style={styles.imageButton}>
                        <Ionicons name="image-outline" size={17} color="#224D78" />
                        <Text style={styles.imageButtonText}>Cargar imagen</Text>
                      </Pressable>
                    </View>
                    <TextInput
                      value={editImage}
                      onChangeText={setEditImage}
                      placeholder="URL o imagen cargada"
                      placeholderTextColor="#6A7B8A"
                      autoCapitalize="none"
                      style={styles.editInput}
                    />
                    <TextInput
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="Nombre del prestador"
                      placeholderTextColor="#6A7B8A"
                      style={styles.editInput}
                    />
                    <TextInput
                      value={editService}
                      onChangeText={setEditService}
                      placeholder="Servicio"
                      placeholderTextColor="#6A7B8A"
                      style={styles.editInput}
                    />
                    <TextInput
                      value={editPhone}
                      onChangeText={setEditPhone}
                      placeholder="Teléfono"
                      placeholderTextColor="#6A7B8A"
                      keyboardType="phone-pad"
                      style={styles.editInput}
                    />
                    <View style={styles.editFooter}>
                      <Pressable onPress={cancelEditingProvider} style={styles.cancelButton}>
                        <Text style={styles.cancelButtonText}>Cancelar</Text>
                      </Pressable>
                      <Pressable onPress={saveProviderChanges} style={styles.saveButton}>
                        <Text style={styles.saveButtonText}>Guardar cambios</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon: IconName }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={20} color="#224D78" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F7F8F4' },
  loginContainer: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingVertical: 28,
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 920,
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
  backButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E6EB',
  },
  backButtonSpacer: { width: 43, height: 43 },
  topbarTitle: { color: '#1F446A', fontSize: 16, fontWeight: '800' },
  loginTopbar: {
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loginBrand: {
    color: '#1F446A',
    fontSize: 16,
    fontWeight: '800',
  },
  loginIntro: {
    paddingHorizontal: 2,
    paddingBottom: 2,
  },
  loginIntroText: { flex: 1 },
  loginCard: {
    marginTop: 18,
    paddingHorizontal: 0,
    paddingVertical: 0,
    backgroundColor: 'transparent',
  },
  lockIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D89222',
  },
  loginEyebrow: {
    color: '#B97012',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  loginTitle: {
    marginTop: 7,
    color: '#1F446A',
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '800',
  },
  loginText: {
    marginTop: 6,
    color: '#536678',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
  loginCardTitle: { color: '#1F446A', fontSize: 12, fontWeight: '800' },
  passwordBox: {
    minHeight: 48,
    marginTop: 4,
    paddingLeft: 0,
    paddingRight: 0,
    borderRadius: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#B8CADB',
  },
  passwordBoxError: { borderBottomColor: '#C66A58' },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    color: '#1F446A',
    fontSize: 15,
    fontWeight: '600',
  },
  eyeButton: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessError: { marginTop: 8, color: '#9A4236', fontSize: 12, fontWeight: '700' },
  input: {
    minHeight: 54,
    marginTop: 12,
    paddingHorizontal: 15,
    borderRadius: 16,
    color: '#243F59',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE5EC',
    fontSize: 14,
  },
  primaryButton: {
    height: 52,
    marginTop: 18,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#224D78',
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  hero: {
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
  heroTitle: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 29,
    lineHeight: 35,
    fontWeight: '800',
  },
  heroText: {
    marginTop: 7,
    color: '#DCE5ED',
    fontSize: 13,
    lineHeight: 20,
  },
  sessionBadge: {
    alignSelf: 'flex-start',
    marginTop: 15,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  sessionText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  statsGrid: {
    marginTop: 13,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: '47%',
    minHeight: 92,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E6EB',
  },
  statValue: {
    marginTop: 8,
    color: '#1F446A',
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: { color: '#687786', fontSize: 11, fontWeight: '700' },
  section: {
    marginTop: 13,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1E6EB',
  },
  sectionTitle: { color: '#1F446A', fontSize: 18, fontWeight: '800' },
  sectionText: {
    marginTop: 5,
    color: '#687786',
    fontSize: 12,
    lineHeight: 18,
  },
  secondaryButton: {
    height: 52,
    marginTop: 13,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EAF1F7',
  },
  secondaryButtonText: { color: '#224D78', fontSize: 13, fontWeight: '800' },
  providerCard: {
    minHeight: 122,
    marginTop: 12,
    padding: 13,
    borderRadius: 18,
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E1E6EB',
  },
  providerCover: { width: 56, height: 56, borderRadius: 14, backgroundColor: '#DDE5EC' },
  providerInfo: { flex: 1, marginLeft: 11 },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  providerName: {
    flex: 1,
    color: '#243F59',
    fontSize: 14,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    overflow: 'hidden',
    color: '#285B87',
    backgroundColor: '#EDF3F7',
    fontSize: 9,
    fontWeight: '800',
  },
  pendingBadge: { color: '#8B6421', backgroundColor: '#F6EFE3' },
  pausedBadge: { color: '#8A4B45', backgroundColor: '#F8E8E5' },
  providerService: {
    marginTop: 4,
    color: '#687786',
    fontSize: 12,
    fontWeight: '600',
  },
  providerMeta: { marginTop: 4, color: '#87929E', fontSize: 11 },
  actions: { marginTop: 10, flexDirection: 'row', gap: 8 },
  simpleRow: {
    minHeight: 70,
    marginTop: 10,
    padding: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E1E6EB',
  },
  simpleInfo: { flex: 1 },
  simpleTitle: { color: '#243F59', fontSize: 13, fontWeight: '800' },
  simpleText: { marginTop: 3, color: '#687786', fontSize: 11, lineHeight: 15 },
  actionButton: {
    minHeight: 34,
    paddingHorizontal: 11,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE5EC',
  },
  actionText: { color: '#224D78', fontSize: 11, fontWeight: '800' },
  editPanel: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#DDE5EC',
  },
  editCover: { width: '100%', height: 118, borderRadius: 15, backgroundColor: '#DDE5EC' },
  editActions: { marginTop: 10, flexDirection: 'row' },
  imageButton: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#EAF1F7',
  },
  imageButtonText: { color: '#224D78', fontSize: 12, fontWeight: '800' },
  editInput: {
    minHeight: 46,
    marginTop: 9,
    paddingHorizontal: 12,
    borderRadius: 13,
    color: '#1F446A',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE5EC',
    fontSize: 13,
    fontWeight: '500',
  },
  editFooter: { marginTop: 10, flexDirection: 'row', gap: 8 },
  cancelButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DDE5EC',
  },
  cancelButtonText: { color: '#536678', fontSize: 12, fontWeight: '800' },
  saveButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#224D78',
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
});
