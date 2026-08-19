import { Linking, Platform } from 'react-native';

// Webpay Plus recibe la visita inicial mediante un formulario POST
// con el campo oculto token_ws (NO basta un window.location.href).
// Esta función redirige hacia el checkout de Transbank.
export function openWebpayCheckout(token: string, url: string) {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const form = document.createElement('form');

    form.method = 'POST';
    form.action = url;
    form.style.display = 'none';

    const input = document.createElement('input');

    input.type = 'hidden';
    input.name = 'token_ws';
    input.value = token;

    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();

    return;
  }

  // iOS/Android: se abre el navegador externo. La devolución a la app
  // mediante deep link (scheme) se implementará en una etapa posterior.
  Linking.openURL(url).catch(() => undefined);
}