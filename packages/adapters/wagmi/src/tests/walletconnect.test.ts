import { getAccount } from '@wagmi/core'
import { mainnet } from 'viem/chains'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { AppKit } from '@reown/appkit'
import type { AppKitNetwork } from '@reown/appkit-common'
import {
  DEFAULT_WC_EIP155_NAMESPACE_CONFIG,
  PROJECT_ID,
  UniversalProviderManager,
  WalletKitManager,
  WalletManager
} from '@reown/appkit-testing'

import { WagmiAdapter } from '../client'
import { walletConnect } from '../connectors/UniversalConnector'

const mockNetworks = [mainnet] as [AppKitNetwork, ...AppKitNetwork[]]
const mockWalletConnectConnector = {
  authenticate: vi.fn().mockResolvedValue(true),
  provider: {
    client: {
      core: {
        crypto: {
          getClientId: vi.fn().mockResolvedValue('mock-client-id')
        }
      }
    }
  }
}

describe('WagmiAdapter - WalletConnect', () => {
  let walletKitManager: WalletKitManager
  let walletManager: WalletManager
  let universalProviderManager: UniversalProviderManager
  let appKit: AppKit
  let adapter: WagmiAdapter

  beforeEach(async () => {
    vi.unmock('@wagmi/core')

    adapter = new WagmiAdapter({
      networks: mockNetworks,
      projectId: PROJECT_ID
    })
    walletKitManager = new WalletKitManager()
    walletManager = new WalletManager()
    universalProviderManager = new UniversalProviderManager()

    await walletKitManager.init()
    await universalProviderManager.init()

    appKit = {
      getUniversalProvider: vi.fn().mockResolvedValue(universalProviderManager.getProvider()),
      getCaipNetwork: vi.fn().mockReturnValue(mockNetworks[0]),
      getCaipNetworks: vi.fn().mockReturnValue(mockNetworks)
    } as unknown as AppKit
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })

  it('should connect with WalletConnect', async () => {
    const onDisplayUri = vi.fn()
    const onConnect = vi.fn()

    const cnctr = adapter.wagmiConfig._internal.connectors.setup(
      walletConnect({ projectId: PROJECT_ID, networks: mockNetworks }, appKit)
    )

    cnctr.onDisplayUri = vi.fn(async (uri: string) => {
      await walletKitManager.pair(uri as string)
      onDisplayUri(uri as string)
    })
    cnctr.onConnect = onConnect

    vi.spyOn(adapter as any, 'getWalletConnectConnector').mockReturnValue(
      mockWalletConnectConnector
    )
    vi.spyOn(adapter as any, 'getWagmiConnector').mockReturnValue(cnctr)

    walletKitManager.listenEvents({
      onSessionProposal: async ({ id, params }) => {
        await walletKitManager.approveSession({
          id,
          params,
          namespaces: {
            eip155: {
              ...DEFAULT_WC_EIP155_NAMESPACE_CONFIG,
              accounts: mockNetworks.map(
                network => `eip155:${network.id}:${walletManager.getAddress()}`
              )
            }
          }
        })
      }
    })

    await adapter.connectWalletConnect(mockNetworks[0].id)

    await vi.waitFor(
      () => {
        const connections = Array.from(adapter.wagmiConfig.state.connections.values())
        const account = getAccount(adapter.wagmiConfig)

        // Validate events
        expect(onDisplayUri).toHaveBeenCalled()
        expect(onConnect).toHaveBeenCalled()

        // Validate account
        expect(account?.address).not.toBeUndefined()
        expect(account?.status).toBe('connected')
        expect(account?.isDisconnected).toBe(false)
        expect(account?.isReconnecting).toBe(false)
        expect(account?.isConnecting).toBe(false)
        expect(account?.chainId).toBe(mockNetworks[0].id)
        expect(account?.connector).toBe(cnctr)

        // Validate connections
        expect(connections.length).toBe(1)
        expect(connections[0]?.connector.id).toBe('walletConnect')
      },
      {
        interval: 200,
        timeout: 10_000
      }
    )
  })
})
