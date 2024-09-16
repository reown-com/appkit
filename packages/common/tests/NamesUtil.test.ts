import { describe, test, expect } from 'vitest'
import { isReownName } from '../src/utils/NamesUtil'
import { ConstantsUtil } from '../src/utils/ConstantsUtil'

describe('NamesUtil', () => {
  describe('isReownName', () => {
    test('returns true for names ending with legacy suffix', () => {
      const legacyName = `testname${ConstantsUtil.WC_NAME_SUFFIX_LEGACY}`
      expect(isReownName(legacyName)).toBe(true)
    })

    test('returns true for names ending with current suffix', () => {
      const currentName = `testname${ConstantsUtil.WC_NAME_SUFFIX}`
      expect(isReownName(currentName)).toBe(true)
    })

    test('returns false for names not ending with either suffix', () => {
      expect(isReownName('testname')).toBe(false)
      expect(isReownName('testname.com')).toBe(false)
    })

    test('returns false for empty string', () => {
      expect(isReownName('')).toBe(false)
    })
  })
})
