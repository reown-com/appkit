import { describe, expect, it } from 'vitest'
import { UnitsUtil } from '../../src/utils/UnitsUtil'
import { bitcoin } from '@reown/appkit/networks'

describe('UnitsUtils', () => {
  describe('parseSatoshis', () => {
    it.each([
      ['100000000', '1'],
      ['10000000', '0.1'],
      ['1000000', '0.01'],
      ['100000', '0.001'],
      ['10000', '0.0001'],
      ['1000', '0.00001'],
      ['100', '0.000001'],
      ['10', '0.0000001'],
      ['1', '0.00000001']
    ])('should parse %s satoshis to %s btc', (satoshis, expected) => {
      expect(UnitsUtil.parseSatoshis(satoshis, bitcoin)).toEqual(expected)
    })
  })
})
