import type { CaipNetwork, ThemeVariables } from '@web3modal/common'
import type {
  ChainAdapter,
  NetworkControllerState,
  OptionsControllerState,
  ThemeMode,
  Token
} from '@web3modal/core'
import type { SIWEControllerClient, Web3ModalSIWEClient } from '@web3modal/siwe'

export type AppKitOptions = OptionsControllerState & {
  adapters?: ChainAdapter[]
  siweConfig?: Web3ModalSIWEClient
  caipNetworks: CaipNetwork[]
  themeMode?: ThemeMode
  themeVariables?: ThemeVariables
  allowUnsupportedCaipNetwork?: NetworkControllerState['allowUnsupportedCaipNetwork']
  siweControllerClient?: SIWEControllerClient
  defaultCaipNetwork?: NetworkControllerState['caipNetwork']
  caipNetworkImages?: Record<number | string, string>
  connectorImages?: Record<string, string>
  tokens?: Record<number, Token>
}

export type Namespace = Record<
  string,
  {
    chains: string[]
    methods: string[]
    events: string[]
    rpcMap: Record<string, string>
  }
>
