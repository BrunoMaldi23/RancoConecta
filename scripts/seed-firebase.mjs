import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getFirestore, setDoc } from 'firebase/firestore';

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

const providers = [
  {
    id: 'servicios-ranco',
    name: 'Servicios del Ranco',
    service: 'Electricidad y reparaciones',
    categoryId: 'hogar',
    subcategoryId: 'electricidad',
    locationId: 'lago-ranco',
    locationName: 'Lago Ranco',
    rating: 4.9,
    reviews: 38,
    distance: '1,8 km',
    verified: true,
    available: true,
    phone: '+56987654321',
    whatsapp: '56987654321',
    description: 'Instalaciones, reparaciones y mantenciones domiciliarias con atención en sectores urbanos y rurales.',
    coverage: ['Lago Ranco', 'Riñinahue', 'Ilihue'],
    images: [
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80',
    ],
    plan: 'Destacado',
    publicationStatus: 'Publicado',
  },
  {
    id: 'soluciones-rios',
    name: 'Soluciones Los Ríos',
    service: 'Energía solar y electricidad',
    categoryId: 'energia',
    subcategoryId: 'solar',
    locationId: 'futrono',
    locationName: 'Futrono',
    rating: 4.8,
    reviews: 24,
    distance: '3,2 km',
    verified: true,
    available: true,
    phone: '+56976543210',
    whatsapp: '56976543210',
    description: 'Diseño e instalación de sistemas solares, baterías, inversores y respaldo energético.',
    coverage: ['Futrono', 'Llifen', 'Lago Ranco'],
    images: [
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=1200&q=80',
    ],
    plan: 'Destacado',
    publicationStatus: 'Publicado',
  },
  {
    id: 'maestro-patricio',
    name: 'Maestro Patricio',
    service: 'Gasfitería y hogar',
    categoryId: 'hogar',
    subcategoryId: 'gasfiteria',
    locationId: 'futrono',
    locationName: 'Futrono',
    rating: 4.7,
    reviews: 19,
    distance: '5,1 km',
    verified: false,
    available: true,
    phone: '+56965432109',
    whatsapp: '56965432109',
    description: 'Reparación de filtraciones, grifería, calefón, cañerías y emergencias domiciliarias.',
    coverage: ['Futrono', 'Llifen'],
    images: ['https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1200&q=80'],
    plan: 'Base',
    publicationStatus: 'Publicado',
  },
  {
    id: 'integrales-futrono',
    name: 'Servicios Integrales Futrono',
    service: 'Mantención y construcción',
    categoryId: 'hogar',
    subcategoryId: 'carpinteria',
    locationId: 'futrono',
    locationName: 'Futrono',
    rating: 4.6,
    reviews: 31,
    distance: '7,4 km',
    verified: true,
    available: false,
    phone: '+56954321098',
    whatsapp: '56954321098',
    description: 'Equipo local para reparaciones, ampliaciones, pintura, carpintería y mantención general.',
    coverage: ['Futrono', 'Llifen', 'Nontuelá'],
    images: ['https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80'],
    plan: 'Base',
    publicationStatus: 'Pausado',
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
    name: 'Administrador municipal',
    email: ADMIN_EMAIL,
    role: 'municipal_admin',
    status: 'MUNICIPAL_ADMIN',
    createdAt: timestamp,
    updatedAt: timestamp,
  },
  { merge: true },
);
console.log(`Admin profile ready: users/${adminUid}`);

for (const provider of providers) {
  await setDoc(
    doc(db, 'providers', provider.id),
    {
      ...provider,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    { merge: true },
  );
  console.log(`Seeded provider: ${provider.id}`);
}

await signOut(auth);
console.log('Firebase seed completed.');
process.exit(0);
