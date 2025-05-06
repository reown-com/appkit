import { describe, expect, it, vi } from 'vitest'

import { type CaipNetwork, ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import { PresetsUtil } from '@reown/appkit-utils'
import { mainnet } from '@reown/appkit/networks'

import {
  CoinbaseWalletProvider,
  type SolanaCoinbaseWallet
} from '../../providers/CoinbaseWalletProvider'

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
})
