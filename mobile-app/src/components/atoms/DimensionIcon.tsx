import React from 'react'
import { ViewStyle } from 'react-native'
import { SvgProps } from 'react-native-svg'

import LoveSvg   from '../../../assets/symbols/dimensions/love.svg'
import WorkSvg   from '../../../assets/symbols/dimensions/work.svg'
import HealthSvg from '../../../assets/symbols/dimensions/health.svg'

const DIMENSIONS: Record<'love' | 'work' | 'health', React.FC<SvgProps>> = {
  love:   LoveSvg,
  work:   WorkSvg,
  health: HealthSvg,
}

export interface DimensionIconProps {
  dimension: 'love' | 'work' | 'health'
  size?: number
  opacity?: number
  style?: ViewStyle
}

export const DimensionIcon: React.FC<DimensionIconProps> = ({
  dimension,
  size = 60,
  opacity = 0.85,
  style,
}) => {
  const SvgComponent = DIMENSIONS[dimension]
  return (
    <SvgComponent
      width={size}
      height={size}
      fill={`rgba(255,255,255,${opacity})`}
      style={style as SvgProps['style']}
    />
  )
}
