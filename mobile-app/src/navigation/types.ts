import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// ── Tab navigator ──────────────────────────────────────────────────────────────
export type TabParamList = {
  TodayTab:    undefined;
  ReadingsTab: undefined;
  CounselTab:  undefined;
  MoreTab:     undefined;
};

// ── Root stack ─────────────────────────────────────────────────────────────────
export type RootStackParamList = {
  // Onboarding
  Splash:             undefined;
  Welcome:            undefined;
  BirthInfo:          undefined;
  BirthTimeLocation:  undefined;
  Calculating:        undefined;
  BigThreeReveal:     { sunSign: string; moonSign: string; risingSign: string; archetypeName: string };
  OptionalQuestions:  undefined;
  PremiumTeaser:      undefined;
  // App
  MainTabs:      NavigatorScreenParams<TabParamList> | undefined;
  Calendar:      { calendarId?: string } | undefined;
  Compatibility: { reportId?: string } | undefined;
  Privacy:       undefined;
  Terms:         undefined;
  Components:    undefined;
};

// ── Tab screen props (composite — can navigate to root stack screens too) ──────
export type TodayScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'TodayTab'>,
  NativeStackScreenProps<RootStackParamList>
>;
export type ReadingsScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'ReadingsTab'>,
  NativeStackScreenProps<RootStackParamList>
>;
export type CounselScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'CounselTab'>,
  NativeStackScreenProps<RootStackParamList>
>;
export type MoreScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'MoreTab'>,
  NativeStackScreenProps<RootStackParamList>
>;


// ── Stack-only screen props ────────────────────────────────────────────────────
export type CalendarScreenProps     = NativeStackScreenProps<RootStackParamList, 'Calendar'>;
export type CompatibilityScreenProps = NativeStackScreenProps<RootStackParamList, 'Compatibility'>;
export type PrivacyScreenProps      = NativeStackScreenProps<RootStackParamList, 'Privacy'>;
export type TermsScreenProps           = NativeStackScreenProps<RootStackParamList, 'Terms'>;
export type BigThreeRevealScreenProps  = NativeStackScreenProps<RootStackParamList, 'BigThreeReveal'>;
