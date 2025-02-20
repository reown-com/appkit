import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConstantsUtil } from '@reown/appkit-common'

import { AuthProvider } from '../providers/AuthProvider'
import { mockLegacyTransaction, mockVersionedTransaction } from './mocks/Transaction'
import { mockW3mFrameProvider } from './mocks/W3mFrameProvider'
import { TestConstants } from './util/TestConstants'

describe('AuthProvider specific tests', () => {
  let provider = mockW3mFrameProvider()
  let getActiveChain = vi.fn(() => TestConstants.chains[0])
  let authProvider = new AuthProvider({
    w3mFrameProvider: mockW3mFrameProvider(),
    getActiveChain,
    chains: TestConstants.chains
  })

  beforeEach(() => {
    provider = mockW3mFrameProvider()
    getActiveChain = vi.fn(() => TestConstants.chains[0])
    authProvider = new AuthProvider({
      w3mFrameProvider: mockW3mFrameProvider(),
      getActiveChain,
      chains: TestConstants.chains
    })
  })

  it('should have correct metadata', () => {
    expect(authProvider).toEqual(
      expect.objectContaining({
        id: ConstantsUtil.CONNECTOR_ID.AUTH,
        name: ConstantsUtil.CONNECTOR_NAMES.AUTH,
        type: 'AUTH',
        chain: ConstantsUtil.CHAIN.SOLANA,
        provider
      })
    )
  })

  it('should call connect', async () => {
    await authProvider.connect()

    expect(provider.connect).toHaveBeenCalled()
  })

  it('should call disconnect', async () => {
    await authProvider.disconnect()

    expect(provider.disconnect).toHaveBeenCalled()
  })

  it('should call signMessage with correct params', async () => {
    await authProvider.connect()
    const message = new Uint8Array([1, 2, 3, 4, 5])
    await authProvider.signMessage(message)

    expect(provider.request).toHaveBeenCalledWith({
      method: 'solana_signMessage',
      params: {
        message: '7bWpTW',
        pubkey: TestConstants.accounts[0].address
      }
    })
  })

  it('should call signTransaction with correct params', async () => {
    await authProvider.connect()
    const transaction = mockLegacyTransaction()
    await authProvider.signTransaction(transaction)

    expect(provider.request).toHaveBeenCalledWith({
      method: 'solana_signTransaction',
      params: {
        transaction:
          'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECFj6WhBP/eepC4T4bDgYuJMiSVXNh9IvPWv1ZDUV52gYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMmaU6FiJxS/swxct+H8Iree7FERP/8vrGuAdF90ANelAQECAAAMAgAAAICWmAAAAAAA'
      }
    })
  })

  it('should call signTransaction with correct params for VersionedTransaction', async () => {
    await authProvider.connect()
    const transaction = mockVersionedTransaction()
    await authProvider.signTransaction(transaction)

    expect(provider.request).toHaveBeenCalledWith({
      method: 'solana_signTransaction',
      params: {
        transaction:
          'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQABAhY+loQT/3nqQuE+Gw4GLiTIklVzYfSLz1r9WQ1FedoGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADJmlOhYicUv7MMXLfh/CK3nuxRET//L6xrgHRfdADXpQEBAgAADAIAAACAlpgAAAAAAAA='
      }
    })
  })

  it('should call signAndSendTransaction with correct params', async () => {
    await authProvider.connect()
    const transaction = mockLegacyTransaction()

    await authProvider.signAndSendTransaction(transaction)
    expect(provider.request).toHaveBeenCalledWith({
      method: 'solana_signAndSendTransaction',
      params: {
        transaction:
          'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECFj6WhBP/eepC4T4bDgYuJMiSVXNh9IvPWv1ZDUV52gYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMmaU6FiJxS/swxct+H8Iree7FERP/8vrGuAdF90ANelAQECAAAMAgAAAICWmAAAAAAA',
        options: undefined
      }
    })

    await authProvider.signAndSendTransaction(transaction, {
      preflightCommitment: 'singleGossip'
    })
    expect(provider.request).toHaveBeenCalledWith({
      method: 'solana_signAndSendTransaction',
      params: {
        transaction:
          'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECFj6WhBP/eepC4T4bDgYuJMiSVXNh9IvPWv1ZDUV52gYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMmaU6FiJxS/swxct+H8Iree7FERP/8vrGuAdF90ANelAQECAAAMAgAAAICWmAAAAAAA',
        options: { preflightCommitment: 'singleGossip' }
      }
    })
  })

  it('should call signAllTransactions with correct params', async () => {
    await authProvider.connect()
    const transactions = [mockLegacyTransaction(), mockVersionedTransaction()]
    await authProvider.signAllTransactions(transactions)

    expect(provider.request).toHaveBeenCalledWith({
      method: 'solana_signAllTransactions',
      params: {
        transactions: [
          'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECFj6WhBP/eepC4T4bDgYuJMiSVXNh9IvPWv1ZDUV52gYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMmaU6FiJxS/swxct+H8Iree7FERP/8vrGuAdF90ANelAQECAAAMAgAAAICWmAAAAAAA',
          'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQABAhY+loQT/3nqQuE+Gw4GLiTIklVzYfSLz1r9WQ1FedoGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADJmlOhYicUv7MMXLfh/CK3nuxRET//L6xrgHRfdADXpQEBAgAADAIAAACAlpgAAAAAAAA='
        ]
      }
    })
  })
})
