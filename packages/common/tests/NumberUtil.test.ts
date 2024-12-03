import { describe, expect, it } from 'vitest'
import { NumberUtil } from '../src/utils/NumberUtil.js'

// -- Tests --------------------------------------------------------------------
describe('NumberUtil', () => {
  it('should return isGreaterThan as expected', () => {
    const isGreaterThan = NumberUtil.bigNumber('6.348').isGreaterThan('0')
    expect(isGreaterThan).toBe(true)
  })
})

describe('NumberUtil.parseLocalStringToNumber', () => {
  it('should return 0 when value is undefined', () => {
    const result = NumberUtil.parseLocalStringToNumber(undefined)
    expect(result).toBe(0)
  })

  it('should return the number when value is a string', () => {
    const result = NumberUtil.parseLocalStringToNumber('123.45')
    expect(result).toBe(123.45)
  })

  it('should return the number when value is a string with a lot of decimals', () => {
    const result = NumberUtil.parseLocalStringToNumber('123.4567890123456789')
    expect(result).toBe(123.4567890123456789)
  })

  it('should return the number when value is a string with zero and a lot of decimals', () => {
    const result = NumberUtil.parseLocalStringToNumber('0.000000000000000001')
    expect(result).toBe(0.000000000000000001)
  })

  it('should return the number when value is a string with a negative sign', () => {
    const result = NumberUtil.parseLocalStringToNumber('-123.45')
    expect(result).toBe(-123.45)
  })

  it('should return the number when value is a string with commas', () => {
    const result = NumberUtil.parseLocalStringToNumber('123,456.78')
    expect(result).toBe(123456.78)
  })

  it('should return the number when value is a string with a lot of commas', () => {
    const result = NumberUtil.parseLocalStringToNumber('123,456,789.123,456,789')
    expect(result).toBe(123456789.123456789)
  })
})
