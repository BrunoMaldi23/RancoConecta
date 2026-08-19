import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { deleteDoc, doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';

const envPath = resolve(process.cwd(), '.env');

function loadEnv() {
  const raw = readFileSync(envPath, 'utf8');

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const [key, ...valueParts] = trimmed.split('=');
    process.env[key] = valueParts.join('=');
  }
}

loadEnv();

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'admin@lagoranco.cl';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || 'ranco-admin';
const ADMIN_UID = process.env.SEED_ADMIN_UID || '';
const timestamp = new Date().toISOString();

// Ids de los prestadores demo sembrados originalmente. Se borran para
// dejar el directorio con datos reales únicamente.
const LEGACY_DEMO_PROVIDER_IDS = [
  'servicios-ranco',
  'soluciones-rios',
  'maestro-patricio',
  'integrales-futrono',
];

// Catálogo inicial de rubros del directorio. Solo se escribe si la categoría
// no existe todavía (no pisa ediciones hechas desde el panel de administración).
const SEED_CATEGORIES = [
  {
    id: 'hogar',
    name: 'Hogar y reparaciones',
    description: 'Soluciones para mantener, reparar y mejorar tu hogar.',
    icon: 'hammer-outline',
    iconColor: '#8B6421',
    iconBackground: '#F8ECD5',
    subcategories: [
      { id: 'electricidad', name: 'Electricidad', description: 'Instalaciones, fallas, enchufes y tableros.', icon: 'flash-outline' },
      { id: 'gasfiteria', name: 'Gasfitería', description: 'Filtraciones, cañerías, grifería y artefactos.', icon: 'water-outline' },
      { id: 'carpinteria', name: 'Carpintería', description: 'Muebles, puertas, revestimientos y reparaciones.', icon: 'construct-outline' },
      { id: 'pintura', name: 'Pintura', description: 'Interiores, fachadas, barnices y terminaciones.', icon: 'color-palette-outline' },
      { id: 'cerrajeria', name: 'Cerrajería', description: 'Cerraduras, llaves y aperturas de emergencia.', icon: 'key-outline' },
      { id: 'techumbre', name: 'Techumbre y goteras', description: 'Reparación, sellado y mantención de techos.', icon: 'home-outline' },
    ],
  },
  {
    id: 'calefaccion',
    name: 'Calefacción',
    description: 'Instalación, combustible y mantención para tu hogar.',
    icon: 'flame-outline',
    iconColor: '#9A641D',
    iconBackground: '#F8ECD5',
    subcategories: [
      { id: 'estufas-lena', name: 'Estufas a leña', description: 'Instalación, reparación y limpieza.', icon: 'flame-outline' },
      { id: 'pellet', name: 'Pellet', description: 'Venta, reparto y mantención de estufas.', icon: 'cube-outline' },
      { id: 'lena', name: 'Leña seca', description: 'Venta y despacho de leña certificada.', icon: 'leaf-outline' },
      { id: 'limpieza-cañones', name: 'Limpieza de cañones', description: 'Deshollinado y revisión preventiva.', icon: 'sparkles-outline' },
      { id: 'climatizacion', name: 'Climatización', description: 'Aire acondicionado y bombas de calor.', icon: 'snow-outline' },
    ],
  },
  {
    id: 'campo',
    name: 'Jardín y parcela',
    description: 'Servicios para terrenos, jardines y sectores rurales.',
    icon: 'leaf-outline',
    iconColor: '#287A51',
    iconBackground: '#E2F2E8',
    subcategories: [
      { id: 'poda', name: 'Poda y tala', description: 'Árboles, frutales y retiro de ramas.', icon: 'cut-outline' },
      { id: 'despeje', name: 'Despeje de terrenos', description: 'Limpieza de maleza y preparación de sitios.', icon: 'leaf-outline' },
      { id: 'cercos', name: 'Cercos', description: 'Construcción y reparación de cierres.', icon: 'grid-outline' },
      { id: 'riego', name: 'Riego', description: 'Diseño, instalación y reparación de sistemas.', icon: 'water-outline' },
      { id: 'maquinaria', name: 'Maquinaria', description: 'Retroexcavadora, minicargador y faenas.', icon: 'build-outline' },
    ],
  },
  {
    id: 'fletes',
    name: 'Fletes y carga',
    description: 'Traslados, carga y apoyo logístico local.',
    icon: 'car-outline',
    iconColor: '#224D78',
    iconBackground: '#E8EEF4',
    subcategories: [
      { id: 'fletes', name: 'Fletes', description: 'Traslado de compras, materiales y carga.', icon: 'car-outline' },
      { id: 'mudanzas', name: 'Mudanzas', description: 'Traslado de hogares y oficinas.', icon: 'home-outline' },
      { id: 'escombros', name: 'Retiro de escombros', description: 'Retiro de residuos de construcción.', icon: 'trash-outline' },
      { id: 'fosas', name: 'Limpieza de fosas', description: 'Vaciado y mantención de sistemas sanitarios.', icon: 'water-outline' },
      { id: 'carga-pesada', name: 'Carga pesada', description: 'Camiones y transporte de mayor volumen.', icon: 'trail-sign-outline' },
    ],
  },
  {
    id: 'gastronomia',
    name: 'Comida y gastronomía',
    description: 'Sabores locales, preparación y reparto.',
    icon: 'restaurant-outline',
    iconColor: '#A46B22',
    iconBackground: '#F8ECD5',
    subcategories: [
      { id: 'comida-casera', name: 'Comida casera', description: 'Menús, colaciones y platos preparados.', icon: 'restaurant-outline' },
      { id: 'reparto', name: 'Reparto de comida', description: 'Delivery disponible en tu sector.', icon: 'bicycle-outline' },
      { id: 'reposteria', name: 'Repostería', description: 'Tortas, dulces y pedidos especiales.', icon: 'gift-outline' },
      { id: 'catering', name: 'Catering y eventos', description: 'Banquetería para reuniones y celebraciones.', icon: 'people-outline' },
      { id: 'asados', name: 'Asados', description: 'Parrilladas y servicio para eventos.', icon: 'flame-outline' },
    ],
  },
  {
    id: 'vehiculos',
    name: 'Vehículos y asistencia',
    description: 'Mantención y ayuda para seguir en ruta.',
    icon: 'construct-outline',
    iconColor: '#647584',
    iconBackground: '#EEF3F7',
    subcategories: [
      { id: 'mecanica', name: 'Mecánica', description: 'Diagnóstico, mantención y reparaciones.', icon: 'construct-outline' },
      { id: 'vulcanizacion', name: 'Vulcanización', description: 'Neumáticos, pinchazos y balanceo.', icon: 'ellipse-outline' },
      { id: 'gruas', name: 'Grúas y rescate', description: 'Traslado y asistencia en ruta.', icon: 'car-outline' },
      { id: 'baterias', name: 'Baterías', description: 'Venta, instalación y arranque auxiliar.', icon: 'battery-charging-outline' },
      { id: 'lavado', name: 'Lavado de vehículos', description: 'Lavado exterior, interior y detailing.', icon: 'sparkles-outline' },
    ],
  },
  {
    id: 'agua',
    name: 'Agua y sistemas hídricos',
    description: 'Captación, almacenamiento y calidad del agua.',
    icon: 'water-outline',
    iconColor: '#26718A',
    iconBackground: '#DFF1F5',
    subcategories: [
      { id: 'pozos', name: 'Pozos', description: 'Perforación, limpieza y recuperación.', icon: 'water-outline' },
      { id: 'bombas', name: 'Bombas de agua', description: 'Instalación, reparación y automatización.', icon: 'settings-outline' },
      { id: 'estanques', name: 'Estanques', description: 'Venta, instalación y limpieza.', icon: 'cube-outline' },
      { id: 'filtros', name: 'Filtros y purificación', description: 'Tratamiento y mejora de agua domiciliaria.', icon: 'funnel-outline' },
      { id: 'redes-agua', name: 'Redes de agua', description: 'Tuberías, matrices y distribución rural.', icon: 'git-network-outline' },
    ],
  },
  {
    id: 'energia',
    name: 'Energía y conectividad',
    description: 'Energía, internet y seguridad para zonas urbanas y rurales.',
    icon: 'flash-outline',
    iconColor: '#8B6421',
    iconBackground: '#F8ECD5',
    subcategories: [
      { id: 'solar', name: 'Energía solar', description: 'Paneles, baterías e instalaciones fotovoltaicas.', icon: 'sunny-outline' },
      { id: 'generadores', name: 'Generadores', description: 'Venta, instalación y mantención.', icon: 'flash-outline' },
      { id: 'internet', name: 'Internet y Wi-Fi', description: 'Instalación, extensión de señal y soporte.', icon: 'wifi-outline' },
      { id: 'starlink', name: 'Starlink', description: 'Instalación, orientación y configuración.', icon: 'planet-outline' },
      { id: 'camaras', name: 'Cámaras y alarmas', description: 'Seguridad, monitoreo y control de acceso.', icon: 'videocam-outline' },
    ],
  },
  {
    id: 'aseo',
    name: 'Aseo y propiedades',
    description: 'Limpieza y cuidado periódico de tus espacios.',
    icon: 'sparkles-outline',
    iconColor: '#6C5590',
    iconBackground: '#EEE8F7',
    subcategories: [
      { id: 'aseo-hogar', name: 'Aseo domiciliario', description: 'Limpieza regular para casas y departamentos.', icon: 'home-outline' },
      { id: 'limpieza-profunda', name: 'Limpieza profunda', description: 'Cocinas, baños, vidrios y espacios completos.', icon: 'sparkles-outline' },
      { id: 'cabanas', name: 'Aseo de cabañas', description: 'Recambio, limpieza y preparación turística.', icon: 'bed-outline' },
      { id: 'tapices', name: 'Tapices y alfombras', description: 'Lavado de sillones, colchones y alfombras.', icon: 'water-outline' },
      { id: 'cuidado-viviendas', name: 'Cuidado de viviendas', description: 'Supervisión y mantención en ausencia.', icon: 'shield-checkmark-outline' },
    ],
  },
  {
    id: 'cuidados',
    name: 'Salud y cuidados',
    description: 'Bienestar y apoyo para personas y mascotas.',
    icon: 'heart-outline',
    iconColor: '#A74E6C',
    iconBackground: '#F8E4EB',
    subcategories: [
      { id: 'enfermeria', name: 'Enfermería', description: 'Curaciones, controles y atención domiciliaria.', icon: 'medkit-outline' },
      { id: 'adulto-mayor', name: 'Cuidado de personas', description: 'Acompañamiento y apoyo cotidiano.', icon: 'people-outline' },
      { id: 'belleza', name: 'Belleza a domicilio', description: 'Peluquería, manicure y cuidado personal.', icon: 'cut-outline' },
      { id: 'masajes', name: 'Masajes y bienestar', description: 'Relajación y atención corporal.', icon: 'body-outline' },
      { id: 'mascotas', name: 'Cuidado de mascotas', description: 'Paseos, alimentación y atención a domicilio.', icon: 'paw-outline' },
    ],
  },
  {
    id: 'profesionales',
    name: 'Servicios profesionales',
    description: 'Especialistas para proyectos, trámites y tecnología.',
    icon: 'briefcase-outline',
    iconColor: '#224D78',
    iconBackground: '#E8EEF4',
    subcategories: [
      { id: 'topografia', name: 'Topografía', description: 'Mediciones, deslindes y levantamientos.', icon: 'map-outline' },
      { id: 'tramites', name: 'Trámites y asesoría', description: 'Apoyo documental y gestiones administrativas.', icon: 'document-text-outline' },
      { id: 'soporte', name: 'Soporte técnico', description: 'Computadores, redes, impresoras y configuración.', icon: 'laptop-outline' },
      { id: 'fotografia', name: 'Fotografía y video', description: 'Eventos, propiedades y contenido comercial.', icon: 'camera-outline' },
      { id: 'drones', name: 'Servicios con drones', description: 'Registro aéreo e inspección de terrenos.', icon: 'airplane-outline' },
    ],
  },
];

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log(`Signing in as ${ADMIN_EMAIL}...`);
const credential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
console.log(`Signed in. UID: ${credential.user.uid}`);

const adminUid = ADMIN_UID || credential.user.uid;
await setDoc(
  doc(db, 'users', adminUid),
  {
    name: 'Administrador interno',
    email: ADMIN_EMAIL,
    role: 'municipal_admin',
    status: 'MUNICIPAL_ADMIN',
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  { merge: true },
);
console.log(`Admin profile ready: users/${adminUid}`);

for (const category of SEED_CATEGORIES) {
  const categoryRef = doc(db, 'categories', category.id);
  const existing = await getDoc(categoryRef);

  if (existing.exists()) {
    console.log(`Category exists, skipped: ${category.id}`);
    continue;
  }

  await setDoc(categoryRef, {
    ...category,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
  console.log(`Category seeded: ${category.id} (${category.name})`);
}

for (const providerId of LEGACY_DEMO_PROVIDER_IDS) {
  try {
    await deleteDoc(doc(db, 'providers', providerId));
    console.log(`Removed legacy demo provider: ${providerId}`);
  } catch (error) {
    console.log(`Skipped ${providerId}: ${error instanceof Error ? error.message : 'unknown'}`);
  }
}

console.log('Crea los prestadores reales desde el panel de administración de la app.');

await signOut(auth);
process.exit(0);
