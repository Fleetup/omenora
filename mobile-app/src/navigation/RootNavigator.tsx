import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme/colors';
import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';

// Stack-only screens (appear above the tab bar)
import { AnalysisScreen } from '../screens/AnalysisScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { CompatibilityScreen } from '../screens/CompatibilityScreen';
import { PrivacyScreen } from '../screens/PrivacyScreen';
import { TermsScreen } from '../screens/TermsScreen';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => (
  <Stack.Navigator
    initialRouteName="MainTabs"
    screenOptions={{
      headerShown:  false,
      contentStyle: { backgroundColor: colors.bone },
      animation:    'slide_from_right',
    }}
  >
    <Stack.Screen name="MainTabs"      component={TabNavigator}        options={{ animation: 'none' }} />
    <Stack.Screen name="Analysis"      component={AnalysisScreen} />
    <Stack.Screen name="Report"        component={ReportScreen} />
    <Stack.Screen name="Calendar"      component={CalendarScreen} />
    <Stack.Screen name="Compatibility" component={CompatibilityScreen} />
    <Stack.Screen name="Privacy"       component={PrivacyScreen} />
    <Stack.Screen name="Terms"         component={TermsScreen} />
  </Stack.Navigator>
);
