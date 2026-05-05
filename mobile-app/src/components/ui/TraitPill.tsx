import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

interface TraitPillProps {
  label: string;
  style?: ViewStyle;
}

export const TraitPill: React.FC<TraitPillProps> = ({ label, style }) => (
  <View style={[styles.pill, style]}>
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  pill: {
    borderWidth:       1,
    borderColor:       colors.inkGhost,
    borderRadius:      2,
    paddingVertical:   4,
    paddingHorizontal: 10,
  },
  label: {
    fontFamily:    fonts.hanken,
    fontSize:      9,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color:         colors.inkDim,
  },
});
