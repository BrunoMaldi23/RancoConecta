export const isFirebaseConfigured = Boolean(
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY &&
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
);
