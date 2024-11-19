import { describe, expect, it } from 'vitest'
import { UiHelperUtil } from '../src/utils/UiHelperUtil.js'

// -- Tests --------------------------------------------------------------------
describe('UiHelperUtil', () => {
  it('should format the numbers as expected', () => {
    expect(UiHelperUtil.formatNumberToLocalString(1000000)).toEqual('1,000,000.00')
    expect(UiHelperUtil.formatNumberToLocalString(1000000, 3)).toEqual('1,000,000.000')
    expect(UiHelperUtil.formatNumberToLocalString(100, 5)).toEqual('100.00000')
  })
})
