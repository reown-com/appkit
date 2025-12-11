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

      const callArgs = vi.mocked(mocks.wallet.send).mock.calls[0]?.[0]
      const preparedTx = JSON.parse(callArgs?.params[0] as string)

      expect(preparedTx.messages[0]).toMatchObject({
        address: 'UQDCp8fa0dQafUICMadG4KiSYxamwzvf53_4E9d21Ol14xb-',
        amount: '1000000000',
        payload: testPayload,
        stateInit: testStateInit
      })
    })
  })
})
