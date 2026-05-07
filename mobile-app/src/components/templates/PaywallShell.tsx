import React from 'react'
import { View, ViewStyle } from 'react-native'
import { ScreenWrapper } from './ScreenWrapper'
import { tokens, space } from '../../design/tokens'

export interface PaywallShellProps {
  hero: React.ReactNode
  features: React.ReactNode
  planSelector?: React.ReactNode
  primaryCta: React.ReactNode
  secondaryAction?: React.ReactNode
  legalFooter?: React.ReactNode
  style?: ViewStyle
}

export const PaywallShell: React.FC<PaywallShellProps> = ({
  hero,
  features,
  planSelector,
  primaryCta,
  secondaryAction,
  legalFooter,
  style,
}) => {
  return (
    <ScreenWrapper scroll padded background="base" style={style}>
      <View style={{ alignItems: 'center', paddingVertical: space['8'] }}>
        {hero}
      </View>
      <View style={{ marginTop: space['6'] }}>
        {features}
      </View>
      {planSelector != null && (
        <View style={{ marginTop: space['8'] }}>
          {planSelector}
        </View>
      )}
      <View style={{ marginTop: space['8'] }}>
        {primaryCta}
      </View>
      {secondaryAction != null && (
        <View style={{ marginTop: space['4'], alignItems: 'center' }}>
          {secondaryAction}
        </View>
      )}
      {legalFooter != null && (
        <View style={{ marginTop: space['8'], paddingTop: space['4'], borderTopWidth: 0.5, borderTopColor: tokens.border.subtle }}>
          {legalFooter}
        </View>
      )}
    </ScreenWrapper>
  )
}
