import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockWalletStandard } from './mocks/WalletStandard'
import { WalletStandardProvider } from '../src/providers/WalletStandardProvider'
import { StandardConnect, StandardDisconnect } from '@wallet-standard/features'
import {
  SolanaSignAndSendTransaction,
  SolanaSignMessage,
  SolanaSignTransaction
} from '@solana/wallet-standard-features'
import { TestConstants } from './util/TestConstants'
import { mockLegacyTransaction, mockVersionedTransaction } from './mocks/Transaction'
import { WalletStandardFeatureNotSupportedError } from '../src/providers/shared/Errors'

describe('WalletStandardProvider specific tests', () => {
  let wallet = mockWalletStandard()
  let getActiveChain = vi.fn(() => TestConstants.chains[0])
  let sut = new WalletStandardProvider({
    wallet,
    getActiveChain
  })

  beforeEach(() => {
    wallet = mockWalletStandard()
    sut = new WalletStandardProvider({
      wallet,
      getActiveChain
    })
  })

  it('should call connect', async () => {
    await sut.connect()

    expect(wallet.features[StandardConnect].connect).toHaveBeenCalled()
  })

  it('should call disconnect', async () => {
    await sut.disconnect()

    expect(wallet.features[StandardDisconnect].disconnect).toHaveBeenCalled()
  })

  it('should call signMessage with correct params', async () => {
    const message = new Uint8Array([1, 2, 3, 4, 5])
    await sut.signMessage(message)

    expect(wallet.features[SolanaSignMessage].signMessage).toHaveBeenCalledWith({
      message,
      account: wallet.accounts[0]
    })
  })

  it('should call signTransaction with correct params', async () => {
    const transaction = mockLegacyTransaction()
    await sut.signTransaction(transaction)

    expect(wallet.features[SolanaSignTransaction].signTransaction).toHaveBeenCalledWith({
      transaction: transaction.serialize({ verifySignatures: false }),
      account: wallet.accounts[0],
      chain: 'solana:mainnet'
    })
  })

  it('should call signTransaction with correct params for VersionedTransaction', async () => {
    const transaction = mockVersionedTransaction()
    await sut.signTransaction(transaction)

    expect(wallet.features[SolanaSignTransaction].signTransaction).toHaveBeenCalledWith({
      transaction: transaction.serialize(),
      account: wallet.accounts[0],
      chain: 'solana:mainnet'
    })
  })

  it('should call signAndSendTransaction with correct params', async () => {
    const transaction = mockLegacyTransaction()

    await sut.signAndSendTransaction(transaction)
    expect(
      wallet.features[SolanaSignAndSendTransaction].signAndSendTransaction
    ).toHaveBeenCalledWith({
      transaction: transaction.serialize({ verifySignatures: false }),
      account: wallet.accounts[0],
      chain: 'solana:mainnet',
      options: { preflighCommitment: undefined }
    })

    await sut.signAndSendTransaction(transaction, {
      preflightCommitment: 'singleGossip',
      maxRetries: 1,
      minContextSlot: 1,
      skipPreflight: true
    })
    expect(
      wallet.features[SolanaSignAndSendTransaction].signAndSendTransaction
    ).toHaveBeenCalledWith({
      transaction: transaction.serialize({ verifySignatures: false }),
      account: wallet.accounts[0],
      chain: 'solana:mainnet',
      options: {
        preflightCommitment: 'confirmed',
        maxRetries: 1,
        minContextSlot: 1,
        skipPreflight: true
      }
    })
  })

  it('should throw if features are not available', async () => {
    // @ts-expect-error
    wallet.features = {}

    await expect(sut.connect()).rejects.toThrowError(WalletStandardFeatureNotSupportedError)
    await expect(sut.disconnect()).rejects.toThrowError(WalletStandardFeatureNotSupportedError)
    await expect(sut.signTransaction(mockLegacyTransaction())).rejects.toThrowError(
      WalletStandardFeatureNotSupportedError
    )
    await expect(sut.signMessage(new Uint8Array())).rejects.toThrowError(
      WalletStandardFeatureNotSupportedError
    )
    await expect(sut.signAndSendTransaction(mockLegacyTransaction())).rejects.toThrowError(
      WalletStandardFeatureNotSupportedError
    )
  })
})
