import type UniversalProvider from '@walletconnect/universal-provider'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ChainController, SIWXUtil } from '../../exports/index.js'
import { extendedMainnet, solanaCaipNetwork, updateChainsMap } from '../../exports/testing.js'
import { WalletConnectConnector } from '../../src/controllers/AdapterController/WalletConnectConnector.js'

const mockProvider = {
  client: { core: { crypto: { getClientId: vi.fn().mockResolvedValue('client-id') } } },
  session: undefined
} as unknown as UniversalProvider

describe('WalletConnectConnector', () => {
  beforeEach(() => {
    vi.restoreAllMocks()

    updateChainsMap('eip155', {
      namespace: 'eip155',
      networkState: { requestedCaipNetworks: [extendedMainnet] }
    })
    updateChainsMap('solana', {
      namespace: 'solana',
      networkState: { requestedCaipNetworks: [solanaCaipNetwork] }
    })
  })

  afterEach(() => {
    ChainController.state.chains.delete('eip155')
    ChainController.state.chains.delete('solana')
  })

  describe('authenticate', () => {
    it('should only pass its own namespace chains when several namespaces are registered', async () => {
      const authenticateSpy = vi
        .spyOn(SIWXUtil, 'universalProviderAuthenticate')
        .mockResolvedValue(true)

      const connector = new WalletConnectConnector({
        provider: mockProvider,
        caipNetworks: [extendedMainnet, solanaCaipNetwork],
        namespace: 'eip155'
      })

      await expect(connector.authenticate()).resolves.toBe(true)

      /*
       * `universalProviderAuthenticate` bails unless every chain shares the `eip155` namespace,
       * so leaking the Solana network here would silently disable one-click auth.
       */
      expect(authenticateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ chains: ['eip155:1'] })
      )
    })

    it('should pass its own namespace chains for a non-eip155 connector', async () => {
      const authenticateSpy = vi
        .spyOn(SIWXUtil, 'universalProviderAuthenticate')
        .mockResolvedValue(false)

      const connector = new WalletConnectConnector({
        provider: mockProvider,
        caipNetworks: [extendedMainnet, solanaCaipNetwork],
        namespace: 'solana'
      })

      await expect(connector.authenticate()).resolves.toBe(false)

      expect(authenticateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ chains: [solanaCaipNetwork.caipNetworkId] })
      )
    })
  })
})
