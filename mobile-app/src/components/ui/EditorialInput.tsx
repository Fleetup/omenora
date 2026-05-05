import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { fonts } from '../../theme/fonts';
import { colors } from '../../theme/colors';

interface EditorialInputProps extends TextInputProps {
  label?: string;
  hint?: string;
  containerStyle?: ViewStyle;
}

export const EditorialInput: React.FC<EditorialInputProps> = ({
  label,
  hint,
  containerStyle,
  style,
  ...inputProps
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label != null && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={colors.inkDim}
        selectionColor={colors.inkMid}
        {...inputProps}
      />
      {hint != null && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },

  label: {
    fontFamily:    fonts.hankenSemiBold,
    fontSize:      11,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color:         colors.inkFaint,
    marginBottom:  12,
  },

  input: {
    fontFamily:        fonts.cormorant,
    fontSize:          24,
    color:             colors.ink,
    borderBottomWidth: 1,
    borderBottomColor: colors.inkDim,
    borderRadius:      0,
    backgroundColor:   'transparent',
    paddingVertical:   14,
    paddingHorizontal: 0,
  },

  hint: {
    fontFamily:    fonts.hanken,
    fontSize:      11,
    letterSpacing: 0.5,
    color:         colors.inkDim,
    marginTop:     10,
  },
});
