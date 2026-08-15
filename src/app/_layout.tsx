import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: {
            backgroundColor: '#F7F8F4',
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
        <Stack.Screen name="admin" />
        <Stack.Screen name="featured" />
        <Stack.Screen name="history" />
        <Stack.Screen name="category/[categoryId]" />
        <Stack.Screen name="providers" />
      </Stack>
    </>
  );
}
