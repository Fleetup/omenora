import React, { useEffect, useState, useCallback } from 'react';
import * as Linking from 'expo-linking'
import { useAuth } from './src/context/useAuth'
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from './src/design/theme/ThemeProvider';
import { AuthProvider } from './src/context/AuthProvider'
import { PurchasesProvider } from './src/context/PurchasesProvider';
import { RootNavigator, navigationRef } from './src/navigation/RootNavigator';
import { useProfileStore } from './src/stores/profileStore';
import {
  useFonts,
  CormorantGaramond_300Light,
  CormorantGaramond_300Light_Italic,
  CormorantGaramond_500Medium,
} from '@expo-google-fonts/cormorant-garamond';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_400Regular_Italic,
} from '@expo-google-fonts/playfair-display';
import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
} from '@expo-google-fonts/inter';
import {
  Fraunces_300Light,
  Fraunces_300Light_Italic,
  Fraunces_500Medium,
} from '@expo-google-fonts/fraunces';
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
} from '@expo-google-fonts/hanken-grotesk';

// Keep splash screen visible while loading
SplashScreen.preventAutoHideAsync();

function DeepLinkHandler() {
  const { handleMagicLinkUrl } = useAuth()

  useEffect(() => {
    // Handle URL when app is already open
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('[DeepLink] Received URL:', url)
      if (url.includes('token_hash=')) {
        handleMagicLinkUrl(url)
      }
    })

    // Handle URL when app is opened cold from a link
    Linking.getInitialURL().then((url) => {
      if (url) {
        console.log('[DeepLink] Initial URL:', url)
        if (url.includes('token_hash=')) {
          handleMagicLinkUrl(url)
        }
      }
    })

    return () => {
      subscription.remove()
    }
  }, [handleMagicLinkUrl])

  return null
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const initializeStore = useProfileStore((state) => state.initialize);

  const [fontsLoaded] = useFonts({
    CormorantGaramond_300Light,
    CormorantGaramond_300Light_Italic,
    CormorantGaramond_500Medium,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_400Regular_Italic,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Fraunces_300Light,
    Fraunces_300Light_Italic,
    Fraunces_500Medium,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
  });

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
    if (appIsReady && fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady, fontsLoaded]);

  if (!appIsReady || !fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <AuthProvider>
            <DeepLinkHandler />
            <PurchasesProvider>
              <NavigationContainer ref={navigationRef}>
                <RootNavigator />
                <StatusBar style="light" />
              </NavigationContainer>
            </PurchasesProvider>
          </AuthProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
