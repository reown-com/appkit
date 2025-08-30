import { isVersionedTransaction } from '@solana/wallet-adapter-base'
import { Transaction, VersionedTransaction } from '@solana/web3.js'
import { beforeAll, describe, expect, it, vi } from 'vitest'

import { ConstantsUtil } from '@reown/appkit-common'
import { ChainController } from '@reown/appkit-controllers'
import type { Provider } from '@reown/appkit-utils/solana'

import { AuthProvider } from '../providers/AuthProvider.js'
import { CoinbaseWalletProvider } from '../providers/CoinbaseWalletProvider.js'
import { SolanaWalletConnectProvider } from '../providers/SolanaWalletConnectProvider.js'
import { WalletStandardProvider } from '../providers/WalletStandardProvider.js'
import { mockCoinbaseWallet } from './mocks/CoinbaseWallet.js'
import { mockLegacyTransaction, mockVersionedTransaction } from './mocks/Transaction.js'
import { mockUniversalProvider } from './mocks/UniversalProvider.js'
import { mockW3mFrameProvider } from './mocks/W3mFrameProvider.js'
import { mockWalletStandard } from './mocks/WalletStandard.js'
import { TestConstants } from './util/TestConstants.js'

const getActiveChain = vi.fn(() => TestConstants.chains[0])

const providers: { name: string; provider: Provider }[] = [
  {
    name: 'WalletConnectProvider',
    provider: new SolanaWalletConnectProvider({
      provider: mockUniversalProvider(),
      chains: TestConstants.chains,
      getActiveChain
    })
  },
  {
    name: 'WalletStandardProvider',
    provider: new WalletStandardProvider({
      wallet: mockWalletStandard(),
      getActiveChain,
      requestedChains: TestConstants.chains
    })
  },
  {
    name: 'AuthProvider',
    provider: new AuthProvider({
      getActiveChain,
      chains: TestConstants.chains,
      w3mFrameProvider: mockW3mFrameProvider()
    })
  },
  {
    name: 'CoinbaseWalletProvider',
    provider: new CoinbaseWalletProvider({
      provider: mockCoinbaseWallet(),
      chains: TestConstants.chains,
      getActiveChain
    })
  }
]

describe.each(providers)('Generic provider tests for $name', ({ provider }) => {
  const events = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    accountsChanged: vi.fn(),
    chainChanged: vi.fn()
  }

  beforeAll(() => {
    ChainController.state.chains.set(ConstantsUtil.CHAIN.SOLANA, {
      namespace: ConstantsUtil.CHAIN.SOLANA,
      accountState: {
        address: TestConstants.accounts[0].address,
        currentTab: 0,
        addressLabels: new Map()
      }
    })
    provider.on('connect', events.connect)
    provider.on('disconnect', events.disconnect)
    provider.on('accountsChanged', events.accountsChanged)
    provider.on('chainChanged', events.chainChanged)
  })

  it('should connect, return address and emit event', async () => {
    const address = await provider.connect()

    expect(address).toEqual(TestConstants.accounts[0].address)
    expect(events.connect).toHaveBeenCalledWith(TestConstants.accounts[0].publicKey)
  })

  it('should signMessage', async () => {
    const result = await provider.signMessage(new TextEncoder().encode('test'))

    expect(result).toBeInstanceOf(Uint8Array)
  })

  it('should signTransaction with Legacy Transaction', async () => {
    const result = await provider.signTransaction(mockLegacyTransaction())

    expect(result).toBeInstanceOf(Transaction)
  })

  it('should signTransaction with Versioned Transaction', async () => {
    const result = await provider.signTransaction(mockVersionedTransaction())

    expect(result).toBeInstanceOf(VersionedTransaction)
  })

  it('should signAndSendTransaction with Legacy Transaction', async () => {
    const result = await provider.signAndSendTransaction(mockLegacyTransaction())

    expect(result).toBeTypeOf('string')
  })

  it('should signAndSendTransaction with Versioned Transaction', async () => {
    const result = await provider.signAndSendTransaction(mockVersionedTransaction())

    expect(result).toBeTypeOf('string')
  })

  it('should signAllTransactions with AnyTransaction', async () => {
    const transactions = [
      mockLegacyTransaction(),
      mockVersionedTransaction(),
      mockLegacyTransaction(),
      mockVersionedTransaction()
    ]
    const result = await provider.signAllTransactions(transactions)

    expect(result).toHaveLength(transactions.length)

    transactions.forEach((transaction, index) => {
      if (isVersionedTransaction(transaction)) {
        expect(result[index]).toBeInstanceOf(VersionedTransaction)
      } else {
        expect(result[index]).toBeInstanceOf(Transaction)
      }
    })
  })

  it('should disconnect and emit event', async () => {
    await provider.disconnect()

    expect(events.disconnect).toHaveBeenCalledWith(undefined)
  })
})
