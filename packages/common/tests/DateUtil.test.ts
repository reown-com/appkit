import { describe, expect, it } from 'vitest'
import { DateUtil } from '../src/utils/DateUtil.js'

const date = new Date()
const year = new Date().getFullYear()
const oneHourAgo = new Date(date.setHours(date.getHours() - 1)).toISOString()

// -- Tests --------------------------------------------------------------------
describe('DateUtil', () => {
  it('should return this year', () => {
    expect(DateUtil.getYear()).toEqual(year)
  })
  it('should return relative time for one hour ago', () => {
    expect(DateUtil.getRelativeDateFromNow(oneHourAgo)).toEqual("1 hr")
  })
})
