import { afterEach, describe, expect, it, vi } from 'vitest'

import { TronFullnodeUtil } from '../utils/TronFullnodeUtil'

const FULL_NODE_URL = 'https://api.shasta.trongrid.io'
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

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('TronFullnodeUtil', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('createTransaction', () => {
    it('POSTs to /wallet/createtransaction with the legacy TRON REST body and returns the unsigned tx', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve(MOCK_UNSIGNED_TX)
      })

      const result = await TronFullnodeUtil.createTransaction(FULL_NODE_URL, {
        from: MOCK_OWNER_ADDRESS,
        to: MOCK_TO_ADDRESS,
        value: '1000000'
      })

      expect(result).toEqual(MOCK_UNSIGNED_TX)

      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect(url).toBe(`${FULL_NODE_URL}/wallet/createtransaction`)
      expect(options.method).toBe('POST')
      expect((options.headers as Record<string, string>)['Content-Type']).toBe('application/json')
      expect(JSON.parse(options.body as string)).toEqual({
        owner_address: MOCK_OWNER_ADDRESS,
        to_address: MOCK_TO_ADDRESS,
        amount: 1000000,
        visible: true
      })
    })

    it('throws the upstream TRON error message when the response has no txID', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () =>
          Promise.resolve({
            Error:
              'class org.tron.core.exception.ContractValidateException : Validate TransferContract error, no OwnerAccount.'
          })
      })

      await expect(
        TronFullnodeUtil.createTransaction(FULL_NODE_URL, {
          from: MOCK_OWNER_ADDRESS,
          to: MOCK_TO_ADDRESS,
          value: '1000000'
        })
      ).rejects.toThrow(
        'class org.tron.core.exception.ContractValidateException : Validate TransferContract error, no OwnerAccount.'
      )
    })

    it('throws a generic error when the response has neither a txID nor an Error', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({})
      })

      await expect(
        TronFullnodeUtil.createTransaction(FULL_NODE_URL, {
          from: MOCK_OWNER_ADDRESS,
          to: MOCK_TO_ADDRESS,
          value: '1000000'
        })
      ).rejects.toThrow('Failed to create transaction')
    })
  })

  describe('broadcastTransaction', () => {
    it('POSTs to /wallet/broadcasttransaction with the full signed tx as the body', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ result: true, txid: MOCK_SIGNED_TX.txID })
      })

      const result = await TronFullnodeUtil.broadcastTransaction(FULL_NODE_URL, MOCK_SIGNED_TX)

      expect(result).toEqual({ result: true, txid: MOCK_SIGNED_TX.txID })

      const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit]
      expect(url).toBe(`${FULL_NODE_URL}/wallet/broadcasttransaction`)
      expect(options.method).toBe('POST')
      expect(JSON.parse(options.body as string)).toEqual(MOCK_SIGNED_TX)
    })

    it('throws the upstream message when result.result is falsy', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ result: false, message: 'Insufficient bandwidth' })
      })

      await expect(
        TronFullnodeUtil.broadcastTransaction(FULL_NODE_URL, MOCK_SIGNED_TX)
      ).rejects.toThrow('Insufficient bandwidth')
    })

    it('throws a generic error when result.result is falsy and there is no message', async () => {
      mockFetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ result: false })
      })

      await expect(
        TronFullnodeUtil.broadcastTransaction(FULL_NODE_URL, MOCK_SIGNED_TX)
      ).rejects.toThrow('Failed to broadcast transaction')
    })
  })
})
