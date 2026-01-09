import type { CaipNetwork } from '@reown/appkit-common'
import type { BitcoinConnector } from '@reown/appkit-utils/bitcoin'

export namespace UnisatConnector {
  export type Chain =
    | 'BITCOIN_MAINNET'
    | 'BITCOIN_TESTNET'
    | 'BITCOIN_SIGNET'
    | 'FRACTAL_BITCOIN_MAINNET'
  export type Network = 'livenet' | 'testnet'
  export type Id = 'unisat' | 'bitget' | 'binancew3w'

  export type Wallet = {
    /*
     * This interface doesn't include all available methods
     * Reference: https://www.okx.com/web3/build/docs/sdks/chains/bitcoin/provider
     */

    requestAccounts: () => Promise<string[]>
    getPublicKey: () => Promise<string>
    sendBitcoin: (
      to: string,
      value: number,
      options?: { feeRate: number; memo?: string; memos?: string[] }
    ) => Promise<string>
    signPsbt: (
      psbtHex: string,
      options?: {
        autoFinalized?: boolean
        toSignInputs: Array<
          | {
              index: number
              address: string
              sighashTypes?: number[]
              disableTweakSigner?: boolean
              useTweakedSigner?: boolean
            }
          | {
              index: number
              publicKey: string
              sighashTypes?: number[]
              disableTweakSigner?: boolean
              useTweakedSigner?: boolean
            }
        >
      }
    ) => Promise<string>
    switchChain(chain: Chain): Promise<{ enum: Chain; name: string; network: Network }>
    getAccounts(): Promise<string[]>
    signMessage(signStr: string, type?: 'ecdsa' | 'bip322-simple'): Promise<string>
    pushPsbt(psbtHex: string): Promise<string>
    on(event: string, listener: (param?: unknown) => void): void
    removeListener(event: string, listener: (param?: unknown) => void): void
  }

  export interface UnisatWindow extends Window {
    unisat?: Wallet
    bitkeep?: {
      unisat?: Wallet
      suiWallet?: {
        icon: string
      }
    }
    binancew3w?: {
      bitcoin?: Wallet
    }
  }

  export type ConstructorParams = {
    id: Id
    name: string
    wallet: Wallet
    requestedChains: CaipNetwork[]
    imageUrl: string
  }

  export type GetWalletParams = Omit<ConstructorParams, 'wallet'>

  export type SignPSBTParams = {
    toSignInputs: BitcoinConnector.SignPSBTParams['signInputs']
    autoFinalized?: boolean
  }
}
