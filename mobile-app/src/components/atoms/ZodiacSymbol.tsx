import React from 'react'
import { ViewStyle } from 'react-native'
import { SvgProps } from 'react-native-svg'

import AriesSvg       from '../../../assets/symbols/zodiac/Aries.svg'
import TaurusSvg      from '../../../assets/symbols/zodiac/Taurus.svg'
import GeminiSvg      from '../../../assets/symbols/zodiac/Gemini.svg'
import CancerSvg      from '../../../assets/symbols/zodiac/Cancer.svg'
import LeoSvg         from '../../../assets/symbols/zodiac/Leo.svg'
import VirgoSvg       from '../../../assets/symbols/zodiac/Virgo.svg'
import LibraSvg       from '../../../assets/symbols/zodiac/Libra.svg'
import ScorpioSvg     from '../../../assets/symbols/zodiac/Scorpio.svg'
import SagittariusSvg from '../../../assets/symbols/zodiac/Sagittarius.svg'
import CapricornSvg   from '../../../assets/symbols/zodiac/Capricorn.svg'
import AquariusSvg    from '../../../assets/symbols/zodiac/Aquarius.svg'
import PiscesSvg      from '../../../assets/symbols/zodiac/Pisces.svg'

const SIGNS: Record<string, React.FC<SvgProps>> = {
  aries:       AriesSvg,
  taurus:      TaurusSvg,
  gemini:      GeminiSvg,
  cancer:      CancerSvg,
  leo:         LeoSvg,
  virgo:       VirgoSvg,
  libra:       LibraSvg,
  scorpio:     ScorpioSvg,
  sagittarius: SagittariusSvg,
  capricorn:   CapricornSvg,
  aquarius:    AquariusSvg,
  pisces:      PiscesSvg,
}

export interface ZodiacSymbolProps {
  sign: string
  size?: number
  opacity?: number
  style?: ViewStyle
}

export const ZodiacSymbol: React.FC<ZodiacSymbolProps> = ({
  sign,
  size = 32,
  opacity = 0.65,
  style,
}) => {
  const SvgComponent = SIGNS[sign.trim().toLowerCase()]
  if (!SvgComponent) return null
  return (
    <SvgComponent
      width={size}
      height={size}
      fill={`rgba(255,255,255,${opacity})`}
      style={style as SvgProps['style']}
    />
  )
}
