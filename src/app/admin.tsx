import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Redirect, router } from 'expo-router';
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

import { ProviderCover } from '../components/provider-cover';
import {
  type AppCategory,
  type DirectoryProvider,
  type ServiceRequestStatus,
  useAppData,
} from '../contexts/app-data';
import { useAuth, type ManagedUser } from '../contexts/auth';
import { uploadImage } from '../services/firebase-storage';

type IconName = ComponentProps<typeof Ionicons>['name'];

const REQUEST_STATUSES: ServiceRequestStatus[] = ['Enviada', 'Respondida', 'Agendada', 'Cerrada'];

type DraftSubcategory = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

const ICON_OPTIONS: IconName[] = [
  'hammer-outline', 'flash-outline', 'water-outline', 'construct-outline',
  'color-palette-outline', 'key-outline', 'home-outline', 'flame-outline',
  'cube-outline', 'leaf-outline', 'sparkles-outline', 'snow-outline',
  'cut-outline', 'grid-outline', 'build-outline', 'car-outline',
  'trail-sign-outline', 'trash-outline', 'restaurant-outline', 'bicycle-outline',
  'gift-outline', 'people-outline', 'ellipse-outline', 'battery-charging-outline',
  'settings-outline', 'funnel-outline', 'git-network-outline', 'sunny-outline',
  'wifi-outline', 'planet-outline', 'videocam-outline', 'bed-outline',
  'shield-checkmark-outline', 'heart-outline', 'medkit-outline', 'body-outline',
  'paw-outline', 'briefcase-outline', 'map-outline', 'document-text-outline',
  'laptop-outline', 'camera-outline', 'airplane-outline', 'checkmark-circle-outline',
];

const COLOR_OPTIONS: { color: string; background: string }[] = [
  { color: '#1D5F4A', background: '#E2ECE1' },
  { color: '#2F7353', background: '#E6EFE6' },
  { color: '#2F7353', background: '#E6EFE6' },
  { color: '#BF6842', background: '#EFE6D6' },
  { color: '#B94738', background: '#F9E4E0' },
  { color: '#BF6842', background: '#EFE6D6' },
  { color: '#9A5C63', background: '#F1E1E2' },
  { color: '#6E6356', background: '#E8E1D4' },
  { color: '#536171', background: '#E9EEE5' },
  { color: '#6F7A72', background: '#E9EEE5' },
];

const isRemoteUrl = (uri: string) => /^https?:\/\//.test(uri);

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default function AdminScreen() {
  const { user, logout, managedUsers, createCommerceUser } = useAuth();
  const {
    categories,
    categoriesStatus,
    deleteCategory,
    saveCategory,
    createPendingProvider,
    providers,
    providersStatus,
    requests,
    requestsStatus,
    toggleProviderPlan,
    toggleProviderPublication,
    updateProvider,
    updateRequestStatus,
  } = useAppData();
  const [businessName, setBusinessName] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [phone, setPhone] = useState('');
  const [newImages, setNewImages] = useState<string[]>([]);
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newSubcategoryId, setNewSubcategoryId] = useState('');
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editService, setEditService] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editSubcategoryId, setEditSubcategoryId] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryIcon, setCategoryIcon] = useState<IconName>('grid-outline');
  const [categoryColor, setCategoryColor] = useState('#1D5F4A');
  const [categoryBackground, setCategoryBackground] = useState('#E2ECE1');
  const [categorySubcategories, setCategorySubcategories] = useState<DraftSubcategory[]>([]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserBusiness, setNewUserBusiness] = useState('');
  const [newUserService, setNewUserService] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');

  const stats = useMemo(() => {
    const published = providers.filter((provider) => provider.publicationStatus === 'Publicado').length;
    const featured = providers.filter((provider) => provider.plan === 'Destacado').length;
    const paused = providers.filter((provider) => provider.publicationStatus === 'Pausado').length;

    return { published, featured, paused, total: providers.length };
  }, [providers]);

  const closeSession = async () => {
    await logout();
    router.replace('/home');
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/home');
  };

  const startEditingProvider = (provider: DirectoryProvider) => {
    setEditingProviderId(provider.id);
    setEditName(provider.name);
    setEditService(provider.service);
    setEditPhone(provider.phone);
    setEditImages(provider.images);
    setEditCategoryId(provider.categoryId);
    setEditSubcategoryId(provider.subcategoryId);
  };

  const cancelEditingProvider = () => {
    setEditingProviderId(null);
    setEditName('');
    setEditService('');
    setEditPhone('');
    setEditImages([]);
    setEditCategoryId('');
    setEditSubcategoryId('');
  };

  const resolveUploadedImages = async (uris: string[]) => {
    const resolved = await Promise.all(
      uris.map((uri) =>
        isRemoteUrl(uri) ? Promise.resolve(uri) : uploadImage(uri, 'provider-images'),
      ),
    );

    return resolved;
  };

  const pickImages = async (append: (next: string[]) => void) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Acceso requerido', 'Necesitamos acceso a tus imágenes para cargar fotos del servicio.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.82,
      allowsMultipleSelection: true,
      selectionLimit: 6,
    });

    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri).filter(Boolean) as string[];
      append(uris);
    }
  };

  const pickNewImages = () => {
    pickImages((uris) => setNewImages((current) => [...current, ...uris].slice(0, 6)));
  };

  const pickEditImages = () => {
    pickImages((uris) => setEditImages((current) => [...current, ...uris].slice(0, 6)));
  };

  const saveProviderChanges = async () => {
    if (!editingProviderId || !editName.trim() || !editService.trim() || !editPhone.trim()) {
      Alert.alert('Faltan datos', 'Completa nombre, servicio y teléfono antes de guardar.');
      return;
    }

    if (!editCategoryId || !editSubcategoryId) {
      Alert.alert('Faltan datos', 'Elige una categoría y un servicio de la lista.');
      return;
    }

    try {
      const images = await resolveUploadedImages(editImages);
      await updateProvider(editingProviderId, {
        name: editName,
        service: editService,
        phone: editPhone,
        images,
        categoryId: editCategoryId,
        subcategoryId: editSubcategoryId,
      });
      cancelEditingProvider();
      Alert.alert('Perfil actualizado', 'Los cambios ya se reflejan en el directorio público.');
    } catch (error) {
      Alert.alert(
        'No se pudo actualizar',
        error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
      );
    }
  };

  const createManagedCommerceUser = async () => {
    try {
      const result = await createCommerceUser({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        businessName: newUserBusiness,
        serviceName: newUserService,
        phone: newUserPhone,
      });

      if (!result.ok) {
        Alert.alert('No se pudo crear', result.message);
        return;
      }

      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserBusiness('');
      setNewUserService('');
      setNewUserPhone('');
      Alert.alert(
        'Usuario creado',
        `El comercio ${result.user.businessName || result.user.name} ya puede iniciar sesión con su correo.`,
      );
    } catch (error) {
      Alert.alert(
        'No se pudo crear',
        error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
      );
    }
  };

  const addPendingSpace = async () => {
    if (!businessName.trim() || !serviceName.trim() || !phone.trim()) {
      Alert.alert('Faltan datos', 'Ingresa nombre, servicio y teléfono.');
      return;
    }

    if (!newCategoryId || !newSubcategoryId) {
      Alert.alert('Faltan datos', 'Elige una categoría y un servicio de la lista.');
      return;
    }

    try {
      const images = await resolveUploadedImages(newImages);
      await createPendingProvider({
        name: businessName.trim(),
        service: serviceName.trim(),
        phone: phone.trim(),
        images,
        categoryId: newCategoryId,
        subcategoryId: newSubcategoryId,
      });

      setBusinessName('');
      setServiceName('');
      setPhone('');
      setNewImages([]);
      setNewCategoryId('');
      setNewSubcategoryId('');
      Alert.alert('Espacio preparado', 'Quedó agregado como pendiente para completar y publicar.');
    } catch (error) {
      Alert.alert(
        'No se pudo preparar',
        error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
      );
    }
  };

  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCategoryName('');
    setCategoryDescription('');
    setCategoryIcon('grid-outline');
    setCategoryColor('#1D5F4A');
    setCategoryBackground('#E2ECE1');
    setCategorySubcategories([]);
  };

  const startEditingCategory = (category: AppCategory) => {
    setEditingCategoryId(category.id);
    setCategoryName(category.name);
    setCategoryDescription(category.description);
    setCategoryIcon((category.icon || 'grid-outline') as IconName);
    setCategoryColor(category.iconColor || '#1D5F4A');
    setCategoryBackground(category.iconBackground || '#E2ECE1');
    setCategorySubcategories(
      category.subcategories.map((sub) => ({ ...sub })),
    );
  };

  const updateDraftSubcategory = (id: string, field: keyof DraftSubcategory, value: string) => {
    setCategorySubcategories((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const addDraftSubcategory = () => {
    setCategorySubcategories((current) => [
      ...current,
      { id: `sub-${Date.now()}`, name: '', description: '', icon: 'construct-outline' },
    ]);
  };

  const removeDraftSubcategory = (id: string) => {
    setCategorySubcategories((current) => current.filter((item) => item.id !== id));
  };

  const persistCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Faltan datos', 'El nombre de la categoría es obligatorio.');
      return;
    }

    const subcategories = categorySubcategories
      .filter((sub) => sub.name.trim())
      .map((sub) => ({
        id: sub.id?.trim() || slugify(sub.name) || `sub-${Date.now()}`,
        name: sub.name.trim(),
        description: sub.description.trim(),
        icon: (sub.icon || 'construct-outline') as IconName,
      }));

    try {
      await saveCategory(editingCategoryId, {
        name: categoryName.trim(),
        description: categoryDescription.trim(),
        icon: categoryIcon,
        iconColor: categoryColor,
        iconBackground: categoryBackground,
        subcategories,
      });
      resetCategoryForm();
      Alert.alert('Categoría guardada', 'Ya está visible en el directorio público.');
    } catch (error) {
      Alert.alert(
        'No se pudo guardar la categoría',
        error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
      );
    }
  };

  const handleDeleteCategory = (category: AppCategory) => {
    Alert.alert('Eliminar categoría', `¿Eliminar "${category.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCategory(category.id);
          } catch (error) {
            Alert.alert(
              'No se pudo eliminar',
              error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
            );
          }
        },
      },
    ]);
  };

  const changeRequestStatus = async (requestId: string, status: ServiceRequestStatus) => {
    try {
      await updateRequestStatus(requestId, status);
    } catch (error) {
      Alert.alert(
        'No se pudo actualizar',
        error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
      );
    }
  };

  const handleTogglePublication = async (providerId: string) => {
    try {
      await toggleProviderPublication(providerId);
    } catch (error) {
      Alert.alert(
        'No se pudo publicar',
        error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
      );
    }
  };

  const handleTogglePlan = async (providerId: string) => {
    try {
      await toggleProviderPlan(providerId);
    } catch (error) {
      Alert.alert(
        'No se pudo cambiar el plan',
        error instanceof Error ? error.message : 'Ocurrió un error inesperado.',
      );
    }
  };

  if (!user) {
    return (
      <Redirect
        href={{
          pathname: '/',
          params: { role: 'municipal_admin', returnTo: '/admin' },
        }}
      />
    );
  }

  if (user.role !== 'municipal_admin') {
    return <Redirect href="/home" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topbar}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#2F7353" />
          </Pressable>
          <Text style={styles.topbarTitle}>Panel interno</Text>
          <Pressable onPress={closeSession} style={styles.backButton}>
            <Ionicons name="lock-closed-outline" size={20} color="#1D5F4A" />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>DIRECTORIO ADMINISTRADO</Text>
          <Text style={styles.heroTitle}>Espacios y prestadores</Text>
          <Text style={styles.heroText}>
            Agrega, pausa y destaca servicios visibles en el directorio público.
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <Stat label="Publicados" value={stats.published} icon="checkmark-circle-outline" />
          <Stat label="Destacados" value={stats.featured} icon="star-outline" />
          <Stat label="Pausados" value={stats.paused} icon="pause-circle-outline" />
          <Stat label="Total" value={stats.total} icon="albums-outline" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Solicitudes de vecinos</Text>
          <Text style={styles.sectionText}>
            Cambia el estado visible para el vecino mientras se coordina el servicio.
          </Text>

          {requestsStatus === 'loading' ? (
            <View style={styles.emptyAdminBox}>
              <Text style={styles.emptyAdminText}>Cargando solicitudes…</Text>
            </View>
          ) : requestsStatus === 'error' ? (
            <View style={styles.emptyAdminBox}>
              <Ionicons name="alert-circle-outline" size={24} color="#9AA59F" />
              <Text style={styles.emptyAdminText}>No se pudieron cargar las solicitudes.</Text>
            </View>
          ) : requests.length === 0 ? (
            <View style={styles.emptyAdminBox}>
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="#9AA59F" />
              <Text style={styles.emptyAdminText}>Aún no hay solicitudes enviadas.</Text>
            </View>
          ) : (
            requests.map((request) => (
              <View key={request.id} style={styles.requestRow}>
                <View style={styles.requestInfo}>
                  <Text numberOfLines={1} style={styles.simpleTitle}>{request.providerName}</Text>
                  <Text numberOfLines={2} style={styles.simpleText}>
                    {request.serviceName} · {request.address}
                  </Text>
                  <Text style={styles.requestDetail}>{request.detail}</Text>
                </View>
                <View style={styles.statusActions}>
                  {REQUEST_STATUSES.map((status) => (
                    <Pressable
                      key={status}
                      onPress={() => changeRequestStatus(request.id, status)}
                      style={[
                        styles.statusChip,
                        request.status === status && styles.statusChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusChipText,
                          request.status === status && styles.statusChipTextActive,
                        ]}
                      >
                        {status}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Usuarios y perfiles</Text>
          <Text style={styles.sectionText}>
            Crea el acceso interno para un comercio. El usuario queda pendiente hasta activar su membresía.
          </Text>
          <TextInput
            value={newUserName}
            onChangeText={setNewUserName}
            placeholder="Nombre de contacto"
            placeholderTextColor="#8A9690"
            style={styles.input}
          />
          <TextInput
            value={newUserEmail}
            onChangeText={setNewUserEmail}
            placeholder="Correo de acceso"
            placeholderTextColor="#8A9690"
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />
          <TextInput
            value={newUserPassword}
            onChangeText={setNewUserPassword}
            placeholder="Clave temporal"
            placeholderTextColor="#8A9690"
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            value={newUserBusiness}
            onChangeText={setNewUserBusiness}
            placeholder="Nombre del negocio"
            placeholderTextColor="#8A9690"
            style={styles.input}
          />
          <TextInput
            value={newUserService}
            onChangeText={setNewUserService}
            placeholder="Servicio principal"
            placeholderTextColor="#8A9690"
            style={styles.input}
          />
          <TextInput
            value={newUserPhone}
            onChangeText={setNewUserPhone}
            placeholder="Teléfono o WhatsApp"
            placeholderTextColor="#8A9690"
            keyboardType="phone-pad"
            style={styles.input}
          />
          <Pressable onPress={createManagedCommerceUser} style={styles.secondaryButton}>
            <Ionicons name="person-add-outline" size={19} color="#1D5F4A" />
            <Text style={styles.secondaryButtonText}>Crear usuario de comercio</Text>
          </Pressable>

          {managedUsers
            .filter((managedUser) => managedUser.role === 'commerce')
            .map((managedUser) => (
              <View key={managedUser.id} style={styles.userRow}>
                <View style={styles.userIcon}>
                  <Ionicons name="storefront-outline" size={18} color="#1D5F4A" />
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.simpleTitle}>{managedUser.businessName || managedUser.name}</Text>
                  <Text style={styles.simpleText}>{managedUser.email}</Text>
                  <Text style={styles.simpleText}>{managedUser.serviceName}</Text>
                </View>
                <Text style={styles.userStatus}>
                  {userStatusLabel(managedUser.status)}
                </Text>
              </View>
            ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorías del directorio</Text>
          <Text style={styles.sectionText}>
            Administra rubros y sus servicios. Cada categoría se ve en el inicio con su icono y color.
          </Text>

          {categoriesStatus === 'loading' ? (
            <View style={styles.emptyAdminBox}>
              <Text style={styles.emptyAdminText}>Cargando categorías…</Text>
            </View>
          ) : categoriesStatus === 'error' ? (
            <View style={styles.emptyAdminBox}>
              <Text style={styles.emptyAdminText}>No se pudieron cargar las categorías.</Text>
            </View>
          ) : categories.length === 0 ? (
            <View style={styles.emptyAdminBox}>
              <Ionicons name="grid-outline" size={24} color="#9AA59F" />
              <Text style={styles.emptyAdminText}>Aún no hay categorías. Crea la primera abajo.</Text>
            </View>
          ) : (
            categories.map((category) => (
              <View key={category.id} style={styles.categoryRow}>
                <View style={[styles.categoryIconBox, { backgroundColor: category.iconBackground }]}>
                  <Ionicons name={category.icon as IconName} size={19} color={category.iconColor} />
                </View>
                <View style={styles.categoryInfo}>
                  <Text numberOfLines={1} style={styles.simpleTitle}>{category.name}</Text>
                  <Text numberOfLines={2} style={styles.simpleText}>
                    {category.subcategories.length} servicios · {category.description}
                  </Text>
                </View>
                <View style={styles.categoryActions}>
                  <Pressable onPress={() => startEditingCategory(category)} style={styles.actionButton}>
                    <Text style={styles.actionText}>Editar</Text>
                  </Pressable>
                  <Pressable onPress={() => handleDeleteCategory(category)} style={styles.actionButton}>
                    <Text style={styles.dangerText}>Eliminar</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}

          <View style={styles.formDivider} />

          <Text style={styles.fieldLabel}>
            {editingCategoryId ? 'Editar categoría' : 'Nueva categoría'}
          </Text>
          <TextInput
            value={categoryName}
            onChangeText={setCategoryName}
            placeholder="Nombre de la categoría (ej: Hogar y reparaciones)"
            placeholderTextColor="#8A9690"
            style={styles.input}
          />
          <TextInput
            value={categoryDescription}
            onChangeText={setCategoryDescription}
            placeholder="Descripción breve"
            placeholderTextColor="#8A9690"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Icono</Text>
          <View style={styles.iconPicker}>
            {ICON_OPTIONS.map((icon) => (
              <Pressable
                key={icon}
                onPress={() => setCategoryIcon(icon)}
                style={[
                  styles.iconOption,
                  categoryIcon === icon && { borderColor: categoryColor, backgroundColor: categoryBackground },
                ]}
              >
                <Ionicons name={icon} size={19} color={categoryColor} />
              </Pressable>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Color</Text>
          <View style={styles.iconPicker}>
            {COLOR_OPTIONS.map((option) => (
              <Pressable
                key={option.color}
                onPress={() => {
                  setCategoryColor(option.color);
                  setCategoryBackground(option.background);
                }}
                style={[
                  styles.colorOption,
                  { backgroundColor: option.background },
                  categoryColor === option.color && styles.colorOptionActive,
                ]}
              >
                <Ionicons name="square" size={19} color={option.color} />
              </Pressable>
            ))}
          </View>

          <View style={styles.subheaderRow}>
            <Text style={styles.fieldLabel}>Servicios de la categoría</Text>
            <Pressable onPress={addDraftSubcategory} style={styles.smallAddButton}>
              <Ionicons name="add" size={16} color="#1D5F4A" />
              <Text style={styles.smallAddText}>Agregar</Text>
            </Pressable>
          </View>
          {categorySubcategories.map((subcategory) => (
            <View key={subcategory.id} style={styles.subcategoryCard}>
              <View style={styles.subcategoryInputs}>
                <TextInput
                  value={subcategory.name}
                  onChangeText={(value) => updateDraftSubcategory(subcategory.id, 'name', value)}
                  placeholder="Nombre del servicio"
                  placeholderTextColor="#8A9690"
                  style={styles.editInput}
                />
                <TextInput
                  value={subcategory.description}
                  onChangeText={(value) =>
                    updateDraftSubcategory(subcategory.id, 'description', value)
                  }
                  placeholder="Descripción corta"
                  placeholderTextColor="#8A9690"
                  style={styles.editInput}
                />
              </View>
              <View style={styles.subcategoryFooter}>
                <View style={styles.iconPicker}>
                  {ICON_OPTIONS.slice(0, 14).map((icon) => (
                    <Pressable
                      key={icon}
                      onPress={() => updateDraftSubcategory(subcategory.id, 'icon', icon)}
                      style={[
                        styles.iconOption,
                        subcategory.icon === icon && { borderColor: categoryColor, backgroundColor: categoryBackground },
                      ]}
                    >
                      <Ionicons name={icon} size={16} color={categoryColor} />
                    </Pressable>
                  ))}
                </View>
                <Pressable
                  onPress={() => removeDraftSubcategory(subcategory.id)}
                  style={styles.smallRemoveButton}
                >
                  <Ionicons name="trash-outline" size={16} color="#8A4B45" />
                </Pressable>
              </View>
            </View>
          ))}
          {categorySubcategories.length === 0 && (
            <Text style={styles.hintText}>Agrega al menos un servicio para esta categoría.</Text>
          )}

          <View style={styles.editFooter}>
            {editingCategoryId && (
              <Pressable onPress={resetCategoryForm} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>
            )}
            <Pressable onPress={persistCategory} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>
                {editingCategoryId ? 'Guardar cambios' : 'Crear categoría'}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nuevo perfil de servicio</Text>
          <Text style={styles.sectionText}>
            Crea un cupo pendiente eligiendo rubro y subir fotos de la portada para el perfil público.
          </Text>
          <TextInput
            value={businessName}
            onChangeText={setBusinessName}
            placeholder="Nombre del negocio o prestador"
            placeholderTextColor="#8A9690"
            style={styles.input}
          />
          <TextInput
            value={serviceName}
            onChangeText={setServiceName}
            placeholder="Servicio principal"
            placeholderTextColor="#8A9690"
            style={styles.input}
          />
          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Teléfono o WhatsApp"
            placeholderTextColor="#8A9690"
            keyboardType="phone-pad"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Rubro (categoría)</Text>
          <View style={styles.chipRow}>
            {categories.map((category) => (
              <OptionChip
                key={category.id}
                label={category.name}
                active={newCategoryId === category.id}
                onPress={() => {
                  setNewCategoryId(category.id);
                  setNewSubcategoryId('');
                }}
              />
            ))}
          </View>

          {!!newCategoryId && (
            <>
              <Text style={styles.fieldLabel}>Servicio dentro del rubro</Text>
              <View style={styles.chipRow}>
                {categories
                  .find((category) => category.id === newCategoryId)
                  ?.subcategories.map((subcategory) => (
                    <OptionChip
                      key={subcategory.id}
                      label={subcategory.name}
                      active={newSubcategoryId === subcategory.id}
                      onPress={() => setNewSubcategoryId(subcategory.id)}
                    />
                  ))}
              </View>
            </>
          )}

          <Text style={styles.fieldLabel}>Fotos del servicio</Text>
          <View style={styles.imageGrid}>
            {newImages.map((uri, index) => (
              <View key={`${uri}-${index}`} style={styles.imageTile}>
                <Image source={{ uri }} style={styles.imageTileImage} contentFit="cover" />
                <Pressable
                  onPress={() => setNewImages((current) => current.filter((_, i) => i !== index))}
                  style={styles.imageRemove}
                >
                  <Ionicons name="close" size={15} color="#FFFFFF" />
                </Pressable>
              </View>
            ))}
          </View>
          <Pressable onPress={pickNewImages} style={styles.imageButton}>
            <Ionicons name="images-outline" size={17} color="#1D5F4A" />
            <Text style={styles.imageButtonText}>Elegir fotos de la galería</Text>
          </Pressable>
          <Pressable onPress={addPendingSpace} style={styles.secondaryButton}>
            <Ionicons name="add-circle-outline" size={19} color="#1D5F4A" />
            <Text style={styles.secondaryButtonText}>Preparar perfil</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perfiles activos</Text>
          <Text style={styles.sectionText}>
            Los cambios de esta lista se reflejan en el directorio público de la app.
          </Text>

          {providersStatus === 'loading' || providersStatus === 'error' ? (
            <View style={styles.emptyAdminBox}>
              <Text style={styles.emptyAdminText}>
                {providersStatus === 'loading' ? 'Cargando perfiles…' : 'No se pudieron cargar los perfiles.'}
              </Text>
            </View>
          ) : providers.length === 0 ? (
            <View style={styles.emptyAdminBox}>
              <Ionicons name="storefront-outline" size={24} color="#9AA59F" />
              <Text style={styles.emptyAdminText}>Aún no hay perfiles en el directorio.</Text>
            </View>
          ) : (
            providers.map((provider) => (
            <View key={provider.id} style={styles.providerCard}>
              <ProviderCover uri={provider.images[0]} style={styles.providerCover} />
              <View style={styles.providerInfo}>
                <View style={styles.providerHeader}>
                  <Text numberOfLines={1} style={styles.providerName}>
                    {provider.name}
                  </Text>
                  <Text
                    style={[
                      styles.statusBadge,
                      provider.publicationStatus === 'Pendiente' && styles.pendingBadge,
                      provider.publicationStatus === 'Pausado' && styles.pausedBadge,
                    ]}
                  >
                    {provider.publicationStatus}
                  </Text>
                </View>
                <Text style={styles.providerService}>{provider.service}</Text>
                <Text style={styles.providerMeta}>
                  {provider.locationName} · Plan {provider.plan}
                </Text>
                <View style={styles.actions}>
                  <Pressable onPress={() => handleTogglePublication(provider.id)} style={styles.actionButton}>
                    <Text style={styles.actionText}>
                      {provider.publicationStatus === 'Publicado' ? 'Pausar' : 'Publicar'}
                    </Text>
                  </Pressable>
                  <Pressable onPress={() => handleTogglePlan(provider.id)} style={styles.actionButton}>
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
                    <Text style={styles.fieldLabel}>Fotos del perfil</Text>
                    <View style={styles.imageGrid}>
                      {editImages.map((uri, index) => (
                        <View key={`${uri}-${index}`} style={styles.imageTile}>
                          <Image source={{ uri }} style={styles.imageTileImage} contentFit="cover" />
                          <Pressable
                            onPress={() =>
                              setEditImages((current) => current.filter((_, i) => i !== index))
                            }
                            style={styles.imageRemove}
                          >
                            <Ionicons name="close" size={15} color="#FFFFFF" />
                          </Pressable>
                        </View>
                      ))}
                    </View>
                    <View style={styles.editActions}>
                      <Pressable onPress={pickEditImages} style={styles.imageButton}>
                        <Ionicons name="images-outline" size={17} color="#1D5F4A" />
                        <Text style={styles.imageButtonText}>Agregar fotos</Text>
                      </Pressable>
                    </View>

                    <Text style={styles.fieldLabel}>Rubro (categoría)</Text>
                    <View style={styles.chipRow}>
                      {categories.map((category) => (
                        <OptionChip
                          key={category.id}
                          label={category.name}
                          active={editCategoryId === category.id}
                          onPress={() => {
                            setEditCategoryId(category.id);
                            setEditSubcategoryId('');
                          }}
                        />
                      ))}
                    </View>

                    {!!editCategoryId && (
                      <>
                        <Text style={styles.fieldLabel}>Servicio dentro del rubro</Text>
                        <View style={styles.chipRow}>
                          {categories
                            .find((category) => category.id === editCategoryId)
                            ?.subcategories.map((subcategory) => (
                              <OptionChip
                                key={subcategory.id}
                                label={subcategory.name}
                                active={editSubcategoryId === subcategory.id}
                                onPress={() => setEditSubcategoryId(subcategory.id)}
                              />
                            ))}
                        </View>
                      </>
                    )}

                    <TextInput
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="Nombre del prestador"
                      placeholderTextColor="#8A9690"
                      style={styles.editInput}
                    />
                    <TextInput
                      value={editService}
                      onChangeText={setEditService}
                      placeholder="Servicio"
                      placeholderTextColor="#8A9690"
                      style={styles.editInput}
                    />
                    <TextInput
                      value={editPhone}
                      onChangeText={setEditPhone}
                      placeholder="Teléfono"
                      placeholderTextColor="#8A9690"
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
          ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, icon }: { label: string; value: number; icon: IconName }) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={20} color="#1D5F4A" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function OptionChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.optionChip, active && styles.optionChipActive]}
    >
      <Text style={[styles.optionChipText, active && styles.optionChipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function userStatusLabel(status: ManagedUser['status']) {
  switch (status) {
    case 'ACTIVE_COMMERCE':
      return 'Membresía activa';
    case 'MUNICIPAL_ADMIN':
      return 'Administración';
    default:
      return 'Pendiente';
  }
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#EAF3F0' },
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
    borderColor: '#D5E0DA',
  },
  topbarTitle: { color: '#2F7353', fontSize: 16, fontWeight: '800' },
  input: {
    minHeight: 54,
    marginTop: 12,
    paddingHorizontal: 15,
    borderRadius: 16,
    color: '#34443D',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5E0DA',
    fontSize: 14,
  },
  hero: {
    padding: 23,
    borderRadius: 24,
    backgroundColor: '#1D5F4A',
  },
  eyebrow: {
    color: '#D8E7DD',
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
    color: '#E9F2EC',
    fontSize: 13,
    lineHeight: 20,
  },
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
    borderColor: '#D5E0DA',
  },
  statValue: {
    marginTop: 8,
    color: '#2F7353',
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: { color: '#6E7D75', fontSize: 11, fontWeight: '700' },
  section: {
    marginTop: 13,
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5E0DA',
  },
  sectionTitle: { color: '#2F7353', fontSize: 18, fontWeight: '800' },
  sectionText: {
    marginTop: 5,
    color: '#6E7D75',
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
    backgroundColor: '#E4EFE9',
  },
  secondaryButtonText: { color: '#1D5F4A', fontSize: 13, fontWeight: '800' },
  providerCard: {
    minHeight: 122,
    marginTop: 12,
    padding: 13,
    borderRadius: 18,
    flexDirection: 'row',
    backgroundColor: '#F7FAF9',
    borderWidth: 1,
    borderColor: '#D5E0DA',
  },
  providerCover: { width: 56, height: 56, borderRadius: 14, backgroundColor: '#D5E0DA' },
  providerInfo: { flex: 1, marginLeft: 11 },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  providerName: {
    flex: 1,
    color: '#34443D',
    fontSize: 14,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    overflow: 'hidden',
    color: '#2F7353',
    backgroundColor: '#E4EFE9',
    fontSize: 9,
    fontWeight: '800',
  },
  pendingBadge: { color: '#BF6842', backgroundColor: '#FBE9E2' },
  pausedBadge: { color: '#BF6842', backgroundColor: '#FBE9E2' },
  providerService: {
    marginTop: 4,
    color: '#6E7D75',
    fontSize: 12,
    fontWeight: '600',
  },
  providerMeta: { marginTop: 4, color: '#8A9690', fontSize: 11 },
  actions: { marginTop: 10, flexDirection: 'row', gap: 8 },
  simpleRow: {
    minHeight: 70,
    marginTop: 10,
    padding: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F7FAF9',
    borderWidth: 1,
    borderColor: '#D5E0DA',
  },
  simpleInfo: { flex: 1 },
  simpleTitle: { color: '#34443D', fontSize: 13, fontWeight: '800' },
  simpleText: { marginTop: 3, color: '#6E7D75', fontSize: 11, lineHeight: 15 },
  userRow: {
    minHeight: 78,
    marginTop: 10,
    padding: 12,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F7FAF9',
    borderWidth: 1,
    borderColor: '#D5E0DA',
  },
  userIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E4EFE9',
  },
  userInfo: { flex: 1 },
  userStatus: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    overflow: 'hidden',
    color: '#BF6842',
    backgroundColor: '#FBE9E2',
    fontSize: 9,
    fontWeight: '800',
  },
  emptyAdminBox: {
    minHeight: 74,
    marginTop: 12,
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7FAF9',
    borderWidth: 1,
    borderColor: '#D5E0DA',
  },
  emptyAdminText: { marginTop: 7, color: '#6E7D75', fontSize: 12, fontWeight: '700' },
  requestRow: {
    marginTop: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#F7FAF9',
    borderWidth: 1,
    borderColor: '#D5E0DA',
  },
  requestInfo: { minWidth: 0 },
  requestDetail: { marginTop: 6, color: '#34443D', fontSize: 12, lineHeight: 17 },
  statusActions: { marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  statusChip: {
    minHeight: 32,
    paddingHorizontal: 10,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5E0DA',
  },
  statusChipActive: { backgroundColor: '#1D5F4A', borderColor: '#1D5F4A' },
  statusChipText: { color: '#6E7D75', fontSize: 10, fontWeight: '800' },
  statusChipTextActive: { color: '#FFFFFF' },
  actionButton: {
    minHeight: 34,
    paddingHorizontal: 11,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5E0DA',
  },
  actionText: { color: '#1D5F4A', fontSize: 11, fontWeight: '800' },
  editPanel: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#D5E0DA',
  },
  fieldLabel: {
    marginTop: 13,
    marginBottom: 7,
    color: '#77867E',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  optionChip: {
    minHeight: 32,
    paddingHorizontal: 11,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F8F6',
    borderWidth: 1,
    borderColor: '#D5E0DA',
  },
  optionChipActive: { backgroundColor: '#1D5F4A', borderColor: '#1D5F4A' },
  optionChipText: { color: '#6E7D75', fontSize: 11, fontWeight: '700' },
  optionChipTextActive: { color: '#FFFFFF' },
  imageGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  imageTile: {
    width: 82,
    height: 64,
    borderRadius: 13,
    overflow: 'hidden',
    backgroundColor: '#D5E0DA',
  },
  imageTileImage: { width: '100%', height: '100%' },
  imageRemove: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(29,60,47,0.72)',
  },
  editActions: { marginTop: 10, flexDirection: 'row' },
  imageButton: {
    minHeight: 40,
    paddingHorizontal: 12,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#E4EFE9',
  },
  imageButtonText: { color: '#1D5F4A', fontSize: 12, fontWeight: '800' },
  categoryRow: {
    minHeight: 74,
    marginTop: 10,
    padding: 11,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F7FAF9',
    borderWidth: 1,
    borderColor: '#D5E0DA',
  },
  categoryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryInfo: { flex: 1, minWidth: 0 },
  categoryActions: { flexDirection: 'row', gap: 7 },
  dangerText: { color: '#BF6842', fontSize: 11, fontWeight: '800' },
  formDivider: {
    height: 1,
    marginTop: 16,
    marginBottom: 4,
    backgroundColor: '#DDE7E2',
  },
  iconPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  iconOption: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5E0DA',
  },
  colorOption: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionActive: { borderColor: '#1D5F4A' },
  subheaderRow: {
    marginTop: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  smallAddButton: {
    minHeight: 32,
    paddingHorizontal: 11,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#E4EFE9',
  },
  smallAddText: { color: '#1D5F4A', fontSize: 11, fontWeight: '800' },
  subcategoryCard: {
    marginTop: 9,
    padding: 11,
    borderRadius: 15,
    backgroundColor: '#F7FAF9',
    borderWidth: 1,
    borderColor: '#D5E0DA',
  },
  subcategoryInputs: { gap: 8 },
  subcategoryFooter: {
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  smallRemoveButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBE9E2',
  },
  hintText: { marginTop: 9, color: '#8A9690', fontSize: 11 },
  editInput: {
    minHeight: 46,
    marginTop: 9,
    paddingHorizontal: 12,
    borderRadius: 13,
    color: '#2F7353',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5E0DA',
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
    borderColor: '#D5E0DA',
  },
  cancelButtonText: { color: '#6E7D75', fontSize: 12, fontWeight: '800' },
  saveButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D5F4A',
  },
  saveButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
});
