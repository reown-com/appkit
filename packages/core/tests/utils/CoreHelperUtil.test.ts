import { describe, expect, it } from 'vitest'
import { CoreHelperUtil } from '../../src/utils/CoreHelperUtil.js'

// -- Tests --------------------------------------------------------------------
describe('CoreHelperUtil', () => {
  it('should return format balance as expected', () => {
    expect(CoreHelperUtil.formatBalance(undefined, undefined)).toBe('0.000')
    expect(CoreHelperUtil.formatBalance('0', undefined)).toBe('0.000')
    expect(CoreHelperUtil.formatBalance('123.456789', 'ETH')).toBe('123.456 ETH')
    expect(CoreHelperUtil.formatBalance('123.456789', undefined)).toBe('123.456')
    expect(CoreHelperUtil.formatBalance('0.000456789', 'BTC')).toBe('0.000 BTC')
    expect(CoreHelperUtil.formatBalance('123456789.123456789', 'USD')).toBe('123456789.123 USD')
    expect(CoreHelperUtil.formatBalance('abc', 'USD')).toBe('0.000 USD')
    expect(CoreHelperUtil.formatBalance('', 'USD')).toBe('0.000 USD')
    expect(CoreHelperUtil.formatBalance('0', 'ETH')).toBe('0.000 ETH')
  })
})
