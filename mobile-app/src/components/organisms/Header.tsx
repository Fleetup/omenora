import React from 'react'
import { Pressable, View, StyleSheet, ViewStyle } from 'react-native'
import { ChevronLeft } from 'lucide-react-native'
import type { LucideIcon } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { Text } from '../atoms'
import { tokens, layout } from '../../design/tokens'

export interface HeaderProps {
  title: string
  onBack?: () => void
  rightIcon?: LucideIcon
  onRightPress?: () => void
  style?: ViewStyle
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
  rightIcon,
  onRightPress,
  style,
}) => {
  const handleBack = () => {
    Haptics.selectionAsync()
    onBack?.()
  }

  const handleRightPress = () => {
    Haptics.selectionAsync()
    onRightPress?.()
  }

  const RightIcon = rightIcon

  return (
    <View style={[styles.container, style]}>
      {onBack != null ? (
        <Pressable onPress={handleBack} style={styles.slot}>
          <ChevronLeft size={24} color={tokens.text.primary} />
        </Pressable>
      ) : (
        <View style={styles.slot} />
      )}

      <Text variant="heading2" style={styles.title}>
        {title}
      </Text>

      {RightIcon != null && onRightPress != null ? (
        <Pressable onPress={handleRightPress} style={styles.slot}>
          <RightIcon size={24} color={tokens.text.primary} />
        </Pressable>
      ) : (
        <View style={styles.slot} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection:     'row',
    alignItems:        'center',
    height:            56,
    paddingHorizontal: layout.screenPadding,
    borderBottomWidth: 0.5,
    borderBottomColor: tokens.border.subtle,
    backgroundColor:   'transparent',
  },
  slot: {
    width:          44,
    height:         44,
    alignItems:     'center',
    justifyContent: 'center',
  },
  title: {
    flex:      1,
    textAlign: 'center',
  },
})
