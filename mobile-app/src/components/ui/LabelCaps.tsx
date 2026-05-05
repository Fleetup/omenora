import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { fonts } from '../../theme/fonts';
import { colors } from '../../theme/colors';

interface LabelCapsProps {
  children: React.ReactNode;
  style?: TextStyle;
}

export const LabelCaps: React.FC<LabelCapsProps> = ({ children, style }) => {
  return <Text style={[styles.label, style]}>{children}</Text>;
};

const styles = StyleSheet.create({
  label: {
    fontFamily:    fonts.hankenSemiBold,
    fontSize:      11,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color:         colors.inkFaint,
  },
});
