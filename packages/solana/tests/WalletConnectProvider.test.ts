import { beforeEach, describe, expect, it } from 'vitest'
import { mockUniversalProvider } from './mocks/UniversalProvider'
import { WalletConnectProvider } from '../src/providers/WalletConnectProvider'
import { TestConstants } from './util/TestConstants'
import { mockLegacyTransaction, mockVersionedTransaction } from './mocks/Transaction'

describe('WalletConnectProvider specific tests', () => {
  let provider = mockUniversalProvider()
  let walletConnectProvider = new WalletConnectProvider({
    provider,
    chains: TestConstants.chains
  })

  beforeEach(() => {
    provider = mockUniversalProvider()
    walletConnectProvider = new WalletConnectProvider({
      provider,
      chains: TestConstants.chains
    })
  })

  it('should call connect', async () => {
    await walletConnectProvider.connect()

    expect(provider.connect).toHaveBeenCalled()
  })

  it('should call disconnect', async () => {
    await walletConnectProvider.disconnect()

    expect(provider.disconnect).toHaveBeenCalled()
  })

  it('should call signMessage with correct params', async () => {
    await walletConnectProvider.connect()
    const message = new Uint8Array([1, 2, 3, 4, 5])
    await walletConnectProvider.signMessage(message)

    expect(provider.request).toHaveBeenCalledWith({
      method: 'solana_signMessage',
      params: {
        message: '7bWpTW',
        pubkey: TestConstants.accounts[0].address
      }
    })
  })

  it('should call signTransaction with correct params', async () => {
    await walletConnectProvider.connect()
    const transaction = mockLegacyTransaction()
    await walletConnectProvider.signTransaction(transaction)

    expect(provider.request).toHaveBeenCalledWith({
      method: 'solana_signTransaction',
      params: {
        transaction:
          'AKhoybLLJS1deDJDyjELDNhfkBBX3k4dt4bBfmppjfPVVimhQdFEfDo8AiFcCBCC9VkYWV2r3jkh9n1DAXEhnJPwMmnsrx6huAVrhHAbmRUqfUuWZ9aWMGmdEWaeroCnPR6jkEnjJcn14a59TZhkiTXMygMqu4KaqD1TqzE8vNHSw3YgbW24cfqWfQczGysuy4ugxj4TGSpqRtNmf5D7zRRa76eJTeZEaBcBQGkqxb31vBRXDMdQzGEbq',
        pubkey: TestConstants.accounts[0].address
      }
    })
  })

  it('should call signTransaction with correct params for VersionedTransaction', async () => {
    await walletConnectProvider.connect()
    const transaction = mockVersionedTransaction()
    await walletConnectProvider.signTransaction(transaction)

    expect(provider.request).toHaveBeenCalledWith({
      method: 'solana_signTransaction',
      params: {
        transaction:
          '48ckoQL1HhH5aqU1ifKqpQkwq3WPDgMnsHHQkVfddisxYcapwAVXr8hejTi2jeJpMPkZMsF72SwmJFDByyfRtaknz4ytCYNAcdHrxtrHa9hTjMKckVQrFFqS8zG63Wj5mJ6wPfj8dv1wKu2XkU6GSXSGdQmuvfRv3K6LUSMbK5XSP3yBGb1SDZKCuoFX4qDKcKhCG7Awn3ssAWB1yRaXMd6mS6HQHKSF11FTp3jTH2HKUNbKyyuGh4tYtq8b',
        pubkey: TestConstants.accounts[0].address
      }
    })
  })

  it('should call signAndSendTransaction with correct params', async () => {
    await walletConnectProvider.connect()
    const transaction = mockLegacyTransaction()

    await walletConnectProvider.signAndSendTransaction(transaction)
    expect(provider.request).toHaveBeenCalledWith({
      method: 'solana_signAndSendTransaction',
      params: {
        transaction:
          'AKhoybLLJS1deDJDyjELDNhfkBBX3k4dt4bBfmppjfPVVimhQdFEfDo8AiFcCBCC9VkYWV2r3jkh9n1DAXEhnJPwMmnsrx6huAVrhHAbmRUqfUuWZ9aWMGmdEWaeroCnPR6jkEnjJcn14a59TZhkiTXMygMqu4KaqD1TqzE8vNHSw3YgbW24cfqWfQczGysuy4ugxj4TGSpqRtNmf5D7zRRa76eJTeZEaBcBQGkqxb31vBRXDMdQzGEbq',
        pubkey: TestConstants.accounts[0].address,
        sendOptions: undefined
      }
    })

    await walletConnectProvider.signAndSendTransaction(transaction, {
      preflightCommitment: 'singleGossip'
    })
    expect(provider.request).toHaveBeenCalledWith({
      method: 'solana_signAndSendTransaction',
      params: {
        transaction:
          'AKhoybLLJS1deDJDyjELDNhfkBBX3k4dt4bBfmppjfPVVimhQdFEfDo8AiFcCBCC9VkYWV2r3jkh9n1DAXEhnJPwMmnsrx6huAVrhHAbmRUqfUuWZ9aWMGmdEWaeroCnPR6jkEnjJcn14a59TZhkiTXMygMqu4KaqD1TqzE8vNHSw3YgbW24cfqWfQczGysuy4ugxj4TGSpqRtNmf5D7zRRa76eJTeZEaBcBQGkqxb31vBRXDMdQzGEbq',
        pubkey: TestConstants.accounts[0].address,
        sendOptions: { preflightCommitment: 'singleGossip' }
      }
    })
  })
})
