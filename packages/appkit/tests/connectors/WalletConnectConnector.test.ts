import { beforeEach, describe, expect, it, vi } from 'vitest'

import { type CaipNetwork, type ChainNamespace, ConstantsUtil } from '@reown/appkit-common'
import { ChainController, SIWXUtil } from '@reown/appkit-controllers'
import { PresetsUtil } from '@reown/appkit-utils'

import { WalletConnectConnector } from '../../src/connectors'
import { bitcoin, mainnet, solana } from '../../src/networks'
import mockProvider from '../mocks/UniversalProvider'

describe('WalletConnectConnector', () => {
  let connector: WalletConnectConnector
  let caipNetworks: CaipNetwork[]
  let namespace: ChainNamespace
  let provider: typeof mockProvider

  beforeEach(() => {
    caipNetworks = [
      { ...mainnet, caipNetworkId: 'eip155:1', chainNamespace: 'eip155' },
      solana,
      bitcoin
    ]
    namespace = 'eip155'
    provider = mockProvider
    connector = new WalletConnectConnector({
      provider,
      caipNetworks,
      namespace
    })
    vi.spyOn(ChainController, 'getCaipNetworks').mockReturnValue(caipNetworks)
  })

  it('should have correct metadata', () => {
    expect(connector.id).toBe(ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT)
    expect(connector.name).toBe(
      PresetsUtil.ConnectorNamesMap[ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT]
    )
    expect(connector.type).toBe('WALLET_CONNECT')
    expect(connector.imageId).toBe(
      PresetsUtil.ConnectorImageIds[ConstantsUtil.CONNECTOR_ID.WALLET_CONNECT]
    )
    expect(connector.chain).toBe(namespace)
  })

  it('should expose chains', () => {
    expect(connector.chains).toStrictEqual(caipNetworks)
  })

  describe('connectWalletConnect', () => {
    it('should attempt to authenticate first', async () => {
      const authenticateSpy = vi
        .spyOn(SIWXUtil, 'universalProviderAuthenticate')
        .mockResolvedValueOnce(false)

      await connector.connectWalletConnect()

      expect(authenticateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          universalProvider: provider,
          chains: caipNetworks.map(({ caipNetworkId }) => caipNetworkId)
        })
      )
      expect(provider.connect).toHaveBeenCalled()
    })

    it('should not connect if already authenticated', async () => {
      vi.spyOn(provider, 'connect').mockReset()
      vi.spyOn(SIWXUtil, 'universalProviderAuthenticate').mockImplementationOnce(() =>
        Promise.resolve(true)
      )

      await connector.connectWalletConnect()

      expect(provider.connect).not.toHaveBeenCalled()
    })
  })

  describe('disconnect', () => {
    it('should disconnect from the provider', async () => {
      await connector.disconnect()
      expect(provider.disconnect).toHaveBeenCalled()
    })
  })
})
