<template>
  <!-- Loading report with impulse upsell -->
  <div v-if="isLoadingReport" class="report-loading-page">
    <div class="report-loading-content">
      <div class="orbital-mark">
        <div class="orbit-outer"><div class="orbit-planet" /></div>
        <div class="orbit-inner" />
        <div class="orbit-center" />
      </div>
      <p class="rload-brand">OMENORA</p>
      <p class="rload-msg">{{ t('craftingReport') }}</p>
      <div class="rload-track">
        <div class="rload-fill" />
      </div>
    </div>
    <div v-if="showAddon" class="addon-offer-box">
      <span class="addon-badge">{{ t('oneTimeOffer') }}</span>
      <p class="addon-title">{{ t('addCompatibility') }}</p>
      <p class="addon-desc">{{ t('onlyWhileLoading') }}</p>
      <div class="addon-price-row">
        <span class="addon-original">$2.99</span>
        <span class="addon-price">$0.99</span>
        <span class="addon-note">{{ t('todayOnly') }}</span>
      </div>
      <input
        id="addon-partner-name"
        v-model="addonPartnerName"
        type="text"
        name="addon-partner-name"
        :placeholder="t('addonPartnerPlaceholder')"
        class="addon-input"
        autocomplete="off"
      >
      <div class="addon-dob-row">
        <input id="addon-birth-day" v-model="addonBirthDay" type="number" name="addon-birth-day" placeholder="DD" min="1" max="31" class="addon-input addon-dob addon-day" autocomplete="off">
        <input id="addon-birth-month" v-model="addonBirthMonth" type="number" name="addon-birth-month" placeholder="MM" min="1" max="12" class="addon-input addon-dob addon-day" autocomplete="off">
        <input id="addon-birth-year" v-model="addonBirthYear" type="number" name="addon-birth-year" placeholder="YYYY" min="1924" max="2010" class="addon-input addon-dob addon-year" autocomplete="off">
      </div>
      <button
        :disabled="!addonPartnerName || !addonBirthYear || isProcessingAddon"
        class="addon-yes-btn"
        @click="handleAddonPurchase"
      >
        {{ isProcessingAddon ? t('processingPayment') : t('yesAdd') }}
      </button>
      <p class="addon-no-link" @click="showAddon = false">{{ t('noThanks') }}</p>
    </div>
  </div>

  <!-- Error state -->
  <div v-else-if="hasError" class="center-page">
    <div class="center-content">
      <div class="orbital-mark">
        <div class="orbit-outer"><div class="orbit-planet" /></div>
        <div class="orbit-inner" />
        <div class="orbit-center" />
      </div>
      <p class="rload-brand">OMENORA</p>
      <p class="status-text">{{ t('reportErrorMsg') }}</p>
      <p style="font-size:13px;color:rgba(255,255,255,0.4);margin:8px 0 20px;">{{ t('reportErrorEmail') }}</p>
      <button
        style="background:rgba(140,110,255,0.15);border:1px solid rgba(140,110,255,0.3);color:rgba(200,180,255,0.9);padding:12px 28px;border-radius:8px;font-size:14px;cursor:pointer;margin-bottom:12px;"
        @click="reloadPage"
      >
        {{ t('tryAgain') }}
      </button>
      <p style="font-size:12px;color:rgba(255,255,255,0.25);">
        {{ t('needHelp') }} <a href="mailto:support@omenora.com" style="color:rgba(140,110,255,0.7);text-decoration:none;">support@omenora.com</a>
      </p>
    </div>
  </div>

  <!-- Report could not be recovered -->
  <div v-else-if="!store.report" class="center-page">
    <div class="center-content">
      <div class="orbital-mark">
        <div class="orbit-outer"><div class="orbit-planet" /></div>
        <div class="orbit-inner" />
        <div class="orbit-center" />
      </div>
      <p class="rload-brand">OMENORA</p>
      <h2 class="fallback-title">{{ t('reportReady') }}</h2>
      <p class="fallback-text">{{ t('checkEmail') }}</p>
    </div>
  </div>

  <!-- Full report -->
  <div v-else class="report-page">
    <!-- Top bar -->
    <div class="top-bar">
      <span class="brand-text top-brand">OMENORA</span>
      <span class="report-label">{{ t('completeReport') }}</span>
    </div>

    <!-- Hero block -->
    <div class="hero-block">
      <p class="archetype-label">{{ t('yourDestinyArchetype') }}</p>
      <ArchetypeSymbol :symbol="store.report.archetypeSymbol" :size="48" class="archetype-symbol" />
      <h1 class="archetype-name">{{ store.report.archetypeName }}</h1>
      <p class="archetype-meta">{{ store.report.element }} · {{ t('lifePathLabel') }} {{ store.lifePathNumber }}</p>
      <div class="traits-row">
        <span v-for="trait in store.report.powerTraits" :key="trait" class="trait-pill">
          {{ trait }}
        </span>
      </div>
    </div>

    <!-- Bundle/Oracle congratulations banner -->
    <div v-if="store.bundlePurchased || store.oraclePurchased" class="unlock-banner">
      <span class="unlock-banner-icon">✦</span>
      <div>
        <p class="unlock-banner-title">{{ store.oraclePurchased ? t('oracleUnlocked') : t('bundleUnlocked') }}</p>
        <p class="unlock-banner-desc">
          {{ store.oraclePurchased ? t('oracleDesc') : t('bundleDesc') }}
        </p>
      </div>
    </div>

    <!-- Birth chart: generated data display -->
    <div v-if="store.birthChartData" class="birth-chart-section">
      <div class="birth-chart-section-header">
        <p class="birth-chart-eyebrow">{{ t('fullBirthChart') }}</p>
        <p class="birth-chart-section-title">{{ store.birthChartData.chartTitle }}</p>
      </div>
      <div class="birth-chart-signs-row">
        <div class="birth-chart-sign-cell">
          <p class="birth-chart-sign-label">{{ t('risingLabel') }}</p>
          <p class="birth-chart-sign-value">{{ store.birthChartData.risingSign }}</p>
        </div>
        <div class="birth-chart-sign-cell">
          <p class="birth-chart-sign-label">{{ t('sunLabel') }}</p>
          <p class="birth-chart-sign-value">{{ store.birthChartData.sunSign }}</p>
        </div>
        <div class="birth-chart-sign-cell">
          <p class="birth-chart-sign-label">{{ t('moonLabel') }}</p>
          <p class="birth-chart-sign-value">{{ store.birthChartData.moonSign }}</p>
        </div>
        <div class="birth-chart-sign-cell">
          <p class="birth-chart-sign-label">{{ t('planetLabel') }}</p>
          <p class="birth-chart-sign-value">{{ store.birthChartData.dominantPlanet }}</p>
        </div>
      </div>
      <p class="birth-chart-reading">{{ store.birthChartData.reading }}</p>
      <div class="birth-chart-forecast-box">
        <p class="birth-chart-forecast-label">{{ t('planetaryForecast') }}</p>
        <p class="birth-chart-forecast-text">{{ store.birthChartData.forecast2026 }}</p>
      </div>
    </div>

    <!-- Birth chart: oracle/purchased — generate button -->
    <div v-else-if="(store.oraclePurchased || store.birthChartPurchased) && store.timeOfBirth" class="birth-chart-banner birth-chart-banner--active">
      <div class="birth-chart-info">
        <p class="birth-chart-title">✦ {{ store.oraclePurchased ? t('birthChartIncluded') : t('birthChartUnlockedLabel') }}</p>
        <p class="birth-chart-desc">{{ store.oraclePurchased ? t('birthChartPositionsIncluded') : t('birthChartPositionsUnlocked') }}</p>
      </div>
      <button class="birth-chart-btn" :disabled="isLoadingBirthChart" @click="buyBirthChart">
        {{ isLoadingBirthChart ? t('generatingBirthChart') : t('generateBirthChart') }}
      </button>
    </div>

    <!-- Birth chart: has time of birth, not yet purchased -->
    <div v-else-if="store.timeOfBirth" class="birth-chart-banner birth-chart-banner--active">
      <div class="birth-chart-info">
        <p class="birth-chart-title">{{ t('birthChartReady') }}</p>
        <p class="birth-chart-desc">{{ t('birthChartPrice') }}</p>
      </div>
      <button class="birth-chart-btn" :disabled="isLoadingBirthChart" @click="buyBirthChart">
        {{ isLoadingBirthChart ? t('loadingBirthChart') : t('unlockBirthChart') }}
      </button>
    </div>

    <!-- Birth chart: no time of birth -->
    <div v-else class="birth-chart-banner">
      <div class="birth-chart-info">
        <p class="birth-chart-title birth-chart-title--dim">{{ t('birthChartUnlockedLabel') }}</p>
        <p class="birth-chart-desc">{{ t('birthChartRequiresTime') }}</p>
      </div>
      <span class="birth-chart-locked-badge">{{ t('requiresTimeOfBirth') }}</span>
    </div>

    <!-- Report sections -->
    <div
      v-for="(key, idx) in SECTION_ORDER"
      :key="key"
      class="section-wrapper"
      :class="{ 'no-border': idx === SECTION_ORDER.length - 1 }"
    >
      <h3 class="section-title">{{ store.report.sections[key].title }}</h3>
      <div v-if="key === 'affirmation'" class="affirmation-box">
        {{ store.report.sections[key].content }}
      </div>
      <p v-else class="section-content">{{ store.report.sections[key].content }}</p>
    </div>

    <!-- Vedic regional section -->
    <div
      v-if="store.region === 'india' && vedicData"
      style="margin-bottom: 40px; padding: 28px 24px;
        background: linear-gradient(135deg, rgba(255,140,50,0.05) 0%, rgba(200,100,50,0.03) 100%);
        border: 1px solid rgba(255,140,50,0.15);
        border-radius: 16px;"
    >
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
        <span style="font-size: 24px;">🕉</span>
        <div>
          <p style="font-size: 11px; font-weight: 500; color: rgba(255,160,80,0.7); text-transform: uppercase; letter-spacing: 0.1em; margin: 0;">{{ t('vedicReadingLabel') }}</p>
          <p style="font-size: 16px; font-weight: 500; color: white; margin: 0;">{{ vedicData.vedicTitle }}</p>
        </div>
      </div>
      <div style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
        <div style="padding: 8px 14px; background: rgba(255,140,50,0.08); border: 1px solid rgba(255,140,50,0.2); border-radius: 10px;">
          <p style="font-size: 9px; color: rgba(255,160,80,0.5); text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 2px;">{{ t('nakshatraLabel') }}</p>
          <p style="font-size: 13px; font-weight: 500; color: rgba(255,200,150,0.9); margin: 0;">{{ vedicData.nakshatraName }}</p>
        </div>
        <div style="padding: 8px 14px; background: rgba(255,140,50,0.08); border: 1px solid rgba(255,140,50,0.2); border-radius: 10px;">
          <p style="font-size: 9px; color: rgba(255,160,80,0.5); text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 2px;">{{ t('rulingPlanetLabel') }}</p>
          <p style="font-size: 13px; font-weight: 500; color: rgba(255,200,150,0.9); margin: 0;">{{ vedicData.rulingPlanet }}</p>
        </div>
      </div>
      <p style="font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.8; margin-bottom: 16px;">{{ vedicData.reading }}</p>
      <div style="padding: 14px 16px; background: rgba(255,140,50,0.06); border-left: 2px solid rgba(255,160,80,0.4); border-radius: 0 8px 8px 0; margin-bottom: 12px;">
        <p style="font-size: 10px; color: rgba(255,160,80,0.5); text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 4px;">{{ t('karmicMissionLabel') }}</p>
        <p style="font-size: 13px; color: rgba(255,200,150,0.8); font-style: italic; margin: 0;">{{ vedicData.karmicMission }}</p>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
        <span style="font-size: 11px; color: rgba(255,255,255,0.25);">{{ t('practice2026') }}</span>
        <span style="font-size: 12px; color: rgba(255,200,150,0.7); background: rgba(255,140,50,0.08); border: 1px solid rgba(255,140,50,0.15); border-radius: 20px; padding: 3px 12px;">{{ vedicData.remedy }}</span>
      </div>
    </div>

    <!-- BaZi regional section -->
    <div
      v-if="store.region === 'china' && baziData"
      style="margin-bottom: 40px; padding: 28px 24px;
        background: linear-gradient(135deg, rgba(200,50,50,0.05) 0%, rgba(200,150,50,0.03) 100%);
        border: 1px solid rgba(200,80,50,0.15);
        border-radius: 16px;"
    >
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
        <span style="font-size: 24px;">☯</span>
        <div>
          <p style="font-size: 11px; font-weight: 500; color: rgba(220,100,80,0.7); text-transform: uppercase; letter-spacing: 0.1em; margin: 0;">{{ t('baziReadingLabel') }}</p>
          <p style="font-size: 16px; font-weight: 500; color: white; margin: 0;">{{ baziData.baziTitle }}</p>
        </div>
      </div>
      <div style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
        <div style="padding: 8px 14px; background: rgba(200,80,50,0.08); border: 1px solid rgba(200,80,50,0.2); border-radius: 10px;">
          <p style="font-size: 9px; color: rgba(220,120,100,0.5); text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 2px;">{{ t('dayMasterLabel') }}</p>
          <p style="font-size: 13px; font-weight: 500; color: rgba(255,180,160,0.9); margin: 0;">{{ baziData.dayMaster }}</p>
        </div>
        <div style="padding: 8px 14px; background: rgba(200,80,50,0.08); border: 1px solid rgba(200,80,50,0.2); border-radius: 10px;">
          <p style="font-size: 9px; color: rgba(220,120,100,0.5); text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 2px;">{{ t('dominantElementLabel') }}</p>
          <p style="font-size: 13px; font-weight: 500; color: rgba(255,180,160,0.9); margin: 0;">{{ baziData.dominantElement }}</p>
        </div>
      </div>
      <p style="font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.8; margin-bottom: 16px;">{{ baziData.reading }}</p>
      <div style="padding: 14px 16px; background: rgba(200,80,50,0.06); border-left: 2px solid rgba(220,100,80,0.4); border-radius: 0 8px 8px 0; margin-bottom: 12px;">
        <p style="font-size: 10px; color: rgba(220,120,100,0.5); text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 4px;">{{ t('wealthLuck2026') }}</p>
        <p style="font-size: 13px; color: rgba(255,180,160,0.8); font-style: italic; margin: 0;">{{ baziData.wealthLuck2026 }}</p>
      </div>
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
        <span style="font-size: 11px; color: rgba(255,255,255,0.25);">{{ t('luckyDirections') }}</span>
        <span
          v-for="dir in baziData.luckyDirections"
          :key="dir"
          style="font-size: 12px; color: rgba(255,180,160,0.7); background: rgba(200,80,50,0.08); border: 1px solid rgba(200,80,50,0.15); border-radius: 20px; padding: 3px 12px;"
        >{{ dir }}</span>
      </div>
    </div>

    <!-- Tarot / LatAm regional section -->
    <div
      v-if="(store.region === 'latam' || store.region === 'tarot') && tarotData"
      style="margin-bottom: 40px; padding: 28px 24px;
        background: linear-gradient(135deg, rgba(180,60,180,0.05) 0%, rgba(120,40,160,0.03) 100%);
        border: 1px solid rgba(160,80,200,0.2);
        border-radius: 16px;"
    >
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
        <span style="font-size: 24px;">🔮</span>
        <div>
          <p style="font-size: 11px; font-weight: 500; color: rgba(180,120,220,0.7); text-transform: uppercase; letter-spacing: 0.1em; margin: 0;">{{ t('tarotReadingLabel') }}</p>
          <p style="font-size: 16px; font-weight: 500; color: white; margin: 0;">{{ tarotData.soulCard }}</p>
        </div>
      </div>
      <div style="padding: 12px 16px; background: rgba(160,80,200,0.08); border: 1px solid rgba(160,80,200,0.2); border-radius: 10px; margin-bottom: 16px; text-align: center;">
        <p style="font-size: 13px; color: rgba(210,170,255,0.8); font-style: italic; margin: 0;">{{ tarotData.soulCardMeaning }}</p>
      </div>
      <p style="font-size: 14px; color: rgba(255,255,255,0.6); line-height: 1.8; margin-bottom: 16px;">{{ tarotData.reading }}</p>
      <div style="padding: 14px 16px; background: rgba(160,80,200,0.06); border-left: 2px solid rgba(180,120,220,0.4); border-radius: 0 8px 8px 0; margin-bottom: 16px;">
        <p style="font-size: 10px; color: rgba(180,120,220,0.5); text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 4px;">{{ t('loveDstiny') }}</p>
        <p style="font-size: 13px; color: rgba(210,170,255,0.85); font-style: italic; margin: 0;">{{ tarotData.loveMessage }}</p>
      </div>
      <div style="padding: 16px 20px; background: rgba(160,80,200,0.04); border: 1px solid rgba(160,80,200,0.12); border-radius: 12px; margin-bottom: 12px; text-align: center;">
        <p style="font-size: 10px; color: rgba(180,120,220,0.4); text-transform: uppercase; letter-spacing: 0.08em; margin: 0 0 6px;">{{ t('blessingLabel') }}</p>
        <p style="font-size: 13px; color: rgba(210,170,255,0.7); font-style: italic; line-height: 1.6; margin: 0;">{{ tarotData.blessing }}</p>
      </div>
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
        <span style="font-size: 11px; color: rgba(255,255,255,0.25);">{{ t('protectiveCharm') }}</span>
        <span style="font-size: 12px; color: rgba(210,170,255,0.7); background: rgba(160,80,200,0.08); border: 1px solid rgba(160,80,200,0.15); border-radius: 20px; padding: 3px 12px;">{{ tarotData.luckyCharm }}</span>
      </div>
    </div>

    <!-- Regional section loading state -->
    <div
      v-if="isLoadingRegional"
      style="margin-bottom: 40px; padding: 24px; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; text-align: center;"
    >
      <p style="font-size: 13px; color: rgba(255,255,255,0.3); margin: 0;">
        {{ store.region === 'india'
            ? t('loadingVedic')
            : store.region === 'china'
              ? t('loadingBazi')
              : t('loadingSpiritual') }}
      </p>
    </div>

    <!-- Tradition Switcher -->
    <div v-if="store.report && !isSwitchingTradition && !isSwitchComplete" class="tradition-switcher">
      <p class="tradition-switcher-label">{{ t('traditionSwitcherLabel') }}</p>
      <p class="tradition-switcher-sub">
        {{ store.oraclePurchased ? t('traditionSwitcherSubOracle') : t('traditionSwitcherSubPaid') }}
      </p>
      <div class="tradition-options">
        <button
          v-for="opt in TRADITION_OPTIONS"
          :key="opt.value"
          class="tradition-opt-btn"
          :class="{
            'tradition-opt-active': store.region === opt.value,
            'tradition-opt-unlocked': isTraditionUnlocked(opt.value),
          }"
          :disabled="store.region === opt.value || isSwitchingTradition"
          @click="handleTraditionSwitch(opt.value)"
        >
          <span class="tradition-opt-icon">{{ opt.icon }}</span>
          <span class="tradition-opt-text">
            <span class="tradition-opt-name">{{ opt.label }}</span>
            <span class="tradition-opt-sub">{{ opt.sub }}</span>
          </span>
          <span v-if="store.region === opt.value" class="tradition-opt-tag tradition-opt-tag--active">{{ t('currentLabel') }}</span>
          <span v-else-if="store.oraclePurchased || isTraditionUnlocked(opt.value)" class="tradition-opt-tag tradition-opt-tag--free">{{ t('freeLabel') }}</span>
          <span v-else class="tradition-opt-tag tradition-opt-tag--paid">$2.99</span>
        </button>
      </div>
    </div>

    <!-- Tradition switching loading state -->
    <div v-if="isSwitchingTradition" class="tradition-loading">
      <div class="tradition-loading-ring" />
      <p class="tradition-loading-text">{{ t('traditionGenerating').replace('{tradition}', switchingTraditionLabel) }}</p>
    </div>

    <!-- Tradition switch success banner -->
    <div v-if="isSwitchComplete" class="tradition-success-banner">
      <span class="tradition-success-icon">✦</span>
      <p class="tradition-success-text">{{ t('traditionUnlocked').replace('{tradition}', switchedTraditionLabel) }}</p>
    </div>

    <!-- Calendar display for bundle/oracle buyers -->
    <div v-if="(store.bundlePurchased || store.oraclePurchased) && store.calendarData" class="report-cal-section">
      <div class="report-cal-header">
        <p class="report-cal-eyebrow">YOUR 2026 DESTINY CALENDAR</p>
        <p class="report-cal-theme">{{ store.calendarData.overallTheme }}</p>
      </div>
      <div class="report-cal-peaks">
        <span v-for="m in store.calendarData.peakMonths" :key="m" class="cal-peak-chip">{{ m }} ★</span>
        <span v-for="m in store.calendarData.cautionMonths" :key="m" class="cal-caution-chip">{{ m }} ⚠</span>
      </div>
      <div class="report-cal-months">
        <div
          v-for="month in store.calendarData.months"
          :key="month.month"
          class="report-month-card"
          :style="{ borderLeftColor: month.color || 'rgba(201,168,76,0.4)' }"
        >
          <div class="rmc-header">
            <div>
              <p class="rmc-name">{{ month.month }}</p>
              <p class="rmc-theme">{{ month.theme }}</p>
            </div>
            <div class="rmc-energy-block">
              <span class="rmc-energy-label">Energy</span>
              <div class="rmc-energy-track">
                <div class="rmc-energy-fill" :style="{ width: month.energyLevel + '%', background: month.color || 'rgba(201,168,76,0.6)' }" />
              </div>
            </div>
          </div>
          <div class="rmc-insights">
            <p class="rmc-insight"><span class="rmc-icon" style="color:rgba(255,200,100,0.5);">♥</span> {{ month.love }}</p>
            <p class="rmc-insight"><span class="rmc-icon" style="color:rgba(100,220,100,0.5);">$</span> {{ month.money }}</p>
            <p class="rmc-insight"><span class="rmc-icon" style="color:rgba(100,150,255,0.5);">⚡</span> {{ month.career }}</p>
            <p v-if="month.warning" class="rmc-warning">⚠ {{ month.warning }}</p>
          </div>
          <p class="rmc-lucky">{{ t('luckyDays') }} {{ month.luckyDays?.join(', ') }}</p>
        </div>
      </div>
    </div>

    <!-- Calendar generating state for bundle buyers -->
    <div
      v-if="(store.bundlePurchased || store.oraclePurchased) && !store.calendarData && isGeneratingCalendar"
      style="margin-bottom: 40px; padding: 24px; border-top: 1px solid rgba(255,255,255,0.05); text-align: center;"
    >
      <p style="font-size: 13px; color: rgba(255,255,255,0.3); margin: 0;">{{ t('generatingCalendar') }}</p>
    </div>

    <!-- Free compatibility section for bundle/oracle buyers -->
    <div
      v-if="store.bundlePurchased || store.oraclePurchased"
      style="margin-bottom: 40px; padding-top: 32px; border-top: 1px solid rgba(255,255,255,0.05);"
    >
      <p style="font-size: 9px; color: #c9a84c; text-transform: uppercase; letter-spacing: 0.18em; margin: 0 0 8px;">{{ t('compatReadingLabel') }}</p>
      <p style="font-size: 16px; font-weight: 400; color: white; margin: 0 0 4px; font-family: 'Playfair Display', serif;">{{ t('compatIncluded') }}</p>
      <p style="font-size: 13px; color: rgba(255,255,255,0.35); margin: 0 0 20px;">{{ t('compatEnterDetails') }}</p>

      <!-- Result -->
      <div v-if="bundleCompatibilityResult" style="margin-top: 8px;">
        <div style="padding: 16px; background: rgba(140,110,255,0.06); border: 1px solid rgba(140,110,255,0.15); border-radius: 8px; margin-bottom: 16px;">
          <p style="font-size: 9px; color: rgba(140,110,255,0.6); text-transform: uppercase; letter-spacing: 0.12em; margin: 0 0 4px;">{{ t('compatScore') }}</p>
          <p style="font-size: 28px; font-weight: 400; color: white; font-family: 'Playfair Display', serif; margin: 0;">{{ bundleCompatibilityResult.compatibilityScore }}%</p>
          <p style="font-size: 13px; color: rgba(200,180,255,0.7); margin: 4px 0 0;">{{ bundleCompatibilityResult.compatibilityTitle }}</p>
        </div>
        <div v-for="(section, key) in bundleCompatibilityResult.sections" :key="key" style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <p style="font-size: 9px; color: #c9a84c; text-transform: uppercase; letter-spacing: 0.18em; margin: 0 0 8px;">{{ section.title }}</p>
          <p style="font-size: 14px; color: rgba(255,255,255,0.65); line-height: 1.8; font-weight: 300; margin: 0;">{{ section.content }}</p>
        </div>
      </div>

      <!-- Form -->
      <div v-else>
        <input id="compat-partner-name" v-model="partnerName" type="text" name="compat-partner-name" :placeholder="t('addonPartnerPlaceholder')" class="compat-input" style="margin-bottom: 10px;" autocomplete="off">
        <input id="compat-partner-dob" v-model="partnerDob" type="date" name="compat-partner-dob" class="compat-input compat-input--date" style="margin-bottom: 10px;" autocomplete="off">
        <input id="compat-partner-city" v-model="partnerCity" type="text" name="compat-partner-city" :placeholder="t('partnerCityPlaceholder')" class="compat-input" style="margin-bottom: 16px;" autocomplete="off">
        <button
          class="compat-unlock-btn"
          :disabled="!partnerName || !partnerDob || isGeneratingCompatibility"
          @click="generateCompatibilityFree"
        >
          {{ isGeneratingCompatibility ? t('generating') : t('generateCompatFree') }}
        </button>
      </div>
    </div>

    <!-- Bundle upsell for Basic report buyers -->
    <div
      v-if="!store.bundlePurchased && !store.oraclePurchased"
      class="bundle-upsell-box"
    >
      <p class="bundle-headline">{{ t('wantDeeper') }}</p>
      <p class="bundle-subline">{{ t('unlockComplete') }}</p>

      <div class="bundle-items">
        <div class="bundle-item">
          <div style="flex: 1; text-align: left;">
            <p class="bundle-item-name">📅 2026 Lucky Calendar</p>
            <p class="bundle-item-desc">Month-by-month lucky timing</p>
          </div>
          <span class="bundle-item-price">$2.99</span>
        </div>
        <div class="bundle-item">
          <div style="flex: 1; text-align: left;">
            <p class="bundle-item-name">💞 Compatibility Reading</p>
            <p class="bundle-item-desc">Discover your destiny match</p>
          </div>
          <span class="bundle-item-price">$2.99</span>
        </div>
        <div class="bundle-item">
          <div style="flex: 1; text-align: left;">
            <p class="bundle-item-name">⭐ Full Birth Chart</p>
            <p class="bundle-item-desc">Sun, Moon + Rising sign analysis</p>
          </div>
          <span class="bundle-item-price">$3.99</span>
        </div>
      </div>

      <div class="bundle-divider" />

      <div class="bundle-total-row">
        <span style="font-size: 12px; color: rgba(255,255,255,0.25);">{{ t('individualTotal') }}</span>
        <span style="font-size: 14px; color: rgba(255,255,255,0.25); text-decoration: line-through;">$9.97</span>
      </div>
      <div class="bundle-price-row">
        <span style="font-size: 14px; font-weight: 500; color: white;">{{ t('yourBundlePrice') }}</span>
        <span style="font-size: 24px; font-weight: 600; color: rgba(200,180,255,0.95);">$5.99</span>
      </div>

      <span class="bundle-savings-badge">{{ t('youSave') }}</span>

      <button
        class="bundle-cta-btn"
        :disabled="isLoadingBundle"
        @click="buyBundle"
      >
        {{ isLoadingBundle ? 'Loading...' : t('unlockBundle') }}
      </button>
      <p class="bundle-cta-note">{{ t('oneTimePurchase') }}</p>
    </div>

    <!-- Lucky Timing Calendar upsell -->
    <div v-if="!store.calendarPurchased && !store.bundlePurchased && !store.oraclePurchased" class="cal-upsell">
      <div class="cal-upsell-header">
        <span class="cal-upsell-icon">📅</span>
        <div class="cal-upsell-info">
          <p class="cal-upsell-title">Your 2026 Lucky Timing Calendar</p>
          <p class="cal-upsell-desc">Month-by-month destiny forecast</p>
        </div>
        <span class="cal-upsell-price">$2.99</span>
      </div>

      <div class="cal-features">
        <div class="cal-feat">
          <span class="cal-feat-dot" />
          <span class="cal-feat-text">Peak months for love &amp; money</span>
        </div>
        <div class="cal-feat">
          <span class="cal-feat-dot" />
          <span class="cal-feat-text">Monthly lucky days highlighted</span>
        </div>
        <div class="cal-feat">
          <span class="cal-feat-dot" />
          <span class="cal-feat-text">Career &amp; purpose windows</span>
        </div>
        <div class="cal-feat">
          <span class="cal-feat-dot" />
          <span class="cal-feat-text">Caution periods to navigate</span>
        </div>
      </div>

      <div class="cal-preview">
        <div class="cal-bar-row">
          <span class="cal-bar-label">January</span>
          <div class="cal-bar-track">
            <div class="cal-bar-fill" style="width: 65%; background: rgba(140,110,255,0.3);" />
          </div>
        </div>
        <div class="cal-bar-row">
          <span class="cal-bar-label">April</span>
          <div class="cal-bar-track">
            <div class="cal-bar-fill" style="width: 90%; background: rgba(140,110,255,0.7);" />
          </div>
        </div>
        <div class="cal-bar-row">
          <span class="cal-bar-label">July</span>
          <div class="cal-bar-track">
            <div class="cal-bar-fill" style="width: 45%; background: rgba(140,110,255,0.2);" />
          </div>
        </div>
      </div>

      <button
        class="cal-upsell-btn"
        :disabled="isLoadingCalendar"
        @click="buyCalendar"
      >
        {{ isLoadingCalendar ? 'Processing...' : 'Unlock My 2026 Calendar →' }}
      </button>
      <p class="cal-upsell-note">One-time purchase · Instant access</p>
    </div>

    <!-- Compatibility upsell -->
    <div v-if="!store.bundlePurchased && !store.oraclePurchased" class="compat-section">

      <!-- Teaser -->
      <div v-if="!showCompatibilityForm" class="compat-teaser">
        <p class="compat-title">{{ t('howCompatible') }}</p>
        <p class="compat-subtitle">{{ t('enterDetails') }}</p>
        <div class="compat-tags">
          <span class="compat-tag">{{ t('romanticPartners') }}</span>
          <span class="compat-tag">{{ t('bestFriends') }}</span>
          <span class="compat-tag">{{ t('businessPartners') }}</span>
        </div>
        <button class="compat-cta-btn" @click="showCompatibilityForm = true">
          {{ t('discoverCompat') }}
        </button>
      </div>

      <!-- Form -->
      <div v-else class="compat-form">
        <p class="compat-form-title">{{ t('compatFormTitle') }}</p>
        <p class="compat-form-subtitle">
          {{ t('compatFormSubtitle') }}
        </p>
        <div class="compat-fields">
          <input
            id="compat-paid-partner-name"
            v-model="partnerName"
            type="text"
            name="compat-paid-partner-name"
            :placeholder="t('addonPartnerPlaceholder')"
            class="compat-input"
            autocomplete="off"
          >
          <input
            id="compat-paid-partner-dob"
            v-model="partnerDob"
            type="date"
            name="compat-paid-partner-dob"
            class="compat-input compat-input--date"
            autocomplete="off"
          >
          <input
            id="compat-paid-partner-city"
            v-model="partnerCity"
            type="text"
            name="compat-paid-partner-city"
            :placeholder="t('partnerCityPlaceholder')"
            class="compat-input"
            autocomplete="off"
          >
        </div>
        <button
          class="compat-unlock-btn"
          :disabled="!partnerName || !partnerDob || isProcessingCompatibility"
          @click="buyCompatibilityReading"
        >
          {{ isProcessingCompatibility ? t('processingCompatibility') : t('getCompatReading') }}
        </button>
        <button class="compat-cancel-btn" @click="showCompatibilityForm = false">
          {{ t('cancelLabel') }}
        </button>
      </div>
    </div>

    <!-- Daily insights subscription upsell -->
    <div v-if="store.report && !store.subscriptionActive && !store.oraclePurchased" class="sub-upsell-banner">
      <div class="sub-upsell-info">
        <p class="sub-upsell-title">{{ t('dailyInsights') }}</p>
        <p class="sub-upsell-desc">{{ t('personalizedArchetype') }}</p>
      </div>
      <button class="sub-upsell-btn" :disabled="isStartingSub" @click="startSubscription">
        {{ isStartingSub ? 'Loading...' : t('subscribeCta') }}
      </button>
    </div>

    <!-- Share card section -->
    <div class="share-section">
      <h3 class="share-title">{{ t('shareDestiny') }}</h3>
      <p class="share-subtitle">{{ t('shareDesc') }}</p>

      <div class="share-card">
        <ArchetypeSymbol :symbol="store.report.archetypeSymbol" :size="32" class="card-symbol" />
        <p class="card-name">{{ store.report.archetypeName }}</p>
        <div class="card-traits">
          <span v-for="trait in store.report.powerTraits" :key="trait" class="card-trait-pill">
            {{ trait }}
          </span>
        </div>
        <p class="card-domain">omenora.com</p>
      </div>

      <div class="download-row">
        <button class="download-btn" :disabled="isDownloading" @click="downloadCard">
          {{ isDownloading ? 'Downloading...' : t('downloadCard') }}
        </button>
        <button class="download-btn download-btn--primary" :disabled="isDownloadingPDF" @click="downloadReportPDF">
          {{ isDownloadingPDF ? 'Generating...' : t('downloadPDF') }}
        </button>
      </div>
      <div v-if="store.email" class="download-row" style="margin-top: 10px;">
        <button
          class="download-btn download-btn--email"
          :disabled="isSendingEmail || emailSentToUser"
          @click="sendReportEmailManual"
          style="width: 100%;"
        >
          <span v-if="isSendingEmail">Sending…</span>
          <span v-else-if="emailSentToUser">✓ Report sent to {{ store.email }}</span>
          <span v-else>✉ Send Full Report to {{ store.email }}</span>
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAnalysisStore } from '~/stores/analysisStore'
import { useAuth } from '~/composables/useAuth'
import { useLanguage } from '~/composables/useLanguage'
import { getNakshatra, getVedicPlanet, getVedicElement } from '~/utils/vedic'

import { getBaziPillars, getDominantElement } from '~/utils/bazi'

const store = useAnalysisStore()
const route = useRoute()
const { provisionUser } = useAuth()
const { t } = useLanguage()
const { $trackPurchase } = useNuxtApp() as any

useSeoMeta({
  title: () => store.firstName ? `${store.firstName}'s Destiny Report` : 'Your Destiny Report',
  robots: 'noindex, nofollow',
})

const isLoadingReport = ref(true)
const hasError = ref(false)
const vedicData = ref<any>(null)
const baziData = ref<any>(null)
const tarotData = ref<any>(null)
const isLoadingRegional = ref(false)

const showAddon = ref(false)
const addonPartnerName = ref('')
const addonBirthDay = ref('')
const addonBirthMonth = ref('')
const addonBirthYear = ref('')
const isProcessingAddon = ref(false)
const isGeneratingCalendar = ref(false)
const isSendingEmail = ref(false)
const emailSentToUser = ref(false)
const bundleCompatibilityResult = ref<any>(null)
const isGeneratingCompatibility = ref(false)
const addonPartnerDob = computed(() => {
  if (!addonBirthDay.value || !addonBirthMonth.value || !addonBirthYear.value) return ''
  return `${addonBirthYear.value}-${addonBirthMonth.value.padStart(2, '0')}-${addonBirthDay.value.padStart(2, '0')}`
})

type SectionKey = 'identity' | 'science' | 'forecast' | 'love' | 'purpose' | 'gift' | 'affirmation'

const SECTION_ORDER: SectionKey[] = [
  'identity',
  'science',
  'forecast',
  'love',
  'purpose',
  'gift',
  'affirmation',
]

async function loadRegionalSection() {
  const region = store.region
  if (region !== 'india' && region !== 'china' && region !== 'latam' && region !== 'tarot') return
  if (!store.dateOfBirth) return

  if (region === 'india' && store.vedicData) {
    vedicData.value = store.vedicData
    return
  }
  if (region === 'china' && store.baziData) {
    baziData.value = store.baziData
    return
  }
  if ((region === 'latam' || region === 'tarot') && store.tarotData) {
    tarotData.value = store.tarotData
    return
  }

  // Check sessionStorage cache to avoid re-calling AI on page refresh
  const cacheKey = `omenora_regional_${store.reportSessionId || store.tempId}_${region}`
  const cached = sessionStorage.getItem(cacheKey)
  if (cached) {
    try {
      const parsed = JSON.parse(cached)
      if (region === 'india') { vedicData.value = parsed; store.setVedicData(parsed) }
      else if (region === 'china') { baziData.value = parsed; store.setBaziData(parsed) }
      else { tarotData.value = parsed; store.setTarotData(parsed) }
      return
    } catch { /* corrupted cache, fall through to generate */ }
  }

  isLoadingRegional.value = true
  try {
    if (region === 'india') {
      const nakshatra = getNakshatra(store.dateOfBirth)
      const vedicPlanet = getVedicPlanet(store.lifePathNumber)
      const vedicElement = getVedicElement(store.lifePathNumber)
      const result = await $fetch<{ success: boolean; vedic: any }>('/api/generate-vedic-section', {
        method: 'POST',
        body: {
          firstName: store.firstName,
          dateOfBirth: store.dateOfBirth,
          lifePathNumber: store.lifePathNumber,
          archetype: store.archetype,
          nakshatra,
          vedicPlanet,
          vedicElement,
          language: store.language,
        },
      })
      vedicData.value = result.vedic
      store.setVedicData(result.vedic)
      sessionStorage.setItem(cacheKey, JSON.stringify(result.vedic))
    } else if (region === 'china') {
      const pillars = getBaziPillars(store.dateOfBirth)
      const dominantElement = getDominantElement(pillars)
      const result = await $fetch<{ success: boolean; bazi: any }>('/api/generate-bazi-section', {
        method: 'POST',
        body: {
          firstName: store.firstName,
          pillars,
          dominantElement,
          archetype: store.archetype,
          lifePathNumber: store.lifePathNumber,
          language: store.language,
        },
      })
      baziData.value = result.bazi
      store.setBaziData(result.bazi)
      sessionStorage.setItem(cacheKey, JSON.stringify(result.bazi))
    } else if (region === 'latam' || region === 'tarot') {
      const result = await $fetch<{ success: boolean; tarot: any }>('/api/generate-tarot-section', {
        method: 'POST',
        body: {
          firstName: store.firstName,
          archetype: store.archetype,
          lifePathNumber: store.lifePathNumber,
          element: store.report?.element || 'Earth',
          dateOfBirth: store.dateOfBirth,
          answers: store.answers,
          language: store.language,
        },
      })
      tarotData.value = result.tarot
      store.setTarotData(result.tarot)
      sessionStorage.setItem(cacheKey, JSON.stringify(result.tarot))
    }
  } catch {
    console.error('Regional section failed')
  } finally {
    isLoadingRegional.value = false
  }
}

async function generateBundleCalendar(): Promise<any> {
  if (store.calendarData) return store.calendarData
  if (!store.firstName || !store.dateOfBirth) return null

  const sessionKey = store.reportSessionId || store.tempId
  const calCacheKey = `omenora_calendar_${sessionKey}`
  const calCached = sessionStorage.getItem(calCacheKey)
  if (calCached) {
    try {
      const parsed = JSON.parse(calCached)
      store.setCalendarData(parsed)
      return parsed
    } catch { /* fall through */ }
  }

  isGeneratingCalendar.value = true
  try {
    // ── Step 1: Check DB first (webhook may have already generated & saved it) ──
    if (sessionKey) {
      try {
        const { calendar: dbCal } = await $fetch<{ calendar: { calendar_data: any } | null }>(
          '/api/get-calendar',
          { method: 'POST', body: { sessionId: sessionKey } },
        )
        if (dbCal?.calendar_data) {
          store.setCalendarData(dbCal.calendar_data)
          sessionStorage.setItem(calCacheKey, JSON.stringify(dbCal.calendar_data))
          return dbCal.calendar_data
        }
      } catch { /* not in DB yet — generate below */ }
    }

    // ── Step 2: Generate via AI ────────────────────────────────────────────────
    const calData = await $fetch<{ success: boolean; calendar: any }>('/api/generate-calendar', {
      method: 'POST',
      body: {
        firstName: store.firstName,
        archetype: store.archetype,
        element: store.report?.element,
        lifePathNumber: store.lifePathNumber,
        answers: store.answers,
        dateOfBirth: store.dateOfBirth,
        city: store.city,
        language: store.language,
      },
    })
    store.setCalendarData(calData.calendar)
    sessionStorage.setItem(calCacheKey, JSON.stringify(calData.calendar))

    // ── Step 3: Persist to DB so hard refreshes don't regenerate ──────────────
    if (sessionKey) {
      $fetch('/api/save-calendar', {
        method: 'POST',
        body: { sessionId: sessionKey, calendarData: calData.calendar, firstName: store.firstName },
      }).catch(() => {})
    }

    return calData.calendar
  } catch {
    console.error('Calendar generation failed')
    return null
  } finally {
    isGeneratingCalendar.value = false
  }
}

async function generateCompatibilityFree() {
  if (isGeneratingCompatibility.value || !partnerName.value || !partnerDob.value) return
  isGeneratingCompatibility.value = true
  try {
    const result = await $fetch<{ success: boolean; compatibility: any }>('/api/generate-compatibility', {
      method: 'POST',
      body: {
        firstName: store.firstName,
        archetype: store.archetype,
        element: store.report?.element,
        lifePathNumber: store.lifePathNumber,
        powerTraits: store.report?.powerTraits,
        partnerName: partnerName.value,
        partnerDob: partnerDob.value,
        partnerCity: partnerCity.value,
        language: store.language,
      },
    })
    bundleCompatibilityResult.value = result.compatibility
  } catch {
    console.error('Compatibility generation failed')
  } finally {
    isGeneratingCompatibility.value = false
  }
}

onMounted(async () => {
  const sessionId = route.query.session_id as string

  if (!sessionId && !store.firstName) {
    navigateTo('/')
    return
  }

  isLoadingReport.value = true

  setTimeout(() => {
    if (isLoadingReport.value && !store.addonPurchased) {
      showAddon.value = true
    }
  }, 1500)

  if (sessionId) {
    try {
      // STEP 1: Check if report already exists in DB
      const existsData = await $fetch<{
        exists: boolean
        emailSent: boolean
        report?: {
          report_data: any
          first_name: string
          archetype: string
          life_path_number: number
          email: string
          region?: string
          date_of_birth?: string
          time_of_birth?: string
        }
      }>('/api/check-report-exists', {
        method: 'POST',
        body: { sessionId },
      })

      if (existsData.exists && existsData.report) {
        const dbReport = existsData.report

        if (!store.report && dbReport.report_data) store.setReport(dbReport.report_data)
        if (!store.firstName && dbReport.first_name) store.firstName = dbReport.first_name
        if (!store.email && dbReport.email) store.setEmail(dbReport.email)
        if (!store.archetype && dbReport.archetype) store.setArchetype(dbReport.archetype)
        if (!store.lifePathNumber && dbReport.life_path_number) store.lifePathNumber = dbReport.life_path_number
        if (!store.dateOfBirth && dbReport.date_of_birth) store.dateOfBirth = dbReport.date_of_birth
        if (!store.timeOfBirth && dbReport.time_of_birth) store.timeOfBirth = dbReport.time_of_birth
        if (!store.region && dbReport.region) store.setRegion(dbReport.region, store.country)

        store.setReportSessionId(sessionId)
        store.setPaymentComplete(true)

        if (!existsData.emailSent) {
          // First load — verify Stripe payment for bundle/oracle flags
          const paymentData = await $fetch<{
            paid: boolean
            customerEmail: string | null
            metadata: Record<string, string> | null
          }>('/api/verify-payment', {
            method: 'POST',
            body: { sessionId },
          })

          if (!paymentData.paid) {
            navigateTo('/preview')
            return
          }

          const meta = paymentData.metadata || {}

          const _suppressEmail = meta.email || paymentData.customerEmail || store.email
          if (_suppressEmail) {
            $fetch('/api/suppress-abandon-sequence', {
              method: 'POST',
              body: { email: _suppressEmail },
            }).catch(() => {})
          }

          store.setBundlePurchased(meta.bundle === 'true' || meta.oracle === 'true')
          store.setCalendarPurchased(meta.bundle === 'true' || meta.oracle === 'true')
          store.setOraclePurchased(meta.oracle === 'true')
          store.setSubscriptionActive(meta.oracle === 'true')
          store.setBirthChartPurchased(meta.birth_chart === 'true')
          if (!store.languageManualOverride && meta.language) {
            store.setLanguage(meta.language)
          }

          trackPurchasePixel(sessionId, meta)

          isLoadingReport.value = false
          showAddon.value = false
          if ((store.oraclePurchased || store.birthChartPurchased) && store.timeOfBirth && !store.birthChartData) {
            await generateBirthChartAuto()
          }
          await loadRegionalSection()

          if (store.bundlePurchased || store.oraclePurchased) {
            await generateBundleCalendar()
          }
        } else {
          // Email already sent — refresh detected, skip email but still verify purchase tier
          const refreshPayment = await $fetch<{
            paid: boolean
            customerEmail: string | null
            metadata: Record<string, string> | null
          }>('/api/verify-payment', {
            method: 'POST',
            body: { sessionId },
          })

          if (!refreshPayment.paid) {
            navigateTo('/preview')
            return
          }

          const refreshMeta = refreshPayment.metadata || {}
          store.setBundlePurchased(refreshMeta.bundle === 'true' || refreshMeta.oracle === 'true')
          store.setCalendarPurchased(refreshMeta.bundle === 'true' || refreshMeta.oracle === 'true')
          store.setOraclePurchased(refreshMeta.oracle === 'true')
          store.setSubscriptionActive(refreshMeta.oracle === 'true')
          store.setBirthChartPurchased(refreshMeta.birth_chart === 'true')

          isLoadingReport.value = false
          showAddon.value = false
          if ((store.oraclePurchased || store.birthChartPurchased) && store.timeOfBirth && !store.birthChartData) {
            generateBirthChartAuto()
          }
          if (store.bundlePurchased || store.oraclePurchased) {
            await generateBundleCalendar()
          }
          await loadRegionalSection()
        }

        // Silently provision Supabase Auth account (non-blocking — report renders regardless)
        provisionUser({ sessionId }).catch(() => {})
        return
      }

      // Report not in DB yet — verify Stripe payment and bootstrap
      const paymentData = await $fetch<{
        paid: boolean
        customerEmail: string | null
        metadata: Record<string, string> | null
      }>('/api/verify-payment', {
        method: 'POST',
        body: { sessionId },
      })

      if (!paymentData.paid) {
        navigateTo('/preview')
        return
      }

      const meta = paymentData.metadata || {}

      const _suppressEmail2 = meta.email || paymentData.customerEmail || store.email
      if (_suppressEmail2) {
        $fetch('/api/suppress-abandon-sequence', {
          method: 'POST',
          body: { email: _suppressEmail2 },
        }).catch(() => {})
      }

      if (!store.firstName) store.firstName = meta.firstName || ''
      if (!store.email) store.setEmail(meta.email || paymentData.customerEmail || '')
      if (!store.tempId) store.setTempId(meta.tempId || '')
      if (!store.archetype) store.setArchetype(meta.archetype || '')
      if (!store.dateOfBirth && meta.dateOfBirth) store.dateOfBirth = meta.dateOfBirth
      if (!store.lifePathNumber && meta.lifePathNumber) store.lifePathNumber = Number.parseInt(meta.lifePathNumber)
      if (meta.region) store.setRegion(meta.region, store.country)
      if (!store.timeOfBirth && meta.timeOfBirth) store.timeOfBirth = meta.timeOfBirth

      store.setBundlePurchased(meta.bundle === 'true' || meta.oracle === 'true')
      store.setCalendarPurchased(meta.bundle === 'true' || meta.oracle === 'true')
      store.setOraclePurchased(meta.oracle === 'true')
      store.setSubscriptionActive(meta.oracle === 'true')
      store.setBirthChartPurchased(meta.birth_chart === 'true')

      trackPurchasePixel(sessionId, meta)

      if (!store.languageManualOverride && meta.language) {
        store.setLanguage(meta.language)
      }

      store.setPaymentComplete(true)
      store.setReportSessionId(sessionId)

      if (!store.report && store.tempId) {
        try {
          const { report } = await $fetch<{
            report: {
              report_data: any
              first_name: string
              archetype: string
              life_path_number: number
              email: string
              region?: string
              date_of_birth?: string
            }
          }>('/api/get-report', {
            method: 'POST',
            body: { sessionId: store.tempId },
          })
          store.setReport(report.report_data)
          store.firstName = report.first_name
          store.archetype = report.archetype
          store.lifePathNumber = report.life_path_number
          if (report.email) store.setEmail(report.email)
          if (report.region) store.setRegion(report.region, store.country)
          if (report.date_of_birth) store.dateOfBirth = report.date_of_birth
        } catch {
          // Could not load from DB, continue without cached data
        }
      }

      isLoadingReport.value = false
      showAddon.value = false
      if ((store.oraclePurchased || store.birthChartPurchased) && store.timeOfBirth && !store.birthChartData) {
        await generateBirthChartAuto()
      }
      await loadRegionalSection()

      if (store.bundlePurchased || store.oraclePurchased) {
        await generateBundleCalendar()
      }

      // Silently provision Supabase Auth account (non-blocking — report renders regardless)
      provisionUser({ sessionId }).catch(() => {})

    } catch {
      console.error('Report page load failed')
      isLoadingReport.value = false
      showAddon.value = false
      hasError.value = true
    }
  } else {
    // No sessionId — show report from existing store state (promo / direct nav)
    isLoadingReport.value = false
    showAddon.value = false
    if ((store.oraclePurchased || store.birthChartPurchased) && store.timeOfBirth && !store.birthChartData) {
      generateBirthChartAuto()
    }
    await loadRegionalSection()
    if (store.bundlePurchased || store.oraclePurchased) {
      generateBundleCalendar()
    }
  }
})

function reloadPage() {
  window.location.reload()
}

async function sendReportEmailManual() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (isSendingEmail.value || emailSentToUser.value || !store.email || !emailRegex.test(store.email) || !store.report) return
  isSendingEmail.value = true
  try {
    await $fetch('/api/send-report-email', {
      method: 'POST',
      body: {
        email: store.email,
        firstName: store.firstName,
        report: store.report,
        archetype: store.archetype,
        lifePathNumber: store.lifePathNumber,
        element: store.report?.element,
        region: store.region,
        vedicData: vedicData.value || null,
        baziData: baziData.value || null,
        tarotData: tarotData.value || null,
        calendarData: store.calendarData || null,
        birthChartData: store.birthChartData || null,
        bundlePurchased: store.bundlePurchased || store.oraclePurchased,
        language: store.language,
      },
    })
    emailSentToUser.value = true
    const sessionKey = store.reportSessionId || store.tempId
    if (sessionKey) {
      await $fetch('/api/mark-email-sent', {
        method: 'POST',
        body: { sessionId: sessionKey },
      }).catch(() => {})
    }
  } catch {
    console.error('Failed to send report email')
  } finally {
    isSendingEmail.value = false
  }
}

function trackPurchasePixel(sessionId: string, meta: Record<string, string>) {
  const pixelKey = `omenora_purchase_tracked_${sessionId}`
  if (sessionStorage.getItem(pixelKey)) return
  sessionStorage.setItem(pixelKey, '1')

  const purchaseAmount = meta.oracle === 'true' ? 12.99
    : meta.bundle === 'true' ? 5.99
    : meta.birth_chart === 'true' ? 3.99
    : 2.99

  const contentName = meta.oracle === 'true' ? 'Oracle Bundle'
    : meta.bundle === 'true' ? 'Most Popular Bundle'
    : meta.birth_chart === 'true' ? 'Birth Chart'
    : 'Destiny Reading'

  $trackPurchase({
    value: purchaseAmount,
    currency: 'USD',
    content_name: contentName,
  })
}

const isLoadingBundle = ref(false)

async function buyBundle() {
  if (isLoadingBundle.value) return
  isLoadingBundle.value = true
  try {
    const { url } = await $fetch<{ sessionId: string; url: string | null }>(
      '/api/create-bundle-payment',
      {
        method: 'POST',
        body: {
          email: store.email,
          firstName: store.firstName,
          archetype: store.archetype,
          lifePathNumber: store.lifePathNumber,
          dateOfBirth: store.dateOfBirth,
          tempId: store.tempId,
          region: store.region,
          language: store.language,
          origin: window.location.origin,
        },
      }
    )
    if (url) window.location.href = url
  } catch {
    console.error('Bundle purchase failed')
    isLoadingBundle.value = false
  }
}

async function handleAddonPurchase() {
  if (!addonPartnerName.value || isProcessingAddon.value) return
  isProcessingAddon.value = true
  try {
    store.setPartnerData({
      name: addonPartnerName.value,
      dob: addonPartnerDob.value,
      city: '',
    })
    const { url } = await $fetch<{ sessionId: string; url: string | null }>(
      '/api/create-addon-payment',
      {
        method: 'POST',
        body: {
          email: store.email,
          firstName: store.firstName,
          language: store.language,
          origin: window.location.origin,
        },
      }
    )
    if (url) window.location.href = url
  } catch {
    console.error('Addon purchase failed')
    isProcessingAddon.value = false
  }
}

const isDownloading = ref(false)

async function downloadCard() {
  if (isDownloading.value) return
  isDownloading.value = true

  try {
    const response = await fetch('/api/generate-card', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        archetypeName: store.report?.archetypeName,
        archetypeSymbol: store.report?.archetypeSymbol,
        element: store.report?.element,
        lifePathNumber: store.lifePathNumber,
        powerTraits: store.report?.powerTraits,
        affirmation: store.report?.sections?.affirmation?.content,
        firstName: store.firstName,
      }),
    })

    if (!response.ok) throw new Error('Failed to generate card')

    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `omenora-destiny-${store.firstName || 'report'}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch {
    console.error('Card download failed')
  } finally {
    isDownloading.value = false
  }
}

const partnerName = ref('')
const partnerDob = ref('')
const partnerCity = ref('')
const isProcessingCompatibility = ref(false)
const showCompatibilityForm = ref(false)

async function buyCompatibilityReading() {
  if (isProcessingCompatibility.value) return
  if (!partnerName.value || !partnerDob.value) return

  isProcessingCompatibility.value = true

  try {
    const { url } = await $fetch<{ sessionId: string; url: string | null }>(
      '/api/create-compatibility-payment',
      {
        method: 'POST',
        body: {
          email: store.email,
          firstName: store.firstName,
          partnerName: partnerName.value,
          tempId: store.tempId,
          language: store.language,
          origin: window.location.origin,
        },
      }
    )

    store.setPartnerData({
      name: partnerName.value,
      dob: partnerDob.value,
      city: partnerCity.value,
    })

    if (url) window.location.href = url
  } catch {
    console.error('Compatibility purchase failed')
    isProcessingCompatibility.value = false
  }
}

const isLoadingCalendar = ref(false)

async function buyCalendar() {
  if (isLoadingCalendar.value) return
  isLoadingCalendar.value = true
  try {
    const { url } = await $fetch<{ sessionId: string; url: string | null }>(
      '/api/create-calendar-payment',
      {
        method: 'POST',
        body: {
          email: store.email,
          firstName: store.firstName,
          tempId: store.tempId,
          language: store.language,
          origin: window.location.origin,
        },
      }
    )
    if (url) window.location.href = url
  } catch {
    console.error('Calendar purchase failed')
    isLoadingCalendar.value = false
  }
}

const isLoadingBirthChart = ref(false)

async function generateBirthChartAuto() {
  if (isLoadingBirthChart.value || store.birthChartData) return

  const bcCacheKey = `omenora_birthchart_${store.reportSessionId || store.tempId}`
  const bcCached = sessionStorage.getItem(bcCacheKey)
  if (bcCached) {
    try {
      store.setBirthChartData(JSON.parse(bcCached))
      return
    } catch { /* fall through to generate */ }
  }

  isLoadingBirthChart.value = true
  try {
    const result = await $fetch<{ success: boolean; birthChart: any }>('/api/generate-birth-chart', {
      method: 'POST',
      body: {
        firstName: store.firstName,
        dateOfBirth: store.dateOfBirth,
        timeOfBirth: store.timeOfBirth,
        city: store.city,
        archetype: store.archetype,
        lifePathNumber: store.lifePathNumber,
        language: store.language,
      },
    })
    store.setBirthChartData(result.birthChart)
    sessionStorage.setItem(bcCacheKey, JSON.stringify(result.birthChart))
  } catch {
    console.error('Birth chart generation failed')
  } finally {
    isLoadingBirthChart.value = false
  }
}

async function buyBirthChart() {
  if (isLoadingBirthChart.value) return
  if (store.oraclePurchased || store.birthChartPurchased) {
    await generateBirthChartAuto()
    return
  }
  isLoadingBirthChart.value = true
  try {
    const { url } = await $fetch<{ sessionId: string; url: string | null }>(
      '/api/create-birth-chart-payment',
      {
        method: 'POST',
        body: {
          email: store.email,
          firstName: store.firstName,
          tempId: store.tempId,
          timeOfBirth: store.timeOfBirth,
          dateOfBirth: store.dateOfBirth,
          language: store.language,
          origin: window.location.origin,
        },
      }
    )
    if (url) window.location.href = url
  } catch {
    console.error('Birth chart purchase failed')
  } finally {
    isLoadingBirthChart.value = false
  }
}

const isStartingSub = ref(false)

async function startSubscription() {
  if (isStartingSub.value) return
  isStartingSub.value = true
  try {
    const { url } = await $fetch<{ sessionId: string; url: string | null }>('/api/create-subscription', {
      method: 'POST',
      body: {
        email: store.email,
        firstName: store.firstName,
        archetype: store.archetype,
        lifePathNumber: store.lifePathNumber,
        origin: window.location.origin,
      },
    })
    if (url) window.location.href = url
  } catch {
    console.error('Subscription start failed')
    isStartingSub.value = false
  }
}

// ── Tradition Switcher ────────────────────────────────────────────────────

const TRADITION_OPTIONS = computed(() => [
  { value: 'western', label: t('traditionWesternName'), sub: t('traditionWesternSub'), icon: '⭐' },
  { value: 'india',   label: t('traditionVedicName'),   sub: t('traditionVedicSub'),   icon: '🕉' },
  { value: 'china',   label: t('traditionChineseName'), sub: t('traditionChineseSub'), icon: '☯' },
  { value: 'latam',   label: t('traditionTarotName'),   sub: t('traditionTarotSub'),   icon: '🔮' },
])

const unlockedTraditions = ref<string[]>([store.region || 'western'])
const isSwitchingTradition = ref(false)
const isSwitchComplete = ref(false)
const switchingTraditionLabel = ref('')
const switchedTraditionLabel = ref('')

function isTraditionUnlocked(tradition: string): boolean {
  return unlockedTraditions.value.includes(tradition)
}

async function handleTraditionSwitch(newTradition: string) {
  if (isSwitchingTradition.value || store.region === newTradition) return

  const opt = TRADITION_OPTIONS.value.find((o: { value: string }) => o.value === newTradition)
  switchingTraditionLabel.value = opt?.label ?? newTradition

  const isAlreadyUnlocked = isTraditionUnlocked(newTradition)
  const isFree = store.oraclePurchased || isAlreadyUnlocked

  if (isFree) {
    // Free switch: call switch-tradition directly
    isSwitchingTradition.value = true
    try {
      const result = await $fetch<{ success: boolean; report: any; tradition: string }>(
        '/api/switch-tradition',
        {
          method: 'POST',
          body: {
            sessionId:    '',
            reportId:     store.tempId || store.reportSessionId,
            newTradition,
            freeSwitch:   true,
          },
        },
      )
      store.setReport(result.report)
      store.setRegion(newTradition, store.country)
      if (!unlockedTraditions.value.includes(newTradition)) {
        unlockedTraditions.value = [...unlockedTraditions.value, newTradition]
      }
      await loadRegionalSection()
      switchedTraditionLabel.value = opt?.label ?? newTradition
      isSwitchComplete.value = true
      setTimeout(() => { isSwitchComplete.value = false }, 4000)
    } catch {
      console.error('Tradition switch failed')
    } finally {
      isSwitchingTradition.value = false
    }
  } else {
    // Paid switch: redirect to Stripe
    isSwitchingTradition.value = true
    try {
      const { url } = await $fetch<{ sessionId: string; url: string | null }>(
        '/api/create-tradition-payment',
        {
          method: 'POST',
          body: {
            firstName:      store.firstName,
            email:          store.email,
            reportId:       store.tempId || store.reportSessionId,
            newTradition,
            archetype:      store.archetype,
            lifePathNumber: store.lifePathNumber,
            language:       store.language,
            origin:         window.location.origin,
          },
        },
      )
      if (url) window.location.href = url
    } catch {
      console.error('Tradition payment creation failed')
      isSwitchingTradition.value = false
    }
  }
}

// Handle returning from a tradition_switch Stripe payment
const _traditionSwitchSessionId = route.query.session_id as string | undefined
const _isTraditionSwitch = route.query.tradition_switch === 'true'

if (_isTraditionSwitch && _traditionSwitchSessionId) {
  onMounted(async () => {
    try {
      const paymentData = await $fetch<{
        paid: boolean
        metadata: Record<string, string> | null
      }>('/api/verify-payment', {
        method: 'POST',
        body: { sessionId: _traditionSwitchSessionId },
      })
      if (!paymentData.paid) return
      const meta = paymentData.metadata ?? {}
      if (meta.type !== 'tradition_switch' || !meta.newTradition) return

      const newTradition = meta.newTradition
      isSwitchingTradition.value = true
      const opt = TRADITION_OPTIONS.value.find((o: { value: string }) => o.value === newTradition)
      switchingTraditionLabel.value = opt?.label ?? newTradition

      const result = await $fetch<{ success: boolean; report: any; tradition: string }>(
        '/api/switch-tradition',
        {
          method: 'POST',
          body: {
            sessionId:    _traditionSwitchSessionId,
            reportId:     meta.reportId || store.tempId || store.reportSessionId,
            newTradition,
            freeSwitch:   false,
          },
        },
      )
      store.setReport(result.report)
      store.setRegion(newTradition, store.country)
      unlockedTraditions.value = [...new Set([...unlockedTraditions.value, newTradition])]
      await loadRegionalSection()
      switchedTraditionLabel.value = opt?.label ?? newTradition
      isSwitchComplete.value = true
      setTimeout(() => { isSwitchComplete.value = false }, 4000)
    } catch {
      console.error('Tradition switch post-payment failed')
    } finally {
      isSwitchingTradition.value = false
    }
  })
}

const isDownloadingPDF = ref(false)

async function downloadReportPDF() {
  if (isDownloadingPDF.value) return
  isDownloadingPDF.value = true
  try {
    const response = await fetch('/api/generate-report-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: store.firstName,
        report: store.report,
        lifePathNumber: store.lifePathNumber,
        region: store.region,
        vedicData: store.vedicData || null,
        baziData: store.baziData || null,
        tarotData: store.tarotData || null,
        calendarData: store.calendarData || null,
        bundlePurchased: store.bundlePurchased || store.oraclePurchased,
        language: store.language,
      }),
    })
    if (!response.ok) throw new Error('Failed to generate report PDF')
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `omenora-report-${store.firstName || 'destiny'}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch {
    console.error('PDF download failed')
  } finally {
    isDownloadingPDF.value = false
  }
}
</script>

<style scoped>
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.95); }
}

/* ── Loading page ── */
.report-loading-page {
  background: #050410;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  box-sizing: border-box;
}

.report-loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 0;
}

/* Orbital mark (shared across pages) */
.orbital-mark {
  position: relative;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.orbit-outer {
  position: absolute;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 1px solid rgba(201, 168, 76, 0.3);
  animation: orbit-spin 18s linear infinite;
}

@keyframes orbit-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.orbit-planet {
  position: absolute;
  top: -3px;
  left: 50%;
  transform: translateX(-50%);
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: rgba(201, 168, 76, 0.85);
  box-shadow: 0 0 6px rgba(201, 168, 76, 0.5);
}

.orbit-inner {
  position: absolute;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(140, 110, 255, 0.2);
}

.orbit-center {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(200, 180, 255, 0.9);
  box-shadow: 0 0 8px rgba(180, 150, 255, 0.6);
}

.rload-brand {
  font-size: 11px;
  letter-spacing: 0.18em;
  color: rgba(255, 255, 255, 0.22);
  margin: 0;
}

.rload-msg {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 16px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
  text-align: center;
}

.rload-track {
  width: 160px;
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

@keyframes fillProgress {
  from { width: 0%; }
  to { width: 90%; }
}

.rload-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(140,110,255,0.55), rgba(201,168,76,0.55));
  animation: fillProgress 8s ease-out forwards;
}

/* Addon offer box */
.addon-price-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.addon-original {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.2);
  text-decoration: line-through;
}

.addon-price {
  font-family: 'Cormorant Garamond', serif;
  font-size: 28px;
  font-weight: 300;
  color: rgba(200, 180, 255, 0.95);
}

.addon-note {
  font-size: 11px;
  color: rgba(140, 110, 255, 0.5);
}

.addon-dob-row {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.addon-day {
  flex: 1;
  text-align: center;
  padding: 10px 6px;
}

.addon-year {
  flex: 1.5;
}

/* ── Unlock banner ── */
.unlock-banner {
  margin-bottom: 24px;
  padding: 14px 20px;
  background: rgba(80, 200, 120, 0.05);
  border: 1px solid rgba(80, 200, 120, 0.18);
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.unlock-banner-icon {
  font-size: 16px;
  color: rgba(120, 230, 160, 0.7);
  flex-shrink: 0;
}

.unlock-banner-title {
  font-size: 13px;
  font-weight: 500;
  color: rgba(120, 230, 160, 0.88);
  margin: 0 0 2px;
}

.unlock-banner-desc {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.28);
  margin: 0;
}

/* ── Birth chart banner ── */
.birth-chart-banner {
  margin-bottom: 24px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.birth-chart-banner--active {
  background: rgba(201, 168, 76, 0.04);
  border-color: rgba(201, 168, 76, 0.18);
}

.birth-chart-info {
  flex: 1;
  min-width: 180px;
}

.birth-chart-title {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.88);
  margin: 0 0 3px;
}

.birth-chart-title--dim {
  color: rgba(255, 255, 255, 0.38);
}

.birth-chart-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.28);
  margin: 0;
}

.birth-chart-btn {
  padding: 10px 20px;
  background: rgba(201, 168, 76, 0.1);
  border: 1px solid rgba(201, 168, 76, 0.35);
  border-radius: 4px;
  color: rgba(201, 168, 76, 0.88);
  font-size: 12px;
  letter-spacing: 0.06em;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.birth-chart-btn:hover:not(:disabled) {
  background: rgba(201, 168, 76, 0.18);
  border-color: rgba(201, 168, 76, 0.6);
}

.birth-chart-locked-badge {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 2px;
  padding: 4px 12px;
  flex-shrink: 0;
}

/* ── Report calendar section ── */
.report-cal-section {
  margin-bottom: 40px;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.report-cal-header {
  margin-bottom: 16px;
}

.report-cal-eyebrow {
  font-size: 9px;
  letter-spacing: 0.18em;
  color: rgba(201, 168, 76, 0.6);
  text-transform: uppercase;
  margin: 0 0 6px;
}

.report-cal-theme {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-style: italic;
}

.report-cal-peaks {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.cal-peak-chip {
  font-size: 10px;
  color: rgba(201, 168, 76, 0.8);
  background: rgba(201, 168, 76, 0.08);
  border: 1px solid rgba(201, 168, 76, 0.2);
  border-radius: 2px;
  padding: 3px 10px;
  letter-spacing: 0.06em;
}

.cal-caution-chip {
  font-size: 10px;
  color: rgba(255, 110, 110, 0.6);
  background: rgba(255, 100, 100, 0.05);
  border: 1px solid rgba(255, 100, 100, 0.15);
  border-radius: 2px;
  padding: 3px 10px;
  letter-spacing: 0.06em;
}

.report-cal-months {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.report-month-card {
  padding: 13px 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-left: 2px solid;
  border-radius: 4px;
}

.rmc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.rmc-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 18px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.82);
  margin: 0 0 2px;
}

.rmc-theme {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.25);
  margin: 0;
}

.rmc-energy-block {
  text-align: right;
  flex-shrink: 0;
}

.rmc-energy-label {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.22);
  display: block;
  margin-bottom: 3px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.rmc-energy-track {
  width: 60px;
  height: 2px;
  background: rgba(255, 255, 255, 0.07);
  overflow: hidden;
}

.rmc-energy-fill {
  height: 100%;
}

.rmc-insights {
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-bottom: 8px;
}

.rmc-insight {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.48);
  margin: 0;
  line-height: 1.5;
}

.rmc-icon {
  margin-right: 3px;
}

.rmc-warning {
  font-size: 11px;
  color: rgba(255, 120, 80, 0.5);
  margin: 4px 0 0;
}

.rmc-lucky {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.18);
  margin: 0;
}

/* ── Sub upsell banner ── */
.sub-upsell-banner {
  margin-bottom: 32px;
  padding: 18px 20px;
  background: rgba(140, 110, 255, 0.05);
  border: 1px solid rgba(140, 110, 255, 0.18);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.sub-upsell-info {
  flex: 1;
  min-width: 180px;
}

.sub-upsell-title {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.85);
  margin: 0 0 3px;
}

.sub-upsell-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  margin: 0;
}

.sub-upsell-btn {
  padding: 10px 20px;
  background: rgba(140, 110, 255, 0.15);
  border: 1px solid rgba(140, 110, 255, 0.35);
  border-radius: 4px;
  color: rgba(200, 180, 255, 0.88);
  font-size: 12px;
  letter-spacing: 0.04em;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}

.sub-upsell-btn:hover:not(:disabled) {
  background: rgba(140, 110, 255, 0.25);
  border-color: rgba(140, 110, 255, 0.55);
}

/* ── Shared centered states ── */
.center-page {
  background: #050410;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.center-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
  padding: 0 24px;
}

.brand-text {
  font-size: 13px;
  letter-spacing: 0.15em;
  color: rgba(255, 255, 255, 0.3);
  margin: 0;
}

.status-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
}

.fallback-title {
  font-size: 20px;
  font-weight: 500;
  color: white;
  margin: 0;
}

.fallback-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
  max-width: 280px;
  line-height: 1.6;
}

/* ── Report page ── */
.report-page {
  background: #050410;
  min-height: 100vh;
  color: white;
  max-width: 560px;
  margin: 0 auto;
  padding: 24px 20px 60px;
  box-sizing: border-box;
}

/* Top bar */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.top-brand {
  font-size: 11px;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.2);
  margin: 0;
}

.report-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
}

/* Hero block */
.hero-block {
  position: relative;
  padding: 32px 0 28px;
  background: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 28px;
  overflow: hidden;
}

.archetype-label {
  font-size: 9px;
  letter-spacing: 0.18em;
  color: rgba(201, 168, 76, 0.65);
  text-transform: uppercase;
  margin: 0 0 12px;
}

.archetype-symbol {
  display: block;
  margin-bottom: 10px;
  opacity: 0.85;
}

.archetype-name {
  font-family: 'Cormorant Garamond', serif;
  font-size: 56px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.94);
  line-height: 1.05;
  margin: 0;
  letter-spacing: -0.01em;
}

.archetype-meta {
  font-size: 12px;
  color: rgba(140, 110, 255, 0.5);
  margin: 8px 0 0;
  letter-spacing: 0.04em;
}

.traits-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.trait-pill {
  font-size: 10px;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  padding: 4px 12px;
  background: transparent;
}

/* Report sections */
.section-wrapper {
  padding: 32px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  background: none;
}

.section-wrapper.no-border {
  border-bottom: none;
}

.section-title {
  font-size: 9px;
  font-weight: 400;
  color: rgba(201, 168, 76, 0.65);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin: 0 0 12px;
}

.section-content {
  font-size: 15px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.68);
  line-height: 1.95;
  margin: 0;
}

.affirmation-box {
  background: transparent;
  border: none;
  border-top: 1px solid rgba(201, 168, 76, 0.12);
  border-bottom: 1px solid rgba(201, 168, 76, 0.12);
  border-radius: 0;
  padding: 32px 0;
  font-family: 'Cormorant Garamond', serif;
  font-size: 24px;
  font-weight: 300;
  font-style: italic;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.6;
  text-align: center;
}

/* Share section */
.share-section {
  margin-top: 48px;
}

.share-title {
  font-size: 14px;
  font-weight: 500;
  color: white;
  margin: 0 0 4px;
}

.share-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  margin: 0 0 16px;
}

.share-card {
  width: 280px;
  height: 160px;
  background: linear-gradient(140deg, #0d0b1e, #12101f);
  border: 1px solid rgba(140, 110, 255, 0.25);
  border-radius: 16px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px;
  box-sizing: border-box;
}

.card-symbol {
  display: block;
}

.card-name {
  font-size: 16px;
  color: white;
  font-weight: 500;
  margin: 0;
}

.card-traits {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
}

.card-trait-pill {
  font-size: 9px;
  color: rgba(200, 180, 255, 0.6);
  border: 1px solid rgba(140, 110, 255, 0.2);
  border-radius: 20px;
  padding: 2px 8px;
  background: rgba(140, 110, 255, 0.05);
}

.card-domain {
  font-size: 8px;
  color: rgba(255, 255, 255, 0.2);
  letter-spacing: 0.05em;
  margin: 0;
}

.download-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.42);
  border-radius: 4px;
  padding: 12px 24px;
  font-size: 12px;
  letter-spacing: 0.06em;
  cursor: pointer;
  font-family: inherit;
  display: block;
  margin: 16px auto 0;
  transition: all 0.22s;
}

.download-btn:hover {
  border-color: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
}

.download-row {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin: 16px auto 0;
}

.download-row .download-btn {
  flex: 1;
  margin: 0;
  display: block;
}

.download-btn--primary {
  background: rgba(201, 168, 76, 0.1);
  border-color: rgba(201, 168, 76, 0.42);
  color: rgba(201, 168, 76, 0.88);
}

.download-btn--primary:not(:disabled):hover {
  background: rgba(201, 168, 76, 0.18);
  border-color: rgba(201, 168, 76, 0.65);
  box-shadow: 0 0 20px rgba(201, 168, 76, 0.08);
}

.download-btn--email {
  background: rgba(140, 110, 255, 0.08);
  border-color: rgba(140, 110, 255, 0.3);
  color: rgba(200, 180, 255, 0.85);
}

.download-btn--email:not(:disabled):hover {
  background: rgba(140, 110, 255, 0.15);
  border-color: rgba(140, 110, 255, 0.5);
  box-shadow: 0 0 20px rgba(140, 110, 255, 0.07);
}

.download-btn--email:disabled {
  opacity: 0.6;
  cursor: default;
}

/* ── Compatibility upsell ── */
.compat-section {
  margin-top: 48px;
  padding: 32px 24px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
}

.compat-teaser {
  text-align: center;
}

.compat-title {
  font-size: 22px;
  font-weight: 500;
  color: white;
  margin: 0 0 8px;
}

.compat-subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.35);
  line-height: 1.6;
  margin: 0 0 20px;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
}

.compat-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 20px;
}

.compat-tag {
  font-size: 12px;
  color: rgba(200, 180, 255, 0.7);
  border: 1px solid rgba(140, 110, 255, 0.25);
  border-radius: 20px;
  padding: 4px 14px;
  background: rgba(140, 110, 255, 0.06);
}

.compat-cta-btn {
  width: 100%;
  padding: 16px;
  background: rgba(140, 110, 255, 0.15);
  border: 1px solid rgba(140, 110, 255, 0.35);
  border-radius: 12px;
  color: rgba(200, 180, 255, 0.9);
  font-size: 15px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}

.compat-cta-btn:hover {
  background: rgba(140, 110, 255, 0.22);
  border-color: rgba(140, 110, 255, 0.55);
}

.compat-form-title {
  font-size: 16px;
  font-weight: 500;
  color: white;
  margin: 0 0 4px;
}

.compat-form-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  margin: 0 0 20px;
  line-height: 1.5;
}

.compat-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.compat-input {
  width: 100%;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: white;
  font-size: 15px;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.compat-input::placeholder {
  color: rgba(255, 255, 255, 0.25);
}

.compat-input:focus {
  border-color: rgba(140, 110, 255, 0.5);
}

.compat-input--date {
  color-scheme: dark;
}

.compat-unlock-btn {
  width: 100%;
  padding: 16px;
  background: rgba(140, 110, 255, 0.85);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 15px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s, opacity 0.2s;
}

.compat-unlock-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.compat-unlock-btn:not(:disabled):hover {
  background: rgba(140, 110, 255, 1);
}

.compat-cancel-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.25);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  margin-top: 12px;
  width: 100%;
  padding: 8px;
}

/* ── Calendar upsell ── */
.cal-upsell {
  margin: 48px 0;
  padding: 28px 24px;
  background: linear-gradient(135deg, rgba(140, 110, 255, 0.06) 0%, rgba(80, 60, 180, 0.04) 100%);
  border: 1px solid rgba(140, 110, 255, 0.2);
  border-radius: 16px;
}

.cal-upsell-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.cal-upsell-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.cal-upsell-info {
  flex: 1;
}

.cal-upsell-title {
  font-size: 16px;
  font-weight: 500;
  color: white;
  margin: 0;
}

.cal-upsell-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  margin: 0;
}

.cal-upsell-price {
  font-size: 20px;
  font-weight: 500;
  color: rgba(200, 180, 255, 0.9);
  flex-shrink: 0;
}

.cal-features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}

.cal-feat {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cal-feat-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(140, 110, 255, 0.6);
  flex-shrink: 0;
  display: inline-block;
}

.cal-feat-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.cal-preview {
  margin-bottom: 4px;
}

.cal-bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 6px 0;
}

.cal-bar-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.3);
  width: 52px;
  flex-shrink: 0;
}

.cal-bar-track {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 3px;
  overflow: hidden;
}

.cal-bar-fill {
  height: 100%;
  border-radius: 3px;
}

.cal-upsell-btn {
  width: 100%;
  margin-top: 20px;
  padding: 16px;
  background: rgba(201, 168, 76, 0.1);
  border: 1px solid rgba(201, 168, 76, 0.38);
  border-radius: 4px;
  color: rgba(201, 168, 76, 0.88);
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.06em;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.22s;
}

.cal-upsell-btn:not(:disabled):hover {
  background: rgba(201, 168, 76, 0.18);
  border-color: rgba(201, 168, 76, 0.62);
  box-shadow: 0 0 20px rgba(201, 168, 76, 0.07);
}

.cal-upsell-btn:disabled {
  opacity: 0.38;
  cursor: not-allowed;
}

.cal-upsell-note {
  text-align: center;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.15);
  margin-top: 8px;
  margin-bottom: 0;
}

/* ── Loading upsell screen ── */
.upsell-loading-page {
  background: #0a0a0f;
  min-height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 60px 20px 40px;
  box-sizing: border-box;
}

.upsell-loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 360px;
}

.upsell-progress-track {
  width: 200px;
  height: 2px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 40px;
}

@keyframes upsellProgress {
  from { width: 0%; }
  to { width: 90%; }
}

@keyframes fillProgress {
  from { width: 0%; }
  to { width: 90%; }
}

.upsell-progress-fill {
  height: 100%;
  background: rgba(140, 110, 255, 0.6);
  border-radius: 2px;
  animation: upsellProgress 8s ease-in-out forwards;
}

.addon-offer-box {
  width: 100%;
  margin-top: 32px;
  background: rgba(140, 110, 255, 0.08);
  border: 1px solid rgba(140, 110, 255, 0.3);
  border-radius: 16px;
  padding: 20px;
  box-sizing: border-box;
}

.addon-badge {
  font-size: 9px;
  font-weight: 600;
  color: rgba(140, 110, 255, 0.8);
  letter-spacing: 0.12em;
  background: rgba(140, 110, 255, 0.15);
  border-radius: 20px;
  padding: 3px 10px;
  display: inline-block;
  margin-bottom: 12px;
}

.addon-title {
  font-size: 16px;
  font-weight: 500;
  color: white;
  margin: 0 0 4px;
}

.addon-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  margin: 0 0 16px;
  line-height: 1.5;
}

.addon-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 12px 14px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  width: 100%;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
  margin-bottom: 8px;
  transition: border-color 0.2s;
}

.addon-input:focus {
  border-color: rgba(140, 110, 255, 0.5);
}

.addon-input::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.addon-dob {
  flex: 1;
  width: auto;
  margin-bottom: 0;
  text-align: center;
  padding: 12px 8px;
}

.addon-year {
  flex: 1.4;
}

.addon-yes-btn {
  width: 100%;
  padding: 14px;
  background: rgba(140, 110, 255, 0.85);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 15px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s;
  margin-bottom: 12px;
}

.addon-yes-btn:hover:not(:disabled) {
  background: rgba(140, 110, 255, 1);
}

.addon-yes-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.addon-no-link {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  text-decoration: underline;
  text-align: center;
  margin: 0;
}

.fade-up-enter-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

/* ── Bundle upsell ── */
.bundle-upsell-box {
  padding: 28px 24px;
  background: rgba(201, 168, 76, 0.04);
  border: 1px solid rgba(201, 168, 76, 0.18);
  border-radius: 8px;
  margin: 40px 0;
  text-align: center;
}

.bundle-headline {
  font-family: 'Cormorant Garamond', serif;
  font-size: 30px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 6px;
}

.bundle-subline {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.3);
  margin: 0 0 24px;
}

.bundle-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.bundle-item {
  display: flex;
  align-items: center;
}

.bundle-item-name {
  font-size: 13px;
  font-weight: 500;
  color: white;
  margin: 0 0 2px;
}

.bundle-item-desc {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
  margin: 0;
}

.bundle-item-price {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.2);
  text-decoration: line-through;
  flex-shrink: 0;
}

.bundle-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 16px 0 12px;
}

.bundle-total-row,
.bundle-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.bundle-savings-badge {
  background: rgba(80, 200, 120, 0.07);
  border: 1px solid rgba(80, 200, 120, 0.18);
  border-radius: 2px;
  padding: 4px 12px;
  font-size: 10px;
  letter-spacing: 0.08em;
  color: rgba(120, 220, 150, 0.65);
  display: inline-block;
  margin: 12px 0;
}

.bundle-cta-btn {
  width: 100%;
  padding: 16px;
  background: rgba(201, 168, 76, 0.12);
  border: 1px solid rgba(201, 168, 76, 0.4);
  border-radius: 4px;
  font-size: 13px;
  font-weight: 400;
  letter-spacing: 0.08em;
  color: rgba(201, 168, 76, 0.9);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.22s;
  margin-top: 4px;
}

.bundle-cta-btn:hover:not(:disabled) {
  background: rgba(201, 168, 76, 0.2);
  border-color: rgba(201, 168, 76, 0.65);
  box-shadow: 0 0 24px rgba(201, 168, 76, 0.08);
}

.bundle-cta-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.bundle-cta-note {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.15);
  margin-top: 8px;
  margin-bottom: 0;
}

/* ── Birth Chart Display Section ── */
.birth-chart-section {
  margin-bottom: 28px;
  padding: 24px;
  background: rgba(201, 168, 76, 0.03);
  border: 1px solid rgba(201, 168, 76, 0.15);
  border-radius: 6px;
  border-top: 2px solid rgba(201, 168, 76, 0.4);
}

.birth-chart-eyebrow {
  font-size: 9px;
  letter-spacing: 0.18em;
  color: rgba(201, 168, 76, 0.5);
  margin: 0 0 6px;
  text-transform: uppercase;
}

.birth-chart-section-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px;
  font-weight: 300;
  color: rgba(237, 232, 255, 0.92);
  margin: 0 0 20px;
  line-height: 1.2;
}

.birth-chart-signs-row {
  display: flex;
  margin-bottom: 20px;
  border: 1px solid rgba(201, 168, 76, 0.12);
  border-radius: 4px;
  overflow: hidden;
}

.birth-chart-sign-cell {
  flex: 1;
  padding: 12px 10px;
  text-align: center;
  border-right: 1px solid rgba(201, 168, 76, 0.1);
}

.birth-chart-sign-cell:last-child {
  border-right: none;
}

.birth-chart-sign-label {
  font-size: 8px;
  letter-spacing: 0.15em;
  color: rgba(201, 168, 76, 0.45);
  margin: 0 0 4px;
  text-transform: uppercase;
}

.birth-chart-sign-value {
  font-family: 'Cormorant Garamond', serif;
  font-size: 15px;
  font-weight: 400;
  color: rgba(237, 232, 255, 0.85);
  margin: 0;
}

.birth-chart-reading {
  font-size: 14px;
  line-height: 1.72;
  color: rgba(255, 255, 255, 0.55);
  margin: 0 0 20px;
}

.birth-chart-forecast-box {
  padding: 14px 16px;
  background: rgba(201, 168, 76, 0.04);
  border-left: 2px solid rgba(201, 168, 76, 0.3);
}

.birth-chart-forecast-label {
  font-size: 8px;
  letter-spacing: 0.18em;
  color: rgba(201, 168, 76, 0.5);
  margin: 0 0 6px;
  text-transform: uppercase;
}

.birth-chart-forecast-text {
  font-size: 13px;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  font-style: italic;
}

/* ── Tradition Switcher ── */
.tradition-switcher {
  margin: 0 0 40px;
  padding: 20px 20px 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.015);
}

.tradition-switcher-label {
  font-size: 9px;
  letter-spacing: 0.18em;
  color: rgba(201, 168, 76, 0.55);
  margin: 0 0 4px;
  text-transform: uppercase;
}

.tradition-switcher-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  margin: 0 0 16px;
}

.tradition-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.tradition-opt-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 11px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  text-align: left;
  color: rgba(255, 255, 255, 0.6);
}

.tradition-opt-btn:hover:not(:disabled) {
  border-color: rgba(201, 168, 76, 0.3);
  background: rgba(201, 168, 76, 0.04);
  color: rgba(255, 255, 255, 0.85);
}

.tradition-opt-btn:disabled {
  cursor: default;
}

.tradition-opt-active {
  border-color: rgba(201, 168, 76, 0.4) !important;
  background: rgba(201, 168, 76, 0.06) !important;
  color: rgba(255, 255, 255, 0.85) !important;
}

.tradition-opt-unlocked:not(.tradition-opt-active) {
  border-color: rgba(80, 200, 120, 0.2);
}

.tradition-opt-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.tradition-opt-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.tradition-opt-name {
  font-size: 13px;
  font-weight: 500;
}

.tradition-opt-sub {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.28);
  letter-spacing: 0.02em;
}

.tradition-opt-active .tradition-opt-sub {
  color: rgba(201, 168, 76, 0.5);
}

.tradition-opt-tag {
  font-size: 9px;
  letter-spacing: 0.1em;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
  flex-shrink: 0;
  text-transform: uppercase;
}

.tradition-opt-tag--active {
  background: rgba(201, 168, 76, 0.12);
  color: rgba(201, 168, 76, 0.8);
}

.tradition-opt-tag--free {
  background: rgba(80, 200, 120, 0.1);
  color: rgba(80, 200, 120, 0.8);
}

.tradition-opt-tag--paid {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.4);
}

.tradition-loading {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 24px;
  border: 1px solid rgba(201, 168, 76, 0.12);
  border-radius: 16px;
  margin: 0 0 40px;
  background: rgba(201, 168, 76, 0.03);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.tradition-loading-ring {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(201, 168, 76, 0.2);
  border-top-color: rgba(201, 168, 76, 0.8);
  border-radius: 50%;
  flex-shrink: 0;
  animation: spin 0.9s linear infinite;
}

.tradition-loading-text {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

.tradition-success-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  border: 1px solid rgba(80, 200, 120, 0.2);
  border-radius: 12px;
  margin: 0 0 40px;
  background: rgba(80, 200, 120, 0.04);
}

.tradition-success-icon {
  font-size: 16px;
  color: rgba(201, 168, 76, 0.8);
}

.tradition-success-text {
  font-size: 13px;
  color: rgba(80, 200, 120, 0.8);
  margin: 0;
}
</style>
