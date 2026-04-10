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
import { QUESTIONS, LANGUAGES, REGION_OPTIONS } from '../constants/questions';

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
  const submitAnalysis = () => { navigation.navigate('Preview'); };

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

                <TouchableOpacity style={[styles.continueButton, !isStep1Valid && styles.continueButtonDisabled]} onPress={continueToStep2} disabled={!isStep1Valid}>
                  <LinearGradient colors={isStep1Valid ? colors.gradients.primary : ['#444', '#333']} style={styles.continueGradient}>
                    <Text style={styles.continueText}>Continue →</Text>
                  </LinearGradient>
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
                <TouchableOpacity style={[styles.continueButton, !allQuestionsAnswered && styles.continueButtonDisabled]} onPress={submitAnalysis} disabled={!allQuestionsAnswered}>
                  <LinearGradient colors={allQuestionsAnswered ? colors.gradients.primary : ['#444', '#333']} style={styles.continueGradient}>
                    <Text style={styles.continueText}>Reveal My Destiny ✦</Text>
                  </LinearGradient>
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
  brandText: { fontSize: 16, fontWeight: '600', color: colors.text.primary, letterSpacing: 2 },
  stepIndicator: { fontSize: 14, color: colors.text.tertiary },
  progressBar: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 24 },
  progressSegment: { flex: 1, height: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 2 },
  progressActive: { backgroundColor: colors.primary.main },
  keyboardView: { flex: 1 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 40 },
  heading: { fontSize: 28, fontWeight: '700', color: colors.text.primary, marginBottom: 8 },
  subheading: { fontSize: 14, color: colors.text.tertiary, marginBottom: 32 },
  fieldWrapper: { backgroundColor: colors.background.card, borderWidth: 1, borderColor: colors.background.cardBorder, borderRadius: 12, padding: 16, marginBottom: 16 },
  fieldFocused: { borderColor: colors.primary.main },
  fieldLabel: { fontSize: 12, color: colors.text.tertiary, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  fieldInput: { fontSize: 16, color: colors.text.primary, padding: 0 },
  fieldHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  optionalBadge: { fontSize: 11, color: colors.text.muted, backgroundColor: 'rgba(255, 255, 255, 0.05)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  dateRow: { flexDirection: 'row', gap: 12 },
  timeRow: { flexDirection: 'row', gap: 12 },
  dateField: { flex: 1 },
  yearField: { flex: 1.5 },
  timeField: { flex: 1 },
  numInput: { fontSize: 18, color: colors.text.primary, textAlign: 'center', padding: 12, backgroundColor: 'rgba(255, 255, 255, 0.03)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  inputSubLabel: { fontSize: 11, color: colors.text.muted, textAlign: 'center', marginTop: 6 },
  ampmContainer: { flex: 1, alignItems: 'center' },
  ampmButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 6, backgroundColor: 'rgba(255, 255, 255, 0.03)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', marginVertical: 2 },
  ampmActive: { backgroundColor: 'rgba(123, 97, 255, 0.2)', borderColor: 'rgba(123, 97, 255, 0.5)' },
  ampmText: { fontSize: 14, color: colors.text.tertiary },
  ampmTextActive: { color: colors.primary.light, fontWeight: '600' },
  unlockRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(123, 97, 255, 0.2)' },
  unlockIcon: { fontSize: 14, color: colors.primary.main, marginRight: 8 },
  unlockText: { fontSize: 13, color: colors.primary.light },
  regionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  regionButton: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.03)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  regionActive: { backgroundColor: 'rgba(123, 97, 255, 0.15)', borderColor: 'rgba(140, 110, 255, 0.5)' },
  regionText: { fontSize: 12, color: colors.text.tertiary },
  regionTextActive: { color: 'rgba(200, 180, 255, 0.9)' },
  languageRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  languageButton: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20, backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.08)' },
  languageActive: { backgroundColor: 'rgba(140, 110, 255, 0.15)', borderColor: 'rgba(140, 110, 255, 0.5)' },
  languageFlag: { fontSize: 14 },
  languageText: { fontSize: 12, color: 'rgba(255, 255, 255, 0.25)' },
  languageTextActive: { color: 'rgba(200, 180, 255, 0.9)' },
  questionBlock: { marginBottom: 24 },
  questionHeader: { flexDirection: 'row', marginBottom: 12 },
  questionNumber: { fontSize: 14, fontWeight: '600', color: colors.primary.main, marginRight: 12, minWidth: 24 },
  questionText: { flex: 1, fontSize: 15, color: colors.text.primary, lineHeight: 22 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginLeft: 36 },
  optionTile: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.03)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  optionTileSelected: { backgroundColor: 'rgba(123, 97, 255, 0.2)', borderColor: colors.primary.main },
  optionText: { fontSize: 13, color: colors.text.tertiary },
  optionTextSelected: { color: colors.text.primary, fontWeight: '500' },
  divider: { height: 1, backgroundColor: 'rgba(255, 255, 255, 0.08)', marginTop: 24, marginLeft: 36 },
  continueButton: { height: 56, borderRadius: 28, overflow: 'hidden', marginTop: 24 },
  continueButtonDisabled: { opacity: 0.6 },
  continueGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  continueText: { fontSize: 16, fontWeight: '600', color: colors.text.primary },
});
