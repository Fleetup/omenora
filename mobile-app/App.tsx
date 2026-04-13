import React, { useEffect, useState, useCallback } from 'react';
import { Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { RootNavigator, navigationRef } from './src/navigation/RootNavigator';
import { useAnalysisStore } from './src/stores/analysisStore';
import { api } from './src/api/endpoints';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const initializeStore = useAnalysisStore((state) => state.initialize);
  const store           = useAnalysisStore();

  // ── Payment deep-link handler ─────────────────────────────────────────────
  const handleDeepLink = useCallback(async (url: string) => {
    if (!url.startsWith('omenora://payment/success')) return;

    const sessionId = url.match(/[?&]session_id=([^&]+)/)?.[1];
    if (!sessionId) return;

    try {
      const result = await api.verifyMobileCheckoutSession(sessionId);
      if (!result.paid) return;

      const type = result.metadata?.type ?? '';
      store.setPaymentComplete(true);
      if (type === 'bundle' || type === 'oracle') store.setBundlePurchased(true);
      if (type === 'oracle') store.setOraclePurchased(true);

      if (navigationRef.isReady()) {
        navigationRef.navigate('Report', {
          reportId: store.report?.archetypeName ?? 'default',
        });
      }
    } catch {
      // Silent — user can retry from PreviewScreen if needed
    }
  }, [store]);

  useEffect(() => {
    // Handle URL when app is already open (foreground)
    const subscription = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));
    // Handle URL that launched the app from background/closed
    Linking.getInitialURL().then((url) => { if (url) handleDeepLink(url); });
    return () => subscription.remove();
  }, [handleDeepLink]);
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    async function prepare() {
      try {
        await initializeStore();
      } catch (e) {
        console.warn('Error loading app:', e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, [initializeStore]);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <ThemeProvider>
        <NavigationContainer ref={navigationRef}>
          <RootNavigator />
          <StatusBar style="light" />
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
