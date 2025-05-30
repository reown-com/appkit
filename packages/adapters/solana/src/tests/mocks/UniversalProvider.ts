import type { SessionTypes } from '@walletconnect/types'
import UniversalProvider from '@walletconnect/universal-provider'
import { vi } from 'vitest'

import { SolanaWalletConnectProvider } from '../../providers/SolanaWalletConnectProvider.js'
import { TestConstants } from '../util/TestConstants.js'

export function mockUniversalProvider() {
  const provider = new UniversalProvider({})

  Object.assign(provider, {
    on: vi.fn(),
    removeEventListener: vi.fn(),
    connect: vi.fn(() => {
      const session = mockUniversalProviderSession()
      Object.assign(provider, {
        session
      })

      return Promise.resolve(session)
    }),
    disconnect: vi.fn(() => Promise.resolve()),
    client: {
      core: {
        crypto: {
          getClientId: vi.fn(() => Promise.resolve('client-id'))
        }
      }
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider.request = vi.fn((...[{ method }]: Parameters<UniversalProvider['request']>): any => {
    switch (method) {
      case 'solana_signMessage':
        return Promise.resolve({
          signature:
            '5bW5EoLn696QKxgJbsDb1aXrBf9hSUvvCa9FbyRt6CyppX4cQMJWyKx736ka5WDKqCZaoVivpWaxHhcAbSwhNx6Qp5Df3cHvSkg7jSX8PVw7FMKv45B5ZaeLjYHubDVsQEFFAs3Ea1CZU7X8xCv2JbhQvoxMoFWAKxUyFbM3DFH4KzuLL5nMZ9ybkiYfGdAAzwfMTDFLY7ymdzG12mWpvPwLJnwECDgHG7BogzZBdehndK8KP5sPLY5VcgVp5D87crr7XhUwmw5QLtDjPMnp4YKwApSS58jVNw3Zy'
        } satisfies SolanaWalletConnectProvider.RequestMethods['solana_signMessage']['returns'])
      case 'solana_signTransaction':
        return Promise.resolve({
          transaction:
            'AbtgOVOy/IOH3BOPyZ8/hu1pi0NQqO1mV13HnoWEvRDCpGKO6/8yTfuJmDgQet+S1iFeIos+2EQLJNee0l561AEBAAEDEYu60W1iZPqZxekvWxHW9/B92on2Sa8LAUEGjV1el9d1oyGFaAZ/9w4srgx9KoqiHtPM6Vur7h4D6XVoSgrEhAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAyVZNp39crMNo5bEpnmL7eM8r98bZA5VoGNHFLu7CvL4BAgIAAQwCAAAAQEIPAAAAAAA='
        } satisfies SolanaWalletConnectProvider.RequestMethods['solana_signTransaction']['returns'])
      case 'solana_signAndSendTransaction':
        return Promise.resolve({
          signature:
            '2Lb1KQHWfbV3pWMqXZveFWqneSyhH95YsgCENRWnArSkLydjN1M42oB82zSd6BBdGkM9pE6sQLQf1gyBh8KWM2c4'
        } satisfies SolanaWalletConnectProvider.RequestMethods['solana_signAndSendTransaction']['returns'])
      case 'solana_signAllTransactions':
        return Promise.resolve({
          transactions: [
            'AbtgOVOy/IOH3BOPyZ8/hu1pi0NQqO1mV13HnoWEvRDCpGKO6/8yTfuJmDgQet+S1iFeIos+2EQLJNee0l561AEBAAEDEYu60W1iZPqZxekvWxHW9/B92on2Sa8LAUEGjV1el9d1oyGFaAZ/9w4srgx9KoqiHtPM6Vur7h4D6XVoSgrEhAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAyVZNp39crMNo5bEpnmL7eM8r98bZA5VoGNHFLu7CvL4BAgIAAQwCAAAAQEIPAAAAAAA=',
            'AYDXAnLcl7IT+zEK9L+oOT/dY9etmSEznxAHfo4EZbdeJ/COPqARQCAfu+5Lbbrc26g3qWGRd4YHL8Uf2KDoAgqAAQABAxGLutFtYmT6mcXpL1sR1vfwfdqJ9kmvCwFBBo1dXpfXdaMhhWgGf/cOLK4MfSqKoh7TzOlbq+4eA+l1aEoKxIQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALKkO9Sy+d4Zr/s5Vn5b6BI7ltSc5at4aMPQjxrk+ibOAQICAAEMAgAAAEBCDwAAAAAAAA=='
          ]
        })
      default:
        return Promise.reject(new Error('not implemented'))
    }
  })

  return provider
}

export function mockUniversalProviderSession(
  replaces: Partial<SessionTypes.Struct> = {},
  inputChains = TestConstants.chains
): SessionTypes.Struct {
  const chains = inputChains.map(chain => `solana:${chain.id}`)

  const accounts = chains.reduce<string[]>((acc, cur) => {
    for (const account of TestConstants.accounts) {
      acc.push(`${cur}:${account.address}`)
    }

    return acc
  }, [])

  return {
    topic: 'ebc6a484a235f10c47b90d7e3d83cdb08ed8802b11cd4960c3907142890bff3a',
    relay: {
      protocol: 'irn'
    },
    expiry: 1724088716,
    namespaces: {
      solana: {
        chains,
        methods: ['solana_signTransaction', 'solana_signMessage', 'solana_signAndSendTransaction'],
        events: [],
        accounts
      }
    },
    acknowledged: true,
    pairingTopic: '06e5b8a04b03f8dec6daafbe6d16cefaff665cc634b52baf906ca05f289eeb46',
    requiredNamespaces: {},
    optionalNamespaces: {
      solana: {
        chains,
        methods: ['solana_signMessage', 'solana_signTransaction', 'solana_signAndSendTransaction'],
        events: []
      }
    },
    controller: '6c4a0bf9796287e690bacd0f7bd4ff9da698cbbb7432535cbe2bf1cd4f560e47',
    self: {
      publicKey: 'f558d7ee6670ce7a44846ecd311532f499b9a13a21a754672ae5bdc484cee935',
      metadata: {
        name: 'AppKit Lab',
        description: 'Laboratory environment for AppKit testing',
        url: 'https://appkit-lab.reown.org',
        icons: ['https://appkit-lab.reown.org/logo.png'],
        verifyUrl: ''
      }
    },
    peer: {
      publicKey: '6c4a0bf9796287e690bacd0f7bd4ff9da698cbbb7432535cbe2bf1cd4f560e47',
      metadata: {
        name: 'React Wallet Example',
        description: 'React Wallet for WalletConnect',
        url: 'https://walletconnect.com/',
        icons: ['https://avatars.githubusercontent.com/u/37784886']
      }
    },
    sessionProperties: {
      capabilities: '{}'
    },
    ...replaces
  }
}
