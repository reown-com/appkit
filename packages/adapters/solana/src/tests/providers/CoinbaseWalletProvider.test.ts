import { VersionedTransaction } from '@solana/web3.js'
import { describe, expect, it, vi } from 'vitest'

import {
  type CaipNetwork,
  ConstantsUtil as CommonConstantsUtil,
  PresetsUtil
} from '@reown/appkit-common'
import { mainnet } from '@reown/appkit/networks'

import {
  CoinbaseWalletProvider,
  type SolanaCoinbaseWallet
} from '../../providers/CoinbaseWalletProvider'
import { decodeSolanaKitTransaction } from '../../providers/shared/SolanaKitTransaction.js'
import { mockCoinbaseWallet } from '../mocks/CoinbaseWallet.js'
import { mockSolanaKitTransaction } from '../mocks/Transaction.js'

describe('CoinbaseWalletProvider', () => {
  it('should have correct properties', () => {
    const mockProvider = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      on: vi.fn(),
      removeListener: vi.fn()
    }

    const provider = new CoinbaseWalletProvider({
      provider: mockProvider as unknown as SolanaCoinbaseWallet,
      chains: [],
      getActiveChain: () => mainnet as unknown as CaipNetwork
    })

    expect(provider.name).toBe('Coinbase Wallet')
    expect(provider.type).toBe('ANNOUNCED')
    expect(provider.chain).toBe('solana')
    expect(provider.imageUrl).toBeDefined()

    const expectedImageId = PresetsUtil.ConnectorImageIds[CommonConstantsUtil.CONNECTOR_ID.COINBASE]
    expect(provider.imageId).toBe(expectedImageId)

    const expectedId =
      PresetsUtil.ConnectorExplorerIds[CommonConstantsUtil.CONNECTOR_ID.COINBASE_SDK]

    expect(provider.id).toBe(expectedId)
  })

  it('should bridge a solana-kit transaction through a legacy VersionedTransaction when signing', async () => {
    const wallet = mockCoinbaseWallet()
    const provider = new CoinbaseWalletProvider({
      provider: wallet,
      chains: [],
      getActiveChain: () => mainnet as unknown as CaipNetwork
    })

    const transaction = mockSolanaKitTransaction()
    const result = await provider.signTransaction(transaction)

    expect(wallet.signTransaction).toHaveBeenCalledWith(expect.any(VersionedTransaction))

    const signedLegacyTransaction = vi.mocked(wallet.signTransaction).mock
      .results[0]!.value as VersionedTransaction
    expect(result).toEqual(
      decodeSolanaKitTransaction(new Uint8Array(signedLegacyTransaction.serialize()))
    )
  })
})
