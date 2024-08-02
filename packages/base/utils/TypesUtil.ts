import type { ThemeVariables } from '@web3modal/common'
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
  chains: Chain[]
  themeMode?: ThemeMode
  themeVariables?: ThemeVariables
  allowUnsupportedChain?: NetworkControllerState['allowUnsupportedChain']
  siweControllerClient?: SIWEControllerClient
  defaultChain?: NetworkControllerState['caipNetwork']
  chainImages?: Record<number | string, string>
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

export type Chain = {
  chainId: string | number
  name: string
  currency: string
  explorerUrl: string
  rpcUrl: string | ((chainId: string | number) => string)
  chain: string
}
