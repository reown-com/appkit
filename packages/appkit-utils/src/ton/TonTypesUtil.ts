import type { Connector } from '@reown/appkit-controllers'

export interface TonConnector extends Connector {
  connect(params?: { chainId: string }): Promise<string> // returns address
  disconnect(): Promise<void>
  signMessage(params: { message: string }): Promise<string>
  sendTransaction(params: { transaction: any }): Promise<string>
  signData(params: { data: any }): Promise<string>
  switchNetwork(chainId: string): Promise<void>
}
