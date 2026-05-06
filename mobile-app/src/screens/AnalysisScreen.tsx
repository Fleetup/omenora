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
    regionOverride,
    languageOverride,
    setFirstName,
    setDateOfBirth,
    setTimeOfBirth,
    setCity,
    setAnswer,
    setRegionOverride,
    setLanguageOverride,
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
                  placeholderTextColor={colors.inkDim}
                  selectionColor={colors.inkMid}
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
                      placeholderTextColor={colors.inkDim}
                      selectionColor={colors.inkMid}
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
                      placeholderTextColor={colors.inkDim}
                      selectionColor={colors.inkMid}
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
                      placeholderTextColor={colors.inkDim}
                      selectionColor={colors.inkMid}
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
                  placeholderTextColor={colors.inkDim}
                  selectionColor={colors.inkMid}
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
                      placeholderTextColor={colors.inkDim}
                      selectionColor={colors.inkMid}
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
                      placeholderTextColor={colors.inkDim}
                      selectionColor={colors.inkMid}
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
  container:    { flex: 1, backgroundColor: colors.bone },
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
    color:      colors.inkMid,
    lineHeight: 22,
  },
  backLabel: {
    fontFamily:    fonts.hankenSemiBold,
    fontSize:      10,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color:         colors.inkFaint,
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
    backgroundColor: colors.inkGhost,
    marginBottom:    44,
  },
  progressFill: {
    height:          1,
    backgroundColor: colors.ink,
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
    color:         colors.ink,
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
    color:         colors.inkFaint,
    marginBottom:  12,
  },
  fieldLabelRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   8,
  },
  optionalLabel: {
    color: colors.inkDim,
  },
  fieldHint: {
    fontFamily:    fonts.hanken,
    fontSize:      11,
    letterSpacing: 0.5,
    color:         colors.inkDim,
    marginBottom:  12,
  },

  // Editorial text input (bottom-border only)
  editorialInput: {
    fontFamily:        fonts.cormorant,
    fontSize:          24,
    color:             colors.ink,
    borderBottomWidth: 1,
    borderBottomColor: colors.inkDim,
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
    color:             colors.ink,
    textAlign:         'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.inkDim,
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
    color:         colors.inkDim,
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
    borderColor:     colors.inkGhost,
    paddingVertical: 8,
    alignItems:      'center',
    borderRadius:    0,
  },
  ampmBtnActive: {
    borderColor:     colors.inkMid,
    backgroundColor: colors.inkTrace,
  },
  ampmBtnText: {
    fontFamily:    fonts.hankenSemiBold,
    fontSize:      10,
    letterSpacing: 1.5,
    color:         colors.inkDim,
  },
  ampmBtnTextActive: {
    color: colors.ink,
  },

  // ── Birth chart unlock ────────────────────────────────────────────────────
  unlockRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
    marginTop:     14,
    paddingTop:    14,
    borderTopWidth: 1,
    borderTopColor: colors.inkTrace,
  },
  unlockGlyph: {
    fontFamily: fonts.cormorant,
    fontSize:   12,
    color:      colors.goldDim,
  },
  unlockText: {
    color: colors.goldDim,
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
    borderColor:     colors.inkGhost,
    borderRadius:    0,
    backgroundColor: 'transparent',
  },
  pillActive: {
    borderColor:     colors.inkMid,
    backgroundColor: colors.inkTrace,
  },
  pillText: {
    fontFamily:    fonts.hanken,
    fontSize:      11,
    letterSpacing: 0.8,
    color:         colors.inkDim,
  },
  pillTextActive: {
    color: colors.ink,
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
    color:    colors.goldDim,
    minWidth: 24,
    paddingTop: 3,
  },
  questionText: {
    flex:       1,
    fontFamily: fonts.cormorant,
    fontSize:   22,
    fontWeight: '400',
    color:      colors.ink,
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
    borderTopColor: colors.inkTrace,
  },
});
