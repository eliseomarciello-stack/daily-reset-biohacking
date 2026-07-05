import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { LogBox, Platform, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useIconFonts } from '@/src/hooks/use-icon-fonts';
import { theme } from '@/src/theme';

LogBox.ignoreAllLogs(true);

// Keep the native splash visible from cold start until icon fonts register.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useIconFonts();

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const doc = typeof globalThis !== 'undefined' ? (globalThis as any).document : undefined;
    if (!doc) return;

    doc.documentElement.setAttribute('lang', 'it');
    doc.documentElement.setAttribute('translate', 'no');
    doc.documentElement.classList.add('notranslate');
    doc.body?.setAttribute('translate', 'no');
    doc.body?.classList.add('notranslate');

    const ensureMeta = (name: string, content: string) => {
      let meta = doc.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = doc.createElement('meta');
        meta.setAttribute('name', name);
        doc.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    ensureMeta('google', 'notranslate');
  }, []);


  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.color.surface }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor={theme.color.surface} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.color.surface } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="result" options={{ presentation: 'card' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
