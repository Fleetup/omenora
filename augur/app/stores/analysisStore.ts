import { defineStore } from 'pinia'

export interface PlanetPosition {
  sign: string
  degree: number
  signIndex: number
}

export interface NatalChart {
  sun: PlanetPosition
  moon: PlanetPosition
  mercury: PlanetPosition
  venus: PlanetPosition
  mars: PlanetPosition
  jupiter: PlanetPosition
  saturn: PlanetPosition
  ascendant: PlanetPosition | null
}

export interface CompatibilityQuizAnswers {
  q1_intent?: 'specific_person' | 'new_curiosity' | 'pattern' | 'exploring'
  q2_feeling?: 'curiosity' | 'hope' | 'confusion' | 'longing' | 'unnamed'
  q3_duration?: 'recent' | 'weeks' | 'months' | 'long'
  q4_approach?: 'lead_feelings' | 'observe_first' | 'match_energy' | 'take_time'
  q5_communication?: 'direct' | 'show_through_action' | 'wait_to_notice' | 'write_first'
  q6_closeness?: 'crave' | 'need_space' | 'on_my_terms' | 'figuring_out'
  q7_conflict?: 'head_on' | 'give_air' | 'middle_ground' | 'wait_pass'
  q8_intimacy?: 'known' | 'understood' | 'both' | 'neither'
  q9_value?: 'trust' | 'excitement' | 'steadiness' | 'mutual_growth' | 'being_seen'
  q14_descriptor?: 'magnetic' | 'confusing' | 'intense' | 'easy' | 'healing' | 'challenging' | 'distant' | 'activating'
  q15_chapter?: 'new_unfolding' | 'first_test' | 'long_steady' | 'confusing_between' | 'ending_shifting'
  q16_season?: 'spring' | 'summer' | 'autumn' | 'winter'
  q17_pattern?: 'close_pull_back' | 'fast_slow' | 'misunderstand' | 'sync_stuck' | 'no_pattern'
  q18_trust_texture?: 'stone' | 'water' | 'glass' | 'silk'
  q19_curiosity?: 'why_feels' | 'what_become' | 'whether_invest' | 'not_seeing'
  q23_time_of_day?: 'dawn' | 'noon' | 'dusk' | 'night'
  q24_helpfulness?: 'clarity' | 'self_insight' | 'possibility' | 'reflection'
  q25_agency?: 'happen_to_me' | 'i_make' | 'through_me' | 'depends'
}

export const useAnalysisStore = defineStore('analysis', {
  state: () => ({
    firstName: '',
    dateOfBirth: '',
    city: '',
    cityLat: null as number | null,
    cityLng: null as number | null,
    cityPlaceId: '' as string,
    partnerCityLat: null as number | null,
    partnerCityLng: null as number | null,
    answers: {
      p1: '', // focus area
      p2: '', // insight style
      p3: '', // reason for visit
    },
    natalChart: null as NatalChart | null,
    archetype: '',
    lifePathNumber: 0,
    reportContent: '',
    paymentComplete: false,
    email: '',
    report: null as any,
    tempId: '',
    partnerName: '',
    partnerDob: '',
    partnerCity: '',
    calendarData: null as any,
    calendarPurchased: false,
    region: 'western' as string,
    country: 'US' as string,
    regionManualOverride: false as boolean,
    vedicData: null as any,
    baziData: null as any,
    tarotData: null as any,
    subscriptionActive: false as boolean,
    bundlePurchased: false as boolean,
    oraclePurchased: false as boolean,
    reportSessionId: '' as string,
    timeOfBirth: '' as string,
    birthChartData: null as any,
    birthChartPurchased: false as boolean,
    compatibilityData: null as any,
    compatibilityTier: 'single' as string,
    compatibilityQuizAnswers: {} as CompatibilityQuizAnswers,
    userBirthChartData: null as any,
    partnerBirthChartData: null as any,
    userBirthChartNoonFallback: false as boolean,
    partnerBirthChartNoonFallback: false as boolean,
    language: 'en' as string,
    languageManualOverride: false as boolean,
    clarityFocus: '' as string,
  }),
  getters: {
    compatibilityQuizAnswersCount(state): number {
      return Object.values(state.compatibilityQuizAnswers).filter(
        (v) => v !== undefined
      ).length
    },
  },
  actions: {
    setPersonalInfo(firstName: string, dob: string, city: string) {
      this.firstName = firstName
      this.dateOfBirth = dob
      this.city = city
    },
    setAnswer(question: string, answer: string) {
      this.answers[question as keyof typeof this.answers] = answer
    },
    setNatalChart(chart: NatalChart) {
      this.natalChart = chart
    },
    setArchetype(archetype: string) {
      this.archetype = archetype
    },
    setLifePathNumber(num: number) {
      this.lifePathNumber = num
    },
    setReport(report: any) {
      this.report = report
    },
    setEmail(email: string) {
      this.email = email
    },
    setTempId(id: string) {
      this.tempId = id
    },
    setPaymentComplete(val: boolean) {
      this.paymentComplete = val
    },
    setPartnerData(data: { name: string, dob: string, city: string }) {
      this.partnerName = data.name
      this.partnerDob = data.dob
      this.partnerCity = data.city
    },
    setCalendarData(data: any) {
      this.calendarData = data
    },
    setCalendarPurchased(val: boolean) {
      this.calendarPurchased = val
    },
    setRegion(region: string, country: string) {
      this.region = region
      this.country = country
    },
    setRegionOverride(region: string) {
      this.region = region
      this.regionManualOverride = true
    },
    setVedicData(data: any) {
      this.vedicData = data
    },
    setBaziData(data: any) {
      this.baziData = data
    },
    setTarotData(data: any) {
      this.tarotData = data
    },
    setSubscriptionActive(val: boolean) {
      this.subscriptionActive = val
    },
    setBundlePurchased(val: boolean) {
      this.bundlePurchased = val
    },
    setOraclePurchased(val: boolean) {
      this.oraclePurchased = val
    },
    setReportSessionId(id: string) {
      this.reportSessionId = id
    },
    setBirthChartData(data: any) {
      this.birthChartData = data
    },
    setBirthChartPurchased(val: boolean) {
      this.birthChartPurchased = val
    },
    setCompatibilityData(data: any) {
      this.compatibilityData = data
    },
    setCompatibilityTier(tier: string) {
      this.compatibilityTier = tier
    },
    setCompatibilityQuizAnswer<K extends keyof CompatibilityQuizAnswers>(key: K, value: CompatibilityQuizAnswers[K]) {
      this.compatibilityQuizAnswers[key] = value
    },
    resetCompatibilityQuizAnswers() {
      this.compatibilityQuizAnswers = {}
    },
    setUserBirthChartData(data: any) {
      this.userBirthChartData = data
    },
    setPartnerBirthChartData(data: any) {
      this.partnerBirthChartData = data
    },
    setLanguage(lang: string) {
      this.language = lang
      this.languageManualOverride = false
    },
    setLanguageOverride(lang: string) {
      this.language = lang
      this.languageManualOverride = true
    },
    reset() {
      this.$reset()
    }
  }
})
