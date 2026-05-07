import React, { useEffect } from 'react'
import { Pressable, StyleSheet, ViewStyle } from 'react-native'
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated'
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  type LucideIcon,
} from 'lucide-react-native'
import { Text } from '../atoms'
import { tokens, space, layout, radius, duration as motionDuration } from '../../design/tokens'

export type ToastVariant = 'success' | 'warning' | 'danger' | 'info'

export interface ToastProps {
  variant: ToastVariant
  message: string
  visible: boolean
  onDismiss: () => void
  duration?: number
  style?: ViewStyle
}

type VariantConfig = {
  backgroundColor: string
  icon: LucideIcon
}

const variantMap: Record<ToastVariant, VariantConfig> = {
  success: { backgroundColor: tokens.state.success, icon: CheckCircle },
  warning: { backgroundColor: tokens.state.warning, icon: AlertTriangle },
  danger:  { backgroundColor: tokens.state.danger,  icon: XCircle },
  info:    { backgroundColor: tokens.state.info,    icon: Info },
}

export const Toast: React.FC<ToastProps> = ({
  variant,
  message,
  visible,
  onDismiss,
  duration = 3000,
  style,
}) => {
  useEffect(() => {
    if (!visible) return

    const timer = setTimeout(() => {
      onDismiss()
    }, duration)

    return () => clearTimeout(timer)
  }, [visible, duration, onDismiss])

  if (!visible) return null

  const config = variantMap[variant]
  const ToastIcon = config.icon

  return (
    <Animated.View
      entering={FadeInDown.duration(motionDuration.transition)}
      exiting={FadeOutUp.duration(motionDuration.transition)}
      style={[
        styles.container,
        { backgroundColor: config.backgroundColor },
        style,
      ]}
    >
      <Pressable onPress={onDismiss} style={styles.pressable}>
        <ToastIcon size={20} color="#FFFFFF" />
        <Text variant="body" style={styles.message}>
          {message}
        </Text>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position:     'absolute',
    top:          0,
    left:         layout.screenPadding,
    right:        layout.screenPadding,
    borderRadius: radius.md,
    overflow:     'hidden',
  },
  pressable: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               space['3'],
    paddingVertical:   space['3'],
    paddingHorizontal: space['4'],
  },
  message: {
    flex:  1,
    color: '#FFFFFF',
  },
})
