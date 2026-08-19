import { router } from 'expo-router';

type FallbackHref = Parameters<typeof router.replace>[0];

export function safeGoBack(fallbackHref: FallbackHref = '/home') {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace(fallbackHref);
}