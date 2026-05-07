import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// ── Tab navigator ──────────────────────────────────────────────────────────────
export type TabParamList = {
  HomeTab:    undefined;
  ReadingTab: undefined;
  ExploreTab: undefined;
  MoreTab:    undefined;
};

// ── Root stack ─────────────────────────────────────────────────────────────────
export type RootStackParamList = {
  MainTabs:      NavigatorScreenParams<TabParamList> | undefined;
  Analysis:      { step?: number } | undefined;
  Report:        { reportId: string } | undefined;
  Calendar:      { calendarId?: string } | undefined;
  Compatibility: { reportId?: string } | undefined;
  Privacy:       undefined;
  Terms:         undefined;
  Components:    undefined;
};

// ── Tab screen props (composite — can navigate to root stack screens too) ──────
export type HomeScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'HomeTab'>,
  NativeStackScreenProps<RootStackParamList>
>;
export type ReadingScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'ReadingTab'>,
  NativeStackScreenProps<RootStackParamList>
>;
export type ExploreScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'ExploreTab'>,
  NativeStackScreenProps<RootStackParamList>
>;
export type MoreScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'MoreTab'>,
  NativeStackScreenProps<RootStackParamList>
>;

// ── Stack-only screen props ────────────────────────────────────────────────────
export type AnalysisScreenProps     = NativeStackScreenProps<RootStackParamList, 'Analysis'>;
export type ReportScreenProps       = NativeStackScreenProps<RootStackParamList, 'Report'>;
export type CalendarScreenProps     = NativeStackScreenProps<RootStackParamList, 'Calendar'>;
export type CompatibilityScreenProps = NativeStackScreenProps<RootStackParamList, 'Compatibility'>;
export type PrivacyScreenProps      = NativeStackScreenProps<RootStackParamList, 'Privacy'>;
export type TermsScreenProps        = NativeStackScreenProps<RootStackParamList, 'Terms'>;
