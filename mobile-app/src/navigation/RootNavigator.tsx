import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { tokens } from '../design/tokens';
import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import { useProfileStore } from '../stores/profileStore';
import SplashScreen             from '../screens/onboarding/SplashScreen';
import WelcomeScreen            from '../screens/onboarding/WelcomeScreen';
import BirthInfoScreen          from '../screens/onboarding/BirthInfoScreen';
import BirthTimeLocationScreen  from '../screens/onboarding/BirthTimeLocationScreen';
import CalculatingScreen        from '../screens/onboarding/CalculatingScreen';
import BigThreeRevealScreen     from '../screens/onboarding/BigThreeRevealScreen';
import OptionalQuestionsScreen  from '../screens/onboarding/OptionalQuestionsScreen';
import PremiumTeaserScreen      from '../screens/onboarding/PremiumTeaserScreen';

// Stack-only screens (appear above the tab bar)
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
      <Stack.Screen name="BirthInfo"         component={BirthInfoScreen} />
      <Stack.Screen name="BirthTimeLocation" component={BirthTimeLocationScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Calculating"       component={CalculatingScreen}       options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="BigThreeReveal"     component={BigThreeRevealScreen}     options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="OptionalQuestions"  component={OptionalQuestionsScreen} />
      <Stack.Screen name="PremiumTeaser"      component={PremiumTeaserScreen}      options={{ gestureEnabled: false }} />
      <Stack.Screen name="MainTabs"      component={TabNavigator}        options={{ animation: 'none' }} />
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
