import type { CaipNetwork } from '@reown/appkit-common'
import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import { ChainController } from '@reown/appkit-controllers'
import type { TonConnector } from '@reown/appkit-utils/ton'
import { WalletConnectConnector } from '@reown/appkit/connectors'

type GetActiveChain = () => CaipNetwork | undefined

export class TonWalletConnectConnector
  extends WalletConnectConnector<'ton'>
  implements TonConnector
{
  public override readonly chain = CommonConstantsUtil.CHAIN.TON
  private readonly getActiveChain: GetActiveChain

  constructor({
    provider,
    chains,
    getActiveChain
  }: {
    provider: any
    chains: CaipNetwork[]
    getActiveChain: GetActiveChain
  }) {
    super({ caipNetworks: chains, namespace: 'ton', provider })
    this.getActiveChain = getActiveChain
  }

  get imageUrl(): string | undefined {
    return undefined
  }

  get info() {
    return undefined
  }

  get chainsList() {
    return this.chains
  }

  async connect(): Promise<string> {
    const address = this.getSessionAddress()
    if (!address) throw new Error('WalletConnect: TON account not found in session')
    return address
  }

  override async disconnect(): Promise<void> {
    // Disconnection of WC session is orchestrated by AppKit universal provider flows
    return Promise.resolve()
  }

  async getAccount(): Promise<string | undefined> {
    return this.getSessionAddress()
  }

  async signMessage(params: { message: string }): Promise<string> {
    // TON uses signData. For convenience, map text message to signData:text
    const signature = await this.signData({ data: { type: 'text', text: params.message } })
    return signature
  }

  public async signData(params: { data: any }): Promise<string> {
    const chainId = this.getActiveCaipNetworkId()
    const topic = (this.provider as any)?.session?.topic
    if (!topic) throw new Error('WalletConnect: missing session topic')

    const request = {
      method: 'ton_signData',
      params: [params],
      chainId,
      topic
    }
    console.log('>> params', request)

    const result: any = await (this.provider as any).request(request)

    return (result?.signature || result?.result?.signature || '') as string
  }

  public async sendMessage(params: { message: any }): Promise<string> {
    const chainId = this.getActiveCaipNetworkId()
    const topic = (this.provider as any)?.session?.topic
    if (!topic) throw new Error('WalletConnect: missing session topic')

    const request = {
      method: 'ton_sendMessage',
      params: [params.message],
      chainId,
      topic
    }
    console.log('>>> sendMessage', request)

    const result: any = await (this.provider as any).request(request)

    return (result?.boc || result?.result || '') as string
  }

  async sendTransaction(params: { transaction: any }): Promise<string> {
    console.log('>>> sendTransaction', params)
    return this.sendMessage({ message: params.transaction })
  }

  async switchNetwork(): Promise<void> {
    return Promise.resolve()
  }

  // -- Internals ----------------------------------------------------- //
  private getSessionAddress(): string | undefined {
    const namespaces = (this.provider as any)?.session?.namespaces
    const accounts = namespaces?.[CommonConstantsUtil.CHAIN.TON]?.accounts || []

    if (!accounts.length) {
      return undefined
    }
    // account format: ton:-239:<user-friendly>
    const activeId = this.getActiveChain()?.id?.toString()
    const account = accounts.find((a: string) => a.split(':')[1] === activeId) || accounts[0]
    return account?.split(':')[2]
  }

  private getActiveCaipNetworkId(): string {
    // Prefer ChainController’s active network for TON
    const active =
      this.getActiveChain() ||
      ChainController.getCaipNetworkByNamespace(CommonConstantsUtil.CHAIN.TON)
    return (active?.caipNetworkId || active?.id || 'ton:-239') as string
  }
}
