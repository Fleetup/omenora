import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useAnalysisStore } from './src/stores/analysisStore';
import { STRIPE_PUBLISHABLE_KEY } from './src/constants/config';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const initializeStore = useAnalysisStore((state) => state.initialize);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize store
        await initializeStore();
        
        // Pre-load fonts if needed
        // await Font.loadAsync({
        //   'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
        // });
      } catch (e) {
        console.warn('Error loading app:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = React.useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY} urlScheme="omenora">
      <SafeAreaProvider onLayout={onLayoutRootView}>
        <ThemeProvider>
          <NavigationContainer>
            <RootNavigator />
            <StatusBar style="light" />
          </NavigationContainer>
        </ThemeProvider>
      </SafeAreaProvider>
    </StripeProvider>
  );
}
