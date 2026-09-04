import type UniversalProvider from '@walletconnect/universal-provider'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { CaipNetwork } from '@reown/appkit-common'
import { ChainController } from '@reown/appkit-controllers'

import { StellarWalletConnectConnector } from '../../src/connectors/StellarWalletConnectConnector.js'
import { mockUniversalProvider } from '../mocks/mockUniversalProvider.js'

const ADDRESS = 'GB43KVROR7TFJ6KAPCYRF2FJROTZAH4FHLTJLPWX4DRZCC5NASLGITR6'

const MOCK_NETWORK = {
  id: 'pubnet',
  chainNamespace: 'stellar',
  caipNetworkId: 'stellar:pubnet',
  name: 'Stellar',
  nativeCurrency: { name: 'Lumens', symbol: 'XLM', decimals: 7 },
  rpcUrls: { default: { http: ['https://horizon.stellar.org'] } }
} as unknown as CaipNetwork

function createConnector(requestResult: unknown) {
  const provider = mockUniversalProvider({
    request: vi.fn().mockResolvedValue(requestResult)
  } as unknown as Partial<UniversalProvider>)

  const connector = new StellarWalletConnectConnector({ provider, chains: [MOCK_NETWORK] })

  return { connector, provider }
}

describe('StellarWalletConnectConnector', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(ChainController, 'getCaipNetworks').mockReturnValue([MOCK_NETWORK])
    vi.spyOn(ChainController, 'getCaipNetworkByNamespace').mockReturnValue(MOCK_NETWORK)
  })

  it('exposes the stellar namespace', () => {
    const { connector } = createConnector({})

    expect(connector.chain).toBe('stellar')
  })

  it('signXDR sends the spec payload and returns the signed envelope', async () => {
    const { connector, provider } = createConnector({
      signedXDR: 'signed-xdr',
      signerAddress: `stellar:pubnet:${ADDRESS}`
    })

    const result = await connector.signXDR({ xdr: 'unsigned-xdr', address: ADDRESS })

    expect(provider.request).toHaveBeenCalledWith(
      {
        method: 'stellar_signXDR',
        params: {
          xdr: 'unsigned-xdr',
          chain: 'stellar:pubnet',
          account: `stellar:pubnet:${ADDRESS}`
        }
      },
      'stellar:pubnet'
    )
    expect(result.signedXDR).toBe('signed-xdr')
  })

  it('signAndSubmitXDR maps the wallet tx_hash onto txHash', async () => {
    const { connector, provider } = createConnector({
      tx_hash: 'abc123',
      signedXDR: 'signed-xdr',
      successful: true
    })

    const result = await connector.signAndSubmitXDR({
      xdr: 'unsigned-xdr',
      address: ADDRESS,
      waitForInclusion: true
    })

    expect(provider.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'stellar_signAndSubmitXDR',
        params: expect.objectContaining({ waitForInclusion: true })
      }),
      'stellar:pubnet'
    )
    expect(result).toEqual({ txHash: 'abc123', signedXDR: 'signed-xdr', successful: true })
  })

  it('signAndSubmitXDR omits waitForInclusion when not supplied', async () => {
    const { connector, provider } = createConnector({ tx_hash: 'abc123', signedXDR: 'x' })

    await connector.signAndSubmitXDR({ xdr: 'unsigned-xdr', address: ADDRESS })

    const params = vi.mocked(provider.request).mock.calls[0]?.[0] as {
      params: Record<string, unknown>
    }

    expect(params.params).not.toHaveProperty('waitForInclusion')
  })

  it('signMessage passes the encoding through and returns the signature', async () => {
    const { connector, provider } = createConnector({
      signature: 'base64-signature',
      signerAddress: `stellar:pubnet:${ADDRESS}`
    })

    const result = await connector.signMessage({
      message: 'hello',
      address: ADDRESS,
      messageEncoding: 'utf-8'
    })

    expect(provider.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'stellar_signMessage',
        params: expect.objectContaining({ message: 'hello', messageEncoding: 'utf-8' })
      }),
      'stellar:pubnet'
    )
    expect(result.signature).toBe('base64-signature')
  })

  it('signAuthEntry forwards the entry', async () => {
    const { connector, provider } = createConnector({
      signedAuthEntry: 'signed-entry',
      signerAddress: `stellar:pubnet:${ADDRESS}`
    })

    const result = await connector.signAuthEntry({ authEntry: 'unsigned-entry', address: ADDRESS })

    expect(provider.request).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'stellar_signAuthEntry',
        params: expect.objectContaining({ authEntry: 'unsigned-entry' })
      }),
      'stellar:pubnet'
    )
    expect(result.signedAuthEntry).toBe('signed-entry')
  })

  it('throws when no stellar network is active', async () => {
    const { connector } = createConnector({})

    vi.spyOn(ChainController, 'getCaipNetworkByNamespace').mockReturnValue(undefined)

    await expect(connector.signXDR({ xdr: 'x', address: ADDRESS })).rejects.toThrow(
      'Chain not found'
    )
  })

  it('rejects direct connect -- the handshake goes through the universal adapter', async () => {
    const { connector } = createConnector({})

    await expect(connector.connect()).rejects.toThrow('UniversalAdapter')
  })
})
