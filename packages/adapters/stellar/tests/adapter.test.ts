import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { CaipNetwork } from '@reown/appkit-common'
import { ChainController } from '@reown/appkit-controllers'
import type { StellarConnector } from '@reown/appkit-utils/stellar'

import { StellarAdapter } from '../src/adapter.js'

const ADDRESS = 'GB43KVROR7TFJ6KAPCYRF2FJROTZAH4FHLTJLPWX4DRZCC5NASLGITR6'

const MOCK_NETWORK = {
  id: 'pubnet',
  chainNamespace: 'stellar',
  caipNetworkId: 'stellar:pubnet',
  name: 'Stellar',
  nativeCurrency: { name: 'Lumens', symbol: 'XLM', decimals: 7 },
  rpcUrls: {
    default: { http: ['https://horizon.stellar.org'] },
    chainDefault: { http: ['https://horizon.stellar.org'] }
  }
} as unknown as CaipNetwork

describe('StellarAdapter', () => {
  let adapter: StellarAdapter

  beforeEach(() => {
    vi.spyOn(ChainController, 'getCaipNetworks').mockReturnValue([MOCK_NETWORK])
    adapter = new StellarAdapter()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('registers itself under the stellar namespace', () => {
    expect(adapter.namespace).toBe('stellar')
    expect(adapter.adapterType).toBe('stellar')
  })

  describe('syncConnectors', () => {
    it('adds no connectors -- there is no extension discovery', () => {
      adapter.syncConnectors()

      expect(adapter.connectors).toHaveLength(0)
    })
  })

  describe('getBalance', () => {
    it('returns the native XLM balance from Horizon', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({
          balances: [
            { asset_type: 'credit_alphanum4', balance: '5.0000000' },
            { asset_type: 'native', balance: '123.4567890' }
          ]
        })
      } as Response)

      const result = await adapter.getBalance({
        address: ADDRESS,
        chainId: MOCK_NETWORK.id,
        caipNetwork: MOCK_NETWORK
      })

      expect(fetchSpy).toHaveBeenCalledWith(`https://horizon.stellar.org/accounts/${ADDRESS}`)
      expect(result).toEqual({ balance: '123.4567890', symbol: 'XLM' })
    })

    it('treats an unfunded account (404) as a zero balance', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({})
      } as Response)

      const result = await adapter.getBalance({
        address: ADDRESS,
        chainId: MOCK_NETWORK.id,
        caipNetwork: MOCK_NETWORK
      })

      expect(result).toEqual({ balance: '0', symbol: 'XLM' })
    })

    it('returns zero when Horizon errors', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({})
      } as Response)
      vi.spyOn(console, 'error').mockImplementation(() => undefined)

      const result = await adapter.getBalance({
        address: ADDRESS,
        chainId: MOCK_NETWORK.id,
        caipNetwork: MOCK_NETWORK
      })

      expect(result).toEqual({ balance: '0', symbol: 'XLM' })
    })

    it('returns zero when the response carries no native balance', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => ({ balances: [] })
      } as Response)

      const result = await adapter.getBalance({
        address: ADDRESS,
        chainId: MOCK_NETWORK.id,
        caipNetwork: MOCK_NETWORK
      })

      expect(result).toEqual({ balance: '0', symbol: 'XLM' })
    })

    it('does not call Horizon without an address', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')

      const result = await adapter.getBalance({
        address: '',
        chainId: MOCK_NETWORK.id,
        caipNetwork: MOCK_NETWORK
      })

      expect(fetchSpy).not.toHaveBeenCalled()
      expect(result).toEqual({ balance: '0', symbol: 'XLM' })
    })
  })

  describe('signMessage', () => {
    it('delegates to the connector', async () => {
      const connector = {
        signMessage: vi.fn().mockResolvedValue({
          signature: 'base64-signature',
          signerAddress: `stellar:pubnet:${ADDRESS}`
        })
      } as unknown as StellarConnector

      const result = await adapter.signMessage({
        message: 'hello',
        address: ADDRESS,
        provider: connector
      })

      expect(connector.signMessage).toHaveBeenCalledWith({ message: 'hello', address: ADDRESS })
      expect(result).toEqual({ signature: 'base64-signature' })
    })

    it('throws without a connector', async () => {
      await expect(
        adapter.signMessage({ message: 'hello', address: ADDRESS, provider: undefined })
      ).rejects.toThrow('connector is undefined')
    })
  })

  describe('methods that do not apply to Stellar', () => {
    it('resolve to inert values rather than throwing', async () => {
      await expect(adapter.getAccounts()).resolves.toEqual({ accounts: [] })
      await expect(adapter.sendTransaction()).resolves.toEqual({ hash: '' })
      await expect(adapter.writeSolanaTransaction()).resolves.toEqual({ hash: '' })
      expect(adapter.parseUnits()).toBe(BigInt(0))
      expect(adapter.formatUnits()).toBe('')
    })
  })
})
