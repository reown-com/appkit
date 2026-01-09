import { beforeEach, describe, expect, it, vi } from 'vitest'

import { CoreHelperUtil } from '@reown/appkit-controllers'
import { tonTestnet } from '@reown/appkit/networks'

import { TonConnectConnector } from '../../src/connectors/TonConnectConnector.js'
import { TonConnectUtil } from '../../src/utils/TonConnectUtil.js'
import { mockTonProvider } from '../mocks/mockTonProvider.js'

// Mock the wallet API
const mockWalletApi = {
  send: vi.fn().mockResolvedValue({ result: 'mock_boc_result' }),
  connect: vi.fn(),
  listen: vi.fn().mockReturnValue(() => {}),
  walletInfo: {
    name: 'MockTonWallet',
    app_name: 'mock_ton_wallet',
    image: 'data:image/png;base64,mock',
    about_url: 'https://mock.wallet',
    platforms: ['chrome'],
    features: [
      {
        name: 'SendTransaction',
        maxMessages: 255,
        extraCurrencySupported: true
      }
    ]
  }
}

describe('TonConnectConnector', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock isClient to return true so sendMessage executes
    vi.spyOn(CoreHelperUtil, 'isClient').mockReturnValue(true)
    // Reset mock wallet API send to default return value
    mockWalletApi.send.mockResolvedValue({ result: 'mock_boc_result' })
    // Mock getTonConnect to return our mock wallet API
    vi.spyOn(TonConnectUtil, 'getTonConnect').mockReturnValue(mockWalletApi as any)
    vi.spyOn(TonConnectUtil, 'assertSendTransactionSupported').mockImplementation(() => {})
    vi.spyOn(TonConnectUtil, 'normalizeBase64').mockImplementation(val => val)
  })

  describe('sendMessage', () => {
    it('should convert user-friendly from address to wc:hex format', async () => {
      const mocks = mockTonProvider()
      const connector = new TonConnectConnector({
        wallet: mocks.wallet,
        chains: [tonTestnet]
      })

      // Set up connector with account
      ;(connector as any).currentAddress = 'UQA2A5SpYmHjygKewBWilkSc7twv1eTBuHOkWlUOLoXGV9Jg'

      const userFriendlyAddress = 'UQA2A5SpYmHjygKewBWilkSc7twv1eTBuHOkWlUOLoXGV9Jg'

      await connector.sendMessage({
        validUntil: Math.floor(Date.now() / 1000) + 60,
        from: userFriendlyAddress,
        messages: [
          {
            address: 'UQA2A5SpYmHjygKewBWilkSc7twv1eTBuHOkWlUOLoXGV9Jg',
            amount: '20000000'
          }
        ]
      })

      // Verify that send was called with the correct format
      expect(mockWalletApi.send).toHaveBeenCalled()
      const callArgs = mockWalletApi.send.mock.calls[0]?.[0]
      expect(callArgs).toBeDefined()
      const prepared = JSON.parse(callArgs.params[0])

      // The from address should be in wc:hex format (e.g., "0:abc123...")
      expect(prepared.from).toMatch(/^[0-9-]+:[0-9a-fA-F]{64}$/u)
      expect(prepared.from).not.toBe(userFriendlyAddress)
    })

    it('should use connector account address if from is not provided', async () => {
      const mocks = mockTonProvider()
      const connector = new TonConnectConnector({
        wallet: mocks.wallet,
        chains: [tonTestnet]
      })

      // Set up connector with account
      ;(connector as any).currentAddress = 'UQA2A5SpYmHjygKewBWilkSc7twv1eTBuHOkWlUOLoXGV9Jg'
      // Mock account property
      ;(connector as any).account = {
        address: 'UQA2A5SpYmHjygKewBWilkSc7twv1eTBuHOkWlUOLoXGV9Jg',
        chain: '-239'
      }

      await connector.sendMessage({
        validUntil: Math.floor(Date.now() / 1000) + 60,
        messages: [
          {
            address: 'UQA2A5SpYmHjygKewBWilkSc7twv1eTBuHOkWlUOLoXGV9Jg',
            amount: '20000000'
          }
        ]
      })

      expect(mockWalletApi.send).toHaveBeenCalled()
      const callArgs = mockWalletApi.send.mock.calls[0]?.[0]
      expect(callArgs).toBeDefined()
      const prepared = JSON.parse(callArgs.params[0])

      // Should convert the account address to wc:hex format
      expect(prepared.from).toMatch(/^[0-9-]+:[0-9a-fA-F]{64}$/u)
    })

    it('should handle undefined from address', async () => {
      const mocks = mockTonProvider()
      const connector = new TonConnectConnector({
        wallet: mocks.wallet,
        chains: [tonTestnet]
      })

      await connector.sendMessage({
        validUntil: Math.floor(Date.now() / 1000) + 60,
        messages: [
          {
            address: 'UQA2A5SpYmHjygKewBWilkSc7twv1eTBuHOkWlUOLoXGV9Jg',
            amount: '20000000'
          }
        ]
      })

      expect(mockWalletApi.send).toHaveBeenCalled()
      const callArgs = mockWalletApi.send.mock.calls[0]?.[0]
      expect(callArgs).toBeDefined()
      const prepared = JSON.parse(callArgs.params[0])

      // from should be undefined if no address is available
      expect(prepared.from).toBeUndefined()
    })

    it('should preserve user-friendly addresses in messages', async () => {
      const mocks = mockTonProvider()
      const connector = new TonConnectConnector({
        wallet: mocks.wallet,
        chains: [tonTestnet]
      })

      const toAddress = 'UQA2A5SpYmHjygKewBWilkSc7twv1eTBuHOkWlUOLoXGV9Jg'

      await connector.sendMessage({
        validUntil: Math.floor(Date.now() / 1000) + 60,
        from: toAddress,
        messages: [
          {
            address: toAddress,
            amount: '20000000'
          }
        ]
      })

      expect(mockWalletApi.send).toHaveBeenCalled()
      const callArgs = mockWalletApi.send.mock.calls[0]?.[0]
      expect(callArgs).toBeDefined()
      const prepared = JSON.parse(callArgs.params[0])

      // Message addresses should remain in user-friendly format
      expect(prepared.messages[0].address).toBe(toAddress)
      // But from should be converted to wc:hex
      expect(prepared.from).toMatch(/^[0-9-]+:[0-9a-fA-F]{64}$/u)
      expect(prepared.from).not.toBe(toAddress)
    })

    it('should include payload and stateInit in prepared transaction', async () => {
      const mocks = mockTonProvider()
      const connector = new TonConnectConnector({
        wallet: mocks.wallet,
        chains: [tonTestnet]
      })

      const testPayload = 'te6ccgEBAQEADAAMABQAAAAASGVsbG8h'
      const testStateInit = 'te6ccgEBAgEAKAABAcABAgBQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAg'

      const testAddress = 'UQA2A5SpYmHjygKewBWilkSc7twv1eTBuHOkWlUOLoXGV9Jg'
      const params = {
        validUntil: Math.floor(Date.now() / 1000) + 300,
        from: testAddress,
        messages: [
          {
            address: testAddress,
            amount: '1000000000',
            payload: testPayload,
            stateInit: testStateInit
          }
        ]
      }

      await connector.sendMessage(params)

      expect(mockWalletApi.send).toHaveBeenCalled()
      const callArgs = mockWalletApi.send.mock.calls[0]?.[0]
      expect(callArgs).toBeDefined()
      const preparedTx = JSON.parse(callArgs.params[0])

      expect(preparedTx.messages[0]).toMatchObject({
        address: testAddress,
        amount: '1000000000',
        payload: testPayload,
        stateInit: testStateInit
      })
    })

    it('should throw error if wallet is not available', async () => {
      const mocks = mockTonProvider()
      const connector = new TonConnectConnector({
        wallet: mocks.wallet,
        chains: [tonTestnet]
      })

      vi.spyOn(TonConnectUtil, 'getTonConnect').mockReturnValue(undefined)

      await expect(
        connector.sendMessage({
          validUntil: Math.floor(Date.now() / 1000) + 60,
          messages: [
            {
              address: 'UQA2A5SpYmHjygKewBWilkSc7twv1eTBuHOkWlUOLoXGV9Jg',
              amount: '20000000'
            }
          ]
        })
      ).rejects.toThrow('Injected wallet')
    })

    it('should throw error if messages array is empty', async () => {
      const mocks = mockTonProvider()
      const connector = new TonConnectConnector({
        wallet: mocks.wallet,
        chains: [tonTestnet]
      })

      await expect(
        connector.sendMessage({
          validUntil: Math.floor(Date.now() / 1000) + 60,
          messages: []
        })
      ).rejects.toThrow('messages must contain at least 1 item')
    })

    it('should return boc from response', async () => {
      const mocks = mockTonProvider()
      const connector = new TonConnectConnector({
        wallet: mocks.wallet,
        chains: [tonTestnet]
      })

      mockWalletApi.send.mockResolvedValue({ result: 'test_boc_result' })

      const result = await connector.sendMessage({
        validUntil: Math.floor(Date.now() / 1000) + 60,
        messages: [
          {
            address: 'UQA2A5SpYmHjygKewBWilkSc7twv1eTBuHOkWlUOLoXGV9Jg',
            amount: '20000000'
          }
        ]
      })

      expect(result).toBe('test_boc_result')
    })

    it('should handle boc field in response', async () => {
      const mocks = mockTonProvider()
      const connector = new TonConnectConnector({
        wallet: mocks.wallet,
        chains: [tonTestnet]
      })

      mockWalletApi.send.mockResolvedValue({ boc: 'test_boc_field' })

      const result = await connector.sendMessage({
        validUntil: Math.floor(Date.now() / 1000) + 60,
        messages: [
          {
            address: 'UQA2A5SpYmHjygKewBWilkSc7twv1eTBuHOkWlUOLoXGV9Jg',
            amount: '20000000'
          }
        ]
      })

      expect(result).toBe('test_boc_field')
    })
  })
})
