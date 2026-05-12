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

      // Verify WC sign call with full transaction object
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

      // Verify broadcast call
      const broadcastCall = mockFetch.mock.calls[1]
      const broadcastBody = JSON.parse(broadcastCall?.[1]?.body as string)

      expect(broadcastBody.method).toBe('tron_broadcastTransaction')
      expect(broadcastBody.params[0]).toBe(MOCK_SIGNED_TX.txID)
      expect(broadcastBody.params[4]).toEqual(MOCK_SIGNED_TX.signature)
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
