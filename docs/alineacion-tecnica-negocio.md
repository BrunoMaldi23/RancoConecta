# Documento de alineacion tecnica y de negocio

Proyecto: Ranco Conecta (`ranco-conecta.vercel.app` / App React Native)

Modelo de negocio: B2G2C (Business-to-Government-to-Consumer) / Permiso Digital Municipal

## 1. Vision general del proyecto

Ranco Conecta no es solo un directorio comercial privado, sino la plataforma y vitrina digital oficial de la Municipalidad de Lago Ranco.

Cliente principal (B2G): la Municipalidad financia la plataforma mediante un contrato de software, licencia, desarrollo y mantencion.

Monetizacion municipal (B2C): vecinos, comercios, prestadores de servicios y operadores turisticos adquieren un permiso o derecho de presencia digital directamente con el Municipio para aparecer o destacarse en la app.

## 2. Flujo de usuarios y permisos

El backend y la navegacion de React Native deben gestionar 3 roles principales.

## Usuario invitado / vecino / turista

Acceso: modo invitado directo a Home, sin friccion de registro inicial.

Capacidades: consultar catalogo, ver noticias y eventos municipales, buscar servicios y contactar comercios.

## Comercio / prestador de servicios

Ejemplos: pyme local, fletes, turismo, servicios domiciliarios y comercio establecido.

Registro: solicitud de perfil de negocio desde la app.

Estado inicial: `PENDING_MUNICIPAL_APPROVAL`. La ficha no debe ser visible publicamente hasta la validacion de pago o permiso municipal.

Estado activado: `ACTIVE_COMMERCE`, tras validacion municipal.

Capacidades: administrar ficha comercial, publicar ofertas, catalogo e insignias de verificacion.

## Administrador municipal

Ejemplos de areas: DIDECO, Fomento Productivo, Turismo.

Acceso: panel web admin, idealmente dashboard dedicado.

Capacidades: validar o rechazar solicitudes de espacio comercial, verificar pagos de derechos municipales, emitir notificaciones push comunitarias y ver analiticas de uso comunal.

## 3. Requerimientos clave para la app React Native

Autenticacion hibrida y condicional:

- Permitir navegacion anonima en Home.
- Mostrar interceptores o modales de autenticacion solo al intentar realizar acciones de registro de negocio, guardado de favoritos o gestion de perfil.

Ciclo de vida de fichas comerciales:

- Implementar indicador de estado en el perfil del comercio: "Esperando validacion de Pago de Permiso Municipal".
- Incorporar sistema de etiquetas y prioridad en Home para destacar comercios con permiso VIP/PRO respecto a fichas gratuitas o basicas.

Integracion y redireccion:

- Incluir enlace o WebView hacia el portal de pagos de la Municipalidad/Tesoreria para que el comerciante pueda tramitar su permiso digital directamente.

## 4. Propuesta de valor comercial

Para la Municipalidad: modernizacion digital de la comuna sin costo de infraestructura interna, aumento de recaudacion por derechos o permisos digitales y formalizacion del comercio local.

Para los comerciantes: espacio de difusion oficial, economico y respaldado por la municipalidad, generando mayor confianza en turistas y vecinos.

Para el equipo desarrollador: contrato recurrente de mantencion y soporte con la municipalidad bajo modelo SaaS/B2G, delegando la gestion de cobranza individual al aparato municipal.

## 5. Implicancias de implementacion

- La Home debe sentirse como entrada publica oficial: busqueda, rubros, noticias/eventos municipales y acceso claro para solicitar presencia digital.
- El registro de prestadores no debe crear visibilidad inmediata; debe generar una solicitud revisable por el municipio.
- El panel admin debe ser tratado como producto principal B2G, no como pantalla secundaria del prototipo.
- Las entidades de negocio deberian contemplar estados, nivel de permiso, fecha de vigencia, comprobante o referencia de pago, responsable municipal y trazabilidad de aprobacion.
- La comunicacion visual debe reforzar confianza institucional sin perder cercania local.
