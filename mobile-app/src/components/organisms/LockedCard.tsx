import React from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'
import { BlurView } from 'expo-blur'
import { Lock } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { Text, Icon, Button } from '../atoms'
import { Card } from './Card'
import { tokens, space, layout } from '../../design/tokens'

export interface LockedCardProps {
  children: React.ReactNode
  preview?: React.ReactNode
  placement: string
  onUnlockPress: () => void
  lockMessage?: string
  unlockCtaLabel?: string
  variant?: 'default' | 'raised' | 'premium'
  minLockedHeight?: number
  style?: ViewStyle
}

export const LockedCard: React.FC<LockedCardProps> = ({
  children,
  preview,
  placement: _placement,
  onUnlockPress,
  lockMessage = 'Unlock to read more',
  unlockCtaLabel = 'Unlock',
  variant = 'premium',
  minLockedHeight = 200,
  style,
}) => {
  const handleUnlockPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    onUnlockPress()
  }

  return (
    <Card variant={variant} padding="default" style={style}>
      {preview != null && (
        <View style={styles.preview}>
          {preview}
        </View>
      )}
      <View style={[styles.lockedRegion, { minHeight: minLockedHeight }]}>
        <View style={styles.contentFade}>
          {children}
        </View>
        <BlurView
          intensity={tokens.specialty.lockBlur}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
        <View style={[StyleSheet.absoluteFill, styles.scrim]} />
        <View style={[StyleSheet.absoluteFill, styles.affordance]}>
          <Icon icon={Lock} size={32} color="accent" />
          <Text
            variant="body"
            color="primary"
            style={styles.lockMessage}
          >
            {lockMessage}
          </Text>
          <Button label={unlockCtaLabel} variant="primary" onPress={handleUnlockPress} />
        </View>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  preview: {
    marginBottom: layout.cardGap,
  },
  lockedRegion: {
    position: 'relative',
  },
  contentFade: {
    opacity: 0.5,
  },
  scrim: {
    backgroundColor: tokens.specialty.lockScrim,
  },
  affordance: {
    justifyContent: 'center',
    alignItems:     'center',
    padding:        layout.cardPaddingDefault,
  },
  lockMessage: {
    textAlign:    'center',
    marginTop:    space['3'],
    marginBottom: space['4'],
  },
})
