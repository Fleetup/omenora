import { create } from 'zustand';
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

export interface AnalysisState {
  // User Input
  firstName: string;
  dateOfBirth: string;
  timeOfBirth: string;
  city: string;
  email: string;
  
  // Answers to personality questions
  answers: Record<string, string>;
  
  // Calculated Results
  lifePathNumber: number | null;
  archetype: string | null;
  reportId: string | null;
  report: Report | null;
  tempId: string;
  
  // Region
  regionOverride: string | null;
  languageOverride: string | null;
  
  // Purchase states
  paymentComplete: boolean;
  bundlePurchased: boolean;
  oraclePurchased: boolean;
  
  // Actions
  setFirstName: (name: string) => void;
  setDateOfBirth: (date: string) => void;
  setTimeOfBirth: (time: string) => void;
  setCity: (city: string) => void;
  setEmail: (email: string) => void;
  setAnswer: (questionId: string, value: string) => void;
  setLifePathNumber: (number: number) => void;
  setArchetype: (archetype: string) => void;
  setReportId: (id: string) => void;
  setReport: (report: Report) => void;
  setTempId: (id: string) => void;
  setRegionOverride: (region: string) => void;
  setLanguageOverride: (lang: string) => void;
  setPaymentComplete: (complete: boolean) => void;
  setBundlePurchased: (purchased: boolean) => void;
  setOraclePurchased: (purchased: boolean) => void;
  
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
  email: '',
  answers: {},
  lifePathNumber: null,
  archetype: null,
  reportId: null,
  report: null,
  tempId: '',
  regionOverride: null,
  languageOverride: null,
  paymentComplete: false,
  bundlePurchased: false,
  oraclePurchased: false,
};

export const useAnalysisStore = create<AnalysisState>()(
  persist(
    (set) => ({
      ...initialState,
      
      setFirstName: (firstName) => set({ firstName }),
      setDateOfBirth: (dateOfBirth) => set({ dateOfBirth }),
      setTimeOfBirth: (timeOfBirth) => set({ timeOfBirth }),
      setCity: (city) => set({ city }),
      setEmail: (email) => set({ email }),
      
      setAnswer: (questionId, value) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: value },
        })),
      
      setLifePathNumber: (lifePathNumber) => set({ lifePathNumber }),
      setArchetype: (archetype) => set({ archetype }),
      setReportId: (reportId) => set({ reportId }),
      setReport: (report) => set({ report }),
      setTempId: (tempId) => set({ tempId }),
      
      setRegionOverride: (regionOverride) => set({ regionOverride }),
      setLanguageOverride: (languageOverride) => set({ languageOverride }),
      
      setPaymentComplete: (paymentComplete) => set({ paymentComplete }),
      setBundlePurchased: (bundlePurchased) => set({ bundlePurchased }),
      setOraclePurchased: (oraclePurchased) => set({ oraclePurchased }),
      
      resetAnalysis: () =>
        set({
          answers: {},
          lifePathNumber: null,
          archetype: null,
          reportId: null,
          report: null,
          tempId: '',
          paymentComplete: false,
          bundlePurchased: false,
          oraclePurchased: false,
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
        email: state.email,
        lifePathNumber: state.lifePathNumber,
        archetype: state.archetype,
        reportId: state.reportId,
        report: state.report,
        tempId: state.tempId,
        regionOverride: state.regionOverride,
        languageOverride: state.languageOverride,
        paymentComplete: state.paymentComplete,
        bundlePurchased: state.bundlePurchased,
        oraclePurchased: state.oraclePurchased,
      }),
    }
  )
);
