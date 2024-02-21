import { InjectedConnector } from './InjectedConnector'
import type { Connector } from './BaseConnector'

export interface PhantomPublicKey {
  length: number
  negative: number
  words: Uint8Array
  toString: () => string
}

const PHANTOM_WALLET_PATH = `window.phantom.solana`

/* declare global {
  interface Window {
    phantom?: {
      solana: {
        connect: () => Promise<{ publicKey: PhantomPublicKey }>
        disconnect: () => Promise<void>
        request: <Method extends keyof RequestMethods>(
          params: RequestMethods[Method]['params']
        ) => RequestMethods[Method]['returns']
        signTransaction: (transaction: Transaction) => Promise<{
          serialize: () => Uint8Array
        }>
        signMessage: (message: Uint8Array, format: string) => Promise<{ signature: Uint8Array }>
      }
    }
  }
} */

export class PhantomConnector extends InjectedConnector implements Connector {
  public constructor() {
    super(PHANTOM_WALLET_PATH, 'phantom', 'Phantom')
  }

  public override connectorName() {
    return super.connectorName(PHANTOM_WALLET_PATH)
  }
}
