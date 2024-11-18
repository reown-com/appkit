import { describe, expect, it } from 'vitest'
import { MathUtil } from '../src/utils/MathUtil.js'

// -- Tests --------------------------------------------------------------------
describe('MathUtil', () => {
  it('should interpolate as expected', () => {
    const inputRange = [0, 100]
    const outputRange = [0, 1]
    const value = 50

    expect(MathUtil.interpolate(inputRange, outputRange, value)).toEqual(0.5)
  })
})
