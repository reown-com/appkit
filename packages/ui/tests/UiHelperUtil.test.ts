import { beforeAll, describe, expect, it } from 'vitest'
import { vi } from 'vitest'

import { UiHelperUtil } from '../src/utils/UiHelperUtil.js'

// -- Tests --------------------------------------------------------------------
describe('UiHelperUtil', () => {
  beforeAll(() => {
    vi.stubGlobal('document', { documentElement: {} })
    vi.stubGlobal(
      'getComputedStyle',
      vi.fn().mockReturnValue({
        getPropertyValue: vi.fn().mockReturnValue('4px')
      })
    )
  })

  describe('getSpacingStyles', () => {
    it('handles array of spacings', () => {
      expect(UiHelperUtil.getSpacingStyles(['xs', 'm', 'l'], 0)).toBe('var(--wui-spacing-xs)')
      expect(UiHelperUtil.getSpacingStyles(['xs', 'm', 'l'], 1)).toBe('var(--wui-spacing-m)')
      expect(UiHelperUtil.getSpacingStyles(['xs', 'm', 'l'], 3)).toBe(undefined)
    })

    it('handles single spacing string', () => {
      expect(UiHelperUtil.getSpacingStyles('m', 0)).toBe('var(--wui-spacing-m)')
      expect(UiHelperUtil.getSpacingStyles('l', 5)).toBe('var(--wui-spacing-l)')
    })
  })

  describe('getFormattedDate', () => {
    it('formats date to month and day', () => {
      expect(UiHelperUtil.getFormattedDate(new Date('2024-01-01'))).toBe('Jan 1')
      expect(UiHelperUtil.getFormattedDate(new Date('2024-12-31'))).toBe('Dec 31')
    })
  })

  describe('getHostName', () => {
    it('extracts hostname from valid URL', () => {
      expect(UiHelperUtil.getHostName('https://www.example.com/path?query=1')).toBe(
        'www.example.com'
      )
    })

    it('returns empty string for invalid URL', () => {
      expect(UiHelperUtil.getHostName('invalid url')).toBe('')
      expect(UiHelperUtil.getHostName('')).toBe('')
    })
  })

  describe('getTruncateString', () => {
    const longString = '12345678901234567890' // 20 chars

    it('does not truncate if string is short', () => {
      expect(
        UiHelperUtil.getTruncateString({
          string: 'short',
          charsStart: 10,
          charsEnd: 10,
          truncate: 'middle'
        })
      ).toBe('short')
    })

    it('truncates at end', () => {
      expect(
        UiHelperUtil.getTruncateString({
          string: longString,
          charsStart: 5,
          charsEnd: 5,
          truncate: 'end'
        })
      ).toBe('12345...')
    })

    it('truncates at start', () => {
      expect(
        UiHelperUtil.getTruncateString({
          string: longString,
          charsStart: 5,
          charsEnd: 5,
          truncate: 'start'
        })
      ).toBe('...67890')
    })

    it('truncates in middle', () => {
      expect(
        UiHelperUtil.getTruncateString({
          string: longString,
          charsStart: 5,
          charsEnd: 5,
          truncate: 'middle'
        })
      ).toBe('12345...67890')
    })

    it('handles zero chars', () => {
      expect(
        UiHelperUtil.getTruncateString({
          string: longString,
          charsStart: 0,
          charsEnd: 0,
          truncate: 'middle'
        })
      ).toBe('...')
    })

    it('handles unequal chars', () => {
      expect(
        UiHelperUtil.getTruncateString({
          string: longString,
          charsStart: 3,
          charsEnd: 4,
          truncate: 'middle'
        })
      ).toBe('123...7890')
    })
  })

  describe('generateAvatarColors', () => {
    beforeAll(() => {
      vi.stubGlobal(
        'getComputedStyle',
        vi.fn().mockReturnValue({
          getPropertyValue: vi.fn().mockReturnValue('4px')
        })
      )
    })

    it('generates CSS variables for avatar colors', () => {
      const result = UiHelperUtil.generateAvatarColors('0xdeadbeef1234567890abcdef12345678')
      expect(result).toContain('--local-color-1:')
      expect(result).toContain('--local-radial-circle:')
      expect(result).toMatch(/rgb\(\d+,\s*\d+,\s*\d+\)/g)
    })

    it('handles short address', () => {
      const result = UiHelperUtil.generateAvatarColors('0xabc')
      expect(result).toContain('--local-color-1:')
    })
  })

  describe('hexToRgb', () => {
    it('converts hex to RGB array', () => {
      expect(UiHelperUtil.hexToRgb('ff0000')).toEqual([255, 0, 0])
      expect(UiHelperUtil.hexToRgb('00ff00')).toEqual([0, 255, 0])
      expect(UiHelperUtil.hexToRgb('0000ff')).toEqual([0, 0, 255])
    })

    it('handles short hex', () => {
      expect(UiHelperUtil.hexToRgb('abc')).toEqual([0, 10, 188])
    })
  })

  describe('tintColor', () => {
    it('tints RGB color', () => {
      expect(UiHelperUtil.tintColor([0, 0, 0], 0)).toEqual([0, 0, 0])
      expect(UiHelperUtil.tintColor([0, 0, 0], 1)).toEqual([255, 255, 255])
      expect(UiHelperUtil.tintColor([100, 150, 200], 0.5)).toEqual([178, 203, 228]) // round(100 + (255-100)*0.5)=100+77.5=177.5->178, etc.
    })
  })

  describe('isNumber', () => {
    it('checks if string is numeric', () => {
      expect(UiHelperUtil.isNumber('123')).toBe(true)
      expect(UiHelperUtil.isNumber('0')).toBe(true)
      expect(UiHelperUtil.isNumber('abc')).toBe(false)
      expect(UiHelperUtil.isNumber('12a')).toBe(false)
      expect(UiHelperUtil.isNumber('')).toBe(false)
      expect(UiHelperUtil.isNumber('1.2')).toBe(false) // since regex ^[0-9]+$, no dot
    })
  })

  describe('getColorTheme', () => {
    it('returns provided theme', () => {
      expect(UiHelperUtil.getColorTheme('light')).toBe('light')
      expect(UiHelperUtil.getColorTheme('dark')).toBe('dark')
    })

    it('returns dark if undefined and no window match', () => {
      expect(UiHelperUtil.getColorTheme(undefined)).toBe('dark') // in node
    })

    // Note: can't easily test media query without mocking window
  })

  describe('splitBalance', () => {
    it('splits string with one dot', () => {
      expect(UiHelperUtil.splitBalance('123.456')).toEqual(['123', '456'])
      expect(UiHelperUtil.splitBalance('0.00')).toEqual(['0', '00'])
    })

    it('returns [0,00] if no dot or multiple dots', () => {
      expect(UiHelperUtil.splitBalance('123')).toEqual(['0', '00'])
      expect(UiHelperUtil.splitBalance('123.456.789')).toEqual(['0', '00']) // since length >2
    })

    it('handles edge cases', () => {
      expect(UiHelperUtil.splitBalance('.456')).toEqual(['', '456'])
      expect(UiHelperUtil.splitBalance('123.')).toEqual(['123', ''])
      expect(UiHelperUtil.splitBalance('')).toEqual(['0', '00'])
    })
  })

  describe('roundNumber', () => {
    it('rounds to fixed if toString length >= threshold', () => {
      expect(UiHelperUtil.roundNumber(1234567, 7, 2)).toBe('1234567.00') // length=7 >=7
      expect(UiHelperUtil.roundNumber(123456, 7, 2)).toBe(123456) // length=6 <7
    })

    it('handles decimals', () => {
      expect(UiHelperUtil.roundNumber(123.4567, 3, 2)).toBe('123.46')
      expect(UiHelperUtil.roundNumber(0.001, 5, 3)).toBe('0.001')
    })

    it('returns number if not rounding', () => {
      const result = UiHelperUtil.roundNumber(123, 4, 2)
      expect(result).toBe(123)
      expect(typeof result).toBe('number')
    })
  })
})
