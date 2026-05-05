import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { fonts } from '../../theme/fonts';

interface EditorialRuleProps {
  ornament?: string;
  style?: ViewStyle;
}

export const EditorialRule: React.FC<EditorialRuleProps> = ({ ornament, style }) => {
  return (
    <View style={[styles.rule, style]}>
      <View style={styles.line} />
      {ornament != null && (
        <>
          <Text style={styles.ornament}>{ornament}</Text>
          <View style={styles.line} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  rule: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           16,
    width:         '100%',
    marginVertical: 28,
  },

  line: {
    flex:            1,
    height:          1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },

  ornament: {
    flexShrink:    0,
    fontFamily:    fonts.hanken,
    fontSize:      11,
    letterSpacing: 1.5,
    color:         'rgba(201, 168, 76, 0.55)',
  },
});
