import type { CaipNetwork } from '@reown/appkit-common'
import type { Connector } from '@reown/appkit-controllers'

export interface TonConnector extends Connector {
  chains: CaipNetwork[]
  connect(params?: { chainId: string }): Promise<string>
  disconnect(): Promise<void>
  getAccount(): Promise<string | undefined>
  signMessage(params: { message: string }): Promise<string>
  sendMessage(params: { message: unknown }): Promise<string>
  sendTransaction(params: { transaction: unknown }): Promise<string>
  signData(params: { data: unknown }): Promise<string>
  switchNetwork(chainId: string): Promise<void>
}

// For parity with Solana's Provider export, TON's provider is the connector surface
export type Provider = TonConnector
