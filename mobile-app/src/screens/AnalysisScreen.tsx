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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AnalysisScreenProps } from '../navigation/types';
import { useAnalysisStore } from '../stores/analysisStore';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { QUESTIONS, LANGUAGES, REGION_OPTIONS } from '../constants/questions';
import { calculateLifePathNumber } from '../utils/lifePathNumber';
import { assignArchetype } from '../utils/archetypes';

export const AnalysisScreen: React.FC<AnalysisScreenProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  // Date of birth fields
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  
  // Time of birth fields
  const [birthHour, setBirthHour] = useState('');
  const [birthMinute, setBirthMinute] = useState('');
  const [birthAmPm, setBirthAmPm] = useState<'AM' | 'PM'>('AM');
  
  const monthInputRef = useRef<TextInput>(null);
  const yearInputRef = useRef<TextInput>(null);
  const minuteInputRef = useRef<TextInput>(null);
  
  const currentYear = new Date().getFullYear();
  
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

  const isStep1Valid = firstName.length > 0 && computedDateOfBirth.length > 0 && city.length > 0;
  const allQuestionsAnswered = QUESTIONS.every(q => answers[q.id]);

  const onDayInput = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 2);
    const num = parseInt(cleaned || '0');
    if (cleaned.length > 0 && num > 31) {
      setBirthDay('31');
      monthInputRef.current?.focus();
      return;
    }
    setBirthDay(cleaned);
    if (cleaned.length === 2 && num >= 1) monthInputRef.current?.focus();
  };

  const onMonthInput = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 2);
    const num = parseInt(cleaned || '0');
    if (cleaned.length > 0 && num > 12) {
      setBirthMonth('12');
      yearInputRef.current?.focus();
      return;
    }
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
    if (cleaned.length > 0 && num > 12) {
      setBirthHour('12');
      minuteInputRef.current?.focus();
      return;
    }
    setBirthHour(cleaned);
    if (cleaned.length === 2 && num >= 1) minuteInputRef.current?.focus();
  };

  const onMinuteInput = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 2);
    const num = parseInt(cleaned || '0');
    if (cleaned.length > 0 && num > 59) {
      setBirthMinute('59');
      return;
    }
    setBirthMinute(cleaned);
  };

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
      <LinearGradient colors={colors.gradients.cosmic} style={styles.gradient}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.brandText}>OMENORA</Text>
          <Text style={styles.stepIndicator}>{currentStep} of 2</Text>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressSegment, currentStep >= 1 && styles.progressActive]} />
          <View style={[styles.progressSegment, currentStep >= 2 && styles.progressActive]} />
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {currentStep === 1 ? (
              <>
                <Text style={styles.heading}>Tell us about yourself</Text>
                <Text style={styles.subheading}>Takes 10 seconds</Text>

                <View style={[styles.fieldWrapper, focusedField === 'firstName' && styles.fieldFocused]}>
                  <Text style={styles.fieldLabel}>First Name</Text>
                  <TextInput style={styles.fieldInput} value={firstName} onChangeText={setFirstName} placeholder="Enter your first name" placeholderTextColor={colors.text.muted} onFocus={() => setFocusedField('firstName')} onBlur={() => setFocusedField(null)} autoCapitalize="words" />
                </View>

                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>Date of Birth</Text>
                  <View style={styles.dateRow}>
                    <View style={styles.dateField}>
                      <TextInput style={styles.numInput} value={birthDay} onChangeText={onDayInput} placeholder="DD" placeholderTextColor={colors.text.muted} keyboardType="numeric" maxLength={2} />
                      <Text style={styles.inputSubLabel}>Day</Text>
                    </View>
                    <View style={styles.dateField}>
                      <TextInput ref={monthInputRef} style={styles.numInput} value={birthMonth} onChangeText={onMonthInput} placeholder="MM" placeholderTextColor={colors.text.muted} keyboardType="numeric" maxLength={2} />
                      <Text style={styles.inputSubLabel}>Month</Text>
                    </View>
                    <View style={styles.yearField}>
                      <TextInput ref={yearInputRef} style={styles.numInput} value={birthYear} onChangeText={onYearInput} placeholder="YYYY" placeholderTextColor={colors.text.muted} keyboardType="numeric" maxLength={4} />
                      <Text style={styles.inputSubLabel}>Year</Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.fieldWrapper, focusedField === 'city' && styles.fieldFocused]}>
                  <Text style={styles.fieldLabel}>City of Birth</Text>
                  <TextInput style={styles.fieldInput} value={city} onChangeText={setCity} placeholder="Enter your birth city" placeholderTextColor={colors.text.muted} onFocus={() => setFocusedField('city')} onBlur={() => setFocusedField(null)} />
                </View>

                <View style={styles.fieldWrapper}>
                  <View style={styles.fieldHeaderRow}>
                    <Text style={styles.fieldLabel}>Time of Birth</Text>
                    <Text style={styles.optionalBadge}>Optional</Text>
                  </View>
                  <View style={styles.timeRow}>
                    <View style={styles.timeField}>
                      <TextInput style={styles.numInput} value={birthHour} onChangeText={onHourInput} placeholder="HH" placeholderTextColor={colors.text.muted} keyboardType="numeric" maxLength={2} />
                      <Text style={styles.inputSubLabel}>Hour</Text>
                    </View>
                    <View style={styles.timeField}>
                      <TextInput ref={minuteInputRef} style={styles.numInput} value={birthMinute} onChangeText={onMinuteInput} placeholder="MM" placeholderTextColor={colors.text.muted} keyboardType="numeric" maxLength={2} />
                      <Text style={styles.inputSubLabel}>Minute</Text>
                    </View>
                    <View style={styles.ampmContainer}>
                      <TouchableOpacity style={[styles.ampmButton, birthAmPm === 'AM' && styles.ampmActive]} onPress={() => setBirthAmPm('AM')}>
                        <Text style={[styles.ampmText, birthAmPm === 'AM' && styles.ampmTextActive]}>AM</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.ampmButton, birthAmPm === 'PM' && styles.ampmActive]} onPress={() => setBirthAmPm('PM')}>
                        <Text style={[styles.ampmText, birthAmPm === 'PM' && styles.ampmTextActive]}>PM</Text>
                      </TouchableOpacity>
                      <Text style={styles.inputSubLabel}>AM / PM</Text>
                    </View>
                  </View>
                  {computedTimeOfBirth ? (
                    <View style={styles.unlockRow}>
                      <Text style={styles.unlockIcon}>✦</Text>
                      <Text style={styles.unlockText}>Birth Chart Unlocked</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>Reading Tradition</Text>
                  <View style={styles.regionRow}>
                    {REGION_OPTIONS.map(opt => (
                      <TouchableOpacity key={opt.value} style={[styles.regionButton, regionOverride === opt.value && styles.regionActive]} onPress={() => setRegionOverride(opt.value)}>
                        <Text style={[styles.regionText, regionOverride === opt.value && styles.regionTextActive]}>{opt.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>Language</Text>
                  <View style={styles.languageRow}>
                    {LANGUAGES.map(lang => (
                      <TouchableOpacity key={lang.code} style={[styles.languageButton, languageOverride === lang.code && styles.languageActive]} onPress={() => setLanguageOverride(lang.code)}>
                        <Text style={styles.languageFlag}>{lang.flag}</Text>
                        <Text style={[styles.languageText, languageOverride === lang.code && styles.languageTextActive]}>{lang.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity style={[styles.continueButton, !isStep1Valid && styles.continueButtonDisabled]} onPress={continueToStep2} disabled={!isStep1Valid} activeOpacity={0.75}>
                  <Text style={styles.continueText}>Continue ✦</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.heading}>Answer 7 questions</Text>
                <Text style={styles.subheading}>To personalize your reading</Text>
                {QUESTIONS.map((question, index) => (
                  <View key={question.id} style={styles.questionBlock}>
                    <View style={styles.questionHeader}>
                      <Text style={styles.questionNumber}>{String(index + 1).padStart(2, '0')}</Text>
                      <Text style={styles.questionText}>{question.text}</Text>
                    </View>
                    <View style={styles.optionsRow}>
                      {question.options.map(option => (
                        <TouchableOpacity key={option.value} style={[styles.optionTile, answers[question.id] === option.value && styles.optionTileSelected]} onPress={() => setAnswer(question.id, option.value)}>
                          <Text style={[styles.optionText, answers[question.id] === option.value && styles.optionTextSelected]}>{option.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                    {index < QUESTIONS.length - 1 && <View style={styles.divider} />}
                  </View>
                ))}
                <TouchableOpacity style={[styles.continueButton, styles.submitButton, !allQuestionsAnswered && styles.continueButtonDisabled]} onPress={submitAnalysis} disabled={!allQuestionsAnswered} activeOpacity={0.75}>
                  <Text style={[styles.continueText, styles.submitText]}>Reveal My Destiny ✦</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.main },
  gradient: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  backButton: { padding: 8 },
  backButtonText: { fontSize: 24, color: colors.text.primary },
  brandText: { fontFamily: fonts.inter, fontSize: 11, letterSpacing: 2.5, color: 'rgba(255,255,255,0.22)' },
  stepIndicator: { fontFamily: fonts.inter, fontSize: 11, color: 'rgba(255,255,255,0.22)' },
  progressBar: { flexDirection: 'row', paddingHorizontal: 20, gap: 6, marginBottom: 36 },
  progressSegment: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  progressActive: { backgroundColor: 'rgba(201,168,76,0.55)' },
  keyboardView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  heading: { fontFamily: fonts.cormorant, fontSize: 38, fontWeight: '300', color: 'rgba(255,255,255,0.92)', marginBottom: 6, lineHeight: 44, letterSpacing: -0.4 },
  subheading: { fontFamily: fonts.cormorantItalic, fontSize: 15, color: 'rgba(255,255,255,0.3)', marginBottom: 32 },
  fieldWrapper: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: 16, marginBottom: 12 },
  fieldFocused: { borderColor: 'rgba(201,168,76,0.4)', backgroundColor: 'rgba(201,168,76,0.025)' },
  fieldLabel: { fontFamily: fonts.inter, fontSize: 9, color: 'rgba(255,255,255,0.22)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 2 },
  fieldInput: { fontFamily: fonts.inter, fontSize: 15, color: 'rgba(255,255,255,0.88)', padding: 0 },
  fieldHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  optionalBadge: { fontFamily: fonts.inter, fontSize: 10, color: 'rgba(140,110,255,0.52)', letterSpacing: 0.3 },
  dateRow: { flexDirection: 'row', gap: 12 },
  timeRow: { flexDirection: 'row', gap: 12 },
  dateField: { flex: 1 },
  yearField: { flex: 1.5 },
  timeField: { flex: 1 },
  numInput: { fontFamily: fonts.cormorant, fontSize: 16, color: 'rgba(255,255,255,0.88)', textAlign: 'center', padding: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  inputSubLabel: { fontFamily: fonts.inter, fontSize: 9, color: 'rgba(255,255,255,0.18)', textAlign: 'center', marginTop: 5, textTransform: 'uppercase', letterSpacing: 1.2 },
  ampmContainer: { flex: 1, alignItems: 'center' },
  ampmButton: { paddingVertical: 6, paddingHorizontal: 0, width: '100%', borderRadius: 5, backgroundColor: 'transparent', borderWidth: 0, marginVertical: 2, alignItems: 'center' },
  ampmActive: { backgroundColor: 'rgba(140,110,255,0.2)' },
  ampmText: { fontFamily: fonts.inter, fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.2)', letterSpacing: 1 },
  ampmTextActive: { color: 'rgba(200,180,255,0.95)' },
  unlockRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', gap: 7 },
  unlockIcon: { fontFamily: fonts.inter, fontSize: 10, color: 'rgba(140,110,255,0.65)' },
  unlockText: { fontFamily: fonts.inter, fontSize: 11, color: 'rgba(140,110,255,0.65)', letterSpacing: 0.3 },
  regionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  regionButton: { paddingVertical: 7, paddingHorizontal: 16, borderRadius: 3, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  regionActive: { borderColor: 'rgba(201,168,76,0.42)', backgroundColor: 'rgba(201,168,76,0.07)' },
  regionText: { fontFamily: fonts.inter, fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: 1 },
  regionTextActive: { color: 'rgba(201,168,76,0.88)' },
  languageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  languageButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 7, paddingHorizontal: 14, borderRadius: 3, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  languageActive: { borderColor: 'rgba(201,168,76,0.42)', backgroundColor: 'rgba(201,168,76,0.07)' },
  languageFlag: { fontSize: 14 },
  languageText: { fontFamily: fonts.inter, fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: 1 },
  languageTextActive: { color: 'rgba(201,168,76,0.88)' },
  questionBlock: { marginBottom: 4 },
  questionHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 14 },
  questionNumber: { fontFamily: fonts.cormorant, fontSize: 22, fontWeight: '300', color: 'rgba(201,168,76,0.4)', lineHeight: 26, flexShrink: 0, minWidth: 28, letterSpacing: 0.3 },
  questionText: { flex: 1, fontFamily: fonts.inter, fontSize: 16, color: 'rgba(255,255,255,0.72)', lineHeight: 24, fontWeight: '300', paddingTop: 2 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionTile: { flex: 1, minHeight: 52, paddingVertical: 13, paddingHorizontal: 16, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  optionTileSelected: { backgroundColor: 'rgba(201,168,76,0.08)', borderColor: 'rgba(201,168,76,0.42)' },
  optionText: { fontFamily: fonts.inter, fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 18 },
  optionTextSelected: { color: 'rgba(201,168,76,0.9)' },
  divider: { height: 1, backgroundColor: 'transparent', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', marginVertical: 24 },
  continueButton: { borderRadius: 3, marginTop: 28, borderWidth: 1, borderColor: 'rgba(201,168,76,0.32)', backgroundColor: 'transparent', paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  continueButtonDisabled: { opacity: 0.22 },
  continueText: { fontFamily: fonts.inter, fontSize: 12, fontWeight: '400', color: 'rgba(255,255,255,0.72)', letterSpacing: 1.8, textTransform: 'uppercase' },
  submitButton: { marginTop: 40, backgroundColor: 'rgba(201,168,76,0.1)', borderColor: 'rgba(201,168,76,0.45)' },
  submitText: { color: 'rgba(201,168,76,0.92)' },
});
