import { describe, expect, it } from 'vitest'

import { HelpersUtil } from '../../src/utils/HelpersUtil.js'

describe('HelpersUtil', () => {
  describe('isValidReownName', () => {
    it('should return true for valid names', () => {
      expect(HelpersUtil.isValidReownName('ValidName123')).toBe(true)
    })

    it('should return true for valid names', () => {
      expect(HelpersUtil.isValidReownName('123ValidName')).toBe(true)
    })

    it('should return false for names with special characters', () => {
      expect(HelpersUtil.isValidReownName('Invalid@Name!')).toBe(false)
    })

    it('should return false for names with special characters 2', () => {
      expect(HelpersUtil.isValidReownName('Invalid.Name')).toBe(false)
    })

    it('should return false for names with spaces', () => {
      expect(HelpersUtil.isValidReownName('Invalid Name')).toBe(false)
    })

    it('should return false for names with spaces', () => {
      expect(HelpersUtil.isValidReownName('Invalid^name')).toBe(false)
    })
  })

  describe('isValidEmail', () => {
    it('should return true for valid email addresses', () => {
      expect(HelpersUtil.isValidEmail('test@example.com')).toBe(true)
      expect(HelpersUtil.isValidEmail('user.name@domain.co.uk')).toBe(true)
      expect(HelpersUtil.isValidEmail('user+tag@example.org')).toBe(true)
      expect(HelpersUtil.isValidEmail('123@domain.net')).toBe(true)
      expect(HelpersUtil.isValidEmail('a@b.co')).toBe(true)
    })

    it('should return false for emails without @ symbol', () => {
      expect(HelpersUtil.isValidEmail('testexample.com')).toBe(false)
      expect(HelpersUtil.isValidEmail('plaintext')).toBe(false)
    })

    it('should return false for emails without domain', () => {
      expect(HelpersUtil.isValidEmail('test@')).toBe(false)
      expect(HelpersUtil.isValidEmail('user@domain')).toBe(false)
    })

    it('should return false for emails without local part', () => {
      expect(HelpersUtil.isValidEmail('@example.com')).toBe(false)
      expect(HelpersUtil.isValidEmail('@domain.co.uk')).toBe(false)
    })

    it('should return false for emails with spaces', () => {
      expect(HelpersUtil.isValidEmail('test @example.com')).toBe(false)
      expect(HelpersUtil.isValidEmail('test@ example.com')).toBe(false)
      expect(HelpersUtil.isValidEmail('test@example .com')).toBe(false)
    })

    it('should return false for emails with multiple @ symbols', () => {
      expect(HelpersUtil.isValidEmail('test@@example.com')).toBe(false)
      expect(HelpersUtil.isValidEmail('test@example@com')).toBe(false)
    })

    it('should return false for empty string', () => {
      expect(HelpersUtil.isValidEmail('')).toBe(false)
    })

    it('should return false for emails without proper domain extension', () => {
      expect(HelpersUtil.isValidEmail('test@example')).toBe(false)
      expect(HelpersUtil.isValidEmail('test@example.')).toBe(false)
    })
  })

  describe('validateReownName', () => {
    it('should remove special characters and return a valid name', () => {
      expect(HelpersUtil.validateReownName('Invalid@Name!')).toBe('invalidname')
    })

    it('should remove spaces and return a valid name', () => {
      expect(HelpersUtil.validateReownName('Invalid Name')).toBe('invalidname')
    })

    it('should remove caret characters and return a valid name', () => {
      expect(HelpersUtil.validateReownName('Invalid^Name')).toBe('invalidname')
    })

    it('should return the same name if it is already valid', () => {
      expect(HelpersUtil.validateReownName('ValidName123')).toBe('validname123')
    })

    it('should return an empty string if the name only contains invalid characters', () => {
      expect(HelpersUtil.validateReownName('^@!')).toBe('')
    })
  })
})
