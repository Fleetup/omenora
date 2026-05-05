import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface ShortRuleProps {
  style?: ViewStyle;
}

export const ShortRule: React.FC<ShortRuleProps> = ({ style }) => {
  return <View style={[styles.rule, style]} />;
};

const styles = StyleSheet.create({
  rule: {
    width:           48,
    height:          1,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
});
