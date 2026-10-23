import { beforeEach, describe, expect, it, vi } from 'vitest'

import { type AccountState, ChainController } from '@reown/appkit-controllers'
import { bitcoin } from '@reown/appkit/networks'

import { BitcoinWalletConnectConnector } from '../../src/connectors/BitcoinWalletConnectConnector'
import { mockUniversalProvider } from '../mocks/mockUniversalProvider'

const bitcoinjsLoads = vi.hoisted(() => ({ count: 0 }))

vi.mock('bitcoinjs-lib', async importOriginal => {
  bitcoinjsLoads.count += 1

  return await importOriginal()
})

describe('BitcoinWalletConnectConnector bitcoinjs-lib loading', () => {
  let provider: BitcoinWalletConnectConnector

  beforeEach(() => {
    const universalProvider = mockUniversalProvider()
    universalProvider.session = mockUniversalProvider.mockSession()
    vi.spyOn(universalProvider, 'request').mockResolvedValue({ psbt: 'signed_psbt' })
    vi.spyOn(ChainController, 'getAccountData').mockReturnValue({
      caipAddress: `${bitcoin.caipNetworkId}:address`,
      address: 'address'
    } as unknown as AccountState)

    provider = new BitcoinWalletConnectConnector({
      provider: universalProvider,
      chains: [bitcoin],
      getActiveChain: () => bitcoin
    })
  })

  it('does not load bitcoinjs-lib on import or when signInputs is not empty', async () => {
    expect(bitcoinjsLoads.count).toBe(0)

    await provider.signPSBT({
      psbt: 'mock_psbt',
      signInputs: [{ address: 'address', index: 0, sighashTypes: [1] }],
      broadcast: false
    })

    expect(bitcoinjsLoads.count).toBe(0)
  })

  it('loads bitcoinjs-lib when an empty signInputs needs to be derived', async () => {
    await provider.signPSBT({ psbt: 'mock_psbt', signInputs: [], broadcast: false })

    expect(bitcoinjsLoads.count).toBeGreaterThan(0)
  })
})
