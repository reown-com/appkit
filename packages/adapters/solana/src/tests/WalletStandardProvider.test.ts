import {
  SolanaSignAndSendTransaction,
  SolanaSignMessage,
  SolanaSignTransaction
} from '@solana/wallet-standard-features'
import { StandardConnect, StandardDisconnect } from '@wallet-standard/features'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { WalletStandardProvider } from '../providers/WalletStandardProvider.js'
import { WalletStandardFeatureNotSupportedError } from '../providers/shared/Errors.js'
import { solanaChains } from '../utils/chains'
import { mockLegacyTransaction, mockVersionedTransaction } from './mocks/Transaction.js'
import { mockWalletStandard } from './mocks/WalletStandard'
import { TestConstants } from './util/TestConstants'

describe('WalletStandardProvider specific tests', () => {
  let wallet = mockWalletStandard()
  let getActiveChain = vi.fn(() => TestConstants.chains[0])
  let requestedChains = vi.mocked(structuredClone(TestConstants.chains))
  let walletStandardProvider: WalletStandardProvider
  let emitSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    wallet = mockWalletStandard()
    walletStandardProvider = new WalletStandardProvider({
      wallet,
      getActiveChain,
      requestedChains
    })
    emitSpy = vi.spyOn(walletStandardProvider, 'emit' as any)
  })

  it('should call connect', async () => {
    await walletStandardProvider.connect()

    expect(wallet.features[StandardConnect].connect).toHaveBeenCalled()
  })

  it('should call disconnect', async () => {
    await walletStandardProvider.disconnect()

    expect(wallet.features[StandardDisconnect].disconnect).toHaveBeenCalled()
  })

  it('should call signMessage with correct params', async () => {
    const message = new Uint8Array([1, 2, 3, 4, 5])
    await walletStandardProvider.signMessage(message)

    expect(wallet.features[SolanaSignMessage].signMessage).toHaveBeenCalledWith({
      message,
      account: wallet.accounts[0]
    })
  })

  it('should call signTransaction with correct params and emit pendingTransaction', async () => {
    const transaction = mockLegacyTransaction()
    await walletStandardProvider.signTransaction(transaction)

    expect(wallet.features[SolanaSignTransaction].signTransaction).toHaveBeenCalledWith({
      transaction: new Uint8Array(transaction.serialize({ verifySignatures: false })),
      account: wallet.accounts[0],
      chain: 'solana:mainnet'
    })
    expect(emitSpy).toHaveBeenCalledWith('pendingTransaction', undefined)
  })

  it('should call signTransaction with correct params for VersionedTransaction', async () => {
    const transaction = mockVersionedTransaction()
    await walletStandardProvider.signTransaction(transaction)

    expect(wallet.features[SolanaSignTransaction].signTransaction).toHaveBeenCalledWith({
      transaction: new Uint8Array(transaction.serialize()),
      account: wallet.accounts[0],
      chain: 'solana:mainnet'
    })
  })

  it('should call signAndSendTransaction with correct params and emit pendingTransaction', async () => {
    const transaction = mockLegacyTransaction()

    await walletStandardProvider.signAndSendTransaction(transaction)
    expect(
      wallet.features[SolanaSignAndSendTransaction].signAndSendTransaction
    ).toHaveBeenCalledWith({
      transaction: new Uint8Array(transaction.serialize({ verifySignatures: false })),
      account: wallet.accounts[0],
      chain: 'solana:mainnet',
      options: { preflightCommitment: undefined }
    })
    expect(emitSpy).toHaveBeenCalledWith('pendingTransaction', undefined)

    await walletStandardProvider.signAndSendTransaction(transaction, {
      preflightCommitment: 'singleGossip',
      maxRetries: 1,
      minContextSlot: 1,
      skipPreflight: true
    })
    expect(
      wallet.features[SolanaSignAndSendTransaction].signAndSendTransaction
    ).toHaveBeenCalledWith({
      transaction: new Uint8Array(transaction.serialize({ verifySignatures: false })),
      account: wallet.accounts[0],
      chain: 'solana:mainnet',
      options: {
        preflightCommitment: 'confirmed',
        maxRetries: 1,
        minContextSlot: 1,
        skipPreflight: true
      }
    })
    expect(emitSpy).toHaveBeenCalledWith('pendingTransaction', undefined)
  })

  it('should throw if features are not available', async () => {
    // @ts-expect-error
    wallet.features = {}

    await expect(walletStandardProvider.connect()).rejects.toThrowError(
      WalletStandardFeatureNotSupportedError
    )
    await expect(walletStandardProvider.disconnect()).rejects.toThrowError(
      WalletStandardFeatureNotSupportedError
    )
    await expect(
      walletStandardProvider.signTransaction(mockLegacyTransaction())
    ).rejects.toThrowError(WalletStandardFeatureNotSupportedError)
    await expect(walletStandardProvider.signMessage(new Uint8Array())).rejects.toThrowError(
      WalletStandardFeatureNotSupportedError
    )
    await expect(
      walletStandardProvider.signAndSendTransaction(mockLegacyTransaction())
    ).rejects.toThrowError(WalletStandardFeatureNotSupportedError)
  })

  it('should call signAllTransactions with correct params and emit pendingTransaction', async () => {
    const transactions = [mockLegacyTransaction(), mockVersionedTransaction()]
    await walletStandardProvider.signAllTransactions(transactions)

    expect(wallet.features[SolanaSignTransaction].signTransaction).toHaveBeenCalledWith(
      ...transactions.map(transaction => ({
        transaction: new Uint8Array(transaction.serialize({ verifySignatures: false })),
        account: wallet.accounts[0],
        chain: 'solana:mainnet'
      }))
    )
    transactions.forEach(() => {
      expect(emitSpy).toHaveBeenCalledWith('pendingTransaction', undefined)
    })
  })

  it('should use the same requestedChains to return chains', () => {
    const testingChainIndex = 2
    const chainId = Object.keys(solanaChains)[testingChainIndex] as `solana:${string}`

    vi.spyOn(wallet, 'chains', 'get').mockReturnValue([chainId])

    expect(walletStandardProvider.chains).toHaveLength(1)
    // should be the exact same object guaranteeing usage of requestedChains object
    expect(walletStandardProvider.chains[0]).toBe(requestedChains[testingChainIndex])
  })
})
