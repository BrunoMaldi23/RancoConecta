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
};

export const PROVIDERS: Provider[] = [
  { id: 'servicios-ranco', name: 'Servicios del Ranco', service: 'Electricidad y reparaciones', categoryId: 'hogar', subcategoryId: 'electricidad', locationId: 'lago-ranco', locationName: 'Lago Ranco', rating: 4.9, reviews: 38, distance: '1,8 km', verified: true, available: true, phone: '+56987654321', whatsapp: '56987654321', description: 'Instalaciones, reparaciones y mantenciones domiciliarias con atenciÃ³n en sectores urbanos y rurales.', coverage: ['Lago Ranco', 'RiÃ±inahue', 'Ilihue'] },
  { id: 'soluciones-rios', name: 'Soluciones Los RÃ­os', service: 'EnergÃ­a solar y electricidad', categoryId: 'energia', subcategoryId: 'solar', locationId: 'futrono', locationName: 'Futrono', rating: 4.8, reviews: 24, distance: '3,2 km', verified: true, available: true, phone: '+56976543210', whatsapp: '56976543210', description: 'DiseÃ±o e instalaciÃ³n de sistemas solares, baterÃ­as, inversores y respaldo energÃ©tico.', coverage: ['Futrono', 'Llifen', 'Lago Ranco'] },
  { id: 'maestro-patricio', name: 'Maestro Patricio', service: 'GasfiterÃ­a y hogar', categoryId: 'hogar', subcategoryId: 'gasfiteria', locationId: 'futrono', locationName: 'Futrono', rating: 4.7, reviews: 19, distance: '5,1 km', verified: false, available: true, phone: '+56965432109', whatsapp: '56965432109', description: 'ReparaciÃ³n de filtraciones, griferÃ­a, calefÃ³n, caÃ±erÃ­as y emergencias domiciliarias.', coverage: ['Futrono', 'Llifen'] },
  { id: 'integrales-futrono', name: 'Servicios Integrales Futrono', service: 'MantenciÃ³n y construcciÃ³n', categoryId: 'hogar', subcategoryId: 'carpinteria', locationId: 'futrono', locationName: 'Futrono', rating: 4.6, reviews: 31, distance: '7,4 km', verified: true, available: false, phone: '+56954321098', whatsapp: '56954321098', description: 'Equipo local para reparaciones, ampliaciones, pintura, carpinterÃ­a y mantenciÃ³n general.', coverage: ['Futrono', 'Llifen', 'NontuelÃ¡'] },
];

export const getProvider = (id?: string) => PROVIDERS.find((item) => item.id === id) ?? PROVIDERS[0];
