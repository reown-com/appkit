import type { SessionTypes } from '@walletconnect/types'
import type UniversalProvider from '@walletconnect/universal-provider'
import { vi } from 'vitest'

import { bitcoin, solana } from '@reown/appkit/networks'

import { TestConstants } from '../constants/TestConstants.js'

/**
 * Creates a mock UniversalProvider with configurable behavior
 * @param replaces - Optional overrides for the mock implementation
 * @returns A mocked UniversalProvider instance
 */
export function mockUniversalProvider(
  replaces: Partial<UniversalProvider> = {}
): UniversalProvider {
  return {
    connect: vi.fn(),
    disconnect: vi.fn(),
    request: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
    client: {
      core: {
        crypto: {
          getClientId: vi.fn(() => Promise.resolve('client-id'))
        }
      }
    },
    setDefaultChain: vi.fn(),
    ...replaces
  } as UniversalProvider
}

/**
 * Creates a mock WalletConnect session for EVM chains
 * @param replaces - Optional overrides for the session
 * @returns A mocked WalletConnect session
 */
export function mockEvmSession(
  replaces: Partial<SessionTypes.Struct> = {}
): SessionTypes.Struct {
  const chains = TestConstants.networks.evm.map(chain => `eip155:${chain.id}`)
  const accounts = chains.reduce<string[]>((acc, chain) => {
    for (const account of TestConstants.accounts.evm) {
      acc.push(`${chain}:${account.address}`)
    }
    return acc
  }, [])

  return mockBaseSession({
    namespaces: {
      eip155: {
        chains,
        methods: ['eth_sendTransaction', 'eth_signTransaction', 'personal_sign', 'eth_sign'],
        events: ['chainChanged', 'accountsChanged'],
        accounts
      }
    },
    requiredNamespaces: {
      eip155: {
        chains,
        methods: ['eth_sendTransaction', 'eth_signTransaction', 'personal_sign', 'eth_sign'],
        events: ['chainChanged', 'accountsChanged']
      }
    },
    ...replaces
  })
}

/**
 * Creates a mock WalletConnect session for Solana chains
 * @param replaces - Optional overrides for the session
 * @returns A mocked WalletConnect session
 */
export function mockSolanaSession(
  replaces: Partial<SessionTypes.Struct> = {}
): SessionTypes.Struct {
  const chains = TestConstants.networks.solana.map(chain => `solana:${chain.id}`)
  const accounts = chains.reduce<string[]>((acc, chain) => {
    for (const account of TestConstants.accounts.solana) {
      acc.push(`${chain}:${account.address}`)
    }
    return acc
  }, [])

  return mockBaseSession({
    namespaces: {
      solana: {
        chains,
        methods: ['solana_signTransaction', 'solana_signMessage', 'solana_signAndSendTransaction'],
        events: [],
        accounts
      }
    },
    requiredNamespaces: {
      solana: {
        chains,
        methods: ['solana_signMessage', 'solana_signTransaction', 'solana_signAndSendTransaction'],
        events: []
      }
    },
    ...replaces
  })
}

/**
 * Creates a mock WalletConnect session for Bitcoin chains
 * @param replaces - Optional overrides for the session
 * @returns A mocked WalletConnect session
 */
export function mockBitcoinSession(
  replaces: Partial<SessionTypes.Struct> = {}
): SessionTypes.Struct {
  const chains = TestConstants.networks.bitcoin.map(chain => `bip122:${chain.id}`)
  const accounts = chains.reduce<string[]>((acc, chain) => {
    for (const account of TestConstants.accounts.bitcoin) {
      acc.push(`${chain}:${account.address}`)
    }
    return acc
  }, [])

  return mockBaseSession({
    namespaces: {
      bip122: {
        chains,
        accounts,
        events: [],
        methods: ['sendTransfer', 'signMessage', 'signPsbt', 'getAccountAddresses']
      }
    },
    requiredNamespaces: {
      bip122: {
        chains,
        events: [],
        methods: ['sendTransfer', 'signMessage', 'signPsbt', 'getAccountAddresses']
      }
    },
    ...replaces
  })
}

/**
 * Base function for creating mock WalletConnect sessions
 * @param replaces - Optional overrides for the session
 * @returns A mocked WalletConnect session
 */
function mockBaseSession(
  replaces: Partial<SessionTypes.Struct> = {}
): SessionTypes.Struct {
  return {
    topic: 'ebc6a484a235f10c47b90d7e3d83cdb08ed8802b11cd4960c3907142890bff3a',
    relay: {
      protocol: 'irn'
    },
    expiry: 1724088716,
    acknowledged: true,
    pairingTopic: '06e5b8a04b03f8dec6daafbe6d16cefaff665cc634b52baf906ca05f289eeb46',
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
