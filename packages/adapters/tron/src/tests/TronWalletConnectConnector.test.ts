import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ChainController } from '@reown/appkit-controllers'

import { TronWalletConnectConnector } from '../connectors/TronWalletConnectConnector'

const MOCK_CHAIN_ID = 'tron:0x2b6653dc'
const MOCK_OWNER_ADDRESS = 'TQZnRQHi8ioE4rEQHDWsDR9qM1APYUPbJG'
const MOCK_TO_ADDRESS = 'TYMwiDu22V37pBMr8ZBYNyaS9nRSpa4mYH'

const MOCK_UNSIGNED_TX = {
  txID: 'abc123def456',
  visible: true,
  raw_data: {
    contract: [
      {
        parameter: {
          value: {
            amount: 1000000,
            owner_address: MOCK_OWNER_ADDRESS,
            to_address: MOCK_TO_ADDRESS
          },
          type_url: 'type.googleapis.com/protocol.TransferContract'
        },
        type: 'TransferContract'
      }
    ],
    ref_block_bytes: '1234',
    ref_block_hash: 'abcdef1234567890',
    expiration: 1700000000000,
    timestamp: 1699999000000
  },
  raw_data_hex: 'deadbeef1234'
}

const MOCK_SIGNED_TX = {
  ...MOCK_UNSIGNED_TX,
  signature: ['sig1234567890abcdef']
}

const MOCK_CAIP_NETWORK = {
  id: '0x2b6653dc',
  name: 'TRON',
  chainNamespace: 'tron' as const,
  caipNetworkId: MOCK_CHAIN_ID,
  rpcUrls: {
    default: { http: ['https://rpc.walletconnect.org/v1'] },
    chainDefault: { http: ['https://api.trongrid.io'] }
  },
  nativeCurrency: { name: 'TRX', symbol: 'TRX', decimals: 6 }
}

const MOCK_SHASTA_CHAIN_ID = 'tron:0x94a9059e'

const MOCK_SHASTA_CAIP_NETWORK = {
  id: '0x94a9059e',
  name: 'TRON Shasta Testnet',
  chainNamespace: 'tron' as const,
  caipNetworkId: MOCK_SHASTA_CHAIN_ID,
  rpcUrls: {
    default: { http: ['https://rpc.walletconnect.org/v1'] },
    chainDefault: { http: ['https://api.shasta.trongrid.io'] }
  },
  nativeCurrency: { name: 'TRX', symbol: 'TRX', decimals: 6 }
}

// Mock fetch
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

// Mock provider
const mockProviderRequest = vi.fn()
const mockProvider = {
  request: mockProviderRequest,
  on: vi.fn(),
  removeListener: vi.fn(),
  session: {
    namespaces: {
      tron: {
        chains: [MOCK_CHAIN_ID],
        accounts: [`${MOCK_CHAIN_ID}:${MOCK_OWNER_ADDRESS}`],
        methods: ['tron_signTransaction', 'tron_signMessage'],
        events: []
      }
    }
  },
  setDefaultChain: vi.fn()
}

vi.mock('@reown/appkit-controllers', async importOriginal => {
  const actual = await importOriginal<typeof import('@reown/appkit-controllers')>()

  return {
    ...actual,
    ChainController: {
      ...actual.ChainController,
      getCaipNetworkByNamespace: vi.fn()
    },
    OptionsController: {
      ...actual.OptionsController,
      state: { projectId: 'test-project-id' }
    }
  }
})

describe('TronWalletConnectConnector', () => {
  let connector: TronWalletConnectConnector

  beforeEach(() => {
    vi.clearAllMocks()

    connector = new TronWalletConnectConnector({
      provider: mockProvider as any,
      chains: [MOCK_CAIP_NETWORK as any]
    })

    vi.mocked(ChainController.getCaipNetworkByNamespace).mockReturnValue(MOCK_CAIP_NETWORK as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('sendTransaction', () => {
    it('should build unsigned tx via tron_createTransaction, sign via WC, and broadcast', async () => {
      // Mock createTransaction response
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            result: MOCK_UNSIGNED_TX
          })
      })

      // Mock WC sign response
      mockProviderRequest.mockResolvedValueOnce(MOCK_SIGNED_TX)

      // Mock broadcast response
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            result: { result: true }
          })
      })

      const result = await connector.sendTransaction({
        from: MOCK_OWNER_ADDRESS,
        to: MOCK_TO_ADDRESS,
        value: '1000000'
      })

      expect(result).toBe(MOCK_UNSIGNED_TX.txID)

      // Verify createTransaction call
      const createCall = mockFetch.mock.calls[0]

      expect(createCall?.[0]).toContain('rpc.walletconnect.org')

      const createBody = JSON.parse(createCall?.[1]?.body as string)

      expect(createBody.method).toBe('tron_createTransaction')
      expect(createBody.params).toEqual([MOCK_OWNER_ADDRESS, MOCK_TO_ADDRESS, 1000000, true])

      // Verify WC sign call uses the legacy nested shape by default (wallet did not
      // advertise tron_method_version: "v1" in sessionProperties)
      expect(mockProviderRequest).toHaveBeenCalledWith(
        {
          method: 'tron_signTransaction',
          params: {
            address: MOCK_OWNER_ADDRESS,
            transaction: { transaction: MOCK_UNSIGNED_TX }
          }
        },
        MOCK_CHAIN_ID
      )

      // Verify broadcast call
      const broadcastCall = mockFetch.mock.calls[1]
      const broadcastBody = JSON.parse(broadcastCall?.[1]?.body as string)

      expect(broadcastBody.method).toBe('tron_broadcastTransaction')
      expect(broadcastBody.params[0]).toBe(MOCK_SIGNED_TX.txID)
      expect(broadcastBody.params[4]).toEqual(MOCK_SIGNED_TX.signature)
    })

    it('should send the flat (v1) transaction shape when wallet advertises tron_method_version v1', async () => {
      const v1Provider = {
        ...mockProvider,
        session: {
          ...mockProvider.session,
          sessionProperties: { tron_method_version: 'v1' }
        }
      }
      const v1Connector = new TronWalletConnectConnector({
        provider: v1Provider as any,
        chains: [MOCK_CAIP_NETWORK as any]
      })

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ result: MOCK_UNSIGNED_TX })
      })
      mockProviderRequest.mockResolvedValueOnce(MOCK_SIGNED_TX)
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ result: { result: true } })
      })

      await v1Connector.sendTransaction({
        from: MOCK_OWNER_ADDRESS,
        to: MOCK_TO_ADDRESS,
        value: '1000000'
      })

      // v1 wallets receive the flat transaction object (no nested wrapper)
      expect(mockProviderRequest).toHaveBeenCalledWith(
        {
          method: 'tron_signTransaction',
          params: {
            address: MOCK_OWNER_ADDRESS,
            transaction: MOCK_UNSIGNED_TX
          }
        },
        MOCK_CHAIN_ID
      )
    })

    it('should throw when createTransaction fails', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            result: { Error: 'Invalid address' }
          })
      })

      await expect(
        connector.sendTransaction({
          from: MOCK_OWNER_ADDRESS,
          to: 'invalid',
          value: '1000000'
        })
      ).rejects.toThrow('Invalid address')
    })

    it('should throw when signing fails', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ result: MOCK_UNSIGNED_TX })
      })

      mockProviderRequest.mockResolvedValueOnce({ txID: MOCK_UNSIGNED_TX.txID })

      await expect(
        connector.sendTransaction({
          from: MOCK_OWNER_ADDRESS,
          to: MOCK_TO_ADDRESS,
          value: '1000000'
        })
      ).rejects.toThrow('Transaction signing failed')
    })

    it('should throw when broadcast fails', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ result: MOCK_UNSIGNED_TX })
      })

      mockProviderRequest.mockResolvedValueOnce(MOCK_SIGNED_TX)

      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            result: { result: false, message: 'Insufficient bandwidth' }
          })
      })

      await expect(
        connector.sendTransaction({
          from: MOCK_OWNER_ADDRESS,
          to: MOCK_TO_ADDRESS,
          value: '1000000'
        })
      ).rejects.toThrow('Insufficient bandwidth')
    })

    it('falls back to the fullnode directly for a chain the Blockchain API does not support (Shasta)', async () => {
      vi.mocked(ChainController.getCaipNetworkByNamespace).mockReturnValue(
        MOCK_SHASTA_CAIP_NETWORK as any
      )

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(MOCK_UNSIGNED_TX)
      })
      mockProviderRequest.mockResolvedValueOnce(MOCK_SIGNED_TX)
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ result: true })
      })

      const result = await connector.sendTransaction({
        from: MOCK_OWNER_ADDRESS,
        to: MOCK_TO_ADDRESS,
        value: '1000000'
      })

      expect(result).toBe(MOCK_SIGNED_TX.txID)

      const createCall = mockFetch.mock.calls[0]
      expect(createCall?.[0]).toBe('https://api.shasta.trongrid.io/wallet/createtransaction')
      expect(JSON.parse(createCall?.[1]?.body as string)).toEqual({
        owner_address: MOCK_OWNER_ADDRESS,
        to_address: MOCK_TO_ADDRESS,
        amount: 1000000,
        visible: true
      })

      // The WC signing step is unaffected by which path built the unsigned tx
      expect(mockProviderRequest).toHaveBeenCalledWith(
        {
          method: 'tron_signTransaction',
          params: {
            address: MOCK_OWNER_ADDRESS,
            transaction: { transaction: MOCK_UNSIGNED_TX }
          }
        },
        MOCK_SHASTA_CHAIN_ID
      )

      const broadcastCall = mockFetch.mock.calls[1]
      expect(broadcastCall?.[0]).toBe('https://api.shasta.trongrid.io/wallet/broadcasttransaction')
      expect(JSON.parse(broadcastCall?.[1]?.body as string)).toEqual(MOCK_SIGNED_TX)
    })

    it('surfaces the real TRON error when the fullnode fallback rejects the transaction', async () => {
      vi.mocked(ChainController.getCaipNetworkByNamespace).mockReturnValue(
        MOCK_SHASTA_CAIP_NETWORK as any
      )

      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            Error:
              'class org.tron.core.exception.ContractValidateException : Validate TransferContract error, no OwnerAccount.'
          })
      })

      await expect(
        connector.sendTransaction({
          from: MOCK_OWNER_ADDRESS,
          to: MOCK_TO_ADDRESS,
          value: '1000000'
        })
      ).rejects.toThrow(
        'class org.tron.core.exception.ContractValidateException : Validate TransferContract error, no OwnerAccount.'
      )

      expect(mockProviderRequest).not.toHaveBeenCalled()
    })
  })

  describe('request', () => {
    it('should forward the request to the WC provider on the active tron chain', async () => {
      mockProviderRequest.mockResolvedValueOnce({ ok: true })

      const result = await connector.request({
        method: 'tron_signMessage',
        params: { message: 'x' }
      })

      expect(result).toEqual({ ok: true })
      expect(mockProviderRequest).toHaveBeenCalledWith(
        { method: 'tron_signMessage', params: { message: 'x' } },
        MOCK_CHAIN_ID
      )
    })

    it('should reject when no tron network is active', async () => {
      vi.mocked(ChainController.getCaipNetworkByNamespace).mockReturnValue(undefined)

      await expect(connector.request({ method: 'tron_signMessage' })).rejects.toThrow(
        'Chain not found'
      )
      expect(mockProviderRequest).not.toHaveBeenCalled()
    })
  })

  describe('signTransaction', () => {
    it('should sign a prebuilt tx with the legacy nested shape and the session address by default', async () => {
      mockProviderRequest.mockResolvedValueOnce(MOCK_SIGNED_TX)

      const result = await connector.signTransaction(MOCK_UNSIGNED_TX)

      expect(result).toEqual(MOCK_SIGNED_TX)
      expect(mockProviderRequest).toHaveBeenCalledWith(
        {
          method: 'tron_signTransaction',
          params: {
            address: MOCK_OWNER_ADDRESS,
            transaction: { transaction: MOCK_UNSIGNED_TX }
          }
        },
        MOCK_CHAIN_ID
      )
    })

    it('should send the flat (v1) shape when wallet advertises tron_method_version v1', async () => {
      const v1Connector = new TronWalletConnectConnector({
        provider: {
          ...mockProvider,
          session: { ...mockProvider.session, sessionProperties: { tron_method_version: 'v1' } }
        } as any,
        chains: [MOCK_CAIP_NETWORK as any]
      })
      mockProviderRequest.mockResolvedValueOnce(MOCK_SIGNED_TX)

      await v1Connector.signTransaction(MOCK_UNSIGNED_TX, MOCK_OWNER_ADDRESS)

      expect(mockProviderRequest).toHaveBeenCalledWith(
        {
          method: 'tron_signTransaction',
          params: { address: MOCK_OWNER_ADDRESS, transaction: MOCK_UNSIGNED_TX }
        },
        MOCK_CHAIN_ID
      )
    })

    it('should throw when the wallet returns no signature', async () => {
      mockProviderRequest.mockResolvedValueOnce({ txID: MOCK_UNSIGNED_TX.txID })

      await expect(connector.signTransaction(MOCK_UNSIGNED_TX)).rejects.toThrow(
        'Transaction signing failed'
      )
    })
  })

  describe('signMessage', () => {
    it('should call tron_signMessage via WC provider', async () => {
      mockProviderRequest.mockResolvedValueOnce({ signature: 'test-signature-hex' })

      const result = await connector.signMessage({
        message: 'Hello TRON',
        from: MOCK_OWNER_ADDRESS
      })

      expect(result).toBe('test-signature-hex')
      expect(mockProviderRequest).toHaveBeenCalledWith(
        {
          method: 'tron_signMessage',
          params: {
            address: MOCK_OWNER_ADDRESS,
            message: 'Hello TRON'
          }
        },
        MOCK_CHAIN_ID
      )
    })
  })
})
