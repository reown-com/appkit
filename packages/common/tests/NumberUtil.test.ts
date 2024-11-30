import { describe, expect, it } from 'vitest'
import { NumberUtil } from '../src/utils/NumberUtil.js'
import BigNumber from 'bignumber.js'

// -- Tests --------------------------------------------------------------------
describe('NumberUtil', () => {
  it('should return isGreaterThan as expected', () => {
    const isGreaterThan = NumberUtil.bigNumber('6.348').isGreaterThan('0')
    expect(isGreaterThan).toBe(true)
  })
})

describe('multiply', () => {
  it('should return 0 if either value is undefined', () => {
    expect(NumberUtil.multiply(undefined, '10')).toEqual(new BigNumber(0))
    expect(NumberUtil.multiply('10', undefined)).toEqual(new BigNumber(0))
  })

  it('should multiply two numbers represented as strings', () => {
    const result = NumberUtil.multiply('2', '3')
    expect(result).toEqual(new BigNumber(6))
  })

  it('should handle decimals correctly', () => {
    const result = NumberUtil.multiply('1.5', '2.5')
    expect(result).toEqual(new BigNumber(3.75))
  })
})

describe('formatNumberToLocalString', () => {
  it('should return "0.00" if value is undefined', () => {
    expect(NumberUtil.formatNumberToLocalString(undefined)).toBe('0.00')
  })

  it('should format a number to a local string with specified decimals', () => {
    expect(NumberUtil.formatNumberToLocalString(1234.5678, 2)).toBe('1,234.57')
    expect(NumberUtil.formatNumberToLocalString(1234.5, 2)).toBe('1,234.50')
  })

  it('should format a string representation of a number to a local string', () => {
    expect(NumberUtil.formatNumberToLocalString('1234.5678', 2)).toBe('1,234.57')
  })

  it('should handle invalid string input gracefully', () => {
    expect(NumberUtil.formatNumberToLocalString('invalid', 2)).toBe('NaN')
  })
})
