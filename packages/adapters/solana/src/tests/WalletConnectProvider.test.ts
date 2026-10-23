import base58 from 'bs58'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { CaipNetwork } from '@reown/appkit-common'
import { ChainController } from '@reown/appkit-controllers'
import type { AnySolanaKitTransaction } from '@reown/appkit-utils/solana'

import { SolanaWalletConnectProvider } from '../providers/SolanaWalletConnectProvider.js'
import { WalletConnectMethodNotSupportedError } from '../providers/shared/Errors.js'
import {
  decodeSolanaKitTransaction,
  encodeSolanaKitTransaction
} from '../providers/shared/SolanaKitTransaction.js'
import { mockConnection } from './mocks/Connection.js'
import {
  mockLegacyTransaction,
  mockSolanaKitTransaction,
  mockVersionedTransaction
} from './mocks/Transaction.js'
import { mockUniversalProvider, mockUniversalProviderSession } from './mocks/UniversalProvider.js'
import { TestConstants } from './util/TestConstants.js'

function createDeferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

describe('WalletConnectProvider specific tests', () => {
  let provider = mockUniversalProvider()
  let getActiveChain = vi.fn(() => TestConstants.chains[0])
  let walletConnectProvider = new SolanaWalletConnectProvider({
    provider,
    chains: TestConstants.chains,
    getActiveChain
  })

  beforeEach(() => {
    provider = mockUniversalProvider()
    getActiveChain = vi.fn(() => TestConstants.chains[0])
    walletConnectProvider = new SolanaWalletConnectProvider({
      provider,
      chains: TestConstants.chains,
      getActiveChain
    })
    vi.spyOn(ChainController, 'getCaipNetworks').mockReturnValue(TestConstants.chains)
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

    expect(provider.request).toHaveBeenCalledWith(
      {
        method: 'solana_signMessage',
        params: {
          message: '7bWpTW',
          pubkey: TestConstants.accounts[0].address
        }
      },
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
    )
  })

  it('should call signTransaction with correct params', async () => {
    await walletConnectProvider.connect()
    const transaction = mockLegacyTransaction()
    await walletConnectProvider.signTransaction(transaction)

    expect(provider.request).toHaveBeenCalledWith(
      {
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
            'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECFj6WhBP/eepC4T4bDgYuJMiSVXNh9IvPWv1ZDUV52gYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMmaU6FiJxS/swxct+H8Iree7FERP/8vrGuAdF90ANelAQECAAAMAgAAAICWmAAAAAAA',
          pubkey: TestConstants.accounts[0].address
        }
      },
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
    )
  })

  it('should call signTransaction with correct params for VersionedTransaction', async () => {
    await walletConnectProvider.connect()
    const transaction = mockVersionedTransaction()
    await walletConnectProvider.signTransaction(transaction)

    expect(provider.request).toHaveBeenCalledWith(
      {
        method: 'solana_signTransaction',
        params: {
          transaction:
            'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQABAhY+loQT/3nqQuE+Gw4GLiTIklVzYfSLz1r9WQ1FedoGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADJmlOhYicUv7MMXLfh/CK3nuxRET//L6xrgHRfdADXpQEBAgAADAIAAACAlpgAAAAAAAA=',
          pubkey: TestConstants.accounts[0].address
        }
      },
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
    )
  })

  it('should call signTransaction with correct params for a solana-kit transaction, without legacy raw RPC params', async () => {
    await walletConnectProvider.connect()
    const transaction = mockSolanaKitTransaction()
    const result = await walletConnectProvider.signTransaction(transaction)

    expect(provider.request).toHaveBeenCalledWith(
      {
        method: 'solana_signTransaction',
        params: {
          transaction: Buffer.from(encodeSolanaKitTransaction(transaction)).toString('base64'),
          pubkey: TestConstants.accounts[0].address
        }
      },
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
    )

    const { transaction: signedTransactionBase64 } = await vi.mocked(provider.request).mock
      .results[0]!.value
    expect(result).toEqual(
      decodeSolanaKitTransaction(new Uint8Array(Buffer.from(signedTransactionBase64, 'base64')))
    )
  })

  it('should attach the signature to a solana-kit transaction when the wallet returns only a signature', async () => {
    await walletConnectProvider.connect()
    const transaction = mockSolanaKitTransaction()
    const signatureBytes = new Uint8Array(64).fill(1)
    vi.spyOn(provider, 'request').mockImplementationOnce(
      <T>() => Promise.resolve({ signature: base58.encode(signatureBytes) }) as T
    )

    const result = await walletConnectProvider.signTransaction(transaction)

    expect(result).toEqual({
      ...transaction,
      signatures: { [TestConstants.accounts[0].address]: signatureBytes }
    })
    expect(Object.isFrozen(result)).toBe(true)
    expect(Object.isFrozen(result.signatures)).toBe(true)
    expect(transaction.signatures).toEqual({ [TestConstants.accounts[0].address]: null })
  })

  it('should use the returned transaction for a solana-kit transaction when the wallet returns both a signature and a transaction', async () => {
    await walletConnectProvider.connect()
    const transaction = mockSolanaKitTransaction()
    const signedTransaction = {
      ...transaction,
      signatures: { [TestConstants.accounts[0].address]: new Uint8Array(64).fill(2) }
    } as AnySolanaKitTransaction
    const signedTransactionBase64 = Buffer.from(
      encodeSolanaKitTransaction(signedTransaction)
    ).toString('base64')
    vi.spyOn(provider, 'request').mockImplementationOnce(
      <T>() =>
        Promise.resolve({
          signature: base58.encode(new Uint8Array(64).fill(1)),
          transaction: signedTransactionBase64
        }) as T
    )

    const result = await walletConnectProvider.signTransaction(transaction)

    expect(result).toEqual(
      decodeSolanaKitTransaction(new Uint8Array(Buffer.from(signedTransactionBase64, 'base64')))
    )
  })

  it('should attach the signature to a solana-kit transaction when the wallet returns an empty transaction field', async () => {
    await walletConnectProvider.connect()
    const transaction = mockSolanaKitTransaction()
    const signatureBytes = new Uint8Array(64).fill(1)
    vi.spyOn(provider, 'request').mockImplementationOnce(
      <T>() => Promise.resolve({ signature: base58.encode(signatureBytes), transaction: null }) as T
    )

    const result = await walletConnectProvider.signTransaction(transaction)

    expect(result).toEqual({
      ...transaction,
      signatures: { [TestConstants.accounts[0].address]: signatureBytes }
    })
  })

  it('should throw a clear error when the wallet returns neither a signature nor a transaction for a solana-kit transaction', async () => {
    await walletConnectProvider.connect()
    vi.spyOn(provider, 'request').mockImplementationOnce(<T>() => Promise.resolve({}) as T)

    await expect(walletConnectProvider.signTransaction(mockSolanaKitTransaction())).rejects.toThrow(
      'Invalid solana_signTransaction response'
    )
  })

  it('should keep other signers and signature order when attaching a signature to a solana-kit transaction', async () => {
    await walletConnectProvider.connect()
    const otherSignature = new Uint8Array(64).fill(3)
    const signatureBytes = new Uint8Array(64).fill(1)
    const transaction = {
      ...mockSolanaKitTransaction(),
      signatures: {
        [TestConstants.accounts[1].address]: otherSignature,
        [TestConstants.accounts[0].address]: null
      } as AnySolanaKitTransaction['signatures']
    }
    vi.spyOn(provider, 'request').mockImplementationOnce(
      <T>() => Promise.resolve({ signature: base58.encode(signatureBytes) }) as T
    )

    const result = await walletConnectProvider.signTransaction(transaction)

    expect(Object.keys(result.signatures)).toEqual([
      TestConstants.accounts[1].address,
      TestConstants.accounts[0].address
    ])
    expect(Object.values(result.signatures)).toEqual([otherSignature, signatureBytes])
  })

  it('should throw when the connected account is not a signer of the solana-kit transaction', async () => {
    await walletConnectProvider.connect()
    const transaction = {
      ...mockSolanaKitTransaction(),
      signatures: {
        [TestConstants.accounts[1].address]: null
      } as AnySolanaKitTransaction['signatures']
    }
    vi.spyOn(provider, 'request').mockImplementationOnce(
      <T>() => Promise.resolve({ signature: base58.encode(new Uint8Array(64).fill(1)) }) as T
    )

    await expect(walletConnectProvider.signTransaction(transaction)).rejects.toThrow(
      'is not a required signer'
    )
  })

  it('should reject a signature that is not 64 bytes for a solana-kit transaction', async () => {
    await walletConnectProvider.connect()
    vi.spyOn(provider, 'request').mockImplementationOnce(
      <T>() => Promise.resolve({ signature: base58.encode(new Uint8Array(32).fill(1)) }) as T
    )

    await expect(walletConnectProvider.signTransaction(mockSolanaKitTransaction())).rejects.toThrow(
      'Invalid signature length'
    )
  })

  it('should broadcast the signed solana-kit transaction from sendTransaction when the wallet returns only a signature', async () => {
    await walletConnectProvider.connect()
    const transaction = mockSolanaKitTransaction()
    const signatureBytes = new Uint8Array(64).fill(1)
    const connection = mockConnection()
    const sendRawTransaction = vi
      .spyOn(connection, 'sendRawTransaction')
      .mockResolvedValue('broadcast-signature')
    vi.spyOn(provider, 'request').mockImplementationOnce(
      <T>() => Promise.resolve({ signature: base58.encode(signatureBytes) }) as T
    )

    const result = await walletConnectProvider.sendTransaction(transaction, connection)

    expect(result).toBe('broadcast-signature')
    expect(sendRawTransaction).toHaveBeenCalledWith(
      encodeSolanaKitTransaction({
        ...transaction,
        signatures: { [TestConstants.accounts[0].address]: signatureBytes }
      } as AnySolanaKitTransaction),
      undefined
    )
  })

  it('should sign a solana-kit transaction in the signAllTransactions fallback when the wallet returns only a signature', async () => {
    await walletConnectProvider.connect()
    const transaction = mockSolanaKitTransaction()
    const signatureBytes = new Uint8Array(64).fill(1)
    vi.spyOn(provider, 'request').mockImplementationOnce(
      <T>() => Promise.resolve({ signature: base58.encode(signatureBytes) }) as T
    )

    const [result] = await walletConnectProvider.signAllTransactions([transaction])

    expect(provider.request).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'solana_signTransaction' }),
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
    )
    expect(result).toEqual({
      ...transaction,
      signatures: { [TestConstants.accounts[0].address]: signatureBytes }
    })
  })

  it('should call signAndSendTransaction with correct params', async () => {
    await walletConnectProvider.connect()
    const transaction = mockLegacyTransaction()

    await walletConnectProvider.signAndSendTransaction(transaction)
    expect(provider.request).toHaveBeenCalledWith(
      {
        method: 'solana_signAndSendTransaction',
        params: {
          transaction:
            'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECFj6WhBP/eepC4T4bDgYuJMiSVXNh9IvPWv1ZDUV52gYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMmaU6FiJxS/swxct+H8Iree7FERP/8vrGuAdF90ANelAQECAAAMAgAAAICWmAAAAAAA',
          pubkey: TestConstants.accounts[0].address,
          sendOptions: undefined
        }
      },
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
    )

    await walletConnectProvider.signAndSendTransaction(transaction, {
      preflightCommitment: 'singleGossip'
    })
    expect(provider.request).toHaveBeenCalledWith(
      {
        method: 'solana_signAndSendTransaction',
        params: {
          transaction:
            'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECFj6WhBP/eepC4T4bDgYuJMiSVXNh9IvPWv1ZDUV52gYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMmaU6FiJxS/swxct+H8Iree7FERP/8vrGuAdF90ANelAQECAAAMAgAAAICWmAAAAAAA',
          pubkey: TestConstants.accounts[0].address,
          sendOptions: { preflightCommitment: 'singleGossip' }
        }
      },
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
    )
  })

  it('should call signAndSendTransaction with correct params for a solana-kit transaction', async () => {
    await walletConnectProvider.connect()
    const transaction = mockSolanaKitTransaction()

    await walletConnectProvider.signAndSendTransaction(transaction)

    expect(provider.request).toHaveBeenCalledWith(
      {
        method: 'solana_signAndSendTransaction',
        params: {
          transaction: Buffer.from(encodeSolanaKitTransaction(transaction)).toString('base64'),
          pubkey: TestConstants.accounts[0].address,
          sendOptions: undefined
        }
      },
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
    )
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

  it('should use the correct chain id for requests', async () => {
    await walletConnectProvider.connect()
    getActiveChain.mockImplementation(
      () => ({ id: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1' }) as CaipNetwork
    )

    await walletConnectProvider.signMessage(new Uint8Array([1, 2, 3, 4, 5]))

    expect(provider.request).toHaveBeenCalledWith(
      {
        method: 'solana_signMessage',
        params: {
          message: '7bWpTW',
          pubkey: TestConstants.accounts[0].address
        }
      },
      'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1'
    )
  })

  it('should replace old deprecated replacement for requests', async () => {
    vi.spyOn(provider, 'connect').mockImplementation(() => {
      const session = mockUniversalProviderSession({}, [
        { id: '4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ' } as CaipNetwork,
        { id: '8E9rvCKLFQia2Y35HXjjpWzj8weVo44K' } as CaipNetwork
      ])
      Object.assign(provider, { session })

      return Promise.resolve(session)
    })

    await walletConnectProvider.connect()
    await walletConnectProvider.signMessage(new Uint8Array([1, 2, 3, 4, 5]))

    expect(provider.request).toHaveBeenCalledWith(
      {
        method: 'solana_signMessage',
        params: {
          message: '7bWpTW',
          pubkey: TestConstants.accounts[0].address
        }
      },
      'solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ'
    )
  })

  it('should replace old deprecated devnet for requests', async () => {
    vi.spyOn(provider, 'connect').mockImplementation(() => {
      const session = mockUniversalProviderSession({}, [
        { id: '4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ' } as CaipNetwork,
        { id: '8E9rvCKLFQia2Y35HXjjpWzj8weVo44K' } as CaipNetwork
      ])
      Object.assign(provider, { session })

      return Promise.resolve(session)
    })

    getActiveChain.mockImplementation(
      () => ({ id: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1' }) as CaipNetwork
    )

    await walletConnectProvider.connect()

    await walletConnectProvider.signMessage(new Uint8Array([1, 2, 3, 4, 5]))

    expect(provider.request).toHaveBeenCalledWith(
      {
        method: 'solana_signMessage',
        params: {
          message: '7bWpTW',
          pubkey: TestConstants.accounts[0].address
        }
      },
      'solana:8E9rvCKLFQia2Y35HXjjpWzj8weVo44K'
    )
  })

  it('should call signTransaction correctly for signAllTransactions', async () => {
    await walletConnectProvider.connect()
    const transactions = [mockLegacyTransaction(), mockVersionedTransaction()]
    await walletConnectProvider.signAllTransactions(transactions)

    expect(provider.request).toHaveBeenNthCalledWith(
      1,
      {
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
            'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECFj6WhBP/eepC4T4bDgYuJMiSVXNh9IvPWv1ZDUV52gYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMmaU6FiJxS/swxct+H8Iree7FERP/8vrGuAdF90ANelAQECAAAMAgAAAICWmAAAAAAA',
          pubkey: TestConstants.accounts[0].address
        }
      },
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
    )
    expect(provider.request).toHaveBeenNthCalledWith(
      2,
      {
        method: 'solana_signTransaction',
        params: {
          transaction:
            'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQABAhY+loQT/3nqQuE+Gw4GLiTIklVzYfSLz1r9WQ1FedoGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADJmlOhYicUv7MMXLfh/CK3nuxRET//L6xrgHRfdADXpQEBAgAADAIAAACAlpgAAAAAAAA=',
          pubkey: TestConstants.accounts[0].address
        }
      },
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
    )
  })

  it('should call signAllTransactions correctly for a mix of legacy and solana-kit transactions', async () => {
    await walletConnectProvider.connect()
    const kitTransaction = mockSolanaKitTransaction()
    const transactions = [mockLegacyTransaction(), kitTransaction]
    const results = await walletConnectProvider.signAllTransactions(transactions)

    expect(provider.request).toHaveBeenNthCalledWith(
      2,
      {
        method: 'solana_signTransaction',
        params: {
          transaction: Buffer.from(encodeSolanaKitTransaction(kitTransaction)).toString('base64'),
          pubkey: TestConstants.accounts[0].address
        }
      },
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
    )

    const { transaction: signedTransactionBase64 } = await vi.mocked(provider.request).mock
      .results[1]!.value
    expect(results[1]).toEqual(
      decodeSolanaKitTransaction(new Uint8Array(Buffer.from(signedTransactionBase64, 'base64')))
    )
  })

  it('should issue every signTransaction request before the first one is answered in the signAllTransactions fallback', async () => {
    await walletConnectProvider.connect()
    const deferreds = [1, 2, 3].map(() => createDeferred<{ signature: string }>())
    const requestSpy = vi.spyOn(provider, 'request')
    for (const deferred of deferreds) {
      requestSpy.mockImplementationOnce(<T>() => deferred.promise as T)
    }

    const resultPromise = walletConnectProvider.signAllTransactions([
      mockLegacyTransaction(),
      mockLegacyTransaction(),
      mockLegacyTransaction()
    ])

    expect(provider.request).toHaveBeenCalledTimes(3)

    deferreds.forEach((deferred, index) =>
      deferred.resolve({ signature: base58.encode(new Uint8Array(64).fill(index + 1)) })
    )

    await expect(resultPromise).resolves.toHaveLength(3)
  })

  it('should return signed transactions in input order when the wallet answers out of order', async () => {
    await walletConnectProvider.connect()
    const deferreds = [1, 2, 3].map(() => createDeferred<{ signature: string }>())
    const requestSpy = vi.spyOn(provider, 'request')
    for (const deferred of deferreds) {
      requestSpy.mockImplementationOnce(<T>() => deferred.promise as T)
    }
    const answer = (index: number) =>
      deferreds[index]!.resolve({ signature: base58.encode(new Uint8Array(64).fill(index + 1)) })

    const resultPromise = walletConnectProvider.signAllTransactions([
      mockLegacyTransaction(),
      mockLegacyTransaction(),
      mockLegacyTransaction()
    ])
    answer(2)
    answer(0)
    answer(1)
    const results = await resultPromise

    expect(
      results.map(transaction =>
        base58.encode(new Uint8Array(transaction.signatures[0]!.signature!))
      )
    ).toEqual([1, 2, 3].map(fill => base58.encode(new Uint8Array(64).fill(fill))))
  })

  it('should reject with the first error and not leak unhandled rejections from the other requests', async () => {
    await walletConnectProvider.connect()
    const deferreds = [1, 2, 3].map(() => createDeferred<{ signature: string }>())
    const requestSpy = vi.spyOn(provider, 'request')
    for (const deferred of deferreds) {
      requestSpy.mockImplementationOnce(<T>() => deferred.promise as T)
    }

    const resultPromise = walletConnectProvider.signAllTransactions([
      mockLegacyTransaction(),
      mockLegacyTransaction(),
      mockLegacyTransaction()
    ])
    deferreds[0]!.resolve({ signature: base58.encode(new Uint8Array(64).fill(1)) })
    deferreds[1]!.reject(new Error('User rejected the request'))
    deferreds[2]!.reject(new Error('Second rejection'))

    await expect(resultPromise).rejects.toThrow('User rejected the request')
    await new Promise(resolve => setTimeout(resolve, 0))
  })

  it('should return an empty array in the signAllTransactions fallback when there are no transactions', async () => {
    await walletConnectProvider.connect()

    await expect(walletConnectProvider.signAllTransactions([])).resolves.toEqual([])
    expect(provider.request).not.toHaveBeenCalled()
  })

  it('should get chains from namespace accounts', async () => {
    vi.spyOn(provider, 'connect').mockImplementationOnce(() => {
      const session = mockUniversalProviderSession({
        namespaces: {
          solana: {
            chains: undefined,
            methods: [
              'solana_signTransaction',
              'solana_signMessage',
              'solana_signAndSendTransaction'
            ],
            events: [],
            accounts: [`solana:${TestConstants.chains[0]?.id}:${TestConstants.accounts[0].address}`]
          }
        }
      })
      Object.assign(provider, { session })

      return Promise.resolve(session)
    })

    await walletConnectProvider.connect()

    expect(walletConnectProvider.chains).toEqual([TestConstants.chains[0]])
  })

  it('should throw an error if the wallet does not support the signMessage method', async () => {
    vi.spyOn(provider, 'connect').mockImplementationOnce(() => {
      const session = mockUniversalProviderSession({
        namespaces: {
          solana: {
            chains: undefined,
            methods: [],
            events: [],
            accounts: [`solana:${TestConstants.chains[0]?.id}:${TestConstants.accounts[0].address}`]
          }
        }
      })
      Object.assign(provider, { session })

      return Promise.resolve(session)
    })

    await walletConnectProvider.connect()

    await expect(() =>
      walletConnectProvider.signMessage(new Uint8Array([1, 2, 3, 4, 5]))
    ).rejects.toThrow(WalletConnectMethodNotSupportedError)
  })

  it('should throw an error if the wallet does not support the signTransaction method', async () => {
    vi.spyOn(provider, 'connect').mockImplementationOnce(() => {
      const session = mockUniversalProviderSession({
        namespaces: {
          solana: {
            chains: undefined,
            methods: ['solana_signMessage'],
            events: [],
            accounts: [`solana:${TestConstants.chains[0]?.id}:${TestConstants.accounts[0].address}`]
          }
        }
      })
      Object.assign(provider, { session })

      return Promise.resolve(session)
    })

    await walletConnectProvider.connect()

    await expect(() =>
      walletConnectProvider.signTransaction(mockLegacyTransaction())
    ).rejects.toThrow(WalletConnectMethodNotSupportedError)
  })

  it('should throw an error if the wallet does not support the signAndSendTransaction method', async () => {
    vi.spyOn(provider, 'connect').mockImplementationOnce(() => {
      const session = mockUniversalProviderSession({
        namespaces: {
          solana: {
            chains: undefined,
            methods: ['solana_signMessage'],
            events: [],
            accounts: [`solana:${TestConstants.chains[0]?.id}:${TestConstants.accounts[0].address}`]
          }
        }
      })
      Object.assign(provider, { session })

      return Promise.resolve(session)
    })

    await walletConnectProvider.connect()

    await expect(() =>
      walletConnectProvider.signAndSendTransaction(mockLegacyTransaction())
    ).rejects.toThrow(WalletConnectMethodNotSupportedError)
  })

  it('should throw an error if the wallet does not support the signAllTransactions method', async () => {
    vi.spyOn(provider, 'connect').mockImplementationOnce(() => {
      const session = mockUniversalProviderSession({
        namespaces: {
          solana: {
            chains: undefined,
            methods: ['solana_signMessage'],
            events: [],
            accounts: [`solana:${TestConstants.chains[0]?.id}:${TestConstants.accounts[0].address}`]
          }
        }
      })
      Object.assign(provider, { session })

      return Promise.resolve(session)
    })

    await walletConnectProvider.connect()

    await expect(() =>
      walletConnectProvider.signAllTransactions([mockLegacyTransaction()])
    ).rejects.toThrow(WalletConnectMethodNotSupportedError)
  })

  it('should request signAllTransactions with batched transactions', async () => {
    vi.spyOn(provider, 'connect').mockImplementationOnce(() => {
      const session = mockUniversalProviderSession({
        namespaces: {
          solana: {
            chains: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
            methods: ['solana_signAllTransactions'],
            events: [],
            accounts: [`solana:${TestConstants.chains[0]?.id}:${TestConstants.accounts[0].address}`]
          }
        }
      })
      Object.assign(provider, { session })

      return Promise.resolve(session)
    })

    await walletConnectProvider.connect()

    const transactions = [mockLegacyTransaction(), mockVersionedTransaction()]

    await walletConnectProvider.signAllTransactions(transactions)

    expect(provider.request).toHaveBeenCalledWith(
      {
        method: 'solana_signAllTransactions',
        params: {
          transactions: [
            'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAECFj6WhBP/eepC4T4bDgYuJMiSVXNh9IvPWv1ZDUV52gYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMmaU6FiJxS/swxct+H8Iree7FERP/8vrGuAdF90ANelAQECAAAMAgAAAICWmAAAAAAA',
            'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAQABAhY+loQT/3nqQuE+Gw4GLiTIklVzYfSLz1r9WQ1FedoGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADJmlOhYicUv7MMXLfh/CK3nuxRET//L6xrgHRfdADXpQEBAgAADAIAAACAlpgAAAAAAAA='
          ]
        }
      },
      'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'
    )
  })
})
