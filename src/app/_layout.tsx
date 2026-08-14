import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar
        style="dark"
        translucent={false}
        backgroundColor="#F7F8F3"
      />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: {
            backgroundColor: '#F7F8F3',
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
        <Stack.Screen name="category/[categoryId]" />
        <Stack.Screen name="providers" />
      </Stack>
    </>
  );
}