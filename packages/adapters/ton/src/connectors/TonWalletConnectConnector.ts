import { WcHelpersUtil } from '@reown/appkit'
import type { CaipNetwork } from '@reown/appkit-common'
import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import { ChainController } from '@reown/appkit-controllers'
import { HelpersUtil } from '@reown/appkit-utils'
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

  public override get chains() {
    return this.sessionChains
      .map(chainId => this.caipNetworks.find(chain => chain.caipNetworkId === chainId))
      .filter(Boolean) as CaipNetwork[]
  }

  public async connect() {
    return Promise.reject(
      new Error('Connection of WalletConnectProvider should be done via UniversalAdapter')
    )
  }

  override async disconnect(): Promise<void> {
    // Disconnection of WC session is orchestrated by AppKit universal provider flows
    return Promise.resolve()
  }

  // @ts-expect-error
  private getAccount<Required extends boolean>(
    required?: Required
  ): Required extends true ? string : string | undefined {
    const caipAddress = ChainController.getAccountData(CommonConstantsUtil.CHAIN.TON)?.caipAddress
    const account = this.provider.session?.namespaces[CommonConstantsUtil.CHAIN.TON]?.accounts.find(
      _account => HelpersUtil.isLowerCaseMatch(_account, caipAddress)
    )

    if (!account) {
      if (required) {
        throw new Error('Account not found')
      }

      return undefined as Required extends true ? string : string | undefined
    }

    const address = account.split(':')[2]
    if (!address) {
      if (required) {
        throw new Error('Address not found')
      }

      return undefined as Required extends true ? string : string | undefined
    }

    return address
  }

  public async signData(params: { data: any }): Promise<string> {
    const chain = this.getActiveChain()

    if (!chain) {
      throw new Error('Chain not found')
    }

    const request = {
      method: 'ton_signData',
      params: [params],
      chainId: chain.caipNetworkId
    }
    const result: any = await (this.provider as any).request(request)

    return (result?.signature || result?.result?.signature || '') as string
  }

  public async sendMessage(params: { message: any }): Promise<string> {
    const chain = this.getActiveChain()

    if (!chain) {
      throw new Error('Chain not found')
    }

    const request = {
      method: 'ton_sendMessage',
      params: [params.message],
      chainId: chain.caipNetworkId
    }
    const result: any = await (this.provider as any).request(request)

    return (result?.boc || result?.result || '') as string
  }

  async sendTransaction(params: { transaction: any }): Promise<string> {
    return this.sendMessage({ message: params.transaction })
  }

  async switchNetwork(): Promise<void> {
    // ChainAdapterBlueprint.switchNetwork will be called instead
    return Promise.resolve()
  }

  // -- Internals ----------------------------------------------------- //
  private get sessionChains() {
    return WcHelpersUtil.getChainsFromNamespaces(this.provider.session?.namespaces)
  }
}
