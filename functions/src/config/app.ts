// URL pública de la SPA a la que webpayReturn redirige tras procesar el retorno.
// En local (emulador) se define en functions/.env (APP_BASE_URL=http://localhost:8081).
// En producción debe definirse mediante configuración/secreto de Firebase Functions.
export function appBaseUrl() {
  return (
    process.env.APP_BASE_URL?.trim() ||
    "https://rancoconecta.cl"
  );
}