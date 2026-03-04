import type { CaipNetwork } from '@reown/appkit-common'
import type { Connector, Provider } from '@reown/appkit-controllers'

interface ChainAdapterConnector extends Connector {
  chains: CaipNetwork[]
}

export interface TronConnector extends ChainAdapterConnector, Provider {
  chains: CaipNetwork[]
  signMessage(params: TronConnector.SignMessageParams): Promise<string>
  sendTransaction(params: TronConnector.SendTransactionParams): Promise<string>
  switchNetwork(chainId: string): Promise<void>
}

export declare namespace TronConnector {
  type SignMessageParams = {
    message: string
    from: string
  }
  type SendTransactionParams = {
    to: string
    from: string
    value: string
    data?: string
  }
}
