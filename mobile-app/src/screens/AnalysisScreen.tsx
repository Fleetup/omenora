import React, { useState } from 'react';
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

export const AnalysisScreen: React.FC<AnalysisScreenProps> = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  const {
    firstName,
    dateOfBirth,
    timeOfBirth,
    city,
    setFirstName,
    setDateOfBirth,
    setTimeOfBirth,
    setCity,
  } = useAnalysisStore();

  const isStep1Valid = firstName.length > 0 && dateOfBirth.length === 10 && city.length > 0;

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(1);
    } else {
      navigation.goBack();
    }
  };

  const continueToStep2 = () => {
    if (isStep1Valid) {
      setCurrentStep(2);
    }
  };

  const submitAnalysis = () => {
    navigation.navigate('Preview');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={colors.gradients.cosmic}
        style={styles.gradient}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.brandText}>OMENORA</Text>
          <Text style={styles.stepIndicator}>{currentStep} of 2</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBar}>
          <View style={[styles.progressSegment, currentStep >= 1 && styles.progressActive]} />
          <View style={[styles.progressSegment, currentStep >= 2 && styles.progressActive]} />
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
                <Text style={styles.heading}>Tell us about yourself</Text>
                <Text style={styles.subheading}>Takes 10 seconds</Text>

                {/* First Name */}
                <View style={[styles.fieldWrapper, focusedField === 'firstName' && styles.fieldFocused]}>
                  <Text style={styles.fieldLabel}>First Name</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="Enter your first name"
                    placeholderTextColor={colors.text.muted}
                    onFocus={() => setFocusedField('firstName')}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="words"
                  />
                </View>

                {/* Date of Birth */}
                <View style={styles.fieldWrapper}>
                  <Text style={styles.fieldLabel}>Date of Birth</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={dateOfBirth}
                    onChangeText={setDateOfBirth}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor={colors.text.muted}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>

                {/* City */}
                <View style={[styles.fieldWrapper, focusedField === 'city' && styles.fieldFocused]}>
                  <Text style={styles.fieldLabel}>City of Birth</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={city}
                    onChangeText={setCity}
                    placeholder="Enter your birth city"
                    placeholderTextColor={colors.text.muted}
                    onFocus={() => setFocusedField('city')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>

                {/* Time of Birth (Optional) */}
                <View style={styles.fieldWrapper}>
                  <View style={styles.fieldHeaderRow}>
                    <Text style={styles.fieldLabel}>Time of Birth</Text>
                    <Text style={styles.optionalBadge}>Optional</Text>
                  </View>
                  <TextInput
                    style={styles.fieldInput}
                    value={timeOfBirth}
                    onChangeText={setTimeOfBirth}
                    placeholder="HH:MM AM/PM"
                    placeholderTextColor={colors.text.muted}
                  />
                  {timeOfBirth ? (
                    <View style={styles.unlockRow}>
                      <Text style={styles.unlockIcon}>✦</Text>
                      <Text style={styles.unlockText}>Birth Chart Unlocked</Text>
                    </View>
                  ) : null}
                </View>

                {/* Continue Button */}
                <TouchableOpacity
                  style={[styles.continueButton, !isStep1Valid && styles.continueButtonDisabled]}
                  onPress={continueToStep2}
                  disabled={!isStep1Valid}
                >
                  <LinearGradient
                    colors={isStep1Valid ? colors.gradients.primary : ['#444', '#333']}
                    style={styles.continueGradient}
                  >
                    <Text style={styles.continueText}>Continue →</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.heading}>Answer 7 questions</Text>
                <Text style={styles.subheading}>To personalize your reading</Text>
                
                {/* Placeholder for questions */}
                <Text style={styles.placeholderText}>
                  Question components will be implemented here...
                </Text>

                <TouchableOpacity
                  style={styles.continueButton}
                  onPress={submitAnalysis}
                >
                  <LinearGradient
                    colors={colors.gradients.primary}
                    style={styles.continueGradient}
                  >
                    <Text style={styles.continueText}>Get Your Reading ✦</Text>
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
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  gradient: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.text.primary,
  },
  brandText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    letterSpacing: 2,
  },
  stepIndicator: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  progressBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 24,
  },
  progressSegment: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
  },
  progressActive: {
    backgroundColor: colors.primary.main,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginBottom: 32,
  },
  fieldWrapper: {
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.background.cardBorder,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  fieldFocused: {
    borderColor: colors.primary.main,
  },
  fieldLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  fieldInput: {
    fontSize: 16,
    color: colors.text.primary,
    padding: 0,
  },
  fieldHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionalBadge: {
    fontSize: 11,
    color: colors.text.muted,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  unlockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(123, 97, 255, 0.2)',
  },
  unlockIcon: {
    fontSize: 14,
    color: colors.primary.main,
    marginRight: 8,
  },
  unlockText: {
    fontSize: 13,
    color: colors.primary.light,
  },
  continueButton: {
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginTop: 24,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: 40,
  },
});
