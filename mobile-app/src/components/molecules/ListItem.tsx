import React from 'react'
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native'
import * as Haptics from 'expo-haptics'
import { ChevronRight } from 'lucide-react-native'
import type { LucideIcon } from 'lucide-react-native'
import { Text } from '../atoms'
import { tokens, space, layout } from '../../design/tokens'

export interface ListItemProps {
  label: string
  icon?: LucideIcon
  meta?: string
  onPress?: () => void
  showChevron?: boolean
  destructive?: boolean
  disabled?: boolean
  style?: ViewStyle
}

export const ListItem: React.FC<ListItemProps> = ({
  label,
  icon,
  meta,
  onPress,
  showChevron,
  destructive = false,
  disabled = false,
  style,
}) => {
  const isInteractive = onPress != null && !disabled
  const shouldShowChevron = showChevron ?? (onPress != null)
  const iconColor = destructive ? tokens.state.danger : tokens.text.secondary

  const LeadingIcon = icon

  const handlePress = () => {
    Haptics.selectionAsync()
    onPress?.()
  }

  const content = (
    <>
      {LeadingIcon != null && (
        <View style={styles.leadingIcon}>
          <LeadingIcon size={20} color={iconColor} />
        </View>
      )}
      <Text
        variant="body"
        style={[styles.label, destructive && { color: tokens.state.danger }]}
      >
        {label}
      </Text>
      {meta != null && (
        <Text
          variant="caption"
          color="tertiary"
          style={shouldShowChevron ? styles.metaWithGap : undefined}
        >
          {meta}
        </Text>
      )}
      {shouldShowChevron && (
        <ChevronRight size={18} color={tokens.text.tertiary} />
      )}
    </>
  )

  if (isInteractive) {
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.row,
          styles.interactive,
          pressed && styles.pressed,
          style,
        ]}
      >
        {content}
      </Pressable>
    )
  }

  return (
    <View style={[styles.row, disabled && styles.disabled, style]}>
      {content}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingVertical:   space['3'],
    paddingHorizontal: space['4'],
  },
  interactive: {
    minHeight: layout.tapTarget,
  },
  leadingIcon: {
    marginRight: space['3'],
  },
  label: {
    flex: 1,
  },
  metaWithGap: {
    marginRight: space['2'],
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.5,
  },
})
