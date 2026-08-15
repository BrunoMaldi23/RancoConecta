export type Provider = {
  id: string;
  name: string;
  service: string;
  categoryId: string;
  subcategoryId: string;
  locationId: string;
  locationName: string;
  rating: number;
  reviews: number;
  distance: string;
  verified: boolean;
  available: boolean;
  phone: string;
  whatsapp: string;
  description: string;
  coverage: string[];
  images: string[];
};

export const PROVIDERS: Provider[] = [
  { id: 'servicios-ranco', name: 'Servicios del Ranco', service: 'Electricidad y reparaciones', categoryId: 'hogar', subcategoryId: 'electricidad', locationId: 'lago-ranco', locationName: 'Lago Ranco', rating: 4.9, reviews: 38, distance: '1,8 km', verified: true, available: true, phone: '+56987654321', whatsapp: '56987654321', description: 'Instalaciones, reparaciones y mantenciones domiciliarias con atención en sectores urbanos y rurales.', coverage: ['Lago Ranco', 'Riñinahue', 'Ilihue'], images: ['https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=1200&q=80'] },
  { id: 'soluciones-rios', name: 'Soluciones Los Ríos', service: 'Energía solar y electricidad', categoryId: 'energia', subcategoryId: 'solar', locationId: 'futrono', locationName: 'Futrono', rating: 4.8, reviews: 24, distance: '3,2 km', verified: true, available: true, phone: '+56976543210', whatsapp: '56976543210', description: 'Diseño e instalación de sistemas solares, baterías, inversores y respaldo energético.', coverage: ['Futrono', 'Llifen', 'Lago Ranco'], images: ['https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?auto=format&fit=crop&w=1200&q=80'] },
  { id: 'maestro-patricio', name: 'Maestro Patricio', service: 'Gasfitería y hogar', categoryId: 'hogar', subcategoryId: 'gasfiteria', locationId: 'futrono', locationName: 'Futrono', rating: 4.7, reviews: 19, distance: '5,1 km', verified: false, available: true, phone: '+56965432109', whatsapp: '56965432109', description: 'Reparación de filtraciones, grifería, calefón, cañerías y emergencias domiciliarias.', coverage: ['Futrono', 'Llifen'], images: ['https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1200&q=80'] },
  { id: 'integrales-futrono', name: 'Servicios Integrales Futrono', service: 'Mantención y construcción', categoryId: 'hogar', subcategoryId: 'carpinteria', locationId: 'futrono', locationName: 'Futrono', rating: 4.6, reviews: 31, distance: '7,4 km', verified: true, available: false, phone: '+56954321098', whatsapp: '56954321098', description: 'Equipo local para reparaciones, ampliaciones, pintura, carpintería y mantención general.', coverage: ['Futrono', 'Llifen', 'Nontuelá'], images: ['https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=80'] },
];

export const getProvider = (id?: string) => PROVIDERS.find((item) => item.id === id) ?? PROVIDERS[0];
