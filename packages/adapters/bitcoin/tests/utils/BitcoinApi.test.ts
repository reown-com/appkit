import { describe, expect, it, vi } from 'vitest'

import { bitcoin, bitcoinTestnet } from '@reown/appkit/networks'

import { BitcoinApi } from '../../src/utils/BitcoinApi'
import { mockUTXO } from '../mocks/mockUTXO'

describe('BitcoinApi', () => {
  describe('getUTXOs', () => {
    it('should fetch UTXOs', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')
      const mockedUTXOs = [mockUTXO(), mockUTXO({ txid: 'mock_txid2' })]

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: vi.fn(() => Promise.resolve(mockedUTXOs))
      } as any)

      const response = await BitcoinApi.getUTXOs({
        network: bitcoin,
        address: 'mock_address'
      })

      expect(response).toEqual(mockedUTXOs)
      expect(fetchSpy).toHaveBeenCalledWith('https://mempool.space/api/address/mock_address/utxo')
    })

    it('should use testnet endpoint', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')
      const mockedUTXOs = [mockUTXO({})]

      fetchSpy.mockResolvedValueOnce({
        ok: true,
        json: vi.fn(() => Promise.resolve(mockedUTXOs))
      } as any)

      const response = await BitcoinApi.getUTXOs({
        network: bitcoinTestnet,
        address: 'mock_address'
      })

      expect(response).toEqual(mockedUTXOs)
      expect(fetchSpy).toHaveBeenCalledWith(
        'https://mempool.space/testnet/api/address/mock_address/utxo'
      )
    })

    it('should return empty array if request fails', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')
      const consoleSpy = vi.spyOn(console, 'warn')

      fetchSpy.mockResolvedValueOnce({
        ok: false,
        text: vi.fn(() => Promise.resolve('mock_error'))
      } as any)

      const response = await BitcoinApi.getUTXOs({
        network: bitcoin,
        address: 'mock_address'
      })

      expect(response).toEqual([])
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch UTXOs: mock_error')
    })
  })
})
