import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { fonts } from '../../theme/fonts';

interface AnnotationTextProps {
  children: React.ReactNode;
  style?: TextStyle;
}

export const AnnotationText: React.FC<AnnotationTextProps> = ({ children, style }) => {
  return <Text style={[styles.annotation, style]}>{children}</Text>;
};

const styles = StyleSheet.create({
  annotation: {
    fontFamily:    fonts.hanken,
    fontSize:      11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    color:         'rgba(255, 255, 255, 0.28)',
  },
});
