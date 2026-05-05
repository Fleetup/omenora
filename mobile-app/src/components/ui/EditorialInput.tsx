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
        placeholderTextColor="rgba(255, 255, 255, 0.22)"
        selectionColor="rgba(255, 255, 255, 0.6)"
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
    color:         'rgba(255, 255, 255, 0.35)',
    marginBottom:  12,
  },

  input: {
    fontFamily:        fonts.cormorant,
    fontSize:          24,
    color:             'rgba(255, 255, 255, 0.93)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius:      0,
    backgroundColor:   'transparent',
    paddingVertical:   14,
    paddingHorizontal: 0,
  },

  hint: {
    fontFamily:    fonts.hanken,
    fontSize:      11,
    letterSpacing: 0.5,
    color:         'rgba(255, 255, 255, 0.28)',
    marginTop:     10,
  },
});
