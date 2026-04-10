import { describe, it, expect } from 'vitest'
import {
  isValidEmail,
  isValidSessionId,
  isValidDateOfBirth,
  isValidArchetype,
  isValidRegion,
  sanitizeString,
} from '../../../server/utils/validate'

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('')).toBe(false)
      expect(isValidEmail(null)).toBe(false)
    })
  })

  describe('isValidSessionId', () => {
    it('should validate Stripe session IDs', () => {
      expect(isValidSessionId('cs_live_1234567890abcdef')).toBe(true)
      expect(isValidSessionId('cs_test_1234567890abcdef')).toBe(true)
    })

    it('should reject invalid session IDs', () => {
      expect(isValidSessionId('invalid')).toBe(false)
      expect(isValidSessionId('cs_invalid_123')).toBe(false)
      expect(isValidSessionId('')).toBe(false)
    })
  })

  describe('isValidDateOfBirth', () => {
    it('should validate correct dates', () => {
      expect(isValidDateOfBirth('1990-01-01')).toBe(true)
      expect(isValidDateOfBirth('2000-12-31')).toBe(true)
    })

    it('should reject invalid dates', () => {
      expect(isValidDateOfBirth('invalid')).toBe(false)
      expect(isValidDateOfBirth('01-01-1990')).toBe(false)
      expect(isValidDateOfBirth('1890-01-01')).toBe(false) // Too old
      expect(isValidDateOfBirth('2030-01-01')).toBe(false) // Future date
    })
  })

  describe('sanitizeString', () => {
    it('should sanitize control characters', () => {
      expect(sanitizeString('hello\x00world')).toBe('helloworld')
      expect(sanitizeString('test\n\r')).toBe('test')
    })

    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello')
    })

    it('should respect max length', () => {
      const long = 'a'.repeat(300)
      expect(sanitizeString(long).length).toBe(200)
    })

    it('should handle non-string inputs', () => {
      expect(sanitizeString(null as any)).toBe('')
      expect(sanitizeString(123 as any)).toBe('')
    })
  })
})
