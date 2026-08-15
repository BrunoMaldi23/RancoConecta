# Ranco Conecta - Firebase setup

Estado actual del backend:

- Proyecto Firebase: `ranco-conecta`.
- Auth: Email/Password habilitado.
- Admin creado en Authentication.
- Perfil admin creado en Firestore `users/{uid}`.
- Prestadores demo sembrados en `providers`.
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

Sembrar datos demo en Firebase:

```bash
npm.cmd run seed:firebase
```

El seed:

- Inicia sesion con `admin@lagoranco.cl`.
- Asegura el documento `users/{uid}` del admin.
- Crea o actualiza los 4 prestadores demo en `providers`.

## Colecciones

`users`

- `name`
- `email`
- `role`: `municipal_admin` o `commerce`
- `status`: `MUNICIPAL_ADMIN`, `PENDING_MUNICIPAL_APPROVAL` o `ACTIVE_COMMERCE`
- `businessName`
- `serviceName`
- `phone`
- `createdAt`
- `updatedAt`

`providers`

- Datos publicos de prestadores.
- `publicationStatus`: `Publicado`, `Pendiente` o `Pausado`
- `plan`: `Base` o `Destacado`

`requests`

- Solicitudes enviadas desde perfil de prestador.
- `status`: `Enviada`, `Respondida`, `Agendada` o `Cerrada`

`ratings`

- Valoraciones enviadas desde perfil.

`recommendations`

- Recomendaciones para destacados.

## Pendientes para afinar

- Aplicar reglas finales desde `firestore.rules` cuando dejemos de usar modo prueba.
- Revisar Brave Shields o extensiones si aparece `ERR_BLOCKED_BY_CLIENT` contra Firestore.
- Decidir si subiremos imagenes a Storage o si por ahora seguiremos con URL externa.
- Mejorar seed para categorias/subcategorias cuando esas entidades pasen a backend real.
