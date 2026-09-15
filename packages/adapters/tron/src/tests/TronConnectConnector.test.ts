import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ChainController } from '@reown/appkit-controllers'

import { TronConnectConnector } from '../connectors/TronConnectConnector'

const MOCK_OWNER_ADDRESS = 'TQZnRQHi8ioE4rEQHDWsDR9qM1APYUPbJG'
const MOCK_TO_ADDRESS = 'TYASr5UV6HEcXatwdFQfmLVUqQQQMUxHLS'

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
    ]
  },
  raw_data_hex: 'deadbeef1234'
}

const MOCK_SIGNED_TX = {
  ...MOCK_UNSIGNED_TX,
  signature: ['sig1234567890abcdef']
}

const MOCK_MAINNET = {
  id: '0x2b6653dc',
  name: 'TRON',
  chainNamespace: 'tron' as const,
  caipNetworkId: 'tron:0x2b6653dc',
  rpcUrls: {
    default: { http: ['https://rpc.walletconnect.org/v1'] },
    chainDefault: { http: ['https://api.trongrid.io'] }
  },
  nativeCurrency: { name: 'TRX', symbol: 'TRX', decimals: 6 }
}

const MOCK_SHASTA = {
  id: '0x94a9059e',
  name: 'TRON Shasta Testnet',
  chainNamespace: 'tron' as const,
  caipNetworkId: 'tron:0x94a9059e',
  rpcUrls: {
    default: { http: ['https://rpc.walletconnect.org/v1'] },
    chainDefault: { http: ['https://api.shasta.trongrid.io'] }
  },
  nativeCurrency: { name: 'TRX', symbol: 'TRX', decimals: 6 }
}

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const mockAdapter = {
  name: 'TronLink',
  icon: 'icon-url',
  connect: vi.fn(),
  disconnect: vi.fn(),
  address: MOCK_OWNER_ADDRESS,
  signMessage: vi.fn(),
  signTransaction: vi.fn(),
  switchChain: vi.fn(),
  on: vi.fn(),
  removeListener: vi.fn()
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

describe('TronConnectConnector', () => {
  let connector: TronConnectConnector

  beforeEach(() => {
    vi.clearAllMocks()

    connector = new TronConnectConnector({
      adapter: mockAdapter as any,
      chains: [MOCK_MAINNET as any]
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('sendTransaction', () => {
    it('routes through the Blockchain API for a supported chain (mainnet), unchanged', async () => {
      vi.mocked(ChainController.getCaipNetworkByNamespace).mockReturnValue(MOCK_MAINNET as any)
      mockAdapter.signTransaction.mockResolvedValueOnce(MOCK_SIGNED_TX)

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ result: MOCK_UNSIGNED_TX })
      })
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ result: { result: true } })
      })

      const result = await connector.sendTransaction({
        from: MOCK_OWNER_ADDRESS,
        to: MOCK_TO_ADDRESS,
        value: '1000000'
      })

      expect(result).toBe(MOCK_UNSIGNED_TX.txID)

      const createCall = mockFetch.mock.calls[0]
      expect(createCall?.[0]).toContain('rpc.walletconnect.org')
      const createBody = JSON.parse(createCall?.[1]?.body as string)
      expect(createBody.method).toBe('tron_createTransaction')
      expect(createBody.params).toEqual([MOCK_OWNER_ADDRESS, MOCK_TO_ADDRESS, 1000000, true])

      const broadcastCall = mockFetch.mock.calls[1]
      const broadcastBody = JSON.parse(broadcastCall?.[1]?.body as string)
      expect(broadcastBody.method).toBe('tron_broadcastTransaction')
    })

    it('falls back to the fullnode directly for a chain the Blockchain API does not support (Shasta)', async () => {
      vi.mocked(ChainController.getCaipNetworkByNamespace).mockReturnValue(MOCK_SHASTA as any)
      mockAdapter.signTransaction.mockResolvedValueOnce(MOCK_SIGNED_TX)

      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(MOCK_UNSIGNED_TX)
      })
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
      const createBody = JSON.parse(createCall?.[1]?.body as string)
      expect(createBody).toEqual({
        owner_address: MOCK_OWNER_ADDRESS,
        to_address: MOCK_TO_ADDRESS,
        amount: 1000000,
        visible: true
      })

      const broadcastCall = mockFetch.mock.calls[1]
      expect(broadcastCall?.[0]).toBe('https://api.shasta.trongrid.io/wallet/broadcasttransaction')
      expect(JSON.parse(broadcastCall?.[1]?.body as string)).toEqual(MOCK_SIGNED_TX)

      expect(mockAdapter.signTransaction).toHaveBeenCalledWith(MOCK_UNSIGNED_TX)
    })

    it('surfaces the real TRON error when the fullnode fallback rejects the transaction', async () => {
      vi.mocked(ChainController.getCaipNetworkByNamespace).mockReturnValue(MOCK_SHASTA as any)

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

      expect(mockAdapter.signTransaction).not.toHaveBeenCalled()
    })
  })

  describe('switchNetwork', () => {
    it('switches the underlying wallet adapter to the bare (non-CAIP) chain id', async () => {
      await connector.switchNetwork('tron:0x94a9059e')

      expect(mockAdapter.switchChain).toHaveBeenCalledWith('0x94a9059e')
    })

    it('passes through a chain id that has no namespace prefix unchanged', async () => {
      await connector.switchNetwork('0x2b6653dc')

      expect(mockAdapter.switchChain).toHaveBeenCalledWith('0x2b6653dc')
    })

    it('does not throw when the underlying wallet adapter does not support switchChain', async () => {
      mockAdapter.switchChain.mockRejectedValueOnce(
        new Error("The current wallet doesn't support switch chain.")
      )

      await expect(connector.switchNetwork('tron:0x94a9059e')).resolves.toBeUndefined()
    })
  })
})
