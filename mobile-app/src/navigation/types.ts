import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  Analysis: { step?: number } | undefined;
  Preview: { reportId?: string } | undefined;
  Report: { reportId: string } | undefined;
  Calendar: { calendarId?: string } | undefined;
  Compatibility: { reportId?: string } | undefined;
  Subscription: undefined;
  Privacy: undefined;
  Terms: undefined;
};

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;
export type AnalysisScreenProps = NativeStackScreenProps<RootStackParamList, 'Analysis'>;
export type PreviewScreenProps = NativeStackScreenProps<RootStackParamList, 'Preview'>;
export type ReportScreenProps = NativeStackScreenProps<RootStackParamList, 'Report'>;
export type CalendarScreenProps = NativeStackScreenProps<RootStackParamList, 'Calendar'>;
export type CompatibilityScreenProps = NativeStackScreenProps<RootStackParamList, 'Compatibility'>;
export type SubscriptionScreenProps = NativeStackScreenProps<RootStackParamList, 'Subscription'>;
export type PrivacyScreenProps = NativeStackScreenProps<RootStackParamList, 'Privacy'>;
export type TermsScreenProps = NativeStackScreenProps<RootStackParamList, 'Terms'>;
