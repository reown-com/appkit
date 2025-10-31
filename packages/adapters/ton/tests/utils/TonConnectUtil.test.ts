import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  BlockchainApiController,
  CoreHelperUtil,
  OptionsController
} from '@reown/appkit-controllers'
import type { TonWalletInfoDTO, TonWalletInfoInjectable } from '@reown/appkit-utils/ton'

import { TonConnectUtil } from '../../src/utils/TonConnectUtil.js'

const MANIFEST_URL =
  'https://api.reown.com/ton/v1/manifest?projectId=test-project-id&st=appkit&sv=html-wagmi-1.8.8&url=https%3A%2F%2Flab.reown.com&name=Test+App&iconUrl=https%3A%2F%2Flab.reown.com%2Ficon.png'
const TON_ADDRESS = 'UQA2A5SpYmHjygKewBWilkSc7twv1eTBuHOkWlUOLoXGV9Jg'

const mockWalletsDTO = [
  {
    name: 'Tonkeeper',
    app_name: 'tonkeeper',
    image: 'https://tonkeeper.com/icon.png',
    about_url: 'https://tonkeeper.com',
    platforms: ['chrome', 'firefox'],
    bridge: [
      { type: 'js', key: 'tonkeeper' },
      { type: 'sse', url: 'https://bridge.tonkeeper.com' }
    ],
    universal_url: 'https://tonkeeper.com/ton-connect'
  },
  {
    name: 'OKX',
    app_name: 'okx',
    image: 'https://okx.com/icon.png',
    about_url: 'https://okx.com',
    platforms: ['chrome'],
    bridge: [{ type: 'js', key: 'okxwallet' }]
  }
] as TonWalletInfoDTO[]

// Mock the controllers
vi.mock('@reown/appkit-controllers', () => ({
  BlockchainApiController: {
    getSdkProperties: vi.fn()
  },
  CoreHelperUtil: {
    isClient: vi.fn(),
    getWindow: vi.fn()
  },
  OptionsController: {
    state: {}
  }
}))

// Mock fetch
global.fetch = vi.fn() as unknown as typeof fetch

describe('TonConnectUtil', () => {
  beforeEach(() => {
    // Ensure we're using real timers by default
    vi.useRealTimers()
    vi.clearAllMocks()
    // Reset window mock
    ;(global as any).window = {}
    // Reset console methods
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
    // Reset fetch mock to default
    vi.mocked(fetch).mockReset()
  })

  afterEach(() => {
    // Clean up any timers
    vi.useRealTimers()
  })

  describe('getTonConnectManifestUrl', () => {
    it('should generate manifest URL with all required parameters', () => {
      const mockState = {
        metadata: {
          name: 'Test App',
          url: 'https://lab.reown.com',
          icons: ['https://lab.reown.com/icon.png'],
          description: 'Test App Description'
        },
        projectId: 'test-project-id'
      }

      vi.mocked(OptionsController.state).metadata = mockState.metadata
      vi.mocked(OptionsController.state).projectId = mockState.projectId
      vi.mocked(BlockchainApiController.getSdkProperties).mockReturnValue({
        st: 'appkit',
        sv: 'html-wagmi-1.8.8'
      })

      const url = TonConnectUtil.getTonConnectManifestUrl()

      expect(url).toEqual(MANIFEST_URL)
    })

    it('should handle missing metadata gracefully', () => {
      // Mock window object directly since the code checks typeof window
      ;(global as any).window = {
        location: { origin: 'https://fallback.com' }
      }

      vi.mocked(OptionsController.state).metadata = undefined
      vi.mocked(OptionsController.state).projectId = 'test-project-id'
      vi.mocked(BlockchainApiController.getSdkProperties).mockReturnValue({
        st: 'appkit',
        sv: 'html-wagmi-1.8.8'
      })

      const url = TonConnectUtil.getTonConnectManifestUrl()

      expect(url).toContain('url=https%3A%2F%2Ffallback.com')
      expect(url).toContain('name=')
      expect(url).toContain('iconUrl=')
    })
  })

  describe('createConnectRequest', () => {
    it('should create basic connect request', () => {
      const request = TonConnectUtil.createConnectRequest(MANIFEST_URL)

      expect(request).toEqual({
        manifestUrl: MANIFEST_URL,
        items: [{ name: 'ton_addr' }]
      })
    })

    it('should include ton_proof when provided', () => {
      const tonProof = 'test-proof-payload'
      const request = TonConnectUtil.createConnectRequest(MANIFEST_URL, tonProof)

      expect(request).toEqual({
        manifestUrl: MANIFEST_URL,
        items: [{ name: 'ton_addr' }, { name: 'ton_proof', payload: tonProof }]
      })
    })
  })

  describe('normalizeBase64', () => {
    it('should normalize base64url to standard base64', () => {
      const base64url = 'SGVsbG8gV29ybGQ'
      const normalized = TonConnectUtil.normalizeBase64(base64url)

      expect(normalized).toBe('SGVsbG8gV29ybGQ=')
    })

    it('should handle base64url with dashes and underscores', () => {
      const base64url = 'SGVsbG8gV29ybGQ-'
      const normalized = TonConnectUtil.normalizeBase64(base64url)

      // - becomes +, and padding is added
      expect(normalized).toBe('SGVsbG8gV29ybGQ+')
    })

    it('should handle already padded strings', () => {
      const base64 = 'SGVsbG8gV29ybGQ='
      const normalized = TonConnectUtil.normalizeBase64(base64)

      expect(normalized).toBe('SGVsbG8gV29ybGQ=')
    })

    it('should return undefined for non-string input', () => {
      expect(TonConnectUtil.normalizeBase64(undefined)).toBeUndefined()
      expect(TonConnectUtil.normalizeBase64(null as any)).toBeUndefined()
      expect(TonConnectUtil.normalizeBase64(123 as any)).toBeUndefined()
    })

    it('should handle empty string', () => {
      const normalized = TonConnectUtil.normalizeBase64('')
      expect(normalized).toBe('')
    })
  })

  describe('connectInjected', () => {
    const mockWallet = {
      connect: vi.fn(),
      restoreConnection: vi.fn(),
      listen: vi.fn()
    }

    beforeEach(() => {
      vi.mocked(CoreHelperUtil.isClient).mockReturnValue(true)
      // Set up window with location and tonkeeper
      ;(global as any).window = {
        location: { origin: 'https://lab.reown.com' },
        tonkeeper: { tonconnect: mockWallet }
      }
      // Also set up OptionsController state for manifest URL generation
      vi.mocked(OptionsController.state).metadata = {
        name: 'Test App',
        url: 'https://lab.reown.com',
        description: 'Test',
        icons: ['https://lab.reown.com/icon.png']
      }
      vi.mocked(OptionsController.state).projectId = 'test-project-id'
      vi.mocked(BlockchainApiController.getSdkProperties).mockReturnValue({
        st: 'appkit',
        sv: 'html-wagmi-1.8.8'
      })
    })

    it('should return empty string in non-client environment', async () => {
      vi.mocked(CoreHelperUtil.isClient).mockReturnValue(false)

      const result = await TonConnectUtil.connectInjected('tonkeeper')

      expect(result).toBe('')
    })

    it('should throw error if wallet not available', async () => {
      ;(global as any).window = {
        location: { origin: 'https://lab.reown.com' }
      }

      await expect(TonConnectUtil.connectInjected('nonexistent')).rejects.toThrow(
        'Injected wallet "nonexistent" not available'
      )
    })

    it('should restore existing connection', async () => {
      const mockAddress = TON_ADDRESS
      mockWallet.restoreConnection.mockResolvedValue({
        event: 'connect',
        payload: {
          items: [{ name: 'ton_addr', address: mockAddress }]
        }
      })

      const result = await TonConnectUtil.connectInjected('tonkeeper')

      expect(result).toBe(mockAddress)
      expect(mockWallet.restoreConnection).toHaveBeenCalled()
    })

    it('should handle restore connection failure gracefully', async () => {
      mockWallet.restoreConnection.mockRejectedValue(new Error('Restore failed'))
      mockWallet.connect.mockResolvedValue({
        event: 'connect',
        payload: {
          items: [{ name: 'ton_addr', address: 'test-address' }]
        }
      })
      mockWallet.listen.mockReturnValue(() => {})

      const result = await TonConnectUtil.connectInjected('tonkeeper')

      expect(result).toBe('test-address')
    })

    it('should handle connect via promise', async () => {
      const mockAddress = TON_ADDRESS
      mockWallet.restoreConnection.mockResolvedValue({ event: 'disconnect' })
      mockWallet.connect.mockResolvedValue({
        event: 'connect',
        payload: {
          items: [{ name: 'ton_addr', address: mockAddress }]
        }
      })
      mockWallet.listen.mockReturnValue(() => {})

      const result = await TonConnectUtil.connectInjected('tonkeeper')

      expect(result).toBe(mockAddress)
    })

    it('should handle connect via event listener', async () => {
      const mockAddress = TON_ADDRESS
      let eventCallback: ((evt: any) => void) | undefined

      mockWallet.restoreConnection.mockResolvedValue({ event: 'disconnect' })
      mockWallet.connect.mockImplementation(() => {
        // Simulate event being fired asynchronously
        setTimeout(() => {
          if (eventCallback) {
            eventCallback({
              event: 'connect',
              payload: {
                items: [{ name: 'ton_addr', address: mockAddress }]
              }
            })
          }
        }, 0)
        return Promise.resolve({ event: 'pending' })
      })
      mockWallet.listen.mockImplementation(callback => {
        eventCallback = callback
        return () => {}
      })

      const result = await TonConnectUtil.connectInjected('tonkeeper')
      expect(result).toBe(mockAddress)
    })

    it('should handle connect_error event', async () => {
      let eventCallback: ((evt: any) => void) | undefined

      mockWallet.restoreConnection.mockResolvedValue({ event: 'disconnect' })
      mockWallet.connect.mockImplementation(() => {
        // Simulate error event being fired asynchronously
        setTimeout(() => {
          if (eventCallback) {
            eventCallback({
              event: 'connect_error',
              payload: { message: 'User rejected' }
            })
          }
        }, 0)
        return Promise.resolve({ event: 'pending' })
      })
      mockWallet.listen.mockImplementation(callback => {
        eventCallback = callback
        return () => {}
      })

      await expect(TonConnectUtil.connectInjected('tonkeeper')).rejects.toThrow('User rejected')
    })

    it.skip('should timeout after 12 seconds', async () => {
      vi.useFakeTimers()

      mockWallet.restoreConnection.mockResolvedValue({ event: 'disconnect' })
      mockWallet.connect.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      )
      mockWallet.listen.mockReturnValue(() => {})

      const connectPromise = TonConnectUtil.connectInjected('tonkeeper')

      // Fast-forward time past the timeout and run all timers
      await vi.advanceTimersByTimeAsync(12001)

      await expect(connectPromise).rejects.toThrow('TON connect timeout')

      // Ensure no leftover timer callbacks or microtasks remain to trigger
      await vi.runOnlyPendingTimersAsync()
      await Promise.resolve()

      vi.useRealTimers()
    })
  })

  describe.skip('getInjectedWallets', () => {
    beforeEach(() => {
      // Note: We don't clear the module-level cache here because it would require
      // calling getInjectedWallets() which could interfere with timer-based tests.
      // Instead, each test that cares about cache state will handle it individually.
    })

    it('should fetch and return injected wallets', async () => {
      const mockWindow = {
        tonkeeper: {
          tonconnect: {
            walletInfo: {
              name: 'Tonkeeper',
              app_name: 'tonkeeper',
              image: 'https://tonkeeper.com/icon.png',
              about_url: 'https://tonkeeper.com',
              platforms: ['chrome']
            },
            isWalletBrowser: false
          }
        }
      }

      vi.mocked(CoreHelperUtil.getWindow).mockReturnValue(mockWindow as any)
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockWalletsDTO)
      } as any)

      const wallets = await TonConnectUtil.getInjectedWallets()

      expect(wallets).toHaveLength(1)
      expect(wallets[0]).toMatchObject({
        name: 'Tonkeeper',
        appName: 'tonkeeper',
        jsBridgeKey: 'tonkeeper',
        injected: true,
        embedded: false
      })
    })

    it('should merge remote and injected wallet info', async () => {
      const mockWindow = {
        tonkeeper: {
          tonconnect: {
            walletInfo: {
              name: 'Tonkeeper',
              app_name: 'tonkeeper',
              image: 'https://tonkeeper.com/icon.png',
              about_url: 'https://tonkeeper.com',
              platforms: ['chrome']
            },
            isWalletBrowser: false
          }
        }
      }

      vi.mocked(CoreHelperUtil.getWindow).mockReturnValue(mockWindow as any)
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockWalletsDTO)
      } as any)

      const wallets = await TonConnectUtil.getInjectedWallets()

      expect(wallets?.[0]?.platforms).toEqual(['chrome'])
      expect(wallets?.[0]?.imageUrl).toBe('https://tonkeeper.com/icon.png')
    })

    it('should handle wallets without walletInfo', async () => {
      ;(global as any).window = {
        tonkeeper: {
          tonconnect: {
            isWalletBrowser: false
          }
        }
      }

      vi.mocked(CoreHelperUtil.getWindow).mockReturnValue((global as any).window as any)
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockWalletsDTO)
      } as any)

      const wallets = await TonConnectUtil.getInjectedWallets()

      expect(wallets).toHaveLength(1)
      // When walletInfo is missing, it falls back to jsBridgeKey, then tries to find in remote DTO
      expect(wallets?.[0]?.name).toBe('Tonkeeper') // From remote DTO
      expect((wallets?.[0] as TonWalletInfoInjectable)?.jsBridgeKey).toBe('tonkeeper')
    })

    it('should handle invalid response data', async () => {
      // Clear window to ensure no injected wallets
      ;(global as any).window = {}
      vi.mocked(CoreHelperUtil.getWindow).mockReturnValue({} as any)

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve('invalid data')
      } as any)

      const wallets = await TonConnectUtil.getInjectedWallets()

      expect(wallets).toEqual([])
    })
  })

  describe('isWalletInjected', () => {
    it('should return true for injected wallet', () => {
      const mockWindow = {
        tonkeeper: {
          tonconnect: {
            walletInfo: {
              name: 'Tonkeeper',
              app_name: 'tonkeeper',
              image: 'https://tonkeeper.com/icon.png',
              about_url: 'https://tonkeeper.com',
              platforms: ['chrome']
            }
          }
        }
      }

      vi.mocked(CoreHelperUtil.getWindow).mockReturnValue(mockWindow as any)

      expect(TonConnectUtil.isWalletInjected('tonkeeper')).toBe(true)
    })

    it('should return false for non-injected wallet', () => {
      vi.mocked(CoreHelperUtil.getWindow).mockReturnValue({} as any)

      expect(TonConnectUtil.isWalletInjected('nonexistent')).toBe(false)
    })

    it('should return false in non-window environment', () => {
      vi.mocked(CoreHelperUtil.getWindow).mockReturnValue(undefined)

      expect(TonConnectUtil.isWalletInjected('tonkeeper')).toBe(false)
    })

    it('should handle cross-origin access errors', () => {
      const mockWindow = {
        get tonkeeper() {
          throw new Error('Cross-origin access denied')
        }
      }

      vi.mocked(CoreHelperUtil.getWindow).mockReturnValue(mockWindow as any)

      expect(TonConnectUtil.isWalletInjected('tonkeeper')).toBe(false)
    })
  })

  describe('isInsideWalletBrowser', () => {
    it('should return true when inside wallet browser', () => {
      const mockWindow = {
        tonkeeper: {
          tonconnect: {
            walletInfo: {
              name: 'Tonkeeper',
              app_name: 'tonkeeper',
              image: 'https://tonkeeper.com/icon.png',
              about_url: 'https://tonkeeper.com',
              platforms: ['chrome']
            },
            isWalletBrowser: true
          }
        }
      }

      vi.mocked(CoreHelperUtil.getWindow).mockReturnValue(mockWindow as any)

      expect(TonConnectUtil.isInsideWalletBrowser('tonkeeper')).toBe(true)
    })

    it('should return false when not inside wallet browser', () => {
      const mockWindow = {
        tonkeeper: {
          tonconnect: {
            walletInfo: {
              name: 'Tonkeeper',
              app_name: 'tonkeeper',
              image: 'https://tonkeeper.com/icon.png',
              about_url: 'https://tonkeeper.com',
              platforms: ['chrome']
            },
            isWalletBrowser: false
          }
        }
      }

      vi.mocked(CoreHelperUtil.getWindow).mockReturnValue(mockWindow as any)

      expect(TonConnectUtil.isInsideWalletBrowser('tonkeeper')).toBe(false)
    })

    it('should return false for non-injected wallet', () => {
      vi.mocked(CoreHelperUtil.getWindow).mockReturnValue({} as any)

      expect(TonConnectUtil.isInsideWalletBrowser('nonexistent')).toBe(false)
    })
  })

  describe('getCurrentlyInjectedWallets', () => {
    it('should return list of currently injected wallets', () => {
      const mockWindow = {
        tonkeeper: {
          tonconnect: {
            walletInfo: {
              name: 'Tonkeeper',
              app_name: 'tonkeeper',
              image: 'https://tonkeeper.com/icon.png',
              about_url: 'https://tonkeeper.com',
              platforms: ['chrome'],
              features: ['SendTransaction']
            },
            isWalletBrowser: false
          }
        },
        okxwallet: {
          tonconnect: {
            walletInfo: {
              name: 'OKX',
              app_name: 'okx',
              image: 'https://okx.com/icon.png',
              about_url: 'https://okx.com',
              platforms: ['chrome']
            },
            isWalletBrowser: true
          }
        }
      }

      vi.mocked(CoreHelperUtil.getWindow).mockReturnValue(mockWindow as any)

      const wallets = TonConnectUtil.getCurrentlyInjectedWallets()

      expect(wallets).toHaveLength(2)
      expect(wallets[0]).toMatchObject({
        name: 'Tonkeeper',
        jsBridgeKey: 'tonkeeper',
        embedded: false
      })
      expect(wallets[1]).toMatchObject({
        name: 'OKX',
        jsBridgeKey: 'okxwallet',
        embedded: true
      })
    })

    it('should handle wallets without walletInfo', () => {
      const mockWindow = {
        tonkeeper: {
          tonconnect: {
            isWalletBrowser: false
          }
        }
      }

      vi.mocked(CoreHelperUtil.getWindow).mockReturnValue(mockWindow as any)

      const wallets = TonConnectUtil.getCurrentlyInjectedWallets()

      expect(wallets).toHaveLength(0)
    })

    it('should return empty array in non-window environment', () => {
      vi.mocked(CoreHelperUtil.getWindow).mockReturnValue(undefined)

      const wallets = TonConnectUtil.getCurrentlyInjectedWallets()

      expect(wallets).toEqual([])
    })

    it('should handle cross-origin access errors', () => {
      const mockWindow = {
        get tonkeeper() {
          throw new Error('Cross-origin access denied')
        }
      }

      vi.mocked(CoreHelperUtil.getWindow).mockReturnValue(mockWindow as any)

      const wallets = TonConnectUtil.getCurrentlyInjectedWallets()

      expect(wallets).toEqual([])
    })
  })

  describe('assertSendTransactionSupported', () => {
    const mockWallet: TonWalletInfoInjectable = {
      name: 'TestWallet',
      appName: 'test',
      imageUrl: 'https://lab.reown.com/icon.png',
      aboutUrl: 'https://lab.reown.com',
      platforms: ['chrome'],
      jsBridgeKey: 'test',
      injected: true,
      embedded: false
    }

    it('should pass when wallet has SendTransaction feature', () => {
      const wallet = {
        ...mockWallet,
        features: [{ name: 'SendTransaction' }]
      } as unknown as TonWalletInfoInjectable

      expect(() => TonConnectUtil.assertSendTransactionSupported(wallet, 1, false)).not.toThrow()
    })

    it('should pass when wallet has SendTransaction object feature', () => {
      const wallet = {
        ...mockWallet,
        features: [
          {
            name: 'SendTransaction',
            maxMessages: 4,
            extraCurrencySupported: true
          }
        ]
      } as unknown as TonWalletInfoInjectable

      expect(() => TonConnectUtil.assertSendTransactionSupported(wallet, 2, true)).not.toThrow()
    })

    it('should throw when wallet lacks SendTransaction feature', () => {
      const wallet = {
        ...mockWallet,
        features: ['SignData']
      } as unknown as TonWalletInfoInjectable

      expect(() => TonConnectUtil.assertSendTransactionSupported(wallet, 1, false)).toThrow(
        "Wallet doesn't support SendTransaction feature."
      )
    })

    it('should throw when extra currencies required but not supported', () => {
      const wallet = {
        ...mockWallet,
        features: [
          {
            name: 'SendTransaction',
            maxMessages: 4,
            extraCurrencySupported: false
          }
        ]
      } as unknown as TonWalletInfoInjectable

      expect(() => TonConnectUtil.assertSendTransactionSupported(wallet, 1, true)).toThrow(
        'Wallet is not able to handle such SendTransaction request. Extra currencies support is required.'
      )
    })

    it('should throw when message count exceeds max', () => {
      const wallet = {
        ...mockWallet,
        features: [
          {
            name: 'SendTransaction',
            maxMessages: 2,
            extraCurrencySupported: true
          }
        ]
      } as unknown as TonWalletInfoInjectable

      expect(() => TonConnectUtil.assertSendTransactionSupported(wallet, 5, false)).toThrow(
        'Wallet is not able to handle such SendTransaction request. Max support messages number is 2, but 5 is required.'
      )
    })

    it('should pass when wallet has no features array', () => {
      expect(() =>
        TonConnectUtil.assertSendTransactionSupported(mockWallet, 1, false)
      ).not.toThrow()
    })
  })

  describe('assertSignDataSupported', () => {
    const mockWallet: TonWalletInfoInjectable = {
      name: 'TestWallet',
      appName: 'test',
      imageUrl: 'https://lab.reown.com/icon.png',
      aboutUrl: 'https://lab.reown.com',
      platforms: ['chrome'],
      jsBridgeKey: 'test',
      injected: true,
      embedded: false
    }

    it('should pass when wallet supports required types', () => {
      const wallet = {
        ...mockWallet,
        features: [
          {
            name: 'SignData',
            types: ['text', 'binary', 'cell']
          }
        ]
      } as unknown as TonWalletInfoInjectable

      expect(() => TonConnectUtil.assertSignDataSupported(wallet, ['text', 'binary'])).not.toThrow()
    })

    it('should throw when wallet lacks SignData feature', () => {
      const wallet = {
        ...mockWallet,
        features: ['SendTransaction']
      } as unknown as TonWalletInfoInjectable

      expect(() => TonConnectUtil.assertSignDataSupported(wallet, ['text'])).toThrow(
        "Wallet doesn't support SignData feature."
      )
    })

    it('should throw when wallet supports string SignData feature', () => {
      const wallet = {
        ...mockWallet,
        features: ['SignData']
      } as unknown as TonWalletInfoInjectable

      expect(() => TonConnectUtil.assertSignDataSupported(wallet, ['text'])).toThrow(
        "Wallet doesn't support SignData feature."
      )
    })

    it('should throw when required types not supported', () => {
      const wallet = {
        ...mockWallet,
        features: [
          {
            name: 'SignData',
            types: ['text', 'binary']
          }
        ]
      } as unknown as TonWalletInfoInjectable

      expect(() => TonConnectUtil.assertSignDataSupported(wallet, ['text', 'cell'])).toThrow(
        "Wallet doesn't support required SignData types: cell."
      )
    })

    it('should pass when wallet has no features array', () => {
      expect(() => TonConnectUtil.assertSignDataSupported(mockWallet, ['text'])).not.toThrow()
    })
  })

  describe('getJSBridgeKey', () => {
    it('should return jsBridgeKey from wallet', () => {
      const wallet: TonWalletInfoInjectable = {
        name: 'TestWallet',
        appName: 'test',
        imageUrl: 'https://lab.reown.com/icon.png',
        aboutUrl: 'https://lab.reown.com',
        platforms: ['chrome'],
        jsBridgeKey: 'testwallet',
        injected: true,
        embedded: false
      }

      expect(TonConnectUtil.getJSBridgeKey(wallet)).toBe('testwallet')
    })

    it('should return undefined for wallet without jsBridgeKey', () => {
      const wallet: TonWalletInfoInjectable = {
        name: 'TestWallet',
        appName: 'test',
        imageUrl: 'https://lab.reown.com/icon.png',
        aboutUrl: 'https://lab.reown.com',
        platforms: ['chrome'],
        injected: true,
        embedded: false
      } as TonWalletInfoInjectable

      expect(TonConnectUtil.getJSBridgeKey(wallet)).toBeUndefined()
    })
  })

  describe('getTonConnect', () => {
    beforeEach(() => {
      ;(global as any).window = {
        tonkeeper: {
          tonconnect: {
            connect: vi.fn(),
            disconnect: vi.fn()
          }
        }
      }
    })

    it('should return tonconnect API for valid bridge key', () => {
      const api = TonConnectUtil.getTonConnect('tonkeeper')

      expect(api).toBeDefined()
      expect(api?.connect).toBeDefined()
      expect(api?.disconnect).toBeDefined()
    })

    it('should return undefined for invalid bridge key', () => {
      const api = TonConnectUtil.getTonConnect('nonexistent')

      expect(api).toBeUndefined()
    })

    it('should return undefined for undefined bridge key', () => {
      const api = TonConnectUtil.getTonConnect(undefined)

      expect(api).toBeUndefined()
    })

    it('should return undefined for empty bridge key', () => {
      const api = TonConnectUtil.getTonConnect('')

      expect(api).toBeUndefined()
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty wallets list', async () => {
      vi.spyOn(TonConnectUtil, 'fetchWalletsListDTO').mockResolvedValue(mockWalletsDTO)

      const wallets = await TonConnectUtil.getInjectedWallets()

      expect(wallets).toEqual([])
    })

    it('should handle wallets with invalid bridge configurations', async () => {
      const invalidWallets = [
        {
          name: 'InvalidWallet',
          app_name: 'invalid',
          image: 'https://invalid.com/icon.png',
          about_url: 'https://invalid.com',
          platforms: ['chrome'],
          bridge: [
            { type: 'js' }, // Missing key
            { type: 'sse', url: 'https://bridge.com' } // Missing universal_url
          ]
        }
      ] as TonWalletInfoDTO[]

      // Clear window so no injected wallets
      ;(global as any).window = {}
      vi.mocked(CoreHelperUtil.getWindow).mockReturnValue({} as any)

      vi.spyOn(TonConnectUtil, 'fetchWalletsListDTO').mockResolvedValue(invalidWallets)

      const wallets = await TonConnectUtil.getInjectedWallets()

      // Should filter out invalid wallets (invalid bridge config = not included)
      expect(wallets).toEqual([])
    })
  })
})
