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
