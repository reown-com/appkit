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
      expect(UiHelperUtil.getSpacingStyles(['0', '1', '2'], 0)).toBe('var(--apkt-spacing-0)')
      expect(UiHelperUtil.getSpacingStyles(['0', '1', '2'], 1)).toBe('var(--apkt-spacing-1)')
      expect(UiHelperUtil.getSpacingStyles(['0', '1', '2'], 3)).toBe(undefined)
    })

    it('handles single spacing string', () => {
      expect(UiHelperUtil.getSpacingStyles('3', 0)).toBe('var(--apkt-spacing-3)')
      expect(UiHelperUtil.getSpacingStyles('4', 5)).toBe('var(--apkt-spacing-4)')
    })
  })

  describe('getFormattedDate', () => {
    it('formats date to month and day', () => {
      expect(UiHelperUtil.getFormattedDate(new Date('2024-01-01T12:00:00.000Z'))).toBe('Jan 1')
      expect(UiHelperUtil.getFormattedDate(new Date('2024-12-31T12:00:00.000Z'))).toBe('Dec 31')
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

  describe('maskInput', () => {
    it('returns "0." when value is just the decimal point', () => {
      expect(UiHelperUtil.maskInput({ value: '.', decimals: 2, integers: 5 })).toBe('0.')
      expect(UiHelperUtil.maskInput({ value: '.', decimals: 0, integers: 5 })).toBe('0.')
      expect(
        UiHelperUtil.maskInput({
          value: '.',
          decimals: undefined,
          integers: undefined
        })
      ).toBe('0.')
    })

    it('strips non-digits from integer and decimal parts', () => {
      expect(UiHelperUtil.maskInput({ value: '1a2b', decimals: 2, integers: 5 })).toBe('12')
      expect(UiHelperUtil.maskInput({ value: '1a2b.3c4d', decimals: 4, integers: 5 })).toBe('12.34')
      expect(UiHelperUtil.maskInput({ value: 'abc.def', decimals: 2, integers: 5 })).toBe('.')
    })

    it('limits integer digits according to "integers"', () => {
      expect(UiHelperUtil.maskInput({ value: '123456', decimals: 2, integers: 3 })).toBe('123')
      expect(UiHelperUtil.maskInput({ value: '000123', decimals: 2, integers: 4 })).toBe('0001')
    })

    it('normalizes exactly two-digit integers ("00" -> "0", "01" -> "1")', () => {
      expect(UiHelperUtil.maskInput({ value: '00', decimals: 2, integers: 2 })).toBe('0')
      expect(UiHelperUtil.maskInput({ value: '01', decimals: 2, integers: 2 })).toBe('1')
    })

    it('applies decimal limit when decimals > 0 and a decimals part is present', () => {
      expect(UiHelperUtil.maskInput({ value: '12.3456', decimals: 2, integers: 10 })).toBe('12.34')
      expect(UiHelperUtil.maskInput({ value: '12.3', decimals: 4, integers: 10 })).toBe('12.3')
    })

    it('handles decimals when decimals is 0 or not a number', () => {
      expect(UiHelperUtil.maskInput({ value: '12.34', decimals: 0, integers: 10 })).toBe('12')
      expect(UiHelperUtil.maskInput({ value: '12.34', decimals: undefined, integers: 10 })).toBe(
        '12.34'
      )
    })

    it('handles inputs without a decimal point', () => {
      expect(UiHelperUtil.maskInput({ value: '123', decimals: 2, integers: 10 })).toBe('123')
      expect(UiHelperUtil.maskInput({ value: '123', decimals: 0, integers: 10 })).toBe('123')
    })

    it('handles multiple decimal points by considering only the first split part', () => {
      expect(UiHelperUtil.maskInput({ value: '1.2.3', decimals: 2, integers: 10 })).toBe('1.2')
    })

    it('removes signs and non-numeric characters', () => {
      expect(UiHelperUtil.maskInput({ value: '-123.45', decimals: 2, integers: 10 })).toBe('123.45')
      expect(UiHelperUtil.maskInput({ value: '+123,45', decimals: 2, integers: 10 })).toBe('123.45')
    })

    it('handles empty and whitespace inputs', () => {
      expect(UiHelperUtil.maskInput({ value: '', decimals: 2, integers: 10 })).toBe('')
      expect(UiHelperUtil.maskInput({ value: '   ', decimals: 2, integers: 10 })).toBe('')
    })

    it('truncates decimals to zero length when decimals=0 even if value includes dot', () => {
      expect(UiHelperUtil.maskInput({ value: '0.0001', decimals: 0, integers: 2 })).toBe('0')
    })

    it('large inputs respect both integer and decimal caps', () => {
      expect(
        UiHelperUtil.maskInput({ value: '9876543210.1234567890', decimals: 4, integers: 6 })
      ).toBe('987654.1234')
    })
  })
  it('should format currency as expected', () => {
    // Large numbers
    expect(UiHelperUtil.formatCurrency(1000000)).toEqual('$1,000,000.00')
    expect(UiHelperUtil.formatCurrency(2500000.5)).toEqual('$2,500,000.50')
    expect(UiHelperUtil.formatCurrency(123456789.99)).toEqual('$123,456,789.99')

    // Mid-range numbers
    expect(UiHelperUtil.formatCurrency(10000)).toEqual('$10,000.00')
    expect(UiHelperUtil.formatCurrency(12345.67)).toEqual('$12,345.67')
    expect(UiHelperUtil.formatCurrency(54321.12)).toEqual('$54,321.12')

    // Small numbers
    expect(UiHelperUtil.formatCurrency(10.5)).toEqual('$10.50')
    expect(UiHelperUtil.formatCurrency(0.99)).toEqual('$0.99')
    expect(UiHelperUtil.formatCurrency(0.004)).toEqual('$0.00')
    expect(UiHelperUtil.formatCurrency(0.006)).toEqual('$0.01')

    // Zero and negative numbers
    expect(UiHelperUtil.formatCurrency(0)).toEqual('$0.00')
    expect(UiHelperUtil.formatCurrency(-10000)).toEqual('-$10,000.00')
    expect(UiHelperUtil.formatCurrency(-123.45)).toEqual('-$123.45')

    // String numbers
    expect(UiHelperUtil.formatCurrency('10000')).toEqual('$10,000.00')
    expect(UiHelperUtil.formatCurrency('10000')).toEqual('$10,000.00')
    expect(UiHelperUtil.formatCurrency('12345.67')).toEqual('$12,345.67')

    // Invalid numbers
    expect(UiHelperUtil.formatCurrency('')).toEqual('$0.00')
    expect(UiHelperUtil.formatCurrency('abc')).toEqual('$0.00')
    expect(UiHelperUtil.formatCurrency(undefined)).toEqual('$0.00')
  })
})
