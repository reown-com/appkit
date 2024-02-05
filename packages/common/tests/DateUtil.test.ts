import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DateUtil } from '../src/utils/DateUtil.js'

const fakeDateTime = new Date(2023, 1, 1, 12)
const fakeDateTimeOneHourAgo = new Date(2023, 1, 1, 11)

// -- Tests --------------------------------------------------------------------
describe('DateUtil', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return this year as expected', () => {
    vi.setSystemTime(fakeDateTime)

    expect(DateUtil.getYear()).toEqual(2023)
  })

  it('should return relative time for one hour ago', () => {
    vi.setSystemTime(fakeDateTime)

    expect(DateUtil.getRelativeDateFromNow(fakeDateTimeOneHourAgo.getTime())).toEqual('1 hr')
  })

  it('should format date correctly', () => {
    expect(DateUtil.formatDate(fakeDateTime.toDateString())).toEqual('01 Feb')
  })
})
