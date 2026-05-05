import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { fonts } from '../../theme/fonts';
import { colors } from '../../theme/colors';

const LETTER_PREFIXES = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

interface QuizOptionCardProps {
  index: number;
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

export const QuizOptionCard: React.FC<QuizOptionCardProps> = ({
  index,
  label,
  selected,
  onPress,
  style,
}) => {
  const prefix = LETTER_PREFIXES[index] ?? String.fromCharCode(65 + index);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        selected ? styles.cardSelected : styles.cardDefault,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Text style={[styles.prefix, selected && styles.prefixSelected]}>
        {prefix}
      </Text>
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection:  'row',
    alignItems:     'flex-start',
    gap:            16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth:    1,
    borderRadius:   0,
    marginBottom:   8,
  },

  cardDefault: {
    borderColor:     colors.inkGhost,
    backgroundColor: 'transparent',
  },

  cardSelected: {
    borderColor:     colors.inkMid,
    backgroundColor: colors.inkTrace,
  },

  prefix: {
    fontFamily:    fonts.hanken,
    fontSize:      10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color:         colors.goldDim,
    marginTop:     3,
    minWidth:      14,
  },

  prefixSelected: {
    color: colors.gold,
  },

  label: {
    flex:       1,
    fontFamily: fonts.cormorant,
    fontSize:   18,
    fontWeight: '400',
    color:      colors.inkMid,
    lineHeight: 26,
  },

  labelSelected: {
    color: colors.ink,
  },
});
