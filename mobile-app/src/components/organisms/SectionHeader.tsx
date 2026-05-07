import React from 'react'
import { Pressable, View, StyleSheet, ViewStyle } from 'react-native'
import * as Haptics from 'expo-haptics'
import { Text, Divider } from '../atoms'
import { space, layout } from '../../design/tokens'

export interface SectionHeaderProps {
  title: string
  subtitle?: string
  actionLabel?: string
  onActionPress?: () => void
  rule?: boolean
  style?: ViewStyle
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  rule = false,
  style,
}) => {
  const handleActionPress = () => {
    Haptics.selectionAsync()
    onActionPress?.()
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.topRow}>
        <Text variant="heading2">
          {title}
        </Text>
        {actionLabel != null && (
          <Pressable onPress={handleActionPress}>
            <Text variant="label" color="accent">
              {actionLabel}
            </Text>
          </Pressable>
        )}
      </View>
      {subtitle != null && (
        <Text variant="caption" color="secondary" style={styles.subtitle}>
          {subtitle}
        </Text>
      )}
      {rule && (
        <Divider variant="gold" style={styles.rule} />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: layout.cardGap,
  },
  topRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'baseline',
  },
  subtitle: {
    marginTop: space['1'],
  },
  rule: {
    marginTop: space['3'],
  },
})
