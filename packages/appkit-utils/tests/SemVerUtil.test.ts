import { beforeEach, describe, expect, it, vi } from 'vitest'

import { type AppKitSdkVersion, ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'

import { ConstantsUtil } from '../exports'
import { SemVerUtils } from '../src/SemVerUtils'

// Mock console methods to avoid console output during tests
const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

// Mock fetch for checkSDKVersion tests
const fetchSpy = vi.spyOn(global, 'fetch')

describe('SemVerUtils', () => {
  describe('extractVersion', () => {
    it('should extract version from html-react format', () => {
      expect(SemVerUtils.extractVersion('html-react-1.7.1-canary.3')).toBe('1.7.1')
      expect(SemVerUtils.extractVersion('html-wagmi-2.0.0-beta.1')).toBe('2.0.0')
      expect(SemVerUtils.extractVersion('vue-ethers-1.5.2')).toBe('1.5.2')
    })

    it('should extract version from simple version strings', () => {
      expect(SemVerUtils.extractVersion('1.7.1')).toBe('1.7.1')
      expect(SemVerUtils.extractVersion('2.0.0')).toBe('2.0.0')
      expect(SemVerUtils.extractVersion('1.5.2-alpha.1')).toBe('1.5.2')
      expect(SemVerUtils.extractVersion('3.1.0-beta.5')).toBe('3.1.0')
    })

    it('should extract version from strings with version range operators', () => {
      expect(SemVerUtils.extractVersion('^1.8.3')).toBe('1.8.3')
      expect(SemVerUtils.extractVersion('~1.7.1')).toBe('1.7.1')
      expect(SemVerUtils.extractVersion('>=1.5.0')).toBe('1.5.0')
      expect(SemVerUtils.extractVersion('<=2.0.0')).toBe('2.0.0')
      expect(SemVerUtils.extractVersion('<1.9.0')).toBe('1.9.0')
      expect(SemVerUtils.extractVersion('>1.6.5')).toBe('1.6.5')
      expect(SemVerUtils.extractVersion('>=1.x.x')).toBe('1')
      expect(SemVerUtils.extractVersion('<=2.x.x')).toBe('2')
      expect(SemVerUtils.extractVersion('^1.7')).toBe('1.7')
      expect(SemVerUtils.extractVersion('~2')).toBe('2')
    })

    it('should extract version from strings with multiple operators and whitespace', () => {
      expect(SemVerUtils.extractVersion('^  1.8.3')).toBe('1.8.3')
      expect(SemVerUtils.extractVersion('>=  1.5.0')).toBe('1.5.0')
      expect(SemVerUtils.extractVersion('<=   2.0.0')).toBe('2.0.0')
      expect(SemVerUtils.extractVersion('<    1.9.0')).toBe('1.9.0')
      expect(SemVerUtils.extractVersion('>   1.6.5')).toBe('1.6.5')
    })

    it('should extract version from strings with operators and pre-release suffixes', () => {
      expect(SemVerUtils.extractVersion('^1.8.3-beta.1')).toBe('1.8.3')
      expect(SemVerUtils.extractVersion('~1.7.1-canary.5')).toBe('1.7.1')
      expect(SemVerUtils.extractVersion('>=1.5.0-alpha.2')).toBe('1.5.0')
      expect(SemVerUtils.extractVersion('<=2.0.0-rc.1')).toBe('2.0.0')
    })

    it('should handle edge cases', () => {
      expect(SemVerUtils.extractVersion('')).toBe(null)
      expect(SemVerUtils.extractVersion('no-version-here')).toBe(null)
      expect(SemVerUtils.extractVersion('1.7')).toBe('1.7')
      expect(SemVerUtils.extractVersion('1')).toBe('1')
      expect(SemVerUtils.extractVersion('invalid')).toBe(null)
      expect(SemVerUtils.extractVersion(undefined)).toBe(null)
      expect(SemVerUtils.extractVersion(null as any)).toBe(null)
    })

    it('should handle various pre-release suffixes', () => {
      expect(SemVerUtils.extractVersion('1.7.1-canary.3')).toBe('1.7.1')
      expect(SemVerUtils.extractVersion('1.7.1-beta.1')).toBe('1.7.1')
      expect(SemVerUtils.extractVersion('1.7.1-alpha.5')).toBe('1.7.1')
      expect(SemVerUtils.extractVersion('1.7.1-rc.2')).toBe('1.7.1')
    })
  })

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

      it('should handle full SDK version format strings', () => {
        expect(SemVerUtils.isOlder('html-react-1.7.1-canary.3' as any, '1.8.3' as any)).toBe(true)
        expect(SemVerUtils.isOlder('html-wagmi-1.8.3' as any, '1.7.1' as any)).toBe(false)
        expect(SemVerUtils.isOlder('vue-ethers-1.7.1' as any, '1.7.1' as any)).toBe(false)
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
      const coreHelperMock = vi
        .spyOn(CommonConstantsUtil, 'IS_DEVELOPMENT', 'get')
        .mockReturnValueOnce(false)

      SemVerUtils.checkSDKVersion('html-wagmi-1.7.1-canary.3' as any)

      expect(fetchSpy).not.toHaveBeenCalled()
      expect(consoleLogSpy).not.toHaveBeenCalled()
      expect(consoleWarnSpy).not.toHaveBeenCalled()

      coreHelperMock.mockRestore()
    })

    it('should not check version when packageVersion is not available', () => {
      // Mock CoreHelperUtil.isDevelopment to return true
      const coreHelperMock = vi
        .spyOn(CommonConstantsUtil, 'IS_DEVELOPMENT', 'get')
        .mockReturnValueOnce(true)

      SemVerUtils.checkSDKVersion('html-react-invalid' as AppKitSdkVersion) // No valid version

      expect(fetchSpy).not.toHaveBeenCalled()
      expect(consoleLogSpy).not.toHaveBeenCalled()
      expect(consoleWarnSpy).not.toHaveBeenCalled()

      coreHelperMock.mockRestore()
    })

    it('should check version and warn when current is older than latest', async () => {
      // Mock CoreHelperUtil.isDevelopment to return true
      const coreHelperMock = vi
        .spyOn(CommonConstantsUtil, 'IS_DEVELOPMENT', 'get')
        .mockReturnValueOnce(true)

      // Mock fetch response
      const mockResponse = {
        json: () => Promise.resolve({ version: '1.8.3' })
      }
      fetchSpy.mockResolvedValueOnce(mockResponse as any)

      // Mock ConstantsUtil.getSDKVersionWarningMessage
      const constantsMock = vi
        .spyOn(ConstantsUtil, 'getSDKVersionWarningMessage')
        .mockReturnValueOnce('Version warning message')

      SemVerUtils.checkSDKVersion('html-react-1.7.1-canary.3' as AppKitSdkVersion)

      // Wait for the async fetch to complete
      await new Promise(process.nextTick)

      expect(fetchSpy).toHaveBeenCalledWith('https://registry.npmjs.org/@reown/appkit/latest')
      expect(consoleWarnSpy).toHaveBeenCalledWith('Version warning message')

      coreHelperMock.mockRestore()
      constantsMock.mockRestore()
    })

    it('should not warn when current version is newer or equal', async () => {
      // Mock CoreHelperUtil.isDevelopment to return true
      const coreHelperMock = vi
        .spyOn(CommonConstantsUtil, 'IS_DEVELOPMENT', 'get')
        .mockReturnValueOnce(true)

      // Mock fetch response with older version
      const mockResponse = {
        json: () => Promise.resolve({ version: '1.6.0' })
      }
      fetchSpy.mockResolvedValue(mockResponse as any)

      SemVerUtils.checkSDKVersion('html-react-1.7.1-canary.3' as AppKitSdkVersion)

      // Wait for the async fetch to complete
      await new Promise(process.nextTick)

      expect(fetchSpy).toHaveBeenCalledWith('https://registry.npmjs.org/@reown/appkit/latest')
      expect(consoleWarnSpy).not.toHaveBeenCalled()

      coreHelperMock.mockRestore()
    })

    it('should handle invalid npm response gracefully', async () => {
      // Mock CoreHelperUtil.isDevelopment to return true
      const coreHelperMock = vi
        .spyOn(CommonConstantsUtil, 'IS_DEVELOPMENT', 'get')
        .mockReturnValueOnce(true)

      // Mock fetch response with invalid data
      const mockResponse = {
        json: () => Promise.resolve({}) // No version field
      }
      fetchSpy.mockResolvedValueOnce(mockResponse as any)

      SemVerUtils.checkSDKVersion('html-react-1.7.1-canary.3' as AppKitSdkVersion)

      // Wait for the async fetch to complete
      await new Promise(process.nextTick)

      expect(fetchSpy).toHaveBeenCalledWith('https://registry.npmjs.org/@reown/appkit/latest')
      expect(consoleWarnSpy).not.toHaveBeenCalled()

      coreHelperMock.mockRestore()
    })
  })
})
