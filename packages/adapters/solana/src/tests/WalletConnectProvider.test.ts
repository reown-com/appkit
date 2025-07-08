import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { CaipNetwork } from '@reown/appkit-common'
import { ChainController } from '@reown/appkit-controllers'

import { SolanaWalletConnectProvider } from '../providers/SolanaWalletConnectProvider.js'
import { WalletConnectMethodNotSupportedError } from '../providers/shared/Errors.js'
import { mockLegacyTransaction, mockVersionedTransaction } from './mocks/Transaction.js'
import { mockUniversalProvider, mockUniversalProviderSession } from './mocks/UniversalProvider.js'
import { TestConstants } from './util/TestConstants.js'

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
