// @vitest-environment jsdom
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

  it.each([
    { address: '0x0', chain: undefined, expected: false },
    { address: '0x0', chain: 'eip155', expected: false },
    { address: '0xb3F068DCc2f92ED42E0417d4f2C2191f743fBfdA', chain: undefined, expected: true },
    { address: '0xb3F068DCc2f92ED42E0417d4f2C2191f743fBfdA', chain: 'eip155', expected: true },
    { address: '0xb3F068DCc2f92ED42E0417d4f2C2191f743fBfdA', chain: 'solana', expected: false },
    { address: '2VqKhjZ766ZN3uBtBpb7Ls3cN4HrocP1rzxzekhVEgpU', chain: 'solana', expected: true }
  ] as const)(
    'should return $expected validating $address when chain is $chain',
    ({ address, chain, expected }) => {
      expect(CoreHelperUtil.isAddress(address, chain)).toBe(expected)
    }
  )

  it('should return true when inside an iframe', () => {
    const originalTop = global.window.top
    const originalSelf = global.window.self
    try {
      ;(global.window as any).top = { name: 'top' }
      ;(global.window as any).self = { name: 'self' }

      expect(CoreHelperUtil.isIframe()).toBe(true)
    } finally {
      global.window.top = originalTop
      global.window.self = originalSelf
    }
  })

  it('should return false when not inside an iframe', () => {
    const originalTop = global.window.top
    const originalSelf = global.window.self

    try {
      global.window.top = global.window.self

      expect(CoreHelperUtil.isIframe()).toBe(false)
    } finally {
      global.window.top = originalTop
      global.window.self = originalSelf
    }
  })

  it.each([
    [undefined, false],
    [{}, false],
    ['0x0', false],
    ['eip155::mock_address', false],
    ['eip155:mock_chain_id:', false],
    ['invalid_namespace:mock_chain_id:address', false],
    ['eip155:mock_chain_id:mock_address', true],
    ['solana:mock_chain_id:mock_address', true],
    ['bip122:mock_chain_id:mock_address', true]
  ])('should validate the value $s is valid caip address $b', (caipAddress, expected) => {
    expect(CoreHelperUtil.isCaipAddress(caipAddress)).toEqual(expected)
  })
})
