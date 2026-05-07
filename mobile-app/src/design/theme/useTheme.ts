import { useContext } from 'react'
import { ThemeContext, type ThemeContextValue } from './ThemeProvider'

export const useTheme = (): ThemeContextValue => useContext(ThemeContext)
