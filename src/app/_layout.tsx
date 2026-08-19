import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AppDataProvider } from '../contexts/app-data';
import { AuthProvider } from '../contexts/auth';

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppDataProvider>
        <StatusBar style="dark" />

        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: {
              backgroundColor: '#EAF3F0',
            },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="home" />
          <Stack.Screen name="admin" />
          <Stack.Screen name="categories" />
          <Stack.Screen name="featured" />
          <Stack.Screen name="favorites" />
          <Stack.Screen name="history" />
          <Stack.Screen name="contacts" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="inscribir" />
          <Stack.Screen name="payment-result" />
          <Stack.Screen name="provider-register" />
          <Stack.Screen name="request-service" />
          <Stack.Screen name="category/[categoryId]" />
          <Stack.Screen name="provider/[providerId]" />
          <Stack.Screen name="providers" />
        </Stack>
      </AppDataProvider>
    </AuthProvider>
  );
}
