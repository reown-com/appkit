import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { AppKitNetwork, CaipNetwork } from '@reown/appkit-common'
import { ChainController } from '@reown/appkit-controllers'
import {
  DEFAULT_WC_SOLANA_NAMESPACE_CONFIG,
  UniversalProviderManager,
  WalletKitManager,
  WalletManager
} from '@reown/appkit-testing'
import { solana } from '@reown/appkit/networks'

import { SolanaAdapter } from '../client'

const mockNetworks = [solana] as [AppKitNetwork, ...AppKitNetwork[]]

describe('WagmiAdapter - WalletConnect', () => {
  let walletKitManager: WalletKitManager
  let walletManager: WalletManager
  let universalProviderManager: UniversalProviderManager
  let adapter: SolanaAdapter

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.spyOn(ChainController, 'getCaipNetworks').mockReturnValue(mockNetworks as CaipNetwork[])

    adapter = new SolanaAdapter()
    walletKitManager = new WalletKitManager()
    walletManager = new WalletManager({ namespaces: ['solana'] })
    universalProviderManager = new UniversalProviderManager()

    await walletKitManager.init()
    await universalProviderManager.init()
    await adapter.setUniversalProvider(universalProviderManager.getProvider())
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  it('should connect with WalletConnect', async () => {
    const onDisplayUri = vi.fn()
    const onConnect = vi.fn()
    const onAccountsChanged = vi.fn()

    universalProviderManager.listenEvents({
      onDisplayUri: vi.fn(async uri => {
        await walletKitManager.pair(uri as string)
        onDisplayUri(uri as string)
      }),
      onConnect
    })

    vi.spyOn(adapter as any, 'getWalletConnectConnector').mockReturnValue({
      connectWalletConnect: vi.fn(async () => {
        await universalProviderManager.connect({
          solana: DEFAULT_WC_SOLANA_NAMESPACE_CONFIG
        })

        return {
          clientId: 'mock-client-id'
        }
      })
    })

    walletKitManager.listenEvents({
      onSessionProposal: async ({ id, params }) => {
        console.log('onSessionProposal', id, params)
        await walletKitManager.approveSession({
          id,
          params,
          namespaces: {
            solana: {
              ...DEFAULT_WC_SOLANA_NAMESPACE_CONFIG,
              accounts: mockNetworks.map(
                network => `solana:${network.id}:${walletManager.getAddress('solana')}`
              )
            }
          }
        })
      }
    })

    adapter.on('accountChanged', onAccountsChanged)
    await adapter.connectWalletConnect(mockNetworks[0].id)

    await vi.waitFor(
      () => {
        // Validate events
        expect(onDisplayUri).toHaveBeenCalled()
        expect(onConnect).toHaveBeenCalled()
        expect(onAccountsChanged).toHaveBeenCalledWith(
          expect.objectContaining({
            address: walletManager.getAddress('solana'),
            chainId: mockNetworks[0].id.toString()
          })
        )

        // Validate connections
        expect(adapter.connections.length).toBe(1)
        expect(adapter.connections[0]?.connectorId).toBe('walletConnect')
      },
      {
        interval: 200,
        timeout: 10_000
      }
    )
  })
})
