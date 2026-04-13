import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

// Screens
import { HomeScreen } from '../screens/HomeScreen';
import { AnalysisScreen } from '../screens/AnalysisScreen';
import { PreviewScreen } from '../screens/PreviewScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { CompatibilityScreen } from '../screens/CompatibilityScreen';
import { SubscriptionScreen } from '../screens/SubscriptionScreen';
import { PrivacyScreen } from '../screens/PrivacyScreen';
import { TermsScreen } from '../screens/TermsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#050410' },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Analysis" component={AnalysisScreen} />
      <Stack.Screen name="Preview" component={PreviewScreen} />
      <Stack.Screen name="Report" component={ReportScreen} />
      <Stack.Screen name="Calendar" component={CalendarScreen} />
      <Stack.Screen name="Compatibility" component={CompatibilityScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
    </Stack.Navigator>
  );
};
