# Documento de alineacion tecnica y de negocio

Proyecto: Ranco Conecta (`ranco-conecta.vercel.app` / App React Native)

Modelo de negocio: producto SaaS local con membresias para comercios y prestadores.

## 1. Vision general del proyecto

Ranco Conecta es un directorio privado de oficios, comercios y servicios del Lago Ranco.

La propuesta se vende como producto de membresia: los prestadores pagan para tener presencia digital, administrar su ficha, aparecer en busquedas y optar a planes destacados.

## 2. Flujo de usuarios

El frontend y backend gestionan tres perfiles principales.

## Usuario invitado / vecino / turista

Acceso: modo invitado directo a Home, sin friccion de registro inicial.

Capacidades: consultar rubros, buscar servicios, revisar prestadores, guardar favoritos y contactar comercios.

## Comercio / prestador de servicios

Ejemplos: pyme local, fletes, turismo, servicios domiciliarios y comercio establecido.

Registro: solicitud de perfil desde la app o alta interna desde el panel.

Estado inicial: `PENDING_MUNICIPAL_APPROVAL`. La ficha no debe ser visible publicamente hasta activar la membresia.

Estado activado: `ACTIVE_COMMERCE`, tras revision interna y activacion del plan.

Capacidades: administrar ficha, fotos, categoria, datos de contacto y estado de su plan.

## Administrador interno

Acceso: panel web admin.

Capacidades: crear usuarios, revisar solicitudes, publicar o pausar fichas, destacar prestadores, administrar categorias y mantener el directorio.

## 3. Requerimientos clave para la app React Native

Autenticacion hibrida y condicional:

- Permitir navegacion anonima en Home.
- Mostrar login solo al intentar gestionar una ficha, guardar favoritos o entrar a perfil.

Ciclo de vida de fichas comerciales:

- Mostrar el estado del plan: pendiente, activo o pausado.
- Priorizar prestadores con plan destacado.

Integracion y redireccion:

- Enlace configurable de pago o contacto para coordinar membresia (`EXPO_PUBLIC_MEMBERSHIP_URL` o canales de soporte).

## 4. Propuesta de valor comercial

Para vecinos y turistas: encontrar rapido prestadores locales confiables.

Para comerciantes: vitrina clara, facil de compartir y con presencia organizada por rubro.

Para Ranco Conecta: ingreso recurrente por membresias, planes destacados y mantencion del directorio.

## 5. Implicancias de implementacion

- La Home debe sentirse como entrada publica de busqueda, no como portal institucional.
- El registro de prestadores no crea visibilidad inmediata; genera una solicitud revisable.
- El panel admin es operacion interna del producto.
- Las entidades de negocio contemplan estado, plan, vigencia futura, comprobante o referencia de pago y trazabilidad de activacion.
- La comunicacion visual debe reforzar confianza local, cercania y simpleza.
