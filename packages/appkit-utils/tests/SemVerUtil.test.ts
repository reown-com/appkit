import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { AppKitSdkVersion } from '@reown/appkit-common'
import { CoreHelperUtil } from '@reown/appkit-controllers'

import { ConstantsUtil } from '../exports'
import { SemVerUtils } from '../src/SemVerUtils'

// Mock console methods to avoid console output during tests
const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

// Mock fetch for checkSDKVersion tests
const fetchSpy = vi.spyOn(global, 'fetch')

describe('SemVerUtils', () => {
  describe('isOlder', () => {
    describe('basic version comparisons', () => {
      it('should return true when current version is older than latest (major version)', () => {
        expect(SemVerUtils.isOlder('1.7.1' as any, '2.0.0' as any)).toBe(true)
        expect(SemVerUtils.isOlder('1.7.1' as any, '1.8.0' as any)).toBe(true)
      })

      it('should return false when current version is newer than latest (major version)', () => {
        expect(SemVerUtils.isOlder('2.0.0' as any, '1.7.1' as any)).toBe(false)
        expect(SemVerUtils.isOlder('1.8.0' as any, '1.7.1' as any)).toBe(false)
      })

      it('should return true when current version is older than latest (minor version)', () => {
        expect(SemVerUtils.isOlder('1.7.1' as any, '1.8.0' as any)).toBe(true)
        expect(SemVerUtils.isOlder('1.7.9' as any, '1.8.0' as any)).toBe(true)
      })

      it('should return true when current version is older than latest (patch version)', () => {
        expect(SemVerUtils.isOlder('1.7.1' as any, '1.7.2' as any)).toBe(true)
        expect(SemVerUtils.isOlder('1.7.8' as any, '1.7.9' as any)).toBe(true)
      })

      it('should return false when versions are equal', () => {
        expect(SemVerUtils.isOlder('1.7.1' as any, '1.7.1' as any)).toBe(false)
        expect(SemVerUtils.isOlder('2.0.0' as any, '2.0.0' as any)).toBe(false)
        expect(SemVerUtils.isOlder('1.8.3' as any, '1.8.3' as any)).toBe(false)
      })
    })

    describe('canary version comparisons', () => {
      it('should handle canary versions correctly - current canary vs stable latest', () => {
        expect(SemVerUtils.isOlder('1.7.1-canary.3' as any, '1.8.3' as any)).toBe(true)
        expect(SemVerUtils.isOlder('1.7.1-canary.3' as any, '1.8.0' as any)).toBe(true)
        expect(SemVerUtils.isOlder('1.6.9-canary.1' as any, '1.7.0' as any)).toBe(true)
      })

      it('should handle complex canary version strings', () => {
        expect(SemVerUtils.isOlder('1.7.1-abcdef123.456' as any, '1.8.3' as any)).toBe(true)
        expect(SemVerUtils.isOlder('1.8.3-xyz789.123' as any, '1.7.1' as any)).toBe(false)
        expect(SemVerUtils.isOlder('1.7.1-abcdef123.456' as any, '1.7.1' as any)).toBe(false)
      })
    })

    describe('edge cases', () => {
      it('should handle versions with missing parts (treated as 0)', () => {
        expect(SemVerUtils.isOlder('1.7' as any, '1.7.1' as any)).toBe(true)
        expect(SemVerUtils.isOlder('1.7.1' as any, '1.7' as any)).toBe(false)
        expect(SemVerUtils.isOlder('1' as any, '1.0.1' as any)).toBe(true)
      })

      it('should handle invalid version strings gracefully', () => {
        expect(SemVerUtils.isOlder('' as any, '1.7.1' as any)).toBe(false)
        expect(SemVerUtils.isOlder('1.7.1' as any, '' as any)).toBe(false)
        expect(SemVerUtils.isOlder('1.7.1' as any, 'invalid' as any)).toBe(false)
      })

      it('should handle versions with extra parts', () => {
        expect(SemVerUtils.isOlder('1.7.1.0' as any, '1.7.2' as any)).toBe(true)
        expect(SemVerUtils.isOlder('1.7.2' as any, '1.7.1.0' as any)).toBe(false)
      })
    })
  })

  describe('checkSDKVersion', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should not check version in production', () => {
      // Mock CoreHelperUtil.isDevelopment to return false
      const coreHelperMock = vi.spyOn(CoreHelperUtil, 'isDevelopment').mockReturnValueOnce(false)

      SemVerUtils.checkSDKVersion('html-wagmi-1.7.1-canary.3' as any)

      expect(fetchSpy).not.toHaveBeenCalled()
      expect(consoleLogSpy).not.toHaveBeenCalled()
      expect(consoleWarnSpy).not.toHaveBeenCalled()

      coreHelperMock.mockRestore()
    })

    it('should not check version when packageVersion is not available', () => {
      // Mock CoreHelperUtil.isDevelopment to return true
      const coreHelperMock = vi.spyOn(CoreHelperUtil, 'isDevelopment').mockReturnValueOnce(true)

      SemVerUtils.checkSDKVersion('' as AppKitSdkVersion) // No canary suffix

      expect(fetchSpy).not.toHaveBeenCalled()
      expect(consoleLogSpy).not.toHaveBeenCalled()
      expect(consoleWarnSpy).not.toHaveBeenCalled()

      coreHelperMock.mockRestore()
    })

    it('should check version and warn when current is older than latest', async () => {
      // Mock CoreHelperUtil.isDevelopment to return true
      const coreHelperMock = vi.spyOn(CoreHelperUtil, 'isDevelopment').mockReturnValueOnce(true)

      // Mock fetch response
      const mockResponse = {
        json: () => Promise.resolve({ version: '1.8.3' })
      }
      fetchSpy.mockResolvedValueOnce(mockResponse as any)

      // Mock ConstantsUtil.getSDKVersionWarningMessage
      const constantsMock = vi
        .spyOn(ConstantsUtil, 'getSDKVersionWarningMessage')
        .mockReturnValueOnce('Version warning message')

      SemVerUtils.checkSDKVersion('html-react-1.7.1-canary.3')

      // Wait for the async fetch to complete
      await new Promise(process.nextTick)

      expect(fetchSpy).toHaveBeenCalledWith('https://registry.npmjs.org/@reown/appkit/latest')
      expect(consoleWarnSpy).toHaveBeenCalledWith('Version warning message')

      coreHelperMock.mockRestore()
      constantsMock.mockRestore()
    })

    it('should not warn when current version is newer or equal', async () => {
      // Mock CoreHelperUtil.isDevelopment to return true
      const coreHelperMock = vi.spyOn(CoreHelperUtil, 'isDevelopment').mockReturnValueOnce(true)

      // Mock fetch response with older version
      const mockResponse = {
        json: () => Promise.resolve({ version: '1.6.0' })
      }
      fetchSpy.mockResolvedValue(mockResponse as any)

      SemVerUtils.checkSDKVersion('html-react-1.7.1-canary.3')

      // Wait for the async fetch to complete
      await new Promise(process.nextTick)

      expect(fetchSpy).toHaveBeenCalledWith('https://registry.npmjs.org/@reown/appkit/latest')
      expect(consoleWarnSpy).not.toHaveBeenCalled()

      coreHelperMock.mockRestore()
    })

    it('should handle invalid npm response gracefully', async () => {
      // Mock CoreHelperUtil.isDevelopment to return true
      const coreHelperMock = vi.spyOn(CoreHelperUtil, 'isDevelopment').mockReturnValueOnce(true)

      // Mock fetch response with invalid data
      const mockResponse = {
        json: () => Promise.resolve({}) // No version field
      }
      fetchSpy.mockResolvedValueOnce(mockResponse as any)

      SemVerUtils.checkSDKVersion('html-react-1.7.1-canary.3')

      // Wait for the async fetch to complete
      await new Promise(process.nextTick)

      expect(fetchSpy).toHaveBeenCalledWith('https://registry.npmjs.org/@reown/appkit/latest')
      expect(consoleWarnSpy).not.toHaveBeenCalled()

      coreHelperMock.mockRestore()
    })
  })
})
