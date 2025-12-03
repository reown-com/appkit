import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CoreHelperUtil } from '@reown/appkit-controllers'
import { tonTestnet } from '@reown/appkit/networks'

import { TonConnectConnector } from '../src/connectors/TonConnectConnector.js'
import { TonConnectUtil } from '../src/utils/TonConnectUtil.js'
import { mockTonProvider } from './mocks/mockTonProvider.js'

describe('TonConnectConnector', () => {
  let connector: TonConnectConnector
  let mocks: ReturnType<typeof mockTonProvider>

  beforeEach(() => {
    mocks = mockTonProvider()
    connector = new TonConnectConnector({
      wallet: mocks.wallet,
      chains: [tonTestnet]
    })

    // Mock CoreHelperUtil.isClient to return true (simulate browser environment)
    vi.spyOn(CoreHelperUtil, 'isClient').mockReturnValue(true)

    // Mock TonConnectUtil.getTonConnect to return our mock wallet
    vi.spyOn(TonConnectUtil, 'getTonConnect').mockReturnValue(mocks.wallet as any)

    // Mock TonConnectUtil.assertSendTransactionSupported to not throw
    vi.spyOn(TonConnectUtil, 'assertSendTransactionSupported').mockImplementation(() => {})
  })

  describe('sendMessage', () => {
    it('should include payload and stateInit in prepared transaction', async () => {
      const testPayload = 'te6ccgEBAQEADAAMABQAAAAASGVsbG8h'
      const testStateInit = 'te6ccgEBAgEAKAABAcABAgBQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAg'

      const params = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        from: 'UQDCp8fa0dQafUICMadG4KiSYxamwzvf53_4E9d21Ol14xb-',
        messages: [
          {
            address: 'UQDCp8fa0dQafUICMadG4KiSYxamwzvf53_4E9d21Ol14xb-',
            amount: '1000000000',
            payload: testPayload,
            stateInit: testStateInit
          }
        ]
      }

      await connector.sendMessage(params)

      // Verify that wallet.send was called
      expect(mocks.wallet.send).toHaveBeenCalled()

      // Get the actual call arguments
      const callArgs = vi.mocked(mocks.wallet.send).mock.calls[0]?.[0]
      expect(callArgs).toBeDefined()
      expect(callArgs?.method).toBe('sendTransaction')

      // Parse the prepared transaction from the params
      const preparedTx = JSON.parse(callArgs?.params[0] as string)

      // Verify that the prepared transaction includes payload and stateInit
      expect(preparedTx.messages).toHaveLength(1)
      expect(preparedTx.messages[0]).toMatchObject({
        address: 'UQDCp8fa0dQafUICMadG4KiSYxamwzvf53_4E9d21Ol14xb-',
        amount: '1000000000',
        payload: testPayload,
        stateInit: testStateInit
      })
    })

    it('should handle messages without payload and stateInit', async () => {
      const params = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        from: 'UQDCp8fa0dQafUICMadG4KiSYxamwzvf53_4E9d21Ol14xb-',
        messages: [
          {
            address: 'UQDCp8fa0dQafUICMadG4KiSYxamwzvf53_4E9d21Ol14xb-',
            amount: '1000000000'
          }
        ]
      }

      await connector.sendMessage(params)

      const callArgs = vi.mocked(mocks.wallet.send).mock.calls[0]?.[0]
      const preparedTx = JSON.parse(callArgs?.params[0] as string)

      // When payload/stateInit are undefined, JSON.stringify omits them (which is fine)
      expect(preparedTx.messages[0]).toMatchObject({
        address: 'UQDCp8fa0dQafUICMadG4KiSYxamwzvf53_4E9d21Ol14xb-',
        amount: '1000000000'
      })
      expect(preparedTx.messages).toHaveLength(1)
    })

    it('should handle multiple messages with mixed payload/stateInit', async () => {
      const params = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        from: 'UQDCp8fa0dQafUICMadG4KiSYxamwzvf53_4E9d21Ol14xb-',
        messages: [
          {
            address: 'UQDCp8fa0dQafUICMadG4KiSYxamwzvf53_4E9d21Ol14xb-',
            amount: '1000000000',
            payload: 'te6ccgEBAQEADAAMABQAAAAASGVsbG8h'
          },
          {
            address: 'UQBxYcMcKUJD5bn9yC7BXFMm5GnN0iP4yHwPxGQeKl_6KeOL',
            amount: '2000000000',
            stateInit: 'te6ccgEBAgEAKAABAcABAgBQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAg'
          },
          {
            address: 'UQA0i8-CdGnF_DhUHHf92R1ONH6sIA9vLZ_WLcCIhfBBXwtG',
            amount: '3000000000'
          }
        ]
      }

      await connector.sendMessage(params)

      const callArgs = vi.mocked(mocks.wallet.send).mock.calls[0]?.[0]
      const preparedTx = JSON.parse(callArgs?.params[0] as string)

      expect(preparedTx.messages).toHaveLength(3)
      expect(preparedTx.messages[0].payload).toBe('te6ccgEBAQEADAAMABQAAAAASGVsbG8h')
      expect(preparedTx.messages[1].stateInit).toBe(
        'te6ccgEBAgEAKAABAcABAgBQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAg'
      )
      expect(preparedTx.messages[2].payload).toBeUndefined()
      expect(preparedTx.messages[2].stateInit).toBeUndefined()
    })

    it('should normalize base64 payload and stateInit', async () => {
      // Mock normalizeBase64 to verify it's being called
      const normalizeBase64Spy = vi
        .spyOn(TonConnectUtil, 'normalizeBase64')
        .mockImplementation(val => val)

      const params = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        from: 'UQDCp8fa0dQafUICMadG4KiSYxamwzvf53_4E9d21Ol14xb-',
        messages: [
          {
            address: 'UQDCp8fa0dQafUICMadG4KiSYxamwzvf53_4E9d21Ol14xb-',
            amount: '1000000000',
            payload: 'test_payload',
            stateInit: 'test_stateInit'
          }
        ]
      }

      await connector.sendMessage(params)

      // Verify normalizeBase64 was called for both payload and stateInit
      expect(normalizeBase64Spy).toHaveBeenCalledWith('test_payload')
      expect(normalizeBase64Spy).toHaveBeenCalledWith('test_stateInit')
    })

    it('should throw error if amount is not a string of digits', async () => {
      const params = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        from: 'UQDCp8fa0dQafUICMadG4KiSYxamwzvf53_4E9d21Ol14xb-',
        messages: [
          {
            address: 'UQDCp8fa0dQafUICMadG4KiSYxamwzvf53_4E9d21Ol14xb-',
            amount: 'invalid'
          }
        ]
      }

      await expect(connector.sendMessage(params)).rejects.toThrow(
        'messages[0].amount must be a string of digits'
      )
    })

    it('should throw error if address is missing', async () => {
      const params = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        from: 'UQDCp8fa0dQafUICMadG4KiSYxamwzvf53_4E9d21Ol14xb-',
        messages: [
          {
            amount: '1000000000'
          } as any
        ]
      }

      await expect(connector.sendMessage(params)).rejects.toThrow(
        'messages[0].address is required (user-friendly)'
      )
    })

    it('should throw error if messages array is empty', async () => {
      const params = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        from: 'UQDCp8fa0dQafUICMadG4KiSYxamwzvf53_4E9d21Ol14xb-',
        messages: []
      }

      await expect(connector.sendMessage(params)).rejects.toThrow(
        'messages must contain at least 1 item'
      )
    })

    it('should handle extra_currency field', async () => {
      const params = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        from: 'UQDCp8fa0dQafUICMadG4KiSYxamwzvf53_4E9d21Ol14xb-',
        messages: [
          {
            address: 'UQDCp8fa0dQafUICMadG4KiSYxamwzvf53_4E9d21Ol14xb-',
            amount: '1000000000',
            extraCurrency: { 1: '500' }
          }
        ]
      }

      await connector.sendMessage(params)

      const callArgs = vi.mocked(mocks.wallet.send).mock.calls[0]?.[0]
      const preparedTx = JSON.parse(callArgs?.params[0] as string)

      expect(preparedTx.messages[0].extra_currency).toEqual({ 1: '500' })
    })

    it('should return boc from response', async () => {
      const expectedBoc = 'te6ccgEBAQEABgAACAABAAI='
      vi.mocked(mocks.wallet.send).mockResolvedValueOnce({ boc: expectedBoc })

      const params = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        from: 'UQDCp8fa0dQafUICMadG4KiSYxamwzvf53_4E9d21Ol14xb-',
        messages: [
          {
            address: 'UQDCp8fa0dQafUICMadG4KiSYxamwzvf53_4E9d21Ol14xb-',
            amount: '1000000000'
          }
        ]
      }

      const result = await connector.sendMessage(params)

      expect(result).toBe(expectedBoc)
    })

    it('should throw error if wallet send returns error', async () => {
      vi.mocked(mocks.wallet.send).mockResolvedValueOnce({
        error: { code: 1, message: 'User rejected transaction' }
      })

      const params = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        from: 'UQDCp8fa0dQafUICMadG4KiSYxamwzvf53_4E9d21Ol14xb-',
        messages: [
          {
            address: 'UQDCp8fa0dQafUICMadG4KiSYxamwzvf53_4E9d21Ol14xb-',
            amount: '1000000000'
          }
        ]
      }

      await expect(connector.sendMessage(params)).rejects.toThrow('User rejected transaction')
    })
  })
})
