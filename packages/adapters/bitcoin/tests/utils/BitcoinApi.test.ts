import { bitcoin, bitcoinTestnet } from '@reown/appkit/networks'
import { describe, expect, it, vi } from 'vitest'
import { BitcoinApi } from '../../src/utils/BitcoinApi'

function mockUTXO(replaces: Partial<BitcoinApi.UTXO> = {}): BitcoinApi.UTXO {
  return {
    txid: 'mock_txid',
    vout: 0,
    value: 1000,
    status: {
      confirmed: true,
      block_height: 1,
      block_hash: 'mock_block_hash',
      block_time: 1
    },
    ...replaces
  }
}

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

    it('should throw an error if the request fails', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch')

      fetchSpy.mockResolvedValueOnce({
        ok: false,
        text: vi.fn(() => Promise.resolve('mock_error'))
      } as any)

      await expect(
        BitcoinApi.getUTXOs({
          network: bitcoin,
          address: 'mock_address'
        })
      ).rejects.toThrow('Failed to fetch UTXOs: mock_error')
    })
  })
})
