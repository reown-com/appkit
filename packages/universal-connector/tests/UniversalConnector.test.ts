import UniversalProvider from '@walletconnect/universal-provider'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as AppKitCore from '@reown/appkit/core'

import { UniversalConnector } from '../src/UniversalConnector'

// Create lightweight in-file mocks to avoid cross-package type issues
const provider = {
  connect: vi.fn(),
  disconnect: vi.fn(),
  request: vi.fn()
} as any

const mockAppKit = {
  open: vi.fn(),
  close: vi.fn(),
  disconnect: vi.fn()
} as any

const baseConfig = {
  projectId: 'test-project',
  metadata: {
    name: 'Test Dapp',
    description: 'A test dapp',
    url: 'https://test.dapp',
    icons: ['https://test.dapp/icon.png']
  },
  networks: [
    {
      namespace: 'eip155',
      chains: [
        {
          caipNetworkId: 'eip155:1'
        } as any
      ],
      methods: ['eth_sendTransaction'],
      events: []
    }
  ]
} as any // Cast to any to avoid importing internal types

describe('UniversalConnector', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('init', () => {
    it('should initialize UniversalProvider and return a UniversalConnector instance', async () => {
      // Arrange
      vi.spyOn(UniversalProvider, 'init').mockResolvedValue(provider as any)
      vi.spyOn(AppKitCore, 'createAppKit').mockReturnValue(mockAppKit as any)

      // Act
      const connector = await UniversalConnector.init(baseConfig)

      // Assert
      expect(UniversalProvider.init).toHaveBeenCalledWith({
        projectId: baseConfig.projectId,
        metadata: baseConfig.metadata
      })

      expect(AppKitCore.createAppKit).toHaveBeenCalled()
      expect(connector).toBeInstanceOf(UniversalConnector)
      expect(connector.provider).toBe(provider)
    })
  })

  describe('connect', () => {
    let connector: UniversalConnector

    beforeEach(() => {
      vi.restoreAllMocks()

      connector = new UniversalConnector({
        appKit: mockAppKit as any,
        provider: provider as any,
        config: baseConfig
      })
    })

    it('should establish a session and close the AppKit', async () => {
      // Arrange
      const mockSession = { topic: 'mock_session_topic' } as any
      provider.connect.mockResolvedValueOnce(mockSession)

      // Act
      const result = await connector.connect()

      // Assert
      expect(mockAppKit.open).toHaveBeenCalled()
      expect(provider.connect).toHaveBeenCalled()
      expect(mockAppKit.close).toHaveBeenCalled()
      expect(result).toEqual({ session: mockSession })
    })

    it('should throw when no session is returned', async () => {
      // Arrange
      provider.connect.mockResolvedValueOnce(undefined as any)

      // Act & Assert
      await expect(connector.connect()).rejects.toThrow(
        'Error connecting to wallet: No session found'
      )
      expect(mockAppKit.close).toHaveBeenCalled()
    })

    it('should throw and close AppKit when provider.connect rejects', async () => {
      // Arrange
      const error = new Error('connect failed')
      provider.connect.mockRejectedValueOnce(error)

      // Act & Assert
      await expect(connector.connect()).rejects.toThrow(
        `Error connecting to wallet: ${error.message}`
      )
      expect(mockAppKit.close).toHaveBeenCalled()
    })
  })

  describe('disconnect', () => {
    beforeEach(() => {
      vi.restoreAllMocks()
    })

    it('should call disconnect on AppKit and provider', async () => {
      // Arrange
      const connector = new UniversalConnector({
        appKit: mockAppKit as any,
        provider: provider as any,
        config: baseConfig
      })

      // Act
      await connector.disconnect()

      // Assert
      expect(mockAppKit.disconnect).toHaveBeenCalled()
      expect(provider.disconnect).toHaveBeenCalled()
    })
  })

  describe('request', () => {
    beforeEach(() => {
      vi.restoreAllMocks()
    })
    it('should delegate the request to the provider', async () => {
      // Arrange
      const connector = new UniversalConnector({
        appKit: mockAppKit as any,
        provider: provider as any,
        config: baseConfig
      })

      const params = { method: 'eth_chainId', params: [] } as any
      provider.request.mockResolvedValueOnce('0x1')

      // Act
      const result = await connector.request(params, 'eip155:1')

      // Assert
      expect(provider.request).toHaveBeenCalledWith(params, 'eip155:1')
      expect(result).toBe('0x1')
    })
  })
})
