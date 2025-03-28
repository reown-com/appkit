import type { PublicKey } from '@solana/web3.js'
import type { SignClientTypes } from '@walletconnect/types'
import type { UniversalProvider } from '@walletconnect/universal-provider'

import type { WalletConnectChainID } from './constants.js'

export type UniversalProviderType = Awaited<ReturnType<typeof UniversalProvider.init>>

export interface WalletConnectWalletAdapterConfig {
  network: WalletConnectChainID
  options: SignClientTypes.Options
}

export interface WalletConnectWalletInit {
  publicKey: PublicKey
}
