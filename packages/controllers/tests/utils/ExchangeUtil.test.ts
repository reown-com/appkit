import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { CaipNetworkId } from '@reown/appkit-common'

import { OptionsController } from '../../src/controllers/OptionsController'
import {
  formatCaip19Asset,
  getApiUrl,
  getBuyStatus,
  getExchanges,
  getPayUrl
} from '../../src/utils/ExchangeUtil'

describe('ExchangeUtil', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.stubGlobal('fetch', vi.fn())
    // Ensure projectId is set for URL generation via snapshot
    vi.spyOn(OptionsController, 'getSnapshot').mockReturnValue({
      projectId: 'test-project-id',
      sdkType: 'test-sdk-type',
      sdkVersion: 'test-sdk-version'
    } as unknown as ReturnType<typeof OptionsController.getSnapshot>)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetAllMocks()
  })

  describe('getApiUrl', () => {
    it('returns the correct WalletConnect JSON-RPC URL', () => {
      const url = getApiUrl()
      expect(url).toBe(
        'https://rpc.walletconnect.org/v1/json-rpc?projectId=test-project-id&st=test-sdk-type&sv=test-sdk-version&source=fund-wallet'
      )
    })
  })

  describe('JSON-RPC requests', () => {
    it('getExchanges sends request and returns result', async () => {
      const params = {
        page: 2,
        asset: 'native',
        amount: '100',
        network: 'eip155:1' as CaipNetworkId,
        projectId: 'test-project-id'
      }

      vi.mocked(global.fetch).mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          jsonrpc: '2.0',
          id: 1,
          result: {
            exchanges: [{ id: 'ex1', imageUrl: 'https://img', name: 'ExampleEx' }],
            total: 1
          }
        })
      } as unknown as Response)

      const result = await getExchanges(params)

      expect(global.fetch).toHaveBeenCalledTimes(1)
      const [calledUrl, calledInit] = vi.mocked(global.fetch).mock.calls[0]!
      expect(String(calledUrl)).toBe(
        'https://rpc.walletconnect.org/v1/json-rpc?projectId=test-project-id&st=test-sdk-type&sv=test-sdk-version&source=fund-wallet'
      )
      expect(calledInit?.method).toBe('POST')
      expect(calledInit?.headers).toEqual({ 'Content-Type': 'application/json' })
      const body = JSON.parse(String(calledInit?.body))
      expect(body.method).toBe('reown_getExchanges')
      expect(body.params).toEqual(params)
      expect(result).toEqual({
        exchanges: [{ id: 'ex1', imageUrl: 'https://img', name: 'ExampleEx' }],
        total: 1
      })
    })

    it('getPayUrl sends request and returns result', async () => {
      const params = {
        exchangeId: 'ex1',
        asset: 'erc20:0xabc',
        amount: '1',
        recipient: '0x123',
        projectId: 'test-project-id'
      }

      vi.mocked(global.fetch).mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          jsonrpc: '2.0',
          id: 1,
          result: { url: 'https://pay.example/ex1', sessionId: 'sess-1' }
        })
      } as unknown as Response)

      const result = await getPayUrl(params)

      expect(global.fetch).toHaveBeenCalledTimes(1)
      const [, calledInit] = vi.mocked(global.fetch).mock.calls[0]!
      const body = JSON.parse(String(calledInit?.body))
      expect(body.method).toBe('reown_getExchangePayUrl')
      expect(body.params).toEqual(params)
      expect(result).toEqual({ url: 'https://pay.example/ex1', sessionId: 'sess-1' })
    })

    it('getBuyStatus sends request and returns result', async () => {
      const params = { sessionId: 'sess-1', exchangeId: 'ex1', projectId: 'test-project-id' }

      vi.mocked(global.fetch).mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          jsonrpc: '2.0',
          id: 1,
          result: { status: 'IN_PROGRESS', txHash: undefined }
        })
      } as unknown as Response)

      const result = await getBuyStatus(params)

      expect(global.fetch).toHaveBeenCalledTimes(1)
      const [, calledInit] = vi.mocked(global.fetch).mock.calls[0]!
      const body = JSON.parse(String(calledInit?.body))
      expect(body.method).toBe('reown_getExchangeBuyStatus')
      expect(body.params).toEqual(params)
      expect(result).toEqual({ status: 'IN_PROGRESS', txHash: undefined })
    })

    it('throws when JSON-RPC returns an error', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        json: vi.fn().mockResolvedValue({ error: { message: 'RPC Error happened' } })
      } as unknown as Response)

      await expect(
        getExchanges({
          page: 1,
          asset: 'native',
          amount: '1',
          network: 'eip155:1' as CaipNetworkId
        })
      ).rejects.toThrow('RPC Error happened')
    })
  })

  describe('formatCaip19Asset', () => {
    it('formats EVM native asset', () => {
      const formatted = formatCaip19Asset('eip155:1' as CaipNetworkId, 'native')
      expect(formatted).toBe('eip155:1/slip44:60')
    })

    it('formats EVM ERC20 token', () => {
      const formatted = formatCaip19Asset('eip155:1' as CaipNetworkId, '0xabc')
      expect(formatted).toBe('eip155:1/erc20:0xabc')
    })

    it('formats Solana native asset', () => {
      const formatted = formatCaip19Asset(
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp' as CaipNetworkId,
        'native'
      )
      expect(formatted).toBe('solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:501')
    })

    it('formats Solana token', () => {
      const formatted = formatCaip19Asset(
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp' as CaipNetworkId,
        'So11111111111111111111111111111111111111112'
      )
      expect(formatted).toBe(
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:So11111111111111111111111111111111111111112'
      )
    })

    it('throws for unsupported chain namespace', () => {
      expect(() => formatCaip19Asset('cosmos:cosmoshub-4' as CaipNetworkId, 'native')).toThrow(
        'Unsupported chain namespace for CAIP-19 formatting: cosmos'
      )
    })
  })
})
