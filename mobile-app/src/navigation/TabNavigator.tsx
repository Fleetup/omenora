import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TabParamList } from './types';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { HomeScreen } from '../screens/HomeScreen';
import { ReadingScreen } from '../screens/ReadingScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { MoreScreen } from '../screens/MoreScreen';

const Tab = createBottomTabNavigator<TabParamList>();

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_CONFIG: Record<keyof TabParamList, { label: string; active: IoniconsName; inactive: IoniconsName }> = {
  HomeTab:    { label: 'Home',    active: 'home',       inactive: 'home-outline' },
  ReadingTab: { label: 'Reading', active: 'book',       inactive: 'book-outline' },
  ExploreTab: { label: 'Explore', active: 'compass',    inactive: 'compass-outline' },
  MoreTab:    { label: 'More',    active: 'person',     inactive: 'person-outline' },
};

export const TabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={({ route }) => {
      const cfg = TAB_CONFIG[route.name as keyof TabParamList];
      return {
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor:   colors.gold,
        tabBarInactiveTintColor: colors.inkFaint,
        tabBarLabelStyle:        styles.tabLabel,
        tabBarLabel: cfg.label,
        tabBarIcon: ({ focused, color }) => (
          <Ionicons
            name={focused ? cfg.active : cfg.inactive}
            size={22}
            color={color}
          />
        ),
      };
    }}
  >
    <Tab.Screen name="HomeTab"    component={HomeScreen} />
    <Tab.Screen name="ReadingTab" component={ReadingScreen} />
    <Tab.Screen name="ExploreTab" component={ExploreScreen} />
    <Tab.Screen name="MoreTab"    component={MoreScreen} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.bone,
    borderTopColor:  colors.inkGhost,
    borderTopWidth:  StyleSheet.hairlineWidth,
    elevation:       0,
    paddingTop:      Platform.OS === 'ios' ? 8 : 6,
  },
  tabLabel: {
    fontFamily:    fonts.hankenSemiBold,
    fontSize:      9,
    letterSpacing: 0.6,
    marginTop:     2,
  },
});
