import { beforeEach, describe, expect, it } from 'vitest'

import type { TonWalletInfo } from '@reown/appkit-utils/ton'

import {
  isWalletInfoCurrentlyEmbedded,
  isWalletInfoCurrentlyInjected,
  isWalletInfoInjectable,
  isWalletInfoRemote,
  toUserFriendlyAddress,
  userFriendlyToRawAddress
} from '../../src/utils/TonWalletUtils'

describe('TonWalletUtils', () => {
  describe('Type Guards', () => {
    describe('isWalletInfoInjectable', () => {
      it('should return true for injectable wallet', () => {
        const wallet: TonWalletInfo = {
          name: 'TestWallet',
          appName: 'test_wallet',
          imageUrl: 'https://test.com/icon.png',
          aboutUrl: 'https://test.com',
          platforms: ['chrome'],
          jsBridgeKey: 'testWallet',
          injected: true,
          embedded: false
        }

        expect(isWalletInfoInjectable(wallet)).toBe(true)
      })

      it('should return false for remote wallet', () => {
        const wallet: TonWalletInfo = {
          name: 'TestWallet',
          appName: 'test_wallet',
          imageUrl: 'https://test.com/icon.png',
          aboutUrl: 'https://test.com',
          platforms: ['ios', 'android'],
          bridgeUrl: 'https://bridge.test.com'
        }

        expect(isWalletInfoInjectable(wallet)).toBe(false)
      })
    })

    describe('isWalletInfoRemote', () => {
      it('should return true for remote wallet with bridgeUrl', () => {
        const wallet: TonWalletInfo = {
          name: 'TestWallet',
          appName: 'test_wallet',
          imageUrl: 'https://test.com/icon.png',
          aboutUrl: 'https://test.com',
          platforms: ['ios', 'android'],
          bridgeUrl: 'https://bridge.test.com'
        }

        expect(isWalletInfoRemote(wallet)).toBe(true)
      })

      it('should return false for injectable wallet', () => {
        const wallet: TonWalletInfo = {
          name: 'TestWallet',
          appName: 'test_wallet',
          imageUrl: 'https://test.com/icon.png',
          aboutUrl: 'https://test.com',
          platforms: ['chrome'],
          jsBridgeKey: 'testWallet',
          injected: true,
          embedded: false
        }

        expect(isWalletInfoRemote(wallet)).toBe(false)
      })

      it('should return false if bridgeUrl is not a string', () => {
        const wallet: TonWalletInfo = {
          name: 'TestWallet',
          appName: 'test_wallet',
          imageUrl: 'https://test.com/icon.png',
          aboutUrl: 'https://test.com',
          platforms: ['ios'],
          bridgeUrl: undefined
        }

        expect(isWalletInfoRemote(wallet)).toBe(false)
      })
    })

    describe('isWalletInfoCurrentlyInjected', () => {
      it('should return true for currently injected wallet', () => {
        const wallet: TonWalletInfo = {
          name: 'TestWallet',
          appName: 'test_wallet',
          imageUrl: 'https://test.com/icon.png',
          aboutUrl: 'https://test.com',
          platforms: ['chrome'],
          jsBridgeKey: 'testWallet',
          injected: true,
          embedded: false
        }

        expect(isWalletInfoCurrentlyInjected(wallet)).toBe(true)
      })

      it('should return false if injected is false', () => {
        const wallet: TonWalletInfo = {
          name: 'TestWallet',
          appName: 'test_wallet',
          imageUrl: 'https://test.com/icon.png',
          aboutUrl: 'https://test.com',
          platforms: ['chrome'],
          jsBridgeKey: 'testWallet',
          injected: false,
          embedded: false
        }

        expect(isWalletInfoCurrentlyInjected(wallet)).toBe(false)
      })

      it('should return false for remote wallet', () => {
        const wallet: TonWalletInfo = {
          name: 'TestWallet',
          appName: 'test_wallet',
          imageUrl: 'https://test.com/icon.png',
          aboutUrl: 'https://test.com',
          platforms: ['ios'],
          bridgeUrl: 'https://bridge.test.com'
        }

        expect(isWalletInfoCurrentlyInjected(wallet)).toBe(false)
      })
    })

    describe('isWalletInfoCurrentlyEmbedded', () => {
      it('should return true for currently embedded wallet', () => {
        const wallet: TonWalletInfo = {
          name: 'TestWallet',
          appName: 'test_wallet',
          imageUrl: 'https://test.com/icon.png',
          aboutUrl: 'https://test.com',
          platforms: ['chrome'],
          jsBridgeKey: 'testWallet',
          injected: true,
          embedded: true
        }

        expect(isWalletInfoCurrentlyEmbedded(wallet)).toBe(true)
      })

      it('should return false if embedded is false', () => {
        const wallet: TonWalletInfo = {
          name: 'TestWallet',
          appName: 'test_wallet',
          imageUrl: 'https://test.com/icon.png',
          aboutUrl: 'https://test.com',
          platforms: ['chrome'],
          jsBridgeKey: 'testWallet',
          injected: true,
          embedded: false
        }

        expect(isWalletInfoCurrentlyEmbedded(wallet)).toBe(false)
      })

      it('should return false if not injected', () => {
        const wallet: TonWalletInfo = {
          name: 'TestWallet',
          appName: 'test_wallet',
          imageUrl: 'https://test.com/icon.png',
          aboutUrl: 'https://test.com',
          platforms: ['chrome'],
          jsBridgeKey: 'testWallet',
          injected: false,
          embedded: true
        }

        expect(isWalletInfoCurrentlyEmbedded(wallet)).toBe(false)
      })
    })
  })

  describe('Address Conversion', () => {
    describe('toUserFriendlyAddress', () => {
      it('should convert workchain 0 address to user-friendly format', () => {
        const hexAddress = '0:83a7d3c5a6b8e4f1d2c9b6a8e5f4d3c2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5'
        const result = toUserFriendlyAddress(hexAddress)

        // Should be base64url encoded (no + or /)
        expect(result).not.toContain('+')
        expect(result).not.toContain('/')
        // Should have URL-safe base64 characters
        expect(result).toMatch(/^[A-Za-z0-9_-]+$/)
      })

      it('should convert workchain -1 address to user-friendly format', () => {
        const hexAddress = '-1:83a7d3c5a6b8e4f1d2c9b6a8e5f4d3c2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5'
        const result = toUserFriendlyAddress(hexAddress)

        expect(result).toMatch(/^[A-Za-z0-9_-]+$/)
      })

      it('should create bounceable address when bounceable option is true', () => {
        const hexAddress = '0:83a7d3c5a6b8e4f1d2c9b6a8e5f4d3c2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5'
        const bounceableResult = toUserFriendlyAddress(hexAddress, { bounceable: true })
        const nonBounceableResult = toUserFriendlyAddress(hexAddress, { bounceable: false })

        // Results should be different due to different tag byte
        expect(bounceableResult).not.toEqual(nonBounceableResult)
      })

      it('should create test-only address when testOnly option is true', () => {
        const hexAddress = '0:83a7d3c5a6b8e4f1d2c9b6a8e5f4d3c2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5'
        const testOnlyResult = toUserFriendlyAddress(hexAddress, { testOnly: true })
        const prodResult = toUserFriendlyAddress(hexAddress, { testOnly: false })

        // Results should be different due to different tag byte
        expect(testOnlyResult).not.toEqual(prodResult)
      })

      it('should throw error for invalid address format', () => {
        expect(() => toUserFriendlyAddress('invalid_address')).toThrow(
          'Invalid address (expected "wc:hex")'
        )
      })

      it('should throw error for missing workchain', () => {
        expect(() =>
          toUserFriendlyAddress(':83a7d3c5a6b8e4f1d2c9b6a8e5f4d3c2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5')
        ).toThrow('Missing workchain')
      })

      it('should throw error for invalid workchain', () => {
        expect(() =>
          toUserFriendlyAddress(
            '5:83a7d3c5a6b8e4f1d2c9b6a8e5f4d3c2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5'
          )
        ).toThrow('Invalid workchain')
      })

      it('should throw error for missing hex part', () => {
        expect(() => toUserFriendlyAddress('0:')).toThrow('Missing hex part')
      })

      it('should throw error for invalid hex length', () => {
        expect(() => toUserFriendlyAddress('0:abc123')).toThrow('Hex must be 64 chars (32 bytes)')
      })

      it('should throw error for invalid hex characters', () => {
        expect(() =>
          toUserFriendlyAddress(
            '0:gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg'
          )
        ).toThrow('Hex must be 64 chars (32 bytes)')
      })
    })

    describe('userFriendlyToRawAddress', () => {
      it('should convert user-friendly address back to raw format', () => {
        const rawAddress = '0:83a7d3c5a6b8e4f1d2c9b6a8e5f4d3c2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5'
        const userFriendly = toUserFriendlyAddress(rawAddress)
        const converted = userFriendlyToRawAddress(userFriendly)

        expect(converted).toBe(rawAddress)
      })

      it('should handle workchain -1 addresses', () => {
        const rawAddress = '-1:83a7d3c5a6b8e4f1d2c9b6a8e5f4d3c2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5'
        const userFriendly = toUserFriendlyAddress(rawAddress)
        const converted = userFriendlyToRawAddress(userFriendly)

        expect(converted).toBe(rawAddress)
      })

      it('should handle bounceable addresses', () => {
        const rawAddress = '0:83a7d3c5a6b8e4f1d2c9b6a8e5f4d3c2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5'
        const userFriendly = toUserFriendlyAddress(rawAddress, { bounceable: true })
        const converted = userFriendlyToRawAddress(userFriendly)

        expect(converted).toBe(rawAddress)
      })

      it('should handle non-bounceable addresses', () => {
        const rawAddress = '0:83a7d3c5a6b8e4f1d2c9b6a8e5f4d3c2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5'
        const userFriendly = toUserFriendlyAddress(rawAddress, { bounceable: false })
        const converted = userFriendlyToRawAddress(userFriendly)

        expect(converted).toBe(rawAddress)
      })

      it('should handle test-only addresses', () => {
        const rawAddress = '0:83a7d3c5a6b8e4f1d2c9b6a8e5f4d3c2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5'
        const userFriendly = toUserFriendlyAddress(rawAddress, { testOnly: true })
        const converted = userFriendlyToRawAddress(userFriendly)

        expect(converted).toBe(rawAddress)
      })

      it('should handle real TON testnet address', () => {
        // Real testnet address example
        const userFriendly = 'EQDCp8fa0dQafUICMadG4KiSYxamwzvf53_4E9d21Ol14xb-'
        const raw = userFriendlyToRawAddress(userFriendly)

        // Should be in format "wc:hex"
        expect(raw).toMatch(/^-?\d+:[0-9a-f]{64}$/)
        // Should have workchain and hash
        const parts = raw.split(':')
        expect(parts).toHaveLength(2)
        expect(parts[1]).toHaveLength(64)
      })

      it('should throw error for invalid address length', () => {
        expect(() => userFriendlyToRawAddress('abc123')).toThrow('Invalid address length')
      })

      it('should throw error for invalid checksum', () => {
        // Create an address with wrong checksum by modifying last bytes
        const validAddress = 'EQDCp8fa0dQafUICMadG4KiSYxamwzvf53_4E9d21Ol14xb-'
        const invalidChecksum = validAddress.slice(0, -2) + 'XX'

        expect(() => userFriendlyToRawAddress(invalidChecksum)).toThrow('Invalid checksum')
      })

      it('should handle base64url encoding with - and _', () => {
        const rawAddress = '0:83a7d3c5a6b8e4f1d2c9b6a8e5f4d3c2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5'
        const userFriendly = toUserFriendlyAddress(rawAddress)

        // Should contain - or _ (base64url chars) instead of + or /
        expect(userFriendly).not.toContain('+')
        expect(userFriendly).not.toContain('/')
        // Should be reversible
        const converted = userFriendlyToRawAddress(userFriendly)
        expect(converted).toBe(rawAddress)
      })
    })

    describe('Round-trip Conversion', () => {
      it('should maintain consistency through multiple conversions', () => {
        const originalRaw = '0:83a7d3c5a6b8e4f1d2c9b6a8e5f4d3c2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5'

        // Convert multiple times
        const friendly1 = toUserFriendlyAddress(originalRaw)
        const raw1 = userFriendlyToRawAddress(friendly1)
        const friendly2 = toUserFriendlyAddress(raw1)
        const raw2 = userFriendlyToRawAddress(friendly2)

        // All conversions should be consistent
        expect(raw1).toBe(originalRaw)
        expect(raw2).toBe(originalRaw)
        expect(friendly1).toBe(friendly2)
      })

      it('should handle all valid workchains', () => {
        const testCases = [
          '0:83a7d3c5a6b8e4f1d2c9b6a8e5f4d3c2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5',
          '-1:83a7d3c5a6b8e4f1d2c9b6a8e5f4d3c2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5'
        ]

        for (const raw of testCases) {
          const friendly = toUserFriendlyAddress(raw)
          const converted = userFriendlyToRawAddress(friendly)
          expect(converted).toBe(raw)
        }
      })

      it('should handle all option combinations', () => {
        const rawAddress = '0:83a7d3c5a6b8e4f1d2c9b6a8e5f4d3c2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5'
        const options = [
          {},
          { bounceable: true },
          { bounceable: false },
          { testOnly: true },
          { testOnly: false },
          { bounceable: true, testOnly: true },
          { bounceable: false, testOnly: true },
          { bounceable: true, testOnly: false },
          { bounceable: false, testOnly: false }
        ]

        for (const opts of options) {
          const friendly = toUserFriendlyAddress(rawAddress, opts)
          const converted = userFriendlyToRawAddress(friendly)
          expect(converted).toBe(rawAddress)
        }
      })
    })

    describe('isWalletInfoCurrentlyInjected', () => {
      it('should correctly identify injected wallets', () => {
        const injectedWallet: TonWalletInfo = {
          name: 'Tonkeeper',
          appName: 'tonkeeper',
          imageUrl: 'https://tonkeeper.com/icon.png',
          aboutUrl: 'https://tonkeeper.com',
          platforms: ['chrome', 'firefox'],
          jsBridgeKey: 'tonkeeper',
          injected: true,
          embedded: false
        }

        expect(isWalletInfoCurrentlyInjected(injectedWallet)).toBe(true)
      })

      it('should correctly identify non-injected wallets', () => {
        const remoteWallet: TonWalletInfo = {
          name: 'Tonkeeper',
          appName: 'tonkeeper',
          imageUrl: 'https://tonkeeper.com/icon.png',
          aboutUrl: 'https://tonkeeper.com',
          platforms: ['ios', 'android'],
          universalLink: 'https://app.tonkeeper.com/ton-connect',
          bridgeUrl: 'https://bridge.tonapi.io/bridge'
        }

        expect(isWalletInfoCurrentlyInjected(remoteWallet)).toBe(false)
      })
    })

    describe('Edge Cases', () => {
      it('should handle zero-filled addresses', () => {
        const zeroAddress = '0:0000000000000000000000000000000000000000000000000000000000000000'
        const friendly = toUserFriendlyAddress(zeroAddress)
        const converted = userFriendlyToRawAddress(friendly)

        expect(converted).toBe(zeroAddress)
      })

      it('should handle all-f addresses', () => {
        const maxAddress = '0:ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
        const friendly = toUserFriendlyAddress(maxAddress)
        const converted = userFriendlyToRawAddress(friendly)

        expect(converted).toBe(maxAddress)
      })

      it('should handle mixed case hex input', () => {
        const mixedCase = '0:83A7D3C5a6b8e4f1d2c9b6a8E5F4D3C2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5'
        const lowerCase = '0:83a7d3c5a6b8e4f1d2c9b6a8e5f4d3c2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5'
        const friendlyMixed = toUserFriendlyAddress(mixedCase)
        const friendlyLower = toUserFriendlyAddress(lowerCase)

        // Should produce the same result regardless of case
        expect(friendlyMixed).toBe(friendlyLower)
      })

      it('should include checksum in user-friendly address', () => {
        const rawAddress = '0:83a7d3c5a6b8e4f1d2c9b6a8e5f4d3c2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5'
        const friendly = toUserFriendlyAddress(rawAddress)

        // User-friendly address should be 48 chars (36 bytes in base64url)
        // 1 byte tag + 1 byte wc + 32 bytes hash + 2 bytes checksum = 36 bytes
        // 36 bytes -> 48 base64 chars
        expect(friendly.length).toBe(48)
      })
    })

    describe('Real TON Addresses', () => {
      it('should handle real mainnet addresses', () => {
        // Example real mainnet addresses
        const realAddresses = [
          'EQDCp8fa0dQafUICMadG4KiSYxamwzvf53_4E9d21Ol14xb-',
          'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
          'EQBYivdc0GAk-nnczaMnYNuSjpeXu2nJS3DZ4KqLjosX5sVC'
        ]

        for (const address of realAddresses) {
          const raw = userFriendlyToRawAddress(address)

          // Should be valid raw format
          expect(raw).toMatch(/^-?\d+:[0-9a-f]{64}$/)

          // Should be reversible
          const friendly = toUserFriendlyAddress(raw)
          const backToRaw = userFriendlyToRawAddress(friendly)
          expect(backToRaw).toBe(raw)
        }
      })
    })
  })

  describe('Wallet Info Type Guards - Complex Cases', () => {
    it('should handle wallet with both remote and injectable properties', () => {
      // Edge case: wallet that has both properties (shouldn't happen but test anyway)
      const hybridWallet = {
        name: 'HybridWallet',
        appName: 'hybrid',
        imageUrl: 'https://test.com/icon.png',
        aboutUrl: 'https://test.com',
        platforms: ['chrome', 'ios'],
        jsBridgeKey: 'hybrid',
        injected: true,
        embedded: false,
        bridgeUrl: 'https://bridge.test.com'
      } as TonWalletInfo

      // Should be both injectable and remote
      expect(isWalletInfoInjectable(hybridWallet)).toBe(true)
      expect(isWalletInfoRemote(hybridWallet)).toBe(true)
    })

    it('should handle wallet with optional tondns', () => {
      const walletWithTondns: TonWalletInfo = {
        name: 'TestWallet',
        appName: 'test_wallet',
        imageUrl: 'https://test.com/icon.png',
        aboutUrl: 'https://test.com',
        platforms: ['chrome'],
        jsBridgeKey: 'testWallet',
        injected: true,
        embedded: false,
        tondns: 'testwallet.ton'
      }

      expect(isWalletInfoInjectable(walletWithTondns)).toBe(true)
    })

    it('should handle wallet with optional features', () => {
      const walletWithFeatures: TonWalletInfo = {
        name: 'TestWallet',
        appName: 'test_wallet',
        imageUrl: 'https://test.com/icon.png',
        aboutUrl: 'https://test.com',
        platforms: ['chrome'],
        jsBridgeKey: 'testWallet',
        injected: true,
        embedded: false,
        features: ['SendTransaction', 'SignData']
      }

      expect(isWalletInfoInjectable(walletWithFeatures)).toBe(true)
    })
  })

  describe('CRC16 Checksum Validation', () => {
    it('should calculate correct CRC16 checksum', () => {
      const rawAddress = '0:83a7d3c5a6b8e4f1d2c9b6a8e5f4d3c2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5'
      const friendly = toUserFriendlyAddress(rawAddress)

      // Converting back should succeed (validates checksum)
      expect(() => userFriendlyToRawAddress(friendly)).not.toThrow()
    })

    it('should detect corrupted addresses', () => {
      const rawAddress = '0:83a7d3c5a6b8e4f1d2c9b6a8e5f4d3c2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5'
      const friendly = toUserFriendlyAddress(rawAddress)

      // Corrupt the address by changing a character
      const corrupted = friendly.slice(0, 10) + 'X' + friendly.slice(11)

      // Should throw due to invalid checksum
      expect(() => userFriendlyToRawAddress(corrupted)).toThrow()
    })

    it('should detect modified checksum', () => {
      const rawAddress = '0:83a7d3c5a6b8e4f1d2c9b6a8e5f4d3c2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5'
      const friendly = toUserFriendlyAddress(rawAddress)

      // Modify only the checksum part (last 2-3 chars)
      const withBadChecksum = friendly.slice(0, -2) + 'XX'

      expect(() => userFriendlyToRawAddress(withBadChecksum)).toThrow('Invalid checksum')
    })
  })

  describe('Base64 URL Encoding', () => {
    it('should use URL-safe base64 encoding', () => {
      const rawAddress = '0:83a7d3c5a6b8e4f1d2c9b6a8e5f4d3c2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5'
      const friendly = toUserFriendlyAddress(rawAddress)

      // Should not contain standard base64 chars that are not URL-safe
      expect(friendly).not.toContain('+')
      expect(friendly).not.toContain('/')
      // Should only contain URL-safe base64 alphabet
      expect(friendly).toMatch(/^[A-Za-z0-9_-]+$/)
    })

    it('should handle padding correctly', () => {
      const rawAddress = '0:83a7d3c5a6b8e4f1d2c9b6a8e5f4d3c2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5'
      const friendly = toUserFriendlyAddress(rawAddress)

      // Should not have padding characters in URL-safe base64
      expect(friendly).not.toContain('=')

      // But should still decode correctly
      const converted = userFriendlyToRawAddress(friendly)
      expect(converted).toBe(rawAddress)
    })
  })

  describe('Workchain Handling', () => {
    it('should correctly encode workchain 0', () => {
      const wc0Address = '0:83a7d3c5a6b8e4f1d2c9b6a8e5f4d3c2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5'
      const friendly = toUserFriendlyAddress(wc0Address)
      const converted = userFriendlyToRawAddress(friendly)

      expect(converted).toBe(wc0Address)
      expect(converted.startsWith('0:')).toBe(true)
    })

    it('should correctly encode workchain -1', () => {
      const wcMinus1Address = '-1:83a7d3c5a6b8e4f1d2c9b6a8e5f4d3c2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5'
      const friendly = toUserFriendlyAddress(wcMinus1Address)
      const converted = userFriendlyToRawAddress(friendly)

      expect(converted).toBe(wcMinus1Address)
      expect(converted.startsWith('-1:')).toBe(true)
    })

    it('should distinguish between workchain 0 and -1', () => {
      const hash = '83a7d3c5a6b8e4f1d2c9b6a8e5f4d3c2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5'
      const wc0 = `0:${hash}`
      const wcMinus1 = `-1:${hash}`

      const friendly0 = toUserFriendlyAddress(wc0)
      const friendlyMinus1 = toUserFriendlyAddress(wcMinus1)

      // Different workchains should produce different friendly addresses
      expect(friendly0).not.toBe(friendlyMinus1)

      // But should convert back correctly
      expect(userFriendlyToRawAddress(friendly0)).toBe(wc0)
      expect(userFriendlyToRawAddress(friendlyMinus1)).toBe(wcMinus1)
    })
  })

  describe('Tag Byte Handling', () => {
    it('should create different addresses for bounceable vs non-bounceable', () => {
      const rawAddress = '0:83a7d3c5a6b8e4f1d2c9b6a8e5f4d3c2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5'

      const bounceable = toUserFriendlyAddress(rawAddress, { bounceable: true })
      const nonBounceable = toUserFriendlyAddress(rawAddress, { bounceable: false })

      // Tag bytes are different
      expect(bounceable).not.toBe(nonBounceable)

      // But both should convert back to same raw address
      expect(userFriendlyToRawAddress(bounceable)).toBe(rawAddress)
      expect(userFriendlyToRawAddress(nonBounceable)).toBe(rawAddress)
    })

    it('should create different addresses for testOnly vs production', () => {
      const rawAddress = '0:83a7d3c5a6b8e4f1d2c9b6a8e5f4d3c2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5'

      const testOnly = toUserFriendlyAddress(rawAddress, { testOnly: true })
      const production = toUserFriendlyAddress(rawAddress, { testOnly: false })

      // Tag bytes are different
      expect(testOnly).not.toBe(production)

      // But both should convert back to same raw address
      expect(userFriendlyToRawAddress(testOnly)).toBe(rawAddress)
      expect(userFriendlyToRawAddress(production)).toBe(rawAddress)
    })

    it('should handle all 4 tag combinations correctly', () => {
      const rawAddress = '0:83a7d3c5a6b8e4f1d2c9b6a8e5f4d3c2b1a9e8f7d6c5b4a3e2f1d0c9b8a7e6f5'

      const addresses = {
        bounceableProd: toUserFriendlyAddress(rawAddress, {
          bounceable: true,
          testOnly: false
        }),
        bounceableTest: toUserFriendlyAddress(rawAddress, {
          bounceable: true,
          testOnly: true
        }),
        nonBounceableProd: toUserFriendlyAddress(rawAddress, {
          bounceable: false,
          testOnly: false
        }),
        nonBounceableTest: toUserFriendlyAddress(rawAddress, {
          bounceable: false,
          testOnly: true
        })
      }

      // All should be different
      const uniqueAddresses = new Set(Object.values(addresses))
      expect(uniqueAddresses.size).toBe(4)

      // All should convert back to same raw
      for (const friendly of Object.values(addresses)) {
        expect(userFriendlyToRawAddress(friendly)).toBe(rawAddress)
      }
    })
  })
})
