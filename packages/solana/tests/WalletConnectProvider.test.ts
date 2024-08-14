import { beforeEach, describe, expect, it, vi } from 'vitest'
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
        feePayer: '2VqKhjZ766ZN3uBtBpb7Ls3cN4HrocP1rzxzekhVEgoP',
        instructions: [
          {
            data: '3Bxs4NN8M2Yn4TLb',
            keys: [
              {
                isSigner: true,
                isWritable: true,
                pubkey: '2VqKhjZ766ZN3uBtBpb7Ls3cN4HrocP1rzxzekhVEgoP'
              },
              {
                isSigner: false,
                isWritable: true,
                pubkey: '2VqKhjZ766ZN3uBtBpb7Ls3cN4HrocP1rzxzekhVEgoP'
              }
            ],
            programId: '11111111111111111111111111111111'
          }
        ],
        recentBlockhash: 'EZySCpmzXRuUtM95P2JGv9SitqYph6Nv6HaYBK7a8PKJ',
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
        feePayer: '2VqKhjZ766ZN3uBtBpb7Ls3cN4HrocP1rzxzekhVEgoP',
        instructions: [
          {
            data: '3Bxs4NN8M2Yn4TLb',
            keys: [
              {
                isSigner: true,
                isWritable: true,
                pubkey: '2VqKhjZ766ZN3uBtBpb7Ls3cN4HrocP1rzxzekhVEgoP'
              },
              {
                isSigner: true,
                isWritable: true,
                pubkey: '2VqKhjZ766ZN3uBtBpb7Ls3cN4HrocP1rzxzekhVEgoP'
              }
            ],
            programId: '11111111111111111111111111111111'
          }
        ],
        recentBlockhash: 'EZySCpmzXRuUtM95P2JGv9SitqYph6Nv6HaYBK7a8PKJ',
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

  it('should return the same transaction if the response comes with signature (legacy)', async () => {
    await walletConnectProvider.connect()

    const transaction = mockLegacyTransaction()
    expect(transaction.signatures.length).toEqual(0)

    vi.spyOn(provider, 'request').mockImplementationOnce(
      <T>() =>
        Promise.resolve({
          signature:
            '2Lb1KQHWfbV3pWMqXZveFWqneSyhH95YsgCENRWnArSkLydjN1M42oB82zSd6BBdGkM9pE6sQLQf1gyBh8KWM2c4'
        }) as T
    )

    const result = await walletConnectProvider.signTransaction(transaction)

    expect(result).toBe(transaction)
    expect(result.signatures.length).toEqual(1)
  })
})
