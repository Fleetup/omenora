import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { tokens } from '../design/tokens';
import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import SplashScreen             from '../screens/onboarding/SplashScreen';
import WelcomeScreen            from '../screens/onboarding/WelcomeScreen';
import BirthInfoScreen          from '../screens/onboarding/BirthInfoScreen';
import BirthTimeLocationScreen  from '../screens/onboarding/BirthTimeLocationScreen';
import CalculatingScreen        from '../screens/onboarding/CalculatingScreen';
import BigThreeRevealScreen     from '../screens/onboarding/BigThreeRevealScreen';
import OptionalQuestionsScreen  from '../screens/onboarding/OptionalQuestionsScreen';
import PremiumTeaserScreen      from '../screens/onboarding/PremiumTeaserScreen';

// Stack-only screens (appear above the tab bar)
import { CalendarScreen } from '../screens/CalendarScreen';
import { CompatibilityScreen } from '../screens/CompatibilityScreen';
import { PrivacyScreen } from '../screens/PrivacyScreen';
import { TermsScreen } from '../screens/TermsScreen';
import TraditionSwitcherScreen from '../screens/settings/TraditionSwitcherScreen';
import CrisisResourcesScreen  from '../screens/settings/CrisisResourcesScreen';
import ProfileScreen          from '../screens/settings/ProfileScreen';
import NotificationsScreen    from '../screens/settings/NotificationsScreen';
import PrivacySettingsScreen  from '../screens/settings/PrivacySettingsScreen';
import LanguageScreen         from '../screens/settings/LanguageScreen';
import DeleteAccountScreen    from '../screens/settings/DeleteAccountScreen';
import CounselChatScreen      from '../screens/counsel/CounselChatScreen';
import { ComponentsScreen } from '../screens/dev/ComponentsScreen';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
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
      <Stack.Screen name="Calendar"      component={CalendarScreen} />
      <Stack.Screen name="Compatibility"     component={CompatibilityScreen} />
      <Stack.Screen name="TraditionSwitcher" component={TraditionSwitcherScreen} />
      <Stack.Screen name="CrisisResources"   component={CrisisResourcesScreen} />
      <Stack.Screen name="Profile"           component={ProfileScreen} />
      <Stack.Screen name="Notifications"   component={NotificationsScreen} />
      <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
      <Stack.Screen name="Language"        component={LanguageScreen} />
      <Stack.Screen name="DeleteAccount"   component={DeleteAccountScreen} />
      <Stack.Screen name="CounselChat"       component={CounselChatScreen} />
      <Stack.Screen name="Privacy"           component={PrivacyScreen} />
      <Stack.Screen name="Terms"         component={TermsScreen} />
      {__DEV__ && (
        <Stack.Screen name="Components" component={ComponentsScreen} />
      )}
    </Stack.Navigator>
  );
};
