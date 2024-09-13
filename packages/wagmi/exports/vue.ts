import { AppKit } from '@reown/appkit'
import type { AppKitOptions } from '@reown/appkit'
import { EVMWagmiClient, type AdapterOptions } from '@reown/appkit-adapter-wagmi'
import { getWeb3Modal } from '@reown/appkit/library/vue'
import type { Config } from '@wagmi/core'
import packageJson from '../package.json' assert { type: 'json' }

// -- Setup -------------------------------------------------------------------
let appkit: AppKit | undefined = undefined

export type WagmiAppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> &
  AdapterOptions<Config>

export function createWeb3Modal(options: WagmiAppKitOptions) {
  const wagmiAdapter = new EVMWagmiClient({
    caipNetworks: options.caipNetworks,
    projectId: options.projectId
  })
  appkit = new AppKit({
    ...options,
    sdkVersion: `vue-wagmi-${packageJson.version}`,
    adapters: [wagmiAdapter]
  })
  getWeb3Modal(appkit)

  return appkit
}

// -- Composites --------------------------------------------------------------
export {
  useWeb3ModalTheme,
  useWeb3Modal,
  useWeb3ModalState,
  useWeb3ModalEvents,
  useWalletInfo
} from '@reown/appkit/library/vue'
