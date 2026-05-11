import { create } from 'zustand';
import type { CalendarData } from '../types/calendar';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ReportSection {
  title: string;
  content: string;
}

export interface Report {
  archetypeSymbol: string;
  archetypeName: string;
  element: string;
  powerTraits: string[];
  sections: {
    identity:    ReportSection;
    science:     ReportSection;
    forecast:    ReportSection;
    love:        ReportSection;
    purpose:     ReportSection;
    gift:        ReportSection;
    affirmation: ReportSection;
    [key: string]: ReportSection;
  };
}

export interface ProfileState {
  // User Input
  firstName: string;
  dateOfBirth: string;
  timeOfBirth: string;
  city: string;

  // Answers to personality questions
  answers: Record<string, string>;

  // Calculated Results
  lifePathNumber: number | null;
  archetype: string | null;
  sunSign:    string | null;
  moonSign:   string | null;
  risingSign: string | null;
  reportId: string | null;
  report: Report | null;
  anonymousUserId: string;

  // Region
  regionOverride: string | null;
  languageOverride: string | null;

  // Calendar cache
  calendarData: CalendarData | null;
  setCalendarData: (data: CalendarData | null) => void;

  // Consent flags
  hasAcceptedCounselDisclosure:    boolean;
  setHasAcceptedCounselDisclosure: (accepted: boolean) => void;

  // Actions
  setFirstName: (name: string) => void;
  setDateOfBirth: (date: string) => void;
  setTimeOfBirth: (time: string) => void;
  setCity: (city: string) => void;
  setAnswer: (questionId: string, value: string) => void;
  setLifePathNumber: (number: number) => void;
  setArchetype:  (archetype: string) => void;
  setSunSign:    (sunSign: string | null) => void;
  setMoonSign:   (moonSign: string | null) => void;
  setRisingSign: (risingSign: string | null) => void;
  setReportId: (id: string) => void;
  setReport: (report: Report) => void;
  setAnonymousUserId: (id: string) => void;
  setRegionOverride: (region: string) => void;
  setLanguageOverride: (lang: string) => void;

  // Reset
  resetAnalysis: () => void;
  resetAll: () => void;

  // Initialize
  initialize: () => Promise<void>;
}

const initialState = {
  firstName: '',
  dateOfBirth: '',
  timeOfBirth: '',
  city: '',
  answers: {},
  lifePathNumber: null,
  archetype: null,
  sunSign:    null,
  moonSign:   null,
  risingSign: null,
  reportId: null,
  report: null,
  anonymousUserId: '',
  regionOverride: null,
  languageOverride: null,
  calendarData: null,
  hasAcceptedCounselDisclosure: false,
};

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      ...initialState,

      setFirstName: (firstName) => set({ firstName }),
      setDateOfBirth: (dateOfBirth) => set({ dateOfBirth }),
      setTimeOfBirth: (timeOfBirth) => set({ timeOfBirth }),
      setCity: (city) => set({ city }),

      setAnswer: (questionId, value) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: value },
        })),

      setLifePathNumber: (lifePathNumber) => set({ lifePathNumber }),
      setArchetype:  (archetype)  => set({ archetype }),
      setSunSign:    (sunSign)    => set({ sunSign }),
      setMoonSign:   (moonSign)   => set({ moonSign }),
      setRisingSign: (risingSign) => set({ risingSign }),
      setReportId: (reportId) => set({ reportId }),
      setReport: (report) => set({ report }),
      setAnonymousUserId: (anonymousUserId) => set({ anonymousUserId }),

      setRegionOverride: (regionOverride) => set({ regionOverride }),
      setLanguageOverride: (languageOverride) => set({ languageOverride }),
      setCalendarData: (calendarData) => set({ calendarData }),
      setHasAcceptedCounselDisclosure: (hasAcceptedCounselDisclosure) => set({ hasAcceptedCounselDisclosure }),

      resetAnalysis: () =>
        set({
          answers: {},
          lifePathNumber: null,
          archetype: null,
          sunSign:    null,
          moonSign:   null,
          risingSign: null,
          reportId: null,
          report: null,
          anonymousUserId: '',
        }),

      resetAll: () => set(initialState),

      initialize: async () => {
        // Any async initialization logic
        // Store is automatically hydrated by persist middleware
      },
    }),
    {
      name: 'omenora-analysis-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        firstName: state.firstName,
        dateOfBirth: state.dateOfBirth,
        timeOfBirth: state.timeOfBirth,
        city: state.city,
        lifePathNumber: state.lifePathNumber,
        archetype:  state.archetype,
        sunSign:    state.sunSign,
        moonSign:   state.moonSign,
        risingSign: state.risingSign,
        reportId: state.reportId,
        report: state.report,
        anonymousUserId: state.anonymousUserId,
        regionOverride: state.regionOverride,
        languageOverride: state.languageOverride,
        calendarData: state.calendarData,
        hasAcceptedCounselDisclosure: state.hasAcceptedCounselDisclosure,
      }),
    }
  )
);
