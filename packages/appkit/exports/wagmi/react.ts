import { getWeb3Modal } from '@web3modal/scaffold-react'
import { EVMWagmiClient } from '../../adapters/evm/wagmi/client.js'
import { AppKit } from '../../src/client.js'
import type { AppKitOptions } from '../../utils/TypesUtil.js'
import type { Config } from 'wagmi'

// -- Views ------------------------------------------------------------
export * from '@web3modal/scaffold-ui'

// -- Utils & Other -----------------------------------------------------
export type * from '@web3modal/core'
export { CoreHelperUtil } from '@web3modal/core'

// -- Configs -----------------------------------------------------------
export { defaultWagmiConfig } from '../../adapters/evm/wagmi/utils/defaultWagmiReactConfig.js'

// -- Setup -------------------------------------------------------------
let appkit: AppKit | undefined = undefined
let wagmiAdapter: EVMWagmiClient | undefined = undefined

type WagmiAppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> & {
  wagmiConfig: Config
}

export function createAppKit(options: WagmiAppKitOptions) {
  wagmiAdapter = new EVMWagmiClient({
    wagmiConfig: options.wagmiConfig,
    siweConfig: options.siweConfig
  })
  appkit = new AppKit({
    ...options,
    adapters: [wagmiAdapter],
    sdkType: 'w3m',
    sdkVersion: 'html-wagmi-5.0.6'
  })
  getWeb3Modal(appkit)

  return appkit
}

export { AppKit }

// -- Types -------------------------------------------------------------
export type { AppKitOptions } from '../../utils/TypesUtil.js'

// -- Hooks -------------------------------------------------------------
export {
  useWeb3ModalTheme,
  useWeb3Modal,
  useWeb3ModalState,
  useWeb3ModalEvents,
  useWalletInfo
} from '@web3modal/scaffold-react'
