import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

// Affirmation variant decorative colors — component-owned
const AFFIRMATION_BG     = 'rgba(140, 110, 255, 0.08)';
const AFFIRMATION_BORDER = 'rgba(140, 110, 255, 0.22)';
const AFFIRMATION_TEXT   = 'rgba(200, 180, 255, 0.95)';

interface SectionBlockProps {
  icon: string;
  title: string;
  content: string;
  isLast?: boolean;
  isAffirmation?: boolean;
  style?: ViewStyle;
}

export const SectionBlock: React.FC<SectionBlockProps> = ({
  icon,
  title,
  content,
  isLast = false,
  isAffirmation = false,
  style,
}) => (
  <View style={[styles.wrapper, isLast && styles.wrapperLast, style]}>
    <View style={styles.header}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
    {isAffirmation ? (
      <View style={styles.affirmationBox}>
        <Text style={styles.affirmationText}>{content}</Text>
      </View>
    ) : (
      <Text style={styles.content}>{content}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical:   28,
    borderBottomWidth: 1,
    borderBottomColor: colors.inkGhost,
  },
  wrapperLast: {
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           10,
    marginBottom:  14,
  },
  icon: {
    fontFamily: fonts.inter,
    fontSize:   11,
    color:      colors.goldDim,
    opacity:    0.7,
  },
  title: {
    fontFamily:    fonts.inter,
    fontSize:      11,
    fontWeight:    '500',
    color:         colors.goldDim,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  content: {
    fontFamily: fonts.inter,
    fontSize:   15,
    color:      colors.inkMid,
    lineHeight: 28,
    fontWeight: '300',
  },
  affirmationBox: {
    backgroundColor: AFFIRMATION_BG,
    borderWidth:     1,
    borderColor:     AFFIRMATION_BORDER,
    padding:         20,
  },
  affirmationText: {
    fontFamily: fonts.cormorantItalic,
    fontSize:   16,
    color:      AFFIRMATION_TEXT,
    lineHeight: 26,
    textAlign:  'center',
  },
});
