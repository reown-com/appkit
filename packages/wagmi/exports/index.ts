import { AppKit } from '@web3modal/base'
import type { AppKitOptions } from '@web3modal/base'
import { EVMWagmiClient } from '@web3modal/base/adapters/evm/wagmi'
import { ConstantsUtil } from '@web3modal/scaffold-utils'
import type { Config } from '@wagmi/core'

// -- Types -------------------------------------------------------------
export type {
  CoreConfig,
  ReactConfig,
  Web3ModalClientOptions
} from '@web3modal/base/adapters/evm/wagmi'

// -- Connectors --------------------------------------------------------
export { authConnector } from '@web3modal/base/adapters/evm/wagmi'

// -- Configs -----------------------------------------------------------
export { defaultWagmiCoreConfig as defaultWagmiConfig } from '@web3modal/base/adapters/evm/wagmi'

// -- Setup -------------------------------------------------------------
type WagmiAppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> & {
  wagmiConfig: Config
}

export function createWeb3Modal(options: WagmiAppKitOptions) {
  const wagmiAdapter = new EVMWagmiClient({
    wagmiConfig: options.wagmiConfig,
    siweConfig: options.siweConfig
  })
  return new AppKit({
    ...options,
    adapters: [wagmiAdapter],
    sdkType: 'w3m',
    sdkVersion: `html-wagmi-${ConstantsUtil.VERSION}`
  })
}
