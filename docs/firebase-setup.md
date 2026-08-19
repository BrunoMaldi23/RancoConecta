# Ranco Conecta - Firebase setup

Estado actual del backend:

- Proyecto Firebase: `ranco-conecta`.
- Auth: Email/Password habilitado.
- Admin creado en Authentication.
- Perfil admin en Firestore `users/{uid}`.
- Prestadores en `providers` escritos desde el panel admin o con la ficha de comercio.
- Categorías en `categories` administradas desde el panel admin (CRUD).
- Imágenes de portada/galería en Storage (`provider-images`) vía `src/services/firebase-storage.ts`.
- Reglas de seguridad definidas en `firestore.rules` y `storage.rules` (ya no modo prueba).
- Config local en `.env` usando variables `EXPO_PUBLIC_FIREBASE_*`.

## Comandos

Validar el proyecto:

```bash
npm.cmd run lint
npm.cmd run build
```

Levantar web local:

```bash
npm.cmd run web
```

Si el puerto `8081` esta ocupado:

```bash
.\node_modules\.bin\expo.cmd start --web --port 8083
```

## Trabajar en desarrollo con emuladores

En desarrollo la app se conecta a los emuladores locales cuando `.env`
tiene `EXPO_PUBLIC_FIREBASE_EMULATOR=true` (puertos auth `9099`, firestore
`8080`, functions `5001`). Si los emuladores no están corriendo, Firestore
no responde y la home muestra "No se pudieron cargar los rubros".

Levantar y sembrar:

```bash
npm.cmd run emulators
npm.cmd run seed:emulator
npm.cmd run web
```

`seed:emulator` crea el usuario admin en el emulador de auth y siembra las
categorías base. Para volver a Firebase real, pon
`EXPO_PUBLIC_FIREBASE_EMULATOR=false` en `.env`.

> El retorno de Webpay es local solo se puede probar si Transbank puede
> alcanzar la URL pública de `webpayReturn` (no responde a `127.0.0.1`).

Sembrar/asegurar datos base en Firebase (opcional):

```bash
npm.cmd run seed:firebase
```

El seed:

- Inicia sesion con el admin configurado vía `SEED_ADMIN_*` (email/password/uid opcionales en `.env`).
- Asegura el documento `users/{uid}` del admin con su `role` y `status`.
- Siembra las 11 categorías base solo si aún no existen (no pisa ediciones del panel).
- Elimina prestadores demo legacy (`servicios-ranco`, `soluciones-rios`, `maestro-patricio`, `integrales-futrono`) si aún existen.
- El resto de prestadores y categorías se administran de forma real desde el panel interno.

## Colecciones

`users`

- `name`
- `email`
- `role`: `municipal_admin` o `commerce`
- `status`: `MUNICIPAL_ADMIN`, `PENDING_MUNICIPAL_APPROVAL` o `ACTIVE_COMMERCE`
- `businessName`
- `serviceName`
- `phone`
- `favoriteIds`: ids de prestadores favoritos del usuario
- `createdAt`
- `updatedAt`

`providers`

- Datos publicos de prestadores (directorio).
- `categoryId` / `subcategoryId`: taxonomía del servicio.
- `locationId` / `locationName` / `coverage`: localidad principal y cobertura.
- `images`: URLs de Storage (portada + galería; la primera hace de miniatura).
- `ownerId`: uid del comercio dueño (si fue creado desde `provider-register`).
- `publicationStatus`: `Publicado`, `Pendiente` o `Pausado`
- `plan`: `Base` o `Destacado`
- `rating` / `reviews`: recalculados por `saveRating`.

`categories`

- Rubros del directorio, legibles por todos y escritos solo por el admin (CRUD en `/admin`).
- `name`, `description`, `icon`, `iconColor`, `iconBackground`, `subcategories[]`.
- Cada subcategoría: `id`, `name`, `description`, `icon`.
- `createdAt`, `updatedAt`.

`requests`

- Solicitudes enviadas desde perfil de prestador.
- `userId`: autor (vecino). Admin ve todas; vecino solo las suyas.
- `status`: `Enviada`, `Respondida`, `Agendada` o `Cerrada`

`ratings`

- Valoraciones enviadas desde perfil.
- Id compuesto `{userId}_{providerId}` (una valoración por usuario).
- `rating` 1-5 validado en las reglas.

`recommendations`

- Reservada para futuras recomendaciones ciudadanas (aún sin flujo en la app).

## Flux de datos reales

- `onSnapshot` en `providers`, `requests` y `categories` mantienen la UI en tiempo real.
- Los contadores de la home (`/home`, `/categories`, `/category/[categoryId]`, `/providers`) se derivan de los providers publicados y su `coverage`, no de datos locales.
- Destacados = providers con `plan: 'Destacado'` y `publicationStatus: 'Publicado'`.
- El home muestra solo rubros con prestadores disponibles en la localidad elegida.

## Inscripción de comercios (membresía + enlace por correo)

Flujo actual del cliente:

1. El cliente paga/coordina la membresía desde `/inscribir` (`EXPO_PUBLIC_MEMBERSHIP_URL` o WhatsApp/correo de admin vía `EXPO_PUBLIC_ADMIN_*`).
2. Desde `/inscribir` registra su nombre y correo. La app envía un email-link con Firebase Auth (`sendSignInLinkToEmail`, `src/services/firebase-invites.ts`).
3. El cliente abre el enlace en el correo → la app completa el sign-in (`signInWithEmailLink`), crea su documento en `users` como `commerce` con `status: PENDING_MUNICIPAL_APPROVAL` y lo lleva a `/provider-register` para completar y gestionar su perfil.
4. La administración publica la ficha desde `/admin`.

Requisitos en Firebase Console (Authentication):

- Proveedor **Email/Password** habilitado.
- Proveedor **Email link (passwordless)** habilitado para enviar enlaces de inscripción.
- Dominios autorizados: agregar el dominio de producción (Vercel) y, si se usa en dev, `localhost`. Sin esto, `sendSignInLinkToEmail` falla con `auth/unauthorized-continue-uri`.

Sin Firebase no hay email-link: la app muestra error y no crea cuentas.

## Storage

- Bucket del proyecto Firebase; reglas en `storage.rules`.
- `provider-images/{file}`: lectura pública, escritura de cualquier usuario autenticado.
  Las imágenes de portada/galería de prestadores se suben aquí (`src/services/firebase-storage.ts`).
- `request-photos/{file}`: lectura/escritura de usuarios autenticados, para futuras fotos de solicitudes.
- `uploadImage(uri, folder)` descarga el blob y genera un nombre único antes de subir.

## Reglas Firestore

- `firestore.rules`: `categories` con `read: if true` y escritura solo admin; `providers`, `requests` y `ratings` mantienen validaciones de roles; `users` con acceso según rol.
- Las reglas deben publicarse con la CLI (no están en modo prueba).

## Pendientes para afinar

- Subir a Storage las fotografías de `requests.photos` (hoy se guardan URIs locales).
- Ajustar reglas de `users` si se permite a comercios editar más campos propios.
- Revisar Brave Shields o extensiones si aparece `ERR_BLOCKED_BY_CLIENT` contra Firestore.
