import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { AnalysisScreenProps } from '../navigation/types';
import { useAnalysisStore } from '../stores/analysisStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { QUESTIONS, LANGUAGES, REGION_OPTIONS } from '../constants/questions';
import { calculateLifePathNumber } from '../utils/lifePathNumber';
import { assignArchetype } from '../utils/archetypes';
import {
  CTAButton,
  EditorialRule,
  ShortRule,
  LabelCaps,
  AnnotationText,
  QuizOptionCard,
} from '../components/ui';

const { width: SW } = Dimensions.get('window');

export const AnalysisScreen: React.FC<AnalysisScreenProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Date of birth fields
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');

  // Time of birth fields
  const [birthHour, setBirthHour] = useState('');
  const [birthMinute, setBirthMinute] = useState('');
  const [birthAmPm, setBirthAmPm] = useState<'AM' | 'PM'>('AM');

  const monthInputRef = useRef<TextInput>(null);
  const yearInputRef  = useRef<TextInput>(null);
  const minuteInputRef = useRef<TextInput>(null);

  const currentYear = new Date().getFullYear();

  // ── Animated hairline progress bar ───────────────────────────────────────
  const progressAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: currentStep === 1 ? 0.5 : 1,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const progressWidth = progressAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, SW - 48],
  });

  // ── Store ─────────────────────────────────────────────────────────────────
  const {
    firstName,
    city,
    answers,
    dateOfBirth,
    regionOverride,
    languageOverride,
    setFirstName,
    setDateOfBirth,
    setTimeOfBirth,
    setCity,
    setAnswer,
    setRegionOverride,
    setLanguageOverride,
    setLifePathNumber,
    setArchetype,
  } = useAnalysisStore();

  // ── Computed DOB / time ───────────────────────────────────────────────────
  const computedDateOfBirth = React.useMemo(() => {
    const d = parseInt(birthDay || '0');
    const m = parseInt(birthMonth || '0');
    const y = parseInt(birthYear || '0');
    if (!d || !m || !y || d < 1 || d > 31 || m < 1 || m > 12 || y < 1940 || y > currentYear) return '';
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }, [birthDay, birthMonth, birthYear]);

  useEffect(() => {
    if (computedDateOfBirth) setDateOfBirth(computedDateOfBirth);
  }, [computedDateOfBirth]);

  const computedTimeOfBirth = React.useMemo(() => {
    if (!birthHour || birthMinute === '') return '';
    const h = parseInt(birthHour);
    const m = parseInt(birthMinute);
    if (isNaN(h) || isNaN(m) || h < 1 || h > 12 || m < 0 || m > 59) return '';
    return `${h}:${String(m).padStart(2, '0')} ${birthAmPm}`;
  }, [birthHour, birthMinute, birthAmPm]);

  useEffect(() => {
    if (computedTimeOfBirth) setTimeOfBirth(computedTimeOfBirth);
  }, [computedTimeOfBirth]);

  const isStep1Valid       = firstName.length > 0 && computedDateOfBirth.length > 0 && city.length > 0;
  const allQuestionsAnswered = QUESTIONS.every(q => answers[q.id]);

  // ── Input handlers ────────────────────────────────────────────────────────
  const onDayInput = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 2);
    const num = parseInt(cleaned || '0');
    if (cleaned.length > 0 && num > 31) { setBirthDay('31'); monthInputRef.current?.focus(); return; }
    setBirthDay(cleaned);
    if (cleaned.length === 2 && num >= 1) monthInputRef.current?.focus();
  };

  const onMonthInput = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 2);
    const num = parseInt(cleaned || '0');
    if (cleaned.length > 0 && num > 12) { setBirthMonth('12'); yearInputRef.current?.focus(); return; }
    setBirthMonth(cleaned);
    if (cleaned.length === 2 && num >= 1) yearInputRef.current?.focus();
  };

  const onYearInput = (text: string) => {
    const num = parseInt(text);
    if (num > currentYear) setBirthYear(String(currentYear));
    else if (num < 1940 && text.length === 4) setBirthYear('1940');
    else setBirthYear(text.replace(/\D/g, '').slice(0, 4));
  };

  const onHourInput = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 2);
    const num = parseInt(cleaned || '0');
    if (cleaned.length > 0 && num > 12) { setBirthHour('12'); minuteInputRef.current?.focus(); return; }
    setBirthHour(cleaned);
    if (cleaned.length === 2 && num >= 1) minuteInputRef.current?.focus();
  };

  const onMinuteInput = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 2);
    const num = parseInt(cleaned || '0');
    if (cleaned.length > 0 && num > 59) { setBirthMinute('59'); return; }
    setBirthMinute(cleaned);
  };

  // ── Navigation ────────────────────────────────────────────────────────────
  const goBack = () => {
    if (currentStep > 1) setCurrentStep(1);
    else navigation.goBack();
  };

  const continueToStep2 = () => { if (isStep1Valid) setCurrentStep(2); };

  const submitAnalysis = () => {
    if (!allQuestionsAnswered) return;
    const lpn = calculateLifePathNumber(dateOfBirth);
    const archetype = assignArchetype(answers);
    setLifePathNumber(lpn);
    setArchetype(archetype);
    navigation.navigate('Preview');
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Top bar ────────────────────────────────────────────────────────── */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={goBack} style={styles.backButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backLabel}>Back</Text>
        </TouchableOpacity>
        <LabelCaps style={styles.brandLabel}>Omenora</LabelCaps>
        <AnnotationText style={styles.stepLabel}>{currentStep} / 2</AnnotationText>
      </View>

      {/* ── Hairline progress track ──────────────────────────────────────── */}
      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {currentStep === 1 ? (
            <>
              {/* ── Step header ────────────────────────────────────────────── */}
              <LabelCaps style={styles.stepNum}>Step 01</LabelCaps>
              <Text style={styles.headline}>Tell us about you.</Text>
              <ShortRule style={styles.headlineRule} />

              {/* ── First name ─────────────────────────────────────────────── */}
              <View style={styles.fieldSection}>
                <Text style={styles.fieldLabel}>Your first name</Text>
                <TextInput
                  style={styles.editorialInput}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Enter your first name"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  selectionColor="rgba(255,255,255,0.6)"
                  autoCapitalize="words"
                />
              </View>

              {/* ── Date of birth ───────────────────────────────────────────── */}
              <View style={styles.fieldSection}>
                <Text style={styles.fieldLabel}>Date of birth</Text>
                <Text style={styles.fieldHint}>Used only to calculate your planetary positions.</Text>
                <View style={styles.dateRow}>
                  <View style={styles.dateCol}>
                    <TextInput
                      style={styles.numInput}
                      value={birthDay}
                      onChangeText={onDayInput}
                      placeholder="DD"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      selectionColor="rgba(255,255,255,0.6)"
                      keyboardType="numeric"
                      maxLength={2}
                    />
                    <Text style={styles.dateSubLabel}>Day</Text>
                  </View>
                  <View style={styles.dateCol}>
                    <TextInput
                      ref={monthInputRef}
                      style={styles.numInput}
                      value={birthMonth}
                      onChangeText={onMonthInput}
                      placeholder="MM"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      selectionColor="rgba(255,255,255,0.6)"
                      keyboardType="numeric"
                      maxLength={2}
                    />
                    <Text style={styles.dateSubLabel}>Month</Text>
                  </View>
                  <View style={[styles.dateCol, { flex: 1.6 }]}>
                    <TextInput
                      ref={yearInputRef}
                      style={styles.numInput}
                      value={birthYear}
                      onChangeText={onYearInput}
                      placeholder="YYYY"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      selectionColor="rgba(255,255,255,0.6)"
                      keyboardType="numeric"
                      maxLength={4}
                    />
                    <Text style={styles.dateSubLabel}>Year</Text>
                  </View>
                </View>
              </View>

              {/* ── City of birth ──────────────────────────────────────────── */}
              <View style={styles.fieldSection}>
                <Text style={styles.fieldLabel}>City of birth</Text>
                <TextInput
                  style={styles.editorialInput}
                  value={city}
                  onChangeText={setCity}
                  placeholder="Enter your birth city"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  selectionColor="rgba(255,255,255,0.6)"
                />
                <Text style={styles.fieldHint}>Used only to determine the horizon position at birth.</Text>
              </View>

              {/* ── Birth time (optional) ──────────────────────────────────── */}
              <View style={styles.fieldSection}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>Birth time</Text>
                  <AnnotationText style={styles.optionalLabel}>Optional</AnnotationText>
                </View>
                <Text style={styles.fieldHint}>Improves your Rising sign accuracy.</Text>
                <View style={styles.timeRow}>
                  <View style={styles.dateCol}>
                    <TextInput
                      style={styles.numInput}
                      value={birthHour}
                      onChangeText={onHourInput}
                      placeholder="HH"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      selectionColor="rgba(255,255,255,0.6)"
                      keyboardType="numeric"
                      maxLength={2}
                    />
                    <Text style={styles.dateSubLabel}>Hour</Text>
                  </View>
                  <View style={styles.dateCol}>
                    <TextInput
                      ref={minuteInputRef}
                      style={styles.numInput}
                      value={birthMinute}
                      onChangeText={onMinuteInput}
                      placeholder="MM"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      selectionColor="rgba(255,255,255,0.6)"
                      keyboardType="numeric"
                      maxLength={2}
                    />
                    <Text style={styles.dateSubLabel}>Minute</Text>
                  </View>
                  <View style={styles.ampmGroup}>
                    <TouchableOpacity
                      style={[styles.ampmBtn, birthAmPm === 'AM' && styles.ampmBtnActive]}
                      onPress={() => setBirthAmPm('AM')}
                    >
                      <Text style={[styles.ampmBtnText, birthAmPm === 'AM' && styles.ampmBtnTextActive]}>AM</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.ampmBtn, birthAmPm === 'PM' && styles.ampmBtnActive]}
                      onPress={() => setBirthAmPm('PM')}
                    >
                      <Text style={[styles.ampmBtnText, birthAmPm === 'PM' && styles.ampmBtnTextActive]}>PM</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {computedTimeOfBirth ? (
                  <View style={styles.unlockRow}>
                    <Text style={styles.unlockGlyph}>✦</Text>
                    <AnnotationText style={styles.unlockText}>Birth chart unlocked</AnnotationText>
                  </View>
                ) : null}
              </View>

              {/* ── Reading tradition ──────────────────────────────────────── */}
              <View style={styles.fieldSection}>
                <Text style={styles.fieldLabel}>Reading tradition</Text>
                <View style={styles.pillRow}>
                  {REGION_OPTIONS.map(opt => (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.pill, regionOverride === opt.value && styles.pillActive]}
                      onPress={() => setRegionOverride(opt.value)}
                    >
                      <Text style={[styles.pillText, regionOverride === opt.value && styles.pillTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* ── Language ───────────────────────────────────────────────── */}
              <View style={styles.fieldSection}>
                <Text style={styles.fieldLabel}>Language</Text>
                <View style={styles.pillRow}>
                  {LANGUAGES.map(lang => (
                    <TouchableOpacity
                      key={lang.code}
                      style={[styles.pill, languageOverride === lang.code && styles.pillActive]}
                      onPress={() => setLanguageOverride(lang.code)}
                    >
                      <Text style={styles.langFlag}>{lang.flag}</Text>
                      <Text style={[styles.pillText, languageOverride === lang.code && styles.pillTextActive]}>
                        {lang.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* ── Continue CTA ───────────────────────────────────────────── */}
              <CTAButton
                label="Continue"
                onPress={continueToStep2}
                variant="solid"
                arrow
                full
                disabled={!isStep1Valid}
                style={styles.ctaBtn}
              />
            </>
          ) : (
            <>
              {/* ── Step header ────────────────────────────────────────────── */}
              <LabelCaps style={styles.stepNum}>Step 02</LabelCaps>
              <Text style={styles.headline}>Three questions.</Text>
              <ShortRule style={styles.headlineRule} />

              {/* ── Questions ──────────────────────────────────────────────── */}
              {QUESTIONS.map((question, index) => (
                <View key={question.id} style={styles.questionBlock}>
                  <View style={styles.questionHeader}>
                    <AnnotationText style={styles.questionNum}>
                      {String(index + 1).padStart(2, '0')}
                    </AnnotationText>
                    <Text style={styles.questionText}>{question.text}</Text>
                  </View>
                  <View style={styles.optionsList}>
                    {question.options.map((option, optIndex) => (
                      <QuizOptionCard
                        key={option.value}
                        index={optIndex}
                        label={option.label}
                        selected={answers[question.id] === option.value}
                        onPress={() => setAnswer(question.id, option.value)}
                      />
                    ))}
                  </View>
                  {index < QUESTIONS.length - 1 && (
                    <EditorialRule style={styles.questionDivider} />
                  )}
                </View>
              ))}

              {/* ── Submit CTA ─────────────────────────────────────────────── */}
              <CTAButton
                label="Reveal my destiny"
                onPress={submitAnalysis}
                variant="solid"
                arrow
                full
                disabled={!allQuestionsAnswered}
                style={styles.ctaBtn}
              />
            </>
          )}

          {/* ── Trust footer ─────────────────────────────────────────────── */}
          <View style={styles.trustFooter}>
            <AnnotationText>🔒 Birth data used only to generate your reading. Never sold.</AnnotationText>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.background.main },
  keyboardView: { flex: 1 },

  // ── Top bar ──────────────────────────────────────────────────────────────
  topBar: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical:   14,
  },
  backButton: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           6,
  },
  backArrow: {
    fontFamily: fonts.cormorant,
    fontSize:   20,
    color:      'rgba(255,255,255,0.55)',
    lineHeight: 22,
  },
  backLabel: {
    fontFamily:    fonts.hankenSemiBold,
    fontSize:      10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color:         'rgba(255,255,255,0.35)',
  },
  brandLabel: {
    letterSpacing: 2.5,
  },
  stepLabel: {
    minWidth: 32,
    textAlign: 'right',
  },

  // ── Hairline progress bar ─────────────────────────────────────────────────
  progressTrack: {
    height:          1,
    marginHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom:    44,
  },
  progressFill: {
    height:          1,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },

  // ── Scroll content ────────────────────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom:     56,
  },

  // ── Step header ───────────────────────────────────────────────────────────
  stepNum: {
    marginBottom: 16,
  },
  headline: {
    fontFamily:    fonts.frauncesItalic,
    fontSize:      SW < 375 ? 34 : 42,
    fontWeight:    '300',
    letterSpacing: -0.8,
    lineHeight:    SW < 375 ? 40 : 48,
    color:         'rgba(255,255,255,0.93)',
  },
  headlineRule: {
    marginTop:    20,
    marginBottom: 36,
  },

  // ── Field sections ────────────────────────────────────────────────────────
  fieldSection: {
    marginBottom: 36,
  },
  fieldLabel: {
    fontFamily:    fonts.hankenSemiBold,
    fontSize:      11,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color:         'rgba(255,255,255,0.35)',
    marginBottom:  12,
  },
  fieldLabelRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   8,
  },
  optionalLabel: {
    color: 'rgba(255,255,255,0.22)',
  },
  fieldHint: {
    fontFamily:    fonts.hanken,
    fontSize:      11,
    letterSpacing: 0.5,
    color:         'rgba(255,255,255,0.28)',
    marginBottom:  12,
  },

  // Editorial text input (bottom-border only)
  editorialInput: {
    fontFamily:        fonts.cormorant,
    fontSize:          24,
    color:             'rgba(255,255,255,0.93)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.25)',
    borderRadius:      0,
    backgroundColor:   'transparent',
    paddingVertical:   14,
    paddingHorizontal: 0,
  },

  // ── Date / time row ───────────────────────────────────────────────────────
  dateRow: {
    flexDirection: 'row',
    gap:           16,
    marginTop:     4,
  },
  timeRow: {
    flexDirection: 'row',
    gap:           16,
    marginTop:     4,
  },
  dateCol: {
    flex: 1,
    alignItems: 'center',
  },
  numInput: {
    fontFamily:        fonts.cormorant,
    fontSize:          22,
    color:             'rgba(255,255,255,0.93)',
    textAlign:         'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.25)',
    borderRadius:      0,
    backgroundColor:   'transparent',
    paddingVertical:   12,
    width:             '100%',
  },
  dateSubLabel: {
    fontFamily:    fonts.hanken,
    fontSize:      9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color:         'rgba(255,255,255,0.22)',
    marginTop:     6,
  },

  // ── AM / PM toggle ────────────────────────────────────────────────────────
  ampmGroup: {
    flex:          1,
    flexDirection: 'column',
    gap:           6,
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  ampmBtn: {
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.12)',
    paddingVertical: 8,
    alignItems:      'center',
    borderRadius:    0,
  },
  ampmBtnActive: {
    borderColor:     'rgba(255,255,255,0.55)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  ampmBtnText: {
    fontFamily:    fonts.hankenSemiBold,
    fontSize:      10,
    letterSpacing: 1.5,
    color:         'rgba(255,255,255,0.25)',
  },
  ampmBtnTextActive: {
    color: 'rgba(255,255,255,0.88)',
  },

  // ── Birth chart unlock ────────────────────────────────────────────────────
  unlockRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
    marginTop:     14,
    paddingTop:    14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  unlockGlyph: {
    fontFamily: fonts.cormorant,
    fontSize:   12,
    color:      'rgba(201,168,76,0.55)',
  },
  unlockText: {
    color: 'rgba(201,168,76,0.65)',
  },

  // ── Selection pills ───────────────────────────────────────────────────────
  pillRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           8,
    marginTop:     4,
  },
  pill: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             4,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.1)',
    borderRadius:    0,
    backgroundColor: 'transparent',
  },
  pillActive: {
    borderColor:     'rgba(255,255,255,0.55)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  pillText: {
    fontFamily:    fonts.hanken,
    fontSize:      11,
    letterSpacing: 0.8,
    color:         'rgba(255,255,255,0.3)',
  },
  pillTextActive: {
    color: 'rgba(255,255,255,0.88)',
  },
  langFlag: {
    fontSize: 13,
  },

  // ── CTA ───────────────────────────────────────────────────────────────────
  ctaBtn: {
    marginTop: 8,
  },

  // ── Question block ────────────────────────────────────────────────────────
  questionBlock: {
    marginBottom: 0,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:           16,
    marginBottom:  20,
  },
  questionNum: {
    color:    'rgba(201,168,76,0.45)',
    minWidth: 24,
    paddingTop: 3,
  },
  questionText: {
    flex:       1,
    fontFamily: fonts.cormorant,
    fontSize:   22,
    fontWeight: '400',
    color:      'rgba(255,255,255,0.88)',
    lineHeight: 30,
  },
  optionsList: {
    gap: 0,
  },
  questionDivider: {
    marginTop:    8,
    marginBottom: 28,
  },

  // ── Trust footer ──────────────────────────────────────────────────────────
  trustFooter: {
    alignItems:  'center',
    marginTop:   32,
    paddingTop:  24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
});
