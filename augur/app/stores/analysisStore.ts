import { defineStore } from 'pinia'

export const useAnalysisStore = defineStore('analysis', {
  state: () => ({
    firstName: '',
    dateOfBirth: '',
    city: '',
    answers: {
      q1: '', // decision instinct
      q2: '', // hidden self
      q3: '', // relationship wound
      q4: '', // core thought / shadow
      q5: '', // how others label them
      q6: '', // success response
      q7: '', // shadow fear
    },
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
    addonPurchased: false as boolean,
    reportSessionId: '' as string,
    timeOfBirth: '' as string,
    birthChartData: null as any,
    birthChartPurchased: false as boolean,
    language: 'en' as string,
    languageManualOverride: false as boolean,
  }),
  actions: {
    setPersonalInfo(firstName: string, dob: string, city: string) {
      this.firstName = firstName
      this.dateOfBirth = dob
      this.city = city
    },
    setAnswer(question: string, answer: string) {
      this.answers[question as keyof typeof this.answers] = answer
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
    setAddonPurchased(val: boolean) {
      this.addonPurchased = val
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
