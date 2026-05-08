import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { tokens } from '../design/tokens';
import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import { useProfileStore } from '../stores/profileStore';
import SplashScreen  from '../screens/onboarding/SplashScreen';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';

// Stack-only screens (appear above the tab bar)
import { AnalysisScreen } from '../screens/AnalysisScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { CompatibilityScreen } from '../screens/CompatibilityScreen';
import { PrivacyScreen } from '../screens/PrivacyScreen';
import { TermsScreen } from '../screens/TermsScreen';
import { ComponentsScreen } from '../screens/dev/ComponentsScreen';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const dateOfBirth      = useProfileStore((state) => state.dateOfBirth);
  const initialRouteName = dateOfBirth ? 'MainTabs' : 'Splash';

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown:  false,
        contentStyle: { backgroundColor: tokens.surface.base },
        animation:    'slide_from_right',
      }}
    >
      <Stack.Screen name="Splash"  component={SplashScreen}  options={{ animation: 'fade' }} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="MainTabs"      component={TabNavigator}        options={{ animation: 'none' }} />
      <Stack.Screen name="Analysis"      component={AnalysisScreen} />
      <Stack.Screen name="Report"        component={ReportScreen} />
      <Stack.Screen name="Calendar"      component={CalendarScreen} />
      <Stack.Screen name="Compatibility" component={CompatibilityScreen} />
      <Stack.Screen name="Privacy"       component={PrivacyScreen} />
      <Stack.Screen name="Terms"         component={TermsScreen} />
      {__DEV__ && (
        <Stack.Screen name="Components" component={ComponentsScreen} />
      )}
    </Stack.Navigator>
  );
};
