import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  type CaipNetwork,
  type ChainNamespace,
  ConstantsUtil,
  PresetsUtil
} from '@reown/appkit-common'
import { ChainController, SIWXUtil } from '@reown/appkit-controllers'
import { WalletConnectConnector } from '@reown/appkit-controllers'

import { bitcoin, mainnet, solana } from '../../src/networks'
import mockProvider from '../mocks/UniversalProvider'

describe('WalletConnectConnector', () => {
  let connector: WalletConnectConnector
  let caipNetworks: CaipNetwork[]
  let namespace: ChainNamespace
  let provider: typeof mockProvider

  beforeEach(() => {
    vi.clearAllMocks()
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

  describe('signEvmMessage', () => {
    it('routes personal_sign to the supplied CAIP network', async () => {
      vi.mocked(provider.request).mockResolvedValueOnce('0xsignature')

      const result = await connector.signEvmMessage({
        message: 'Sign in',
        address: '0x1234567890123456789012345678901234567890',
        caipNetworkId: 'eip155:1'
      })

      expect(provider.request).toHaveBeenCalledWith(
        {
          method: 'personal_sign',
          params: ['0x5369676e20696e', '0x1234567890123456789012345678901234567890']
        },
        'eip155:1'
      )
      expect(result).toEqual({ signature: '0xsignature' })
    })

    it('preserves the provider error as the cause', async () => {
      const cause = new Error('Wallet request failed')
      vi.mocked(provider.request).mockRejectedValueOnce(cause)

      await expect(
        connector.signEvmMessage({
          message: 'Sign in',
          address: '0x1234567890123456789012345678901234567890',
          caipNetworkId: 'eip155:1'
        })
      ).rejects.toMatchObject({
        message: 'WalletConnectConnector:signEvmMessage - Sign message failed',
        cause
      })
    })
  })

  describe('disconnect', () => {
    it('should disconnect from the provider', async () => {
      await connector.disconnect()
      expect(provider.disconnect).toHaveBeenCalled()
    })
  })
})
