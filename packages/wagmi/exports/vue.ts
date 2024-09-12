import { AppKit } from '@rerock/base'
import type { AppKitOptions } from '@rerock/base'
import { EVMWagmiClient, type AdapterOptions } from '@rerock/appkit-adapter-wagmi'
import { getWeb3Modal } from '@rerock/base/library/vue'
import type { Config } from '@wagmi/core'
import { ConstantsUtil } from '@rerock/scaffold-utils'

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
    sdkVersion: `vue-wagmi-${ConstantsUtil.VERSION}`,
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
} from '@rerock/base/library/vue'
