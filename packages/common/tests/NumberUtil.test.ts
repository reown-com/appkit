import { describe, expect, it } from 'vitest'
import { NumberUtil } from '../src/utils/NumberUtil.js'

// -- Tests --------------------------------------------------------------------
describe('NumberUtil', () => {
  it('should return isGreaterThan as expected', () => {
    const isGreaterThan = NumberUtil.bigNumber('6.348').isGreaterThan('0')
    expect(isGreaterThan).toBe(true)
  })
})
