<template>
  <!-- ── Loading state ── -->
  <div v-if="isLoadingReport" class="report-loading-page">
    <div class="report-loading-content">
      <p class="rload-eyebrow label-caps">Omenora</p>
      <p class="rload-msg font-serif-italic">{{ t('craftingReport') }}</p>
      <div class="rload-track">
        <div class="rload-fill" />
      </div>
    </div>

    <!-- Impulse upsell during load -->
    <div v-if="showAddon" class="addon-offer-box">
      <span class="addon-badge label-caps">{{ t('oneTimeOffer') }}</span>
      <p class="addon-title font-serif-italic">{{ t('addCompatibility') }}</p>
      <p class="addon-desc annotation">{{ t('onlyWhileLoading') }}</p>
      <div class="addon-price-row">
        <span class="addon-original">$2.99</span>
        <span class="addon-price">$0.99</span>
        <span class="addon-note annotation">{{ t('todayOnly') }}</span>
      </div>
      <input
        id="addon-partner-name"
        v-model="addonPartnerName"
        type="text"
        name="addon-partner-name"
        :placeholder="t('addonPartnerPlaceholder')"
        class="addon-input editorial-input"
        autocomplete="off"
      >
      <div class="addon-dob-row">
        <input id="addon-birth-day" v-model="addonBirthDay" type="number" name="addon-birth-day" placeholder="DD" min="1" max="31" class="addon-input editorial-input addon-dob addon-day" autocomplete="off">
        <input id="addon-birth-month" v-model="addonBirthMonth" type="number" name="addon-birth-month" placeholder="MM" min="1" max="12" class="addon-input editorial-input addon-dob addon-day" autocomplete="off">
        <input id="addon-birth-year" v-model="addonBirthYear" type="number" name="addon-birth-year" placeholder="YYYY" min="1924" max="2010" class="addon-input editorial-input addon-dob addon-year" autocomplete="off">
      </div>
      <button
        :disabled="!addonPartnerName || !addonBirthYear || isProcessingAddon"
        class="addon-yes-btn"
        @click="handleAddonPurchase"
      >
        {{ isProcessingAddon ? t('processingPayment') : t('yesAdd') }}
      </button>
      <p class="addon-no-link annotation" @click="showAddon = false">{{ t('noThanks') }}</p>
    </div>
  </div>

  <!-- ── Error state ── -->
  <div v-else-if="hasError" class="report-state-page">
    <div class="report-state-inner">
      <p class="label-caps report-state__eyebrow">Something went wrong</p>
      <h2 class="report-state__heading font-display-italic">{{ t('reportErrorMsg') }}</h2>
      <p class="annotation report-state__sub">{{ t('reportErrorEmail') }}</p>
      <div class="report-state__actions">
        <button class="report-state-btn" @click="reloadPage">{{ t('tryAgain') }}</button>
        <p class="annotation">
          {{ t('needHelp') }}
          <a href="mailto:support@omenora.com" class="report-state-link">support@omenora.com</a>
        </p>
      </div>
    </div>
  </div>

  <!-- ── No report recovered ── -->
  <div v-else-if="!store.report" class="report-state-page">
    <div class="report-state-inner">
      <PhoenixLoader :size="88" class="report-state__phoenix" />
      <p class="label-caps report-state__eyebrow">Forecast complete</p>
      <h2 class="report-state__heading font-display-italic">{{ t('reportReady') }}</h2>
      <p class="annotation report-state__sub">{{ t('checkEmail') }}</p>
    </div>
  </div>

  <!-- ── Full report ── -->
  <div v-else class="report-page">

    <!-- Payment confirmation banner -->
    <Transition name="banner-fade">
      <div v-if="showPaymentBanner" class="payment-banner">
        <span class="payment-banner__text annotation">
          ❆ Your complete forecast has been sent to {{ store.email }}
        </span>
        <button class="payment-banner__dismiss" aria-label="Dismiss" @click="showPaymentBanner = false">×</button>
      </div>
    </Transition>

    <!-- App header with PDF export -->
    <AppHeader>
      <template #action>
        <div class="report-header-actions">
          <NuxtLink to="/account" class="report-account-link label-caps">My Account</NuxtLink>
          <button
            v-if="canExport"
            class="label-caps report-export-btn"
            :disabled="isDownloadingPDF"
            @click="downloadReportPDF"
          >
            {{ isDownloadingPDF ? 'Generating…' : '↓ Save PDF' }}
          </button>
        </div>
      </template>
    </AppHeader>

    <!-- ── MASTHEAD ── -->
    <section class="report-masthead">
      <div class="report-masthead__inner">

        <p class="label-caps report-masthead__eyebrow">
          Complete Natal Forecast · {{ store.firstName }}
        </p>

        <h1 class="report-masthead__name font-display-italic">
          {{ store.report.archetypeName }}
        </h1>

        <div v-if="archetypeFile" class="report-masthead__symbol">
          <img
            :src="`/symbols/${archetypeFile}`"
            :alt="store.report.archetypeName"
            class="symbol-editorial"
          >
        </div>

        <!-- Planet cells row -->
        <div class="report-masthead__planets">
          <div v-for="p in keyPlanets" :key="p.label" class="planet-cell">
            <img :src="`/symbols/${p.sign}.svg`" :alt="p.sign" class="planet-cell__zodiac" aria-hidden="true" />
            <span class="planet-cell__sign annotation">{{ p.sign }}</span>
            <span class="planet-cell__label annotation">{{ p.label }}</span>
          </div>
        </div>

        <div class="editorial-rule" />

        <!-- Meta strip -->
        <div class="report-masthead__meta">
          <span class="annotation">{{ store.dateOfBirth }}</span>
          <span class="annotation" style="opacity:0.3">·</span>
          <span class="annotation">{{ store.city }}</span>
          <span class="annotation" style="opacity:0.3">·</span>
          <span class="annotation">Life Path {{ store.lifePathNumber }}</span>
          <span class="annotation" style="opacity:0.3">·</span>
          <span class="annotation">{{ store.report.element }}</span>
        </div>

        <!-- Power traits -->
        <div class="report-masthead__traits">
          <span v-for="trait in store.report.powerTraits" :key="trait" class="report-trait">
            {{ trait }}
          </span>
        </div>

      </div>
    </section>

    <!-- Bundle/Oracle unlock confirmation -->
    <div v-if="store.bundlePurchased || store.oraclePurchased" class="unlock-notice">
      <span class="unlock-notice__icon">✦</span>
      <div>
        <p class="label-caps unlock-notice__title">
          {{ store.oraclePurchased ? t('oracleUnlocked') : t('bundleUnlocked') }}
        </p>
        <p class="annotation unlock-notice__desc">
          {{ store.oraclePurchased ? t('oracleDesc') : t('bundleDesc') }}
        </p>
      </div>
    </div>

    <!-- ── BIRTH CHART (oracle/purchased buyers) ── -->
    <!-- Generated data display -->
    <section v-if="store.birthChartData" class="report-section birth-chart-section">
      <div class="report-section__header">
        <span class="annotation report-section__num">✦</span>
        <div>
          <p class="label-caps report-section__tradition">{{ t('fullBirthChart') }}</p>
          <h2 class="report-section__heading font-serif">{{ store.birthChartData.chartTitle }}</h2>
        </div>
      </div>
      <div class="editorial-rule" />
      <div class="report-section__body">
        <div class="birth-chart-signs-grid">
          <div class="bc-sign-cell">
            <p class="label-caps bc-sign-cell__label">{{ t('risingLabel') }}</p>
            <p class="bc-sign-cell__value font-serif">{{ store.birthChartData.risingSign }}</p>
          </div>
          <div class="bc-sign-cell">
            <p class="label-caps bc-sign-cell__label">{{ t('sunLabel') }}</p>
            <p class="bc-sign-cell__value font-serif">{{ store.birthChartData.sunSign }}</p>
          </div>
          <div class="bc-sign-cell">
            <p class="label-caps bc-sign-cell__label">{{ t('moonLabel') }}</p>
            <p class="bc-sign-cell__value font-serif">{{ store.birthChartData.moonSign }}</p>
          </div>
          <div class="bc-sign-cell">
            <p class="label-caps bc-sign-cell__label">{{ t('planetLabel') }}</p>
            <p class="bc-sign-cell__value font-serif">{{ store.birthChartData.dominantPlanet }}</p>
          </div>
          <div class="bc-sign-cell">
            <p class="label-caps bc-sign-cell__label">Power House</p>
            <p class="bc-sign-cell__value font-serif">{{ store.birthChartData.powerHouse }}</p>
          </div>
        </div>
        <p class="report-section__para">{{ store.birthChartData.reading }}</p>
        <div class="bc-forecast-box">
          <p class="label-caps bc-forecast-box__label">{{ t('planetaryForecast') }}</p>
          <p class="bc-forecast-box__text font-serif-italic">{{ store.birthChartData.forecast2026 }}</p>
        </div>
      </div>
    </section>

    <!-- Birth chart: oracle/purchased — generate button -->
    <div v-else-if="(store.oraclePurchased || store.birthChartPurchased) && store.timeOfBirth" class="upsell-inline upsell-inline--active">
      <div class="upsell-inline__info">
        <p class="label-caps upsell-inline__title">✦ {{ store.oraclePurchased ? t('birthChartIncluded') : t('birthChartUnlockedLabel') }}</p>
        <p class="annotation upsell-inline__desc">{{ store.oraclePurchased ? t('birthChartPositionsIncluded') : t('birthChartPositionsUnlocked') }}</p>
      </div>
      <button class="upsell-inline__btn" :disabled="isLoadingBirthChart" @click="buyBirthChart">
        {{ isLoadingBirthChart ? t('generatingBirthChart') : t('generateBirthChart') }}
      </button>
    </div>

    <!-- Birth chart: has time of birth, not yet purchased -->
    <div v-else-if="store.timeOfBirth" class="upsell-inline upsell-inline--active">
      <div class="upsell-inline__info">
        <p class="label-caps upsell-inline__title">{{ t('birthChartReady') }}</p>
        <p class="annotation upsell-inline__desc">{{ t('birthChartPrice') }}</p>
      </div>
      <button class="upsell-inline__btn" :disabled="isLoadingBirthChart" @click="buyBirthChart">
        {{ isLoadingBirthChart ? t('loadingBirthChart') : t('unlockBirthChart') }}
      </button>
    </div>

    <!-- Birth chart: no time of birth -->
    <div v-else class="upsell-inline upsell-inline--active">
      <div class="upsell-inline__info">
        <p class="label-caps upsell-inline__title">{{ t('birthChartUnlockedLabel') }}</p>
        <p class="annotation upsell-inline__desc">{{ t('birthChartRequiresTime') }}</p>
      </div>
      <button class="upsell-inline__btn" :disabled="isLoadingBirthChart" @click="buyBirthChart">
        {{ isLoadingBirthChart ? t('loadingBirthChart') : '$2.99 — Unlock' }}
      </button>
    </div>

    <!-- ── CORE REPORT SECTIONS ── -->
    <div class="report-body">
      <article
        v-for="(key, idx) in SECTION_ORDER"
        :key="key"
        class="report-section"
        :id="`section-${key}`"
      >
        <div class="report-section__header">
          <span class="annotation report-section__num">{{ String(idx + 1).padStart(2, '0') }}</span>
          <div>
            <p class="label-caps report-section__tradition">
              {{ sectionTraditionLabel(key) }}
            </p>
            <h2 class="report-section__heading font-serif">
              {{ store.report.sections[key].title }}
            </h2>
          </div>
        </div>
        <div class="editorial-rule" />
        <div class="report-section__body">
          <div v-if="key === 'affirmation'" class="affirmation-block">
            <p class="affirmation-block__text font-serif-italic">
              {{ store.report.sections[key].content }}
            </p>
          </div>
          <p v-else class="report-section__para">{{ store.report.sections[key].content }}</p>
        </div>
      </article>
    </div>

    <!-- ── REGIONAL SECTIONS ── -->

    <!-- Vedic (India) -->
    <section v-if="store.region === 'india' && vedicData" class="report-section regional-section">
      <div class="report-section__header">
        <img src="/symbols/Life Path Number copy.svg" alt="" class="report-section__tradition-symbol" aria-hidden="true" />
        <div>
          <p class="label-caps report-section__tradition">{{ t('vedicReadingLabel') }}</p>
          <h2 class="report-section__heading font-serif">{{ vedicData.vedicTitle }}</h2>
        </div>
      </div>
      <div class="editorial-rule" />
      <div class="report-section__body">
        <div class="regional-pills">
          <div class="regional-pill">
            <p class="label-caps regional-pill__label">{{ t('nakshatraLabel') }}</p>
            <p class="regional-pill__value font-serif">{{ vedicData.nakshatraName }}</p>
          </div>
          <div class="regional-pill">
            <p class="label-caps regional-pill__label">{{ t('rulingPlanetLabel') }}</p>
            <p class="regional-pill__value font-serif">{{ vedicData.rulingPlanet }}</p>
          </div>
        </div>
        <p class="report-section__para">{{ vedicData.reading }}</p>
        <div class="regional-highlight">
          <p class="label-caps regional-highlight__label">{{ t('karmicMissionLabel') }}</p>
          <p class="regional-highlight__text font-serif-italic">{{ vedicData.karmicMission }}</p>
        </div>
        <div class="regional-tags">
          <span class="annotation regional-tags__label">{{ t('practice2026') }}</span>
          <span class="regional-tag">{{ vedicData.remedy }}</span>
        </div>
      </div>
    </section>

    <!-- BaZi (China) -->
    <section v-if="store.region === 'china' && baziData" class="report-section regional-section">
      <div class="report-section__header">
        <img src="/symbols/Destiny Forecast copy.svg" alt="" class="report-section__tradition-symbol" aria-hidden="true" />
        <div>
          <p class="label-caps report-section__tradition">{{ t('baziReadingLabel') }}</p>
          <h2 class="report-section__heading font-serif">{{ baziData.baziTitle }}</h2>
        </div>
      </div>
      <div class="editorial-rule" />
      <div class="report-section__body">
        <div class="regional-pills">
          <div class="regional-pill">
            <p class="label-caps regional-pill__label">{{ t('dayMasterLabel') }}</p>
            <p class="regional-pill__value font-serif">{{ baziData.dayMaster }}</p>
          </div>
          <div class="regional-pill">
            <p class="label-caps regional-pill__label">{{ t('dominantElementLabel') }}</p>
            <p class="regional-pill__value font-serif">{{ baziData.dominantElement }}</p>
          </div>
        </div>
        <p class="report-section__para">{{ baziData.reading }}</p>
        <div class="regional-highlight">
          <p class="label-caps regional-highlight__label">{{ t('wealthLuck2026') }}</p>
          <p class="regional-highlight__text font-serif-italic">{{ baziData.wealthLuck2026 }}</p>
        </div>
        <div class="regional-tags">
          <span class="annotation regional-tags__label">{{ t('luckyDirections') }}</span>
          <span v-for="dir in baziData.luckyDirections" :key="dir" class="regional-tag">{{ dir }}</span>
        </div>
      </div>
    </section>

    <!-- Tarot / LatAm -->
    <section v-if="(store.region === 'latam' || store.region === 'tarot') && tarotData" class="report-section regional-section">
      <div class="report-section__header">
        <img src="/symbols/Love & Relationship Patterns copy.svg" alt="" class="report-section__tradition-symbol" aria-hidden="true" />
        <div>
          <p class="label-caps report-section__tradition">{{ t('tarotReadingLabel') }}</p>
          <h2 class="report-section__heading font-serif">{{ tarotData.soulCard }}</h2>
        </div>
      </div>
      <div class="editorial-rule" />
      <div class="report-section__body">
        <div class="regional-highlight regional-highlight--center">
          <p class="regional-highlight__text font-serif-italic">{{ tarotData.soulCardMeaning }}</p>
        </div>
        <p class="report-section__para">{{ tarotData.reading }}</p>
        <div class="regional-highlight">
          <p class="label-caps regional-highlight__label">{{ t('loveDstiny') }}</p>
          <p class="regional-highlight__text font-serif-italic">{{ tarotData.loveMessage }}</p>
        </div>
        <div class="regional-highlight regional-highlight--center">
          <p class="label-caps regional-highlight__label">{{ t('blessingLabel') }}</p>
          <p class="regional-highlight__text font-serif-italic">{{ tarotData.blessing }}</p>
        </div>
        <div class="regional-tags">
          <span class="annotation regional-tags__label">{{ t('protectiveCharm') }}</span>
          <span class="regional-tag">{{ tarotData.luckyCharm }}</span>
        </div>
      </div>
    </section>

    <!-- Regional loading -->
    <div v-if="isLoadingRegional" class="regional-loading">
      <p class="annotation regional-loading__text">
        {{ store.region === 'india' ? t('loadingVedic') : store.region === 'china' ? t('loadingBazi') : t('loadingSpiritual') }}
      </p>
    </div>

    <!-- ── TRADITION SWITCHER ── -->
    <section v-if="store.report && !isSwitchingTradition && !isSwitchComplete" class="tradition-switcher">
      <div class="tradition-switcher__header">
        <p class="label-caps tradition-switcher__label">{{ t('traditionSwitcherLabel') }}</p>
        <p class="annotation tradition-switcher__sub">
          {{ store.oraclePurchased ? t('traditionSwitcherSubOracle') : t('traditionSwitcherSubPaid') }}
        </p>
      </div>
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
          <span class="tradition-opt-num annotation">{{ opt.num }}</span>
          <img :src="opt.symbol" :alt="opt.label" class="tradition-opt-symbol" aria-hidden="true" />
          <span class="tradition-opt-text">
            <span class="tradition-opt-name font-serif">{{ opt.label }}</span>
            <span class="annotation tradition-opt-sub">{{ opt.sub }}</span>
          </span>
          <span v-if="store.region === opt.value" class="tradition-opt-tag tradition-opt-tag--active label-caps">{{ t('currentLabel') }}</span>
          <span v-else-if="store.oraclePurchased || isTraditionUnlocked(opt.value)" class="tradition-opt-tag tradition-opt-tag--free label-caps">{{ t('freeLabel') }}</span>
          <span v-else class="tradition-opt-tag tradition-opt-tag--paid label-caps">$2.99</span>
        </button>
      </div>
    </section>

    <!-- Tradition switching state -->
    <div v-if="isSwitchingTradition" class="tradition-loading">
      <div class="tradition-loading__ring" />
      <p class="annotation tradition-loading__text">{{ t('traditionGenerating').replace('{tradition}', switchingTraditionLabel) }}</p>
    </div>

    <!-- Tradition switch success -->
    <div v-if="isSwitchComplete" class="tradition-success">
      <span class="tradition-success__icon">✦</span>
      <p class="label-caps tradition-success__text">{{ t('traditionUnlocked').replace('{tradition}', switchedTraditionLabel) }}</p>
    </div>

    <!-- ── DESTINY CALENDAR (bundle/oracle) ── -->
    <section v-if="(store.bundlePurchased || store.oraclePurchased) && store.calendarData" class="report-section calendar-section">
      <div class="report-section__header">
        <span class="annotation report-section__num">◈</span>
        <div>
          <p class="label-caps report-section__tradition">YOUR 2026 DESTINY CALENDAR</p>
          <h2 class="report-section__heading font-serif">{{ store.calendarData.overallTheme }}</h2>
        </div>
      </div>
      <div class="editorial-rule" />
      <div class="report-section__body">
        <div class="calendar-peaks">
          <span v-for="m in store.calendarData.peakMonths" :key="m" class="cal-peak-chip label-caps">{{ m }} ★</span>
          <span v-for="m in store.calendarData.cautionMonths" :key="m" class="cal-caution-chip label-caps">{{ m }} ⚠</span>
        </div>
        <div class="calendar-months">
          <div
            v-for="month in visibleCalendarMonths"
            :key="month.month"
            class="month-card"
            :style="{ borderLeftColor: month.color || 'var(--color-gold)' }"
          >
            <div class="month-card__header">
              <div>
                <p class="month-card__name">{{ month.month }}</p>
                <p class="annotation month-card__theme">{{ month.theme }}</p>
              </div>
              <div class="month-card__energy">
                <span class="annotation month-card__energy-label">Energy</span>
                <div class="month-card__energy-track">
                  <div class="month-card__energy-fill" :style="{ width: month.energyLevel + '%', background: month.color || 'var(--color-gold)' }" />
                </div>
              </div>
            </div>
            <div class="month-card__insights">
              <p class="month-card__insight annotation"><HoroscopeSymbol type="love" :size="14" class="month-card__icon" /> {{ month.love }}</p>
              <p class="month-card__insight annotation"><HoroscopeSymbol type="work" :size="14" class="month-card__icon" /> {{ month.money }}</p>
              <p class="month-card__insight annotation"><HoroscopeSymbol type="health" :size="14" class="month-card__icon" /> {{ month.career }}</p>
              <p v-if="month.warning" class="month-card__warning annotation">⚠ {{ month.warning }}</p>
            </div>
            <p class="annotation month-card__lucky">{{ t('luckyDays') }} {{ month.luckyDays?.join(', ') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Calendar generating -->
    <div v-if="(store.bundlePurchased || store.oraclePurchased) && !store.calendarData && isGeneratingCalendar" class="regional-loading">
      <p class="annotation regional-loading__text">{{ t('generatingCalendar') }}</p>
    </div>

    <!-- ── COMPATIBILITY (bundle/oracle) ── -->
    <section v-if="store.bundlePurchased || store.oraclePurchased" class="report-section compat-free-section">
      <div class="report-section__header">
        <span class="annotation report-section__num">◎</span>
        <div>
          <p class="label-caps report-section__tradition">{{ t('compatReadingLabel') }}</p>
          <h2 class="report-section__heading font-serif">{{ t('compatIncluded') }}</h2>
        </div>
      </div>
      <div class="editorial-rule" />
      <div class="report-section__body">
        <p class="annotation report-section__para">{{ t('compatEnterDetails') }}</p>

        <!-- Result -->
        <div v-if="bundleCompatibilityResult" class="compat-result">
          <div class="compat-result__score-block">
            <p class="label-caps compat-result__score-label">{{ t('compatScore') }}</p>
            <p class="compat-result__score font-serif">{{ bundleCompatibilityResult.compatibilityScore }}%</p>
            <p class="annotation compat-result__title">{{ bundleCompatibilityResult.compatibilityTitle }}</p>
          </div>
          <div v-for="(section, key) in bundleCompatibilityResult.sections" :key="key" class="compat-result__section">
            <p class="label-caps compat-result__section-title">{{ section.title }}</p>
            <p class="report-section__para">{{ section.content }}</p>
          </div>
        </div>

        <!-- Form -->
        <div v-else class="compat-form">
          <input id="compat-partner-name" v-model="partnerName" type="text" name="compat-partner-name" :placeholder="t('addonPartnerPlaceholder')" class="editorial-input compat-input" autocomplete="off">
          <input id="compat-partner-dob" v-model="partnerDob" type="date" name="compat-partner-dob" class="editorial-input compat-input compat-input--date" autocomplete="off">
          <input id="compat-partner-city" v-model="partnerCity" type="text" name="compat-partner-city" :placeholder="t('partnerCityPlaceholder')" class="editorial-input compat-input" autocomplete="off">
          <button
            class="compat-submit-btn"
            :disabled="!partnerName || !partnerDob || isGeneratingCompatibility"
            @click="generateCompatibilityFree"
          >
            {{ isGeneratingCompatibility ? t('generating') : t('generateCompatFree') }}
          </button>
        </div>
      </div>
    </section>

    <!-- ── UPSELLS (basic report buyers only) ── -->

    <!-- Bundle upsell -->
    <section v-if="!store.bundlePurchased && !store.oraclePurchased" class="upsell-section">
      <div class="editorial-rule" />
      <div class="upsell-section__inner">
        <p class="label-caps upsell-section__eyebrow">Go deeper</p>
        <h3 class="upsell-section__heading font-serif-italic">{{ t('wantDeeper') }}</h3>
        <p class="annotation upsell-section__sub">{{ t('unlockComplete') }}</p>
        <div class="upsell-items">
          <div class="upsell-item">
            <div class="upsell-item__info">
              <p class="upsell-item__name">2026 Lucky Calendar</p>
              <p class="annotation upsell-item__desc">Month-by-month lucky timing</p>
            </div>
            <span class="upsell-item__price font-serif">$2.99</span>
          </div>
          <div class="upsell-item">
            <div class="upsell-item__info">
              <p class="upsell-item__name">Compatibility Forecast</p>
              <p class="annotation upsell-item__desc">Discover your destiny match</p>
            </div>
            <span class="upsell-item__price font-serif">$2.99</span>
          </div>
          <div class="upsell-item">
            <div class="upsell-item__info">
              <p class="upsell-item__name">Full Birth Chart</p>
              <p class="annotation upsell-item__desc">Sun, Moon + Rising sign analysis</p>
            </div>
            <span class="upsell-item__price font-serif">$3.99</span>
          </div>
        </div>
        <div class="upsell-section__rule" />
        <div class="upsell-section__total-row">
          <span class="annotation">{{ t('individualTotal') }}</span>
          <span class="annotation upsell-section__strike">$9.97</span>
        </div>
        <div class="upsell-section__price-row">
          <span class="annotation">{{ t('yourBundlePrice') }}</span>
          <span class="upsell-section__price font-serif">$5.99</span>
        </div>
        <button class="upsell-cta-btn" :disabled="isLoadingBundle" @click="buyBundle">
          {{ isLoadingBundle ? 'Loading...' : t('unlockBundle') }}
        </button>
        <p class="annotation upsell-section__note">{{ t('oneTimePurchase') }}</p>
      </div>
      <div class="editorial-rule" />
    </section>

    <!-- Calendar upsell -->
    <section v-if="!store.calendarPurchased && !store.bundlePurchased && !store.oraclePurchased" class="upsell-section">
      <div class="upsell-section__inner">
        <div class="upsell-section__header-row">
          <div>
            <p class="label-caps upsell-section__eyebrow">Timing</p>
            <h3 class="upsell-section__heading font-serif-italic">Your 2026 Lucky Timing Calendar</h3>
            <p class="annotation upsell-section__sub">Month-by-month destiny forecast</p>
          </div>
          <span class="upsell-section__price font-serif">$2.99</span>
        </div>
        <div class="upsell-features">
          <p class="annotation upsell-feature">Peak months for love &amp; money</p>
          <p class="annotation upsell-feature">Monthly lucky days highlighted</p>
          <p class="annotation upsell-feature">Career &amp; purpose windows</p>
          <p class="annotation upsell-feature">Caution periods to navigate</p>
        </div>
        <div class="cal-preview">
          <div class="cal-bar-row">
            <span class="annotation cal-bar-label">January</span>
            <div class="cal-bar-track"><div class="cal-bar-fill" style="width:65%" /></div>
          </div>
          <div class="cal-bar-row">
            <span class="annotation cal-bar-label">April</span>
            <div class="cal-bar-track"><div class="cal-bar-fill" style="width:90%;opacity:0.9" /></div>
          </div>
          <div class="cal-bar-row">
            <span class="annotation cal-bar-label">July</span>
            <div class="cal-bar-track"><div class="cal-bar-fill" style="width:45%;opacity:0.5" /></div>
          </div>
        </div>
        <button class="upsell-cta-btn" :disabled="isLoadingCalendar" @click="buyCalendar">
          {{ isLoadingCalendar ? 'Processing...' : 'Unlock My 2026 Calendar →' }}
        </button>
        <p class="annotation upsell-section__note">One-time purchase · Instant access</p>
      </div>
    </section>

    <!-- Subscription upsell -->
    <section v-if="store.report && !store.subscriptionActive && !store.oraclePurchased" class="upsell-section upsell-section--sub">
      <div class="editorial-rule" />
      <div class="upsell-section__inner">
        <div class="upsell-section__header-row">
          <div>
            <p class="label-caps upsell-section__eyebrow">Daily</p>
            <h3 class="upsell-section__heading font-serif-italic">Personal Daily Horoscope</h3>
            <p class="annotation upsell-section__sub">Your natal chart read every morning</p>
          </div>
          <span class="upsell-section__price font-serif">$4.99<span class="upsell-section__price-period">/mo</span></span>
        </div>
        <p class="upsell-section__hook font-serif-italic">Everything in your report — delivered fresh every single day, tailored to your chart.</p>
        <div class="upsell-features">
          <p class="annotation upsell-feature">✦ Personal daily horoscope — Love, Work &amp; Health</p>
          <p class="annotation upsell-feature">✦ Based on real planetary positions through your natal chart</p>
          <p class="annotation upsell-feature">✦ Delivered to your inbox every morning — no app needed</p>
          <p class="annotation upsell-feature">✦ Delivered every morning at 7am</p>
        </div>
        <button class="upsell-cta-btn" :disabled="isStartingSub" @click="startSubscription">
          {{ isStartingSub ? 'Loading...' : 'Start My Personal Horoscope →' }}
        </button>
        <p class="annotation upsell-section__note">Cancel anytime · No commitment</p>
      </div>
      <div class="editorial-rule" />
    </section>

    <!-- Compatibility upsell (paid) -->
    <section v-if="!store.bundlePurchased && !store.oraclePurchased" class="upsell-section compat-upsell-section">
      <div class="upsell-section__inner">
        <p class="label-caps upsell-section__eyebrow">Compatibility</p>
        <h3 class="upsell-section__heading font-serif-italic">{{ t('howCompatible') }}</h3>
        <p class="annotation upsell-section__sub">{{ t('enterDetails') }}</p>
        <div class="compat-tags">
          <span class="annotation compat-tag">{{ t('romanticPartners') }}</span>
          <span class="annotation compat-tag">{{ t('bestFriends') }}</span>
          <span class="annotation compat-tag">{{ t('businessPartners') }}</span>
        </div>

        <div v-if="!showCompatibilityForm">
          <button class="upsell-cta-btn upsell-cta-btn--secondary" @click="showCompatibilityForm = true">
            {{ t('discoverCompat') }}
          </button>
        </div>
        <div v-else class="compat-form">
          <p class="annotation compat-form__title">{{ t('compatFormTitle') }}</p>
          <p class="annotation compat-form__sub">{{ t('compatFormSubtitle') }}</p>
          <input id="compat-paid-partner-name" v-model="partnerName" type="text" name="compat-paid-partner-name" :placeholder="t('addonPartnerPlaceholder')" class="editorial-input compat-input" autocomplete="off">
          <input id="compat-paid-partner-dob" v-model="partnerDob" type="date" name="compat-paid-partner-dob" class="editorial-input compat-input compat-input--date" autocomplete="off">
          <input id="compat-paid-partner-city" v-model="partnerCity" type="text" name="compat-paid-partner-city" :placeholder="t('partnerCityPlaceholder')" class="editorial-input compat-input" autocomplete="off">
          <div class="compat-form__actions">
            <button class="upsell-cta-btn" :disabled="!partnerName || !partnerDob || isProcessingCompatibility" @click="buyCompatibilityReading">
              {{ isProcessingCompatibility ? t('processingCompatibility') : t('getCompatReading') }}
            </button>
            <button class="upsell-cta-btn upsell-cta-btn--ghost" @click="showCompatibilityForm = false">{{ t('cancelLabel') }}</button>
          </div>
        </div>
      </div>
    </section>

    <!-- ── SHARE & EXPORT ── -->
    <section class="report-section share-section">
      <div class="report-section__header">
        <span class="annotation report-section__num">◇</span>
        <div>
          <p class="label-caps report-section__tradition">Export</p>
          <h2 class="report-section__heading font-serif">{{ t('shareDestiny') }}</h2>
        </div>
      </div>
      <div class="editorial-rule" />
      <div class="report-section__body">
        <p class="annotation report-section__para">{{ t('shareDesc') }}</p>

        <!-- Share card preview -->
        <div class="share-card">
          <p class="label-caps share-card__archetype">{{ store.report.archetypeName }}</p>
          <div class="share-card__traits">
            <span v-for="trait in store.report.powerTraits" :key="trait" class="share-card__trait annotation">{{ trait }}</span>
          </div>
          <p class="annotation share-card__domain">omenora.com</p>
        </div>

        <div class="share-actions">
          <button class="share-btn" :disabled="isDownloading" @click="downloadCard">
            {{ isDownloading ? 'Downloading...' : t('downloadCard') }}
          </button>
          <button class="share-btn share-btn--primary" :disabled="isDownloadingPDF" @click="downloadReportPDF">
            {{ isDownloadingPDF ? 'Generating...' : t('downloadPDF') }}
          </button>
        </div>
        <p v-if="cardDownloadError" class="share-error annotation">{{ cardDownloadError }}</p>

        <div v-if="store.email" class="share-email-row">
          <button
            class="share-btn share-btn--email"
            :disabled="isSendingEmail || emailSentToUser"
            @click="sendReportEmailManual"
          >
            <span v-if="isSendingEmail">Sending…</span>
            <span v-else-if="emailSentToUser">✓ Report sent to {{ store.email }}</span>
            <span v-else>✉ Send Full Report to {{ store.email }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ── FOOTER CTA ── -->
    <section class="report-footer-cta">
      <div class="editorial-rule" />
      <div class="report-footer-cta__inner">
        <h2 class="font-display-italic report-footer-cta__headline">
          Your forecast is complete.
        </h2>
        <p class="report-footer-cta__body">
          Return tomorrow for your daily forecast,
          tailored to your {{ store.report.archetypeName }} archetype.
        </p>
        <div class="report-footer-cta__actions">
          <NuxtLink to="/" class="footer-cta-link">
            Back to Omenora →
          </NuxtLink>
        </div>
      </div>
      <div class="editorial-rule" />
    </section>

  </div>

  <!-- ── Crisis / legal footer ── -->
  <footer class="report-footer" role="contentinfo">
    <nav aria-label="Legal">
      <NuxtLink to="/privacy" class="report-footer-link">Privacy Policy</NuxtLink>
      <span class="report-footer-sep" aria-hidden="true">·</span>
      <NuxtLink to="/terms" class="report-footer-link">Terms of Service</NuxtLink>
    </nav>
    <p class="report-footer-crisis annotation">If you are in emotional distress, contact the Crisis Text Line: text HOME to 741741</p>
  </footer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAnalysisStore } from '~/stores/analysisStore'
import { useAuth } from '~/composables/useAuth'
import { useLanguage } from '~/composables/useLanguage'
import { getNakshatra, getVedicPlanet, getVedicElement } from '~/utils/vedic'

import { getBaziPillars, getDominantElement } from '~/utils/bazi'

const store = useAnalysisStore()
const route = useRoute()
const { provisionUser } = useAuth()
const { t } = useLanguage()
const { $trackPurchase, $trackReportViewed, $trackUpsellViewed, $trackUpsellAccepted, $trackShareCardOpened, $trackShareCardDownloaded } = useNuxtApp() as any

useSeoMeta({
  title: () => store.firstName ? `${store.firstName}'s Personality Reading — OMENORA` : 'Your Personality Reading — OMENORA',
  robots: 'noindex, nofollow',
})

const isLoadingReport = ref(true)
const hasError = ref(false)
const showPaymentBanner = ref(false)
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

const archetypeFile = computed(() => {
  const name = store.report?.archetypeName || store.archetype || ''
  if (!name) return ''
  return name.toLowerCase().replace(/^the\s+/i, '').replace(/\s+/g, '-') + '@2x.png'
})

const keyPlanets = computed(() => {
  const chart = store.natalChart
  if (!chart) return []
  return [
    { label: 'Sun',     glyph: '☉', sign: chart.sun?.sign     ?? '' },
    { label: 'Moon',    glyph: '☽', sign: chart.moon?.sign    ?? '' },
    { label: 'Mercury', glyph: '☿', sign: chart.mercury?.sign ?? '' },
    { label: 'Venus',   glyph: '♀', sign: chart.venus?.sign   ?? '' },
    { label: 'Mars',    glyph: '♂', sign: chart.mars?.sign    ?? '' },
    { label: 'Rising',  glyph: '↑', sign: chart.ascendant?.sign ?? '' },
  ].filter(p => p.sign)
})

const canExport = computed(() => !!store.report && !isLoadingReport.value)

const SECTION_TRADITIONS: Record<SectionKey, string> = {
  identity:    'Identity',
  science:     'Character',
  forecast:    'Forecast',
  love:        'Love & Relationships',
  purpose:     'Purpose',
  gift:        'Gifts & Strengths',
  affirmation: 'Affirmation',
}

function sectionTraditionLabel(key: SectionKey): string {
  return SECTION_TRADITIONS[key] ?? key
}

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
    store.setCompatibilityData(result.compatibility)
  } catch {
    console.error('Compatibility generation failed')
  } finally {
    isGeneratingCompatibility.value = false
  }
}

onMounted(async () => {
  if (store.paymentComplete) {
    showPaymentBanner.value = true
    setTimeout(() => {
      showPaymentBanner.value = false
    }, 5000)
  }

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

  if (sessionId && _isTraditionSwitch) {
    // Tradition-switch return: the dedicated onMounted below handles everything.
    // Skip normal session-based report loading to avoid clobbering store state.
    isLoadingReport.value = false
    showAddon.value = false
    return
  }

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

        const isStripeSession = sessionId.startsWith('cs_live_') || sessionId.startsWith('cs_test_')

        if (!existsData.emailSent) {
          // First load — verify Stripe payment for bundle/oracle flags.
          // Skip for temp_* / promo_* IDs (account history view) — report in DB = proof of purchase.
          let meta: Record<string, string> = {}
          if (isStripeSession) {
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
            meta = paymentData.metadata || {}
          }

          const _suppressEmail = meta.email || store.email
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
          nextTick(() => { $trackReportViewed({ archetype: store.archetype, lifePathNumber: store.lifePathNumber, language: store.language, region: store.region }) })
          if ((store.oraclePurchased || store.birthChartPurchased) && store.timeOfBirth && !store.birthChartData) {
            await generateBirthChartAuto()
          }
          await loadRegionalSection()

          if (store.bundlePurchased || store.oraclePurchased) {
            await generateBundleCalendar()
          }
        } else {
          // Email already sent — refresh detected, skip email but still verify purchase tier.
          // Skip verify-payment for non-Stripe IDs (account history view).
          if (isStripeSession) {
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
          }

          isLoadingReport.value = false
          showAddon.value = false
          nextTick(() => { $trackReportViewed({ archetype: store.archetype, lifePathNumber: store.lifePathNumber, language: store.language, region: store.region }) })
          if ((store.oraclePurchased || store.birthChartPurchased) && store.timeOfBirth && !store.birthChartData) {
            generateBirthChartAuto()
          }
          if (store.bundlePurchased || store.oraclePurchased) {
            await generateBundleCalendar()
          }
          await loadRegionalSection()
        }

        // Silently provision Supabase Auth account (non-blocking — report renders regardless).
        // Only applies to Stripe sessions — temp_* / promo_* IDs are already provisioned.
        if (isStripeSession) provisionUser({ sessionId }).catch(() => {})
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
      nextTick(() => { $trackReportViewed({ archetype: store.archetype, lifePathNumber: store.lifePathNumber, language: store.language, region: store.region }) })
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
    nextTick(() => { $trackReportViewed({ archetype: store.archetype, lifePathNumber: store.lifePathNumber, language: store.language, region: store.region }) })
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
        compatibilityData: store.compatibilityData || null,
        partnerName: store.partnerName || null,
        reportSessionId: store.reportSessionId || store.tempId || '',
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
  $trackUpsellViewed({ type: 'bundle', archetype: store.archetype, language: store.language })
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
    if (url) {
      $trackUpsellAccepted({ type: 'bundle', price: 5.99, archetype: store.archetype, language: store.language })
      window.location.href = url
    }
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
const cardDownloadError = ref('')

async function downloadCard() {
  if (isDownloading.value) return
  cardDownloadError.value = ''
  $trackShareCardOpened()
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
    $trackShareCardDownloaded()
  } catch (err) {
    console.error('Card download failed', err)
    cardDownloadError.value = 'Unable to generate image — please try again.'
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

  $trackUpsellViewed({ type: 'compatibility', archetype: store.archetype, language: store.language })
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

    if (url) {
      $trackUpsellAccepted({ type: 'compatibility', price: 0.99, archetype: store.archetype, language: store.language })
      window.location.href = url
    }
  } catch {
    console.error('Compatibility purchase failed')
    isProcessingCompatibility.value = false
  }
}

const isLoadingCalendar = ref(false)

async function buyCalendar() {
  if (isLoadingCalendar.value) return
  $trackUpsellViewed({ type: 'calendar', archetype: store.archetype, language: store.language })
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
    if (url) {
      $trackUpsellAccepted({ type: 'calendar', price: 2.99, archetype: store.archetype, language: store.language })
      window.location.href = url
    }
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
  $trackUpsellViewed({ type: 'birthChart', archetype: store.archetype, language: store.language })
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
    if (url) {
      $trackUpsellAccepted({ type: 'birthChart', price: 2.99, archetype: store.archetype, language: store.language })
      window.location.href = url
    }
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
  { value: 'western', label: t('traditionWesternName'), sub: t('traditionWesternSub'), num: '01', symbol: '/symbols/Destiny Archetype.svg' },
  { value: 'india',   label: t('traditionVedicName'),   sub: t('traditionVedicSub'),   num: '02', symbol: '/symbols/Life Path Number copy.svg' },
  { value: 'china',   label: t('traditionChineseName'), sub: t('traditionChineseSub'), num: '03', symbol: '/symbols/Destiny Forecast copy.svg' },
  { value: 'latam',   label: t('traditionTarotName'),   sub: t('traditionTarotSub'),   num: '04', symbol: '/symbols/Love & Relationship Patterns copy.svg' },
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
            reportId:     store.reportSessionId || store.tempId,
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

      if (!paymentData.paid) {
        navigateTo('/preview')
        return
      }

      const meta = paymentData.metadata ?? {}
      if (meta.type !== 'tradition_switch' || !meta.newTradition || !meta.reportId) {
        navigateTo('/')
        return
      }

      // Restore store state from Stripe metadata (lost on page reload after redirect)
      if (!store.firstName && meta.firstName)      store.firstName = meta.firstName
      if (!store.archetype && meta.archetype)      store.setArchetype(meta.archetype)
      if (!store.language && meta.language)        store.setLanguage(meta.language)
      if (meta.lifePathNumber && !store.lifePathNumber) store.lifePathNumber = Number.parseInt(meta.lifePathNumber)

      // Pre-load existing report from DB so the page has content while the switch runs
      if (!store.report) {
        try {
          const existsData = await $fetch<{
            exists: boolean
            report?: { report_data: any; first_name: string; archetype: string; life_path_number: number; region?: string }
          }>('/api/check-report-exists', {
            method: 'POST',
            body: { sessionId: meta.reportId },
          })
          if (existsData.exists && existsData.report) {
            store.setReport(existsData.report.report_data)
            if (!store.firstName)      store.firstName      = existsData.report.first_name
            if (!store.archetype)      store.setArchetype(existsData.report.archetype)
            if (!store.lifePathNumber) store.lifePathNumber = existsData.report.life_path_number
            if (!store.region && existsData.report.region) store.setRegion(existsData.report.region, store.country)
          }
        } catch {
          // Non-fatal: switch-tradition will still work without the pre-loaded report
        }
      }

      store.setReportSessionId(meta.reportId)
      isLoadingReport.value = false
      showAddon.value = false

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
            reportId:     meta.reportId,
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
      isLoadingReport.value = false
      showAddon.value = false
    } finally {
      isSwitchingTradition.value = false
    }
  })
}

const _currentMonthNumber = new Date().getMonth() + 1
const visibleCalendarMonths = computed(() => {
  const months: any[] = store.calendarData?.months ?? []
  const future = months.filter((m: any) => typeof m.number === 'number' ? m.number >= _currentMonthNumber : true)
  return future.length > 0 ? future : months
})

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
        compatibilityData: store.compatibilityData || null,
        partnerName: store.partnerName || null,
        bundlePurchased: store.bundlePurchased || store.oraclePurchased,
        birthChartData: store.birthChartData || null,
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
/* ─────────────────────────────────────────────
   REPORT PAGE — EDITORIAL DESIGN SYSTEM
   ───────────────────────────────────────────── */

/* ── Report-local design tokens — editorial bone/ink ── */
.report-page,
.report-loading-page {
  --color-paper:      var(--color-bone, #F2EBDD);
  --color-text:       var(--color-ink-mid, #3D3530);
  --color-text-dim:   var(--color-ink-faint, rgba(26,22,18,0.45));
  --color-gold:       #C9A84C;
  --color-gold-dim:   rgba(201,168,76,0.5);
  --font-display:     'Fraunces', 'Cormorant Garamond', serif;
  --font-serif:       'Cormorant Garamond', Georgia, serif;
  --font-sans:        'Hanken Grotesk', 'Inter', system-ui, sans-serif;
}

/* ── report-state-page uses global Editorial (bone) tokens ── */
.report-state-page {
  --font-display:     'Fraunces', 'Cormorant Garamond', serif;
  --font-serif:       'Cormorant Garamond', Georgia, serif;
  --font-sans:        'Inter', system-ui, sans-serif;
}

/* ── Type helpers ── */
.label-caps {
  font-family: var(--font-sans);
  font-size: 9px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-ink-faint);
}

.annotation {
  font-family: var(--font-sans);
  font-size: 11px;
  color: var(--color-text-dim);
  line-height: 1.5;
}

.font-serif {
  font-family: var(--font-serif);
  font-weight: 400;
}

.font-serif-italic {
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 300;
}

.font-display-italic {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 400;
}

/* ── Editorial rule ── */
.editorial-rule {
  width: 100%;
  height: 1px;
  background: var(--color-ink-ghost, rgba(26,22,18,0.08));
  margin: 20px 0;
}

/* ─────────────────────────────────────────────
   LOADING / STATE PAGES
   ───────────────────────────────────────────── */

.report-loading-page {
  background: var(--color-bone, #F2EBDD);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  box-sizing: border-box;
  gap: 40px;
}

.report-loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.rload-eyebrow {
  margin: 0;
  color: var(--color-ink-faint, rgba(26,22,18,0.45));
}

.rload-msg {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 16px;
  font-weight: 300;
  color: var(--color-ink-mid, #3D3530);
  margin: 0;
  text-align: center;
}

.rload-track {
  width: 120px;
  height: 1px;
  background: var(--color-ink-ghost, rgba(26,22,18,0.08));
  overflow: hidden;
}

@keyframes fillProgress {
  from { width: 0 }
  to   { width: 90% }
}

.rload-fill {
  height: 100%;
  background: linear-gradient(90deg, rgba(201,168,76,0.4), rgba(201,168,76,0.8));
  animation: fillProgress 8s ease-out forwards;
}

.report-state-page {
  background: var(--color-bone, #F2EBDD);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;
  box-sizing: border-box;
}

.report-state-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  max-width: 360px;
}

.report-state__phoenix {
  margin-bottom: 8px;
}

.report-state__eyebrow {
  margin: 0;
  color: var(--color-ink-faint, rgba(26,22,18,0.45));
}

.report-state__heading {
  margin: 0;
  font-family: 'Fraunces', serif;
  font-style: italic;
  font-size: clamp(28px, 6vw, 44px);
  font-weight: 300;
  color: var(--color-ink, #1A1612);
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.report-state__sub {
  margin: 0;
  color: var(--color-ink-mid, #3D3530);
}

.report-state__actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.report-state-btn {
  background: var(--color-ink, #1A1612);
  border: none;
  color: var(--color-bone, #F2EBDD);
  padding: 12px 28px;
  font-size: 11px;
  font-family: 'Hanken Grotesk', sans-serif;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  transition: opacity 0.2s;
}

.report-state-btn:hover {
  opacity: 0.85;
}

.report-state-link {
  color: var(--color-ink-mid, #3D3530);
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* ─────────────────────────────────────────────
   ADDON OFFER (impulse upsell during load)
   ───────────────────────────────────────────── */

.addon-offer-box {
  max-width: 340px;
  width: 100%;
  padding: 24px 20px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.07);
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-sizing: border-box;
}

.addon-badge {
  color: var(--color-gold);
  font-size: 9px;
}

.addon-title {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 18px;
  font-weight: 300;
  color: rgba(255,255,255,0.88);
  margin: 0;
}

.addon-desc {
  margin: 0;
}

.addon-price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.addon-original {
  font-size: 12px;
  color: rgba(255,255,255,0.2);
  text-decoration: line-through;
}

.addon-price {
  font-family: var(--font-serif);
  font-size: 26px;
  font-weight: 300;
  color: rgba(200,180,255,0.95);
}

.addon-note {
  margin: 0;
}

.addon-dob-row {
  display: flex;
  gap: 8px;
}

.addon-day  { flex: 1; text-align: center; }
.addon-year { flex: 1.5; }

.addon-yes-btn {
  width: 100%;
  padding: 12px;
  background: rgba(140,110,255,0.14);
  border: 1px solid rgba(140,110,255,0.3);
  color: rgba(200,180,255,0.9);
  font-size: 13px;
  font-family: var(--font-sans);
  letter-spacing: 0.06em;
  cursor: pointer;
  border-radius: 2px;
  transition: background 0.2s;
}

.addon-yes-btn:hover:not(:disabled) {
  background: rgba(140,110,255,0.22);
}

.addon-yes-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.addon-no-link {
  text-align: center;
  cursor: pointer;
  margin: 0;
  color: rgba(255,255,255,0.25);
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* ─────────────────────────────────────────────
   PAYMENT CONFIRMATION BANNER
   ───────────────────────────────────────────── */

.payment-banner {
  width: 100%;
  background: rgba(201,168,76,0.06);
  border-bottom: 1px solid rgba(201,168,76,0.16);
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-sizing: border-box;
}

.payment-banner__text {
  color: rgba(201,168,76,0.7);
}

.payment-banner__dismiss {
  background: none;
  border: none;
  color: var(--color-ink-faint, rgba(26,22,18,0.45));
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
}

.banner-fade-enter-active,
.banner-fade-leave-active {
  transition: opacity 0.4s ease;
}

.banner-fade-enter-from,
.banner-fade-leave-to {
  opacity: 0;
}

/* ─────────────────────────────────────────────
   REPORT PAGE WRAPPER
   ───────────────────────────────────────────── */

.report-page {
  background: var(--color-bone, #F2EBDD);
  min-height: 100vh;
  color: var(--color-ink, #1A1612);
  font-family: var(--font-sans);
}

/* ── Header action area ── */
.report-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.report-account-link {
  color: var(--color-ink-faint);
  text-decoration: none;
  transition: color 0.2s;
}

.report-account-link:hover {
  color: var(--color-ink, #1A1612);
}

.report-export-btn {
  background: none;
  border: 1px solid var(--color-gold-dim);
  color: var(--color-gold);
  font-family: var(--font-sans);
  font-size: 9px;
  letter-spacing: 0.16em;
  padding: 5px 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.report-export-btn:hover:not(:disabled) {
  background: rgba(201,168,76,0.07);
}

.report-export-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ─────────────────────────────────────────────
   MASTHEAD
   ───────────────────────────────────────────── */

.report-masthead {
  padding: 48px 0 0;
  text-align: center;
}

.report-masthead__inner {
  max-width: 480px;
  margin: 0 auto;
  padding: 0 24px;
}

.report-masthead__eyebrow {
  margin: 0 0 20px;
  color: var(--color-gold);
}

.report-masthead__name {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 48px;
  font-weight: 400;
  line-height: 1.1;
  color: var(--color-ink, #1A1612);
  margin: 0 0 24px;
}

.report-masthead__symbol {
  margin-bottom: 24px;
}

.symbol-editorial {
  width: 80px;
  height: 80px;
  object-fit: contain;
  opacity: 0.75;
  filter: none;
}

/* Planet cells */
.report-masthead__planets {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0;
  margin-bottom: 24px;
}

.planet-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 10px 14px;
  border-right: 1px solid var(--color-ink-ghost, rgba(26,22,18,0.08));
}

.planet-cell:last-child {
  border-right: none;
}

.planet-cell__zodiac {
  width: 18px;
  height: 18px;
  object-fit: contain;
  opacity: 0.6;
}

.planet-cell__sign {
  font-size: 11px;
  color: var(--color-ink-mid, #3D3530);
}

.planet-cell__label {
  font-size: 8px;
  letter-spacing: 0.14em;
  color: var(--color-ink-faint, rgba(26,22,18,0.45));
  text-transform: uppercase;
}

/* Meta strip & traits */
.report-masthead__meta {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px 10px;
  margin-bottom: 20px;
}

.report-masthead__traits {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  padding-bottom: 32px;
}

.report-trait {
  font-family: var(--font-sans);
  font-size: 9px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(201,168,76,0.55);
  border: 1px solid rgba(201,168,76,0.2);
  border-radius: 1px;
  padding: 4px 10px;
}

/* ─────────────────────────────────────────────
   UNLOCK NOTICE
   ───────────────────────────────────────────── */

.unlock-notice {
  max-width: 480px;
  margin: 0 auto 32px;
  padding: 12px 20px;
  background: rgba(80,200,120,0.04);
  border: 1px solid rgba(80,200,120,0.14);
  display: flex;
  align-items: center;
  gap: 12px;
}

.unlock-notice__icon {
  font-size: 14px;
  color: rgba(120,220,160,0.65);
  flex-shrink: 0;
}

.unlock-notice__title {
  margin: 0 0 2px;
  color: rgba(120,220,160,0.8);
}

.unlock-notice__desc {
  margin: 0;
}

/* ─────────────────────────────────────────────
   INLINE UPSELL (birth chart)
   ───────────────────────────────────────────── */

.upsell-inline {
  max-width: 480px;
  margin: 0 auto 24px;
  padding: 14px 20px;
  background: transparent;
  border: 1px solid var(--color-ink-ghost, rgba(26,22,18,0.08));
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.upsell-inline--active {
  background: rgba(201,168,76,0.03);
  border-color: rgba(201,168,76,0.15);
}

.upsell-inline__info {
  flex: 1;
  min-width: 160px;
}

.upsell-inline__title {
  margin: 0 0 3px;
  color: var(--color-ink, #1A1612);
}

.upsell-inline__title--dim {
  color: var(--color-ink-faint, rgba(26,22,18,0.45));
}

.upsell-inline__desc {
  margin: 0;
}

.upsell-inline__btn {
  padding: 8px 18px;
  background: rgba(201,168,76,0.08);
  border: 1px solid rgba(201,168,76,0.3);
  color: rgba(201,168,76,0.85);
  font-family: var(--font-sans);
  font-size: 11px;
  letter-spacing: 0.06em;
  cursor: pointer;
  border-radius: 1px;
  transition: background 0.2s;
  white-space: nowrap;
}

.upsell-inline__btn:hover:not(:disabled) {
  background: rgba(201,168,76,0.15);
}

.upsell-inline__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.upsell-inline__locked-badge {
  border: 1px solid var(--color-ink-ghost, rgba(26,22,18,0.08));
  padding: 4px 10px;
  border-radius: 1px;
  color: var(--color-ink-faint, rgba(26,22,18,0.45));
  flex-shrink: 0;
}

/* ─────────────────────────────────────────────
   REPORT BODY & SECTIONS
   ───────────────────────────────────────────── */

.report-body {
  max-width: 480px;
  margin: 0 auto;
  padding: 0 24px;
}

.report-section {
  padding: 32px 0;
  max-width: 480px;
  margin: 0 auto;
}

.report-section + .report-section {
  border-top: none;
}

.report-section__header {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 4px;
}

.report-section__tradition-symbol {
  width: 28px;
  height: 28px;
  object-fit: contain;
  opacity: 0.55;
  flex-shrink: 0;
  margin-top: 2px;
}

.report-section__num {
  margin: 0;
  margin-top: 2px;
  flex-shrink: 0;
  min-width: 20px;
  color: var(--color-ink-faint);
}

.report-section__tradition {
  margin: 0 0 4px;
  color: var(--color-gold);
}

.report-section__heading {
  font-family: var(--font-serif);
  font-size: 22px;
  font-weight: 400;
  color: var(--color-ink, #1A1612);
  margin: 0;
  line-height: 1.2;
}

.report-section__body {
  padding-left: 34px;
}

.report-section__para {
  font-size: 15px;
  line-height: 1.85;
  color: var(--color-text);
  font-weight: 300;
  margin: 0 0 16px;
}

.report-section__para:last-child {
  margin-bottom: 0;
}

/* ── Affirmation block ── */
.affirmation-block {
  padding: 20px 0;
  border-top: 1px solid var(--color-ink-ghost, rgba(26,22,18,0.08));
  border-bottom: 1px solid var(--color-ink-ghost, rgba(26,22,18,0.08));
}

.affirmation-block__text {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 18px;
  font-weight: 300;
  color: var(--color-ink-mid, #3D3530);
  text-align: center;
  line-height: 1.6;
  margin: 0;
}

/* ─────────────────────────────────────────────
   BIRTH CHART SECTION
   ───────────────────────────────────────────── */

.birth-chart-section {
  padding: 0 24px 32px;
}

.birth-chart-signs-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1px;
  margin-bottom: 20px;
  background: var(--color-ink-ghost, rgba(26,22,18,0.08));
}

.bc-sign-cell {
  flex: 1;
  min-width: 80px;
  padding: 12px 14px;
  background: var(--color-bone, #F2EBDD);
}

.bc-sign-cell__label {
  margin: 0 0 4px;
  color: var(--color-gold-dim);
}

.bc-sign-cell__value {
  font-family: var(--font-serif);
  font-size: 14px;
  color: var(--color-ink, #1A1612);
  margin: 0;
}

.bc-forecast-box {
  padding: 14px 16px;
  background: rgba(201,168,76,0.04);
  border-left: 2px solid var(--color-gold-dim);
  margin-top: 16px;
}

.bc-forecast-box__label {
  margin: 0 0 6px;
  color: var(--color-gold);
}

.bc-forecast-box__text {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 14px;
  color: var(--color-ink-mid, #3D3530);
  margin: 0;
  line-height: 1.7;
}

/* ─────────────────────────────────────────────
   REGIONAL SECTIONS
   ───────────────────────────────────────────── */

.regional-section {
  padding: 0 24px 32px;
}

.regional-pills {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.regional-pill {
  flex: 1;
  min-width: 100px;
  padding: 10px 14px;
  background: transparent;
  border: 1px solid var(--color-ink-ghost, rgba(26,22,18,0.08));
}

.regional-pill__label {
  margin: 0 0 4px;
  color: var(--color-gold-dim);
}

.regional-pill__value {
  font-family: var(--font-serif);
  font-size: 14px;
  color: var(--color-ink, #1A1612);
  margin: 0;
}

.regional-highlight {
  padding: 12px 16px;
  background: rgba(201,168,76,0.04);
  border-left: 2px solid var(--color-gold-dim);
  margin: 16px 0;
}

.regional-highlight--center {
  text-align: center;
  border-left: none;
  border: 1px solid var(--color-ink-ghost, rgba(26,22,18,0.08));
}

.regional-highlight__label {
  margin: 0 0 6px;
  color: var(--color-gold);
}

.regional-highlight__text {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 14px;
  color: var(--color-ink-mid, #3D3530);
  margin: 0;
  line-height: 1.7;
}

.regional-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.regional-tags__label {
  margin: 0;
  color: var(--color-ink-faint, rgba(26,22,18,0.45));
}

.regional-tag {
  font-family: var(--font-sans);
  font-size: 10px;
  letter-spacing: 0.06em;
  color: rgba(201,168,76,0.65);
  background: rgba(201,168,76,0.06);
  border: 1px solid rgba(201,168,76,0.15);
  padding: 3px 10px;
}

.regional-loading {
  max-width: 480px;
  margin: 0 auto 24px;
  padding: 20px 24px;
  text-align: center;
  border: 1px solid var(--color-ink-ghost, rgba(26,22,18,0.08));
}

.regional-loading__text {
  margin: 0;
}

/* ─────────────────────────────────────────────
   TRADITION SWITCHER
   ───────────────────────────────────────────── */

.tradition-switcher {
  max-width: 480px;
  margin: 0 auto 32px;
  padding: 0 24px;
}

.tradition-switcher__header {
  margin-bottom: 14px;
}

.tradition-switcher__label {
  margin: 0 0 4px;
  color: var(--color-gold);
}

.tradition-switcher__sub {
  margin: 0;
}

.tradition-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tradition-opt-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: transparent;
  border: 1px solid var(--color-ink-ghost, rgba(26,22,18,0.08));
  cursor: pointer;
  text-align: left;
  color: var(--color-ink-mid, #3D3530);
  font-family: var(--font-sans);
  transition: background 0.2s, border-color 0.2s;
  border-radius: 0;
  width: 100%;
}

.tradition-opt-num {
  min-width: 24px;
  color: var(--color-ink-faint, rgba(26,22,18,0.45));
  flex-shrink: 0;
}

.tradition-opt-symbol {
  width: 32px;
  height: 32px;
  object-fit: contain;
  opacity: 0.55;
  flex-shrink: 0;
  transition: opacity 0.2s;
}

.tradition-opt-btn:hover:not(:disabled) .tradition-opt-symbol,
.tradition-opt-active .tradition-opt-symbol {
  opacity: 0.85;
}

.tradition-opt-btn:hover:not(:disabled) {
  background: rgba(26,22,18,0.03);
  border-color: rgba(26,22,18,0.14);
}

.tradition-opt-btn:disabled {
  cursor: not-allowed;
}

.tradition-opt-active {
  background: rgba(201,168,76,0.04);
  border-color: rgba(201,168,76,0.22);
}

.tradition-opt-unlocked {
  border-color: rgba(80,200,120,0.15);
}



.tradition-opt-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.tradition-opt-name {
  font-size: 14px;
  color: var(--color-ink, #1A1612);
  line-height: 1.2;
}

.tradition-opt-sub {
  margin: 0;
}

.tradition-opt-tag {
  font-size: 9px;
  letter-spacing: 0.1em;
  padding: 3px 8px;
  border-radius: 1px;
  flex-shrink: 0;
}

.tradition-opt-tag--active {
  color: rgba(201,168,76,0.7);
  border: 1px solid rgba(201,168,76,0.2);
}

.tradition-opt-tag--free {
  color: rgba(120,220,160,0.7);
  border: 1px solid rgba(120,220,160,0.2);
}

.tradition-opt-tag--paid {
  color: var(--color-ink-faint, rgba(26,22,18,0.45));
  border: 1px solid var(--color-ink-ghost, rgba(26,22,18,0.08));
}

.tradition-loading {
  max-width: 480px;
  margin: 0 auto 24px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.tradition-loading__ring {
  width: 14px;
  height: 14px;
  border: 1px solid rgba(201,168,76,0.2);
  border-top-color: rgba(201,168,76,0.65);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to { transform: rotate(360deg) }
}

.tradition-loading__text {
  margin: 0;
}

.tradition-success {
  max-width: 480px;
  margin: 0 auto 24px;
  padding: 12px 20px;
  background: rgba(80,200,120,0.04);
  border: 1px solid rgba(80,200,120,0.14);
  display: flex;
  align-items: center;
  gap: 10px;
}

.tradition-success__icon {
  color: rgba(120,220,160,0.6);
  font-size: 12px;
}

.tradition-success__text {
  margin: 0;
  color: rgba(120,220,160,0.75);
}

/* ─────────────────────────────────────────────
   CALENDAR SECTION
   ───────────────────────────────────────────── */

.calendar-section {
  padding: 0 24px 32px;
}

.calendar-peaks {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
}

.cal-peak-chip {
  font-size: 9px;
  letter-spacing: 0.14em;
  color: rgba(201,168,76,0.75);
  background: rgba(201,168,76,0.06);
  border: 1px solid rgba(201,168,76,0.18);
  padding: 3px 10px;
}

.cal-caution-chip {
  font-size: 9px;
  letter-spacing: 0.14em;
  color: rgba(220,100,100,0.6);
  background: rgba(220,100,100,0.04);
  border: 1px solid rgba(220,100,100,0.14);
  padding: 3px 10px;
}

.calendar-months {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.month-card {
  padding: 16px 16px 12px;
  background: transparent;
  border: 1px solid var(--color-ink-ghost, rgba(26,22,18,0.08));
  border-left: 2px solid var(--color-gold);
}

.month-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.month-card__name {
  font-family: var(--font-serif);
  font-size: 15px;
  color: var(--color-ink, #1A1612);
  margin: 0 0 2px;
}

.month-card__theme {
  margin: 0;
}

.month-card__energy {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  min-width: 90px;
}

.month-card__energy-label {
  margin: 0;
}

.month-card__energy-track {
  width: 90px;
  height: 2px;
  background: var(--color-ink-ghost, rgba(26,22,18,0.08));
}

.month-card__energy-fill {
  height: 100%;
  background: var(--color-gold);
  transition: width 0.5s ease;
}

.month-card__insights {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
}

.month-card__insight {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin: 0;
}

.month-card__icon {
  font-size: 10px;
}

.month-card__warning {
  margin: 0;
  color: rgba(220,100,100,0.6);
}

.month-card__lucky {
  margin: 0;
  border-top: 1px solid var(--color-ink-ghost, rgba(26,22,18,0.08));
  padding-top: 8px;
}

/* ─────────────────────────────────────────────
   COMPATIBILITY SECTION (free / bundle)
   ───────────────────────────────────────────── */

.compat-free-section {
  padding: 0 24px 32px;
}

.compat-result__score-block {
  padding: 16px;
  background: rgba(140,110,255,0.04);
  border: 1px solid rgba(140,110,255,0.12);
  margin-bottom: 16px;
  text-align: center;
}

.compat-result__score-label {
  margin: 0 0 4px;
  color: rgba(140,110,255,0.6);
}

.compat-result__score {
  font-family: var(--font-serif);
  font-size: 36px;
  font-weight: 400;
  color: var(--color-ink, #1A1612);
  margin: 0;
}

.compat-result__title {
  margin: 4px 0 0;
  color: var(--color-ink-mid, #3D3530);
}

.compat-result__section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--color-ink-ghost, rgba(26,22,18,0.08));
}

.compat-result__section-title {
  margin: 0 0 8px;
  color: var(--color-gold);
}

/* Compat forms (shared) */
.compat-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.compat-form__title,
.compat-form__sub {
  margin: 0;
}

.compat-form__actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* ─────────────────────────────────────────────
   UPSELL SECTIONS
   ───────────────────────────────────────────── */

.upsell-section {
  max-width: 480px;
  margin: 0 auto;
  padding: 0 24px 32px;
}

.upsell-section__inner {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.upsell-section__eyebrow {
  margin: 0;
  color: var(--color-gold);
}

.upsell-section__heading {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 22px;
  font-weight: 300;
  color: var(--color-ink, #1A1612);
  margin: 0;
}

.upsell-section__sub {
  margin: 0;
}

.upsell-section__header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.upsell-section__hook {
  font-family: var(--font-serif);
  font-style: italic;
  font-size: 14px;
  color: var(--color-ink-mid, #3D3530);
  line-height: 1.7;
  margin: 0;
}

.upsell-section__price {
  font-family: var(--font-serif);
  font-size: 28px;
  font-weight: 400;
  color: var(--color-ink, #1A1612);
  white-space: nowrap;
}

.upsell-section__price-period {
  font-size: 14px;
  color: var(--color-ink-faint, rgba(26,22,18,0.45));
}

.upsell-section__rule {
  height: 1px;
  background: var(--color-ink-ghost, rgba(26,22,18,0.08));
}

.upsell-section__total-row,
.upsell-section__price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upsell-section__strike {
  text-decoration: line-through;
  color: var(--color-ink-faint, rgba(26,22,18,0.45));
}

.upsell-section__note {
  margin: 0;
  text-align: center;
}

.upsell-items {
  display: flex;
  flex-direction: column;
  gap: 0;
  border: 1px solid var(--color-ink-ghost, rgba(26,22,18,0.08));
}

.upsell-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid var(--color-ink-ghost, rgba(26,22,18,0.08));
}

.upsell-item:last-child {
  border-bottom: none;
}

.upsell-item__info {
  flex: 1;
}

.upsell-item__name {
  font-size: 13px;
  color: var(--color-ink, #1A1612);
  margin: 0 0 2px;
}

.upsell-item__desc {
  margin: 0;
}

.upsell-item__price {
  font-family: var(--font-serif);
  font-size: 16px;
  color: var(--color-ink-mid, #3D3530);
  flex-shrink: 0;
}

.upsell-features {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.upsell-feature {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  padding-left: 4px;
}

/* ── CTAs ── */
.upsell-cta-btn {
  width: 100%;
  padding: 14px;
  background: rgba(201,168,76,0.1);
  border: 1px solid rgba(201,168,76,0.3);
  color: rgba(201,168,76,0.9);
  font-family: var(--font-sans);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 1px;
  transition: background 0.2s;
}

.upsell-cta-btn:hover:not(:disabled) {
  background: rgba(201,168,76,0.18);
}

.upsell-cta-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.upsell-cta-btn--secondary {
  background: transparent;
  border-color: var(--color-ink-ghost, rgba(26,22,18,0.1));
  color: var(--color-ink-mid, #3D3530);
}

.upsell-cta-btn--ghost {
  background: none;
  border-color: var(--color-ink-ghost, rgba(26,22,18,0.08));
  color: var(--color-ink-faint, rgba(26,22,18,0.45));
}

/* ── Calendar bar preview ── */
.cal-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 0;
}

.cal-bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cal-bar-label {
  min-width: 52px;
  margin: 0;
}

.cal-bar-track {
  flex: 1;
  height: 2px;
  background: var(--color-ink-ghost, rgba(26,22,18,0.08));
}

.cal-bar-fill {
  height: 100%;
  background: rgba(140,110,255,0.5);
}

/* ── Compat tags ── */
.compat-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.compat-tag {
  margin: 0;
  padding: 4px 10px;
  border: 1px solid var(--color-ink-ghost, rgba(26,22,18,0.08));
  border-radius: 1px;
  color: var(--color-ink-faint, rgba(26,22,18,0.45));
}

/* ── Compat input ── */
.editorial-input,
.compat-input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 14px;
  background: transparent;
  border: 1px solid var(--color-ink-ghost, rgba(26,22,18,0.12));
  border-radius: 1px;
  color: var(--color-ink, #1A1612);
  font-size: 13px;
  font-family: var(--font-sans);
  outline: none;
  transition: border-color 0.2s;
}

.editorial-input:focus,
.compat-input:focus {
  border-color: rgba(201,168,76,0.35);
}

.compat-input--date {
  color-scheme: light;
}

.compat-submit-btn {
  width: 100%;
  padding: 12px;
  background: rgba(140,110,255,0.1);
  border: 1px solid rgba(140,110,255,0.25);
  color: rgba(200,180,255,0.85);
  font-family: var(--font-sans);
  font-size: 12px;
  letter-spacing: 0.08em;
  cursor: pointer;
  border-radius: 1px;
  transition: background 0.2s;
}

.compat-submit-btn:hover:not(:disabled) {
  background: rgba(140,110,255,0.18);
}

.compat-submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ─────────────────────────────────────────────
   SHARE SECTION
   ───────────────────────────────────────────── */

.share-section {
  padding: 0 24px 32px;
}

.share-card {
  padding: 20px;
  background: transparent;
  border: 1px solid var(--color-ink-ghost, rgba(26,22,18,0.08));
  text-align: center;
  margin: 16px 0;
}

.share-card__archetype {
  font-family: var(--font-serif);
  font-size: 16px;
  font-style: normal;
  color: var(--color-ink, #1A1612);
  margin: 0 0 10px;
}

.share-card__traits {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.share-card__trait {
  margin: 0;
  padding: 3px 8px;
  border: 1px solid var(--color-ink-ghost, rgba(26,22,18,0.08));
}

.share-card__domain {
  margin: 0;
  color: var(--color-ink-faint, rgba(26,22,18,0.45));
}

.share-actions {
  display: flex;
  gap: 10px;
}

.share-btn {
  flex: 1;
  padding: 10px;
  background: transparent;
  border: 1px solid var(--color-ink-ghost, rgba(26,22,18,0.1));
  color: var(--color-ink-mid, #3D3530);
  font-family: var(--font-sans);
  font-size: 11px;
  letter-spacing: 0.06em;
  cursor: pointer;
  border-radius: 1px;
  transition: background 0.2s;
}

.share-btn:hover:not(:disabled) {
  background: rgba(26,22,18,0.04);
}

.share-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.share-btn--primary {
  background: rgba(201,168,76,0.07);
  border-color: rgba(201,168,76,0.22);
  color: rgba(201,168,76,0.8);
}

.share-btn--primary:hover:not(:disabled) {
  background: rgba(201,168,76,0.13);
}

.share-btn--email {
  flex: unset;
  width: 100%;
}

.share-error {
  margin: 6px 0 0;
  color: rgba(220,100,100,0.65);
  text-align: center;
}

.share-email-row {
  margin-top: 10px;
}

/* ─────────────────────────────────────────────
   FOOTER CTA
   ───────────────────────────────────────────── */

.report-footer-cta {
  max-width: 480px;
  margin: 0 auto;
  padding: 0 24px 48px;
}

.report-footer-cta__inner {
  text-align: center;
  padding: 32px 0;
}

.report-footer-cta__headline {
  font-family: var(--font-display);
  font-style: italic;
  font-size: 32px;
  font-weight: 400;
  color: var(--color-ink, #1A1612);
  margin: 0 0 12px;
}

.report-footer-cta__body {
  font-size: 13px;
  color: var(--color-ink-mid, #3D3530);
  line-height: 1.7;
  margin: 0 0 24px;
}

.report-footer-cta__actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.footer-cta-link {
  font-family: var(--font-sans);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(201,168,76,0.65);
  text-decoration: none;
  border-bottom: 1px solid rgba(201,168,76,0.25);
  padding-bottom: 2px;
  transition: color 0.2s;
}

.footer-cta-link:hover {
  color: rgba(201,168,76,0.9);
}

/* ─────────────────────────────────────────────
   LEGAL FOOTER
   ───────────────────────────────────────────── */

.report-footer {
  padding: 20px 24px calc(16px + env(safe-area-inset-bottom, 0px));
  text-align: center;
  border-top: 1px solid var(--color-ink-ghost, rgba(26,22,18,0.08));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.report-footer-link {
  font-family: var(--font-sans);
  font-size: 10px;
  color: var(--color-ink-faint, rgba(26,22,18,0.45));
  text-decoration: none;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.report-footer-link:hover {
  color: var(--color-ink, #1A1612);
}

.report-footer-sep {
  margin: 0 8px;
  color: var(--color-ink-faint, rgba(26,22,18,0.45));
}

.report-footer-crisis {
  margin: 0;
  color: var(--color-ink-faint, rgba(26,22,18,0.45));
  font-size: 10px;
}

/* ─────────────────────────────────────────────
   @MEDIA
   ───────────────────────────────────────────── */

@media (max-width: 480px) {
  .report-masthead__name {
    font-size: 38px;
  }

  .planet-cell {
    padding: 8px 10px;
  }

  .upsell-section__price {
    font-size: 22px;
  }

  .share-actions {
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  .rload-fill,
  .tradition-loading__ring {
    animation: none;
  }
}
</style>
