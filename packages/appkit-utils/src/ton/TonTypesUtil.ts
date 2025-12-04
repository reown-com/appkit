import type { CaipNetwork } from '@reown/appkit-common'
import type { Connector, Provider } from '@reown/appkit-controllers'

interface ChainAdapterConnector extends Connector {
  chains: CaipNetwork[]
}

export interface TonConnector extends ChainAdapterConnector, Provider {
  chains: CaipNetwork[]
  sendMessage(params: TonConnector.SendMessageParams): Promise<string>
  signData(params: TonConnector.SignDataParams): Promise<string>
  switchNetwork(chainId: string): Promise<void>
}

export type SignDataParamsText = {
  type: 'text'
  from: string
  text: string
}
export type SignDataParamsBinary = {
  type: 'binary'
  bytes: string
  from: string
}
export type SignDataParamsCell = {
  type: 'cell'
  schema: string
  cell: string
  from: string
}
export declare namespace TonConnector {
  type AccountAddress = {
    address: string
  }
  type SignDataParams = SignDataParamsText | SignDataParamsBinary | SignDataParamsCell
  type SendMessageParams = {
    validUntil: number
    from: string
    messages: {
      address: string
      amount: string
      payload?: string
      stateInit?: string
      extraCurrency?: Record<number, string>
    }[]
  }
}

// -- TonConnect Types -------------------------------- //
type WalletPlatform = string
type WalletFeature =
  | {
      name: 'SendTransaction'
      maxMessages?: number
      extraCurrencySupported?: boolean
    }
  | {
      name: 'SignData'
      types?: Array<'text' | 'binary' | 'cell'>
    }

export type TonWalletInfoBase = {
  name: string
  appName: string
  imageUrl: string
  aboutUrl: string
  tondns?: string
  platforms: WalletPlatform[]
  features?: WalletFeature[]
}

export type TonWalletInfoRemote = TonWalletInfoBase & {
  universalLink?: string
  deepLink?: string
  bridgeUrl?: string
}

export type TonWalletInfoInjectable = TonWalletInfoBase & {
  jsBridgeKey: string
  injected: boolean
  embedded: boolean
}

export type TonWalletInfo = TonWalletInfoRemote | TonWalletInfoInjectable

export type TonWalletInfoDTO = {
  name: string
  app_name: string
  image: string
  about_url: string
  tondns?: string
  universal_url?: string
  deepLink?: string
  platforms: WalletPlatform[]
  features?: WalletFeature[]
  bridge: Array<{ type: 'sse'; url: string } | { type: 'js'; key: string }>
}
