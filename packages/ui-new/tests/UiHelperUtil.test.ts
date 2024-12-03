import { describe, expect, it } from 'vitest'
import { UiHelperUtil } from '../src/utils/UiHelperUtil.js'

// -- Tests --------------------------------------------------------------------
describe('UiHelperUtil', () => {
  it('should format the numbers as expected', () => {
    expect(UiHelperUtil.formatNumberToLocalString(1000000)).toEqual('1,000,000.00')
    expect(UiHelperUtil.formatNumberToLocalString(1000000, 3)).toEqual('1,000,000.000')
    expect(UiHelperUtil.formatNumberToLocalString(100, 5)).toEqual('100.00000')
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
