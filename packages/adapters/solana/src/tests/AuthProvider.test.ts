import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ConstantsUtil } from '@reown/appkit-common'
import { type AccountState, ChainController } from '@reown/appkit-controllers'

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
    ChainController.state.chains.set('solana', {
      accountState: {
        address: TestConstants.accounts[0].address,
        currentTab: 0,
        addressLabels: new Map()
      }
    })
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

  it('should respect preferred account type on connect', async () => {
    vi.spyOn(ChainController, 'state', 'get').mockReturnValue({
      ...ChainController.state,
      chains: new Map([
        [
          'solana',
          {
            accountState: {
              address: TestConstants.accounts[0].address,
              preferredAccountType: 'eoa'
            } as AccountState
          }
        ]
      ])
    })

    await authProvider.connect()

    expect(provider.connect).toHaveBeenCalledWith({
      chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
      preferredAccountType: 'eoa'
    })
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
      chainNamespace: 'solana',
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
      chainNamespace: 'solana',
      method: 'solana_signTransaction',
      params: {
        transaction:
          'AKhoybLLJS1deDJDyjELDNhfkBBX3k4dt4bBfmppjfPVVimhQdFEfDo8AiFcCBCC9VkYWV2r3jkh9n1DAXEhnJPwMmnsrx6huAVrhHAbmRUqfUuWZ9aWMGmdEWaeroCnPR6jkEnjJcn14a59TZhkiTXMygMqu4KaqD1TqzE8vNHSw3YgbW24cfqWfQczGysuy4ugxj4TGSpqRtNmf5D7zRRa76eJTeZEaBcBQGkqxb31vBRXDMdQzGEbq'
      }
    })
  })

  it('should call signTransaction with correct params for VersionedTransaction', async () => {
    await authProvider.connect()
    const transaction = mockVersionedTransaction()
    await authProvider.signTransaction(transaction)

    expect(provider.request).toHaveBeenCalledWith({
      chainNamespace: 'solana',
      method: 'solana_signTransaction',
      params: {
        transaction:
          '48ckoQL1HhH5aqU1ifKqpQkwq3WPDgMnsHHQkVfddisxYcapwAVXr8hejTi2jeJpMPkZMsF72SwmJFDByyfRtaknz4ytCYNAcdHrxtrHa9hTjMKckVQrFFqS8zG63Wj5mJ6wPfj8dv1wKu2XkU6GSXSGdQmuvfRv3K6LUSMbK5XSP3yBGb1SDZKCuoFX4qDKcKhCG7Awn3ssAWB1yRaXMd6mS6HQHKSF11FTp3jTH2HKUNbKyyuGh4tYtq8b'
      }
    })
  })

  it('should call signAndSendTransaction with correct params', async () => {
    await authProvider.connect()
    const transaction = mockLegacyTransaction()

    await authProvider.signAndSendTransaction(transaction)
    expect(provider.request).toHaveBeenCalledWith({
      chainNamespace: 'solana',
      method: 'solana_signAndSendTransaction',
      params: {
        transaction:
          'AKhoybLLJS1deDJDyjELDNhfkBBX3k4dt4bBfmppjfPVVimhQdFEfDo8AiFcCBCC9VkYWV2r3jkh9n1DAXEhnJPwMmnsrx6huAVrhHAbmRUqfUuWZ9aWMGmdEWaeroCnPR6jkEnjJcn14a59TZhkiTXMygMqu4KaqD1TqzE8vNHSw3YgbW24cfqWfQczGysuy4ugxj4TGSpqRtNmf5D7zRRa76eJTeZEaBcBQGkqxb31vBRXDMdQzGEbq',
        options: undefined
      }
    })

    await authProvider.signAndSendTransaction(transaction, {
      preflightCommitment: 'singleGossip'
    })
    expect(provider.request).toHaveBeenCalledWith({
      chainNamespace: 'solana',
      method: 'solana_signAndSendTransaction',
      params: {
        transaction:
          'AKhoybLLJS1deDJDyjELDNhfkBBX3k4dt4bBfmppjfPVVimhQdFEfDo8AiFcCBCC9VkYWV2r3jkh9n1DAXEhnJPwMmnsrx6huAVrhHAbmRUqfUuWZ9aWMGmdEWaeroCnPR6jkEnjJcn14a59TZhkiTXMygMqu4KaqD1TqzE8vNHSw3YgbW24cfqWfQczGysuy4ugxj4TGSpqRtNmf5D7zRRa76eJTeZEaBcBQGkqxb31vBRXDMdQzGEbq',
        options: { preflightCommitment: 'singleGossip' }
      }
    })
  })

  it('should call signAllTransactions with correct params', async () => {
    await authProvider.connect()
    const transactions = [mockLegacyTransaction(), mockVersionedTransaction()]
    await authProvider.signAllTransactions(transactions)

    expect(provider.request).toHaveBeenCalledWith({
      chainNamespace: 'solana',
      method: 'solana_signAllTransactions',
      params: {
        transactions: [
          'AKhoybLLJS1deDJDyjELDNhfkBBX3k4dt4bBfmppjfPVVimhQdFEfDo8AiFcCBCC9VkYWV2r3jkh9n1DAXEhnJPwMmnsrx6huAVrhHAbmRUqfUuWZ9aWMGmdEWaeroCnPR6jkEnjJcn14a59TZhkiTXMygMqu4KaqD1TqzE8vNHSw3YgbW24cfqWfQczGysuy4ugxj4TGSpqRtNmf5D7zRRa76eJTeZEaBcBQGkqxb31vBRXDMdQzGEbq',
          '48ckoQL1HhH5aqU1ifKqpQkwq3WPDgMnsHHQkVfddisxYcapwAVXr8hejTi2jeJpMPkZMsF72SwmJFDByyfRtaknz4ytCYNAcdHrxtrHa9hTjMKckVQrFFqS8zG63Wj5mJ6wPfj8dv1wKu2XkU6GSXSGdQmuvfRv3K6LUSMbK5XSP3yBGb1SDZKCuoFX4qDKcKhCG7Awn3ssAWB1yRaXMd6mS6HQHKSF11FTp3jTH2HKUNbKyyuGh4tYtq8b'
        ]
      }
    })
  })
})
