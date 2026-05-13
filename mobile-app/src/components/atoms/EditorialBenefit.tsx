import React from 'react'
import { Text } from './Text'

interface EditorialBenefitProps {
  children: React.ReactNode
}

export const EditorialBenefit: React.FC<EditorialBenefitProps> = ({ children }) => (
  <Text variant="readingBody" color="secondary" style={{ textAlign: 'center' }}>
    {children}
  </Text>
)
