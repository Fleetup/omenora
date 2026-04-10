import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AnalysisState {
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
  reportId: string | null;
  
  // Region
  regionOverride: string | null;
  languageOverride: string | null;
  
  // Actions
  setFirstName: (name: string) => void;
  setDateOfBirth: (date: string) => void;
  setTimeOfBirth: (time: string) => void;
  setCity: (city: string) => void;
  setAnswer: (questionId: string, value: string) => void;
  setLifePathNumber: (number: number) => void;
  setArchetype: (archetype: string) => void;
  setReportId: (id: string) => void;
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
  reportId: null,
  regionOverride: null,
  languageOverride: null,
};

export const useAnalysisStore = create<AnalysisState>()(
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
      setArchetype: (archetype) => set({ archetype }),
      setReportId: (reportId) => set({ reportId }),
      
      setRegionOverride: (regionOverride) => set({ regionOverride }),
      setLanguageOverride: (languageOverride) => set({ languageOverride }),
      
      resetAnalysis: () =>
        set({
          answers: {},
          lifePathNumber: null,
          archetype: null,
          reportId: null,
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
        archetype: state.archetype,
        reportId: state.reportId,
        regionOverride: state.regionOverride,
        languageOverride: state.languageOverride,
      }),
    }
  )
);
