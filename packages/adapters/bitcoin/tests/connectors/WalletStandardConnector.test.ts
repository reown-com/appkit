import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CaipNetwork } from '@reown/appkit-common'
import { bitcoin, bitcoinTestnet } from '@reown/appkit/networks'
import { WalletStandardConnector } from '../../src/connectors/WalletStandardConnector'
import { mockWalletStandardProvider } from '../mocks/mockWalletStandard'

describe('SatsConnectConnector', () => {
  let connector: WalletStandardConnector
  let wallet: ReturnType<typeof mockWalletStandardProvider>
  let requestedChains: CaipNetwork[]

  beforeEach(() => {
    requestedChains = [bitcoin, bitcoinTestnet]
    wallet = mockWalletStandardProvider()
    connector = new WalletStandardConnector({
      wallet,
      requestedChains
    })
  })

  it('should validate the test fixture', async () => {
    expect(connector).toBeInstanceOf(WalletStandardConnector)
  })

  it('should validate the metadata', async () => {
    expect(connector.chain).toBe('bip122')
    expect(connector.type).toBe('ANNOUNCED')
    expect(connector.id).toBe(wallet.name)
    expect(connector.name).toBe(wallet.name)
    expect(connector.imageUrl).toBe(wallet.icon)
  })

  it('should map correctly only chains that are requested and the wallet supports', async () => {
    expect(connector.chains).toEqual([bitcoin])
  })

  describe('connect', () => {
    it('connect correctly', async () => {
      await expect(connector.connect()).resolves.not.toThrow()
    })

    it('should throw if account is not found', async () => {
      wallet = mockWalletStandardProvider({
        features: {
          'bitcoin:connect': {
            connect: async () => Promise.resolve({ accounts: [] }),
            version: '1.0.0'
          }
        }
      })
      connector = new WalletStandardConnector({
        wallet,
        requestedChains
      })

      await expect(connector.connect()).rejects.toThrow('No account found')
    })

    it('should bind events', async () => {
      const eventsFeatureSpy = vi.spyOn(wallet.features['standard:events'] as any, 'on')
      await connector.connect()
      expect(eventsFeatureSpy).toHaveBeenCalledWith('change', expect.any(Function))
    })
  })
})
