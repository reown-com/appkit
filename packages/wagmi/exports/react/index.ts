import { AppKit } from '@rerock/appkit'
import type { AppKitOptions } from '@rerock/appkit'
import { EVMWagmiClient, type AdapterOptions } from '@rerock/appkit-adapter-wagmi'
import { getWeb3Modal } from '@rerock/appkit/library/react'
import { type Config, type CreateConfigParameters } from 'wagmi'
import { ConstantsUtil } from '@rerock/scaffold-utils'

// -- Setup -------------------------------------------------------------------
let appkit: AppKit | undefined = undefined

export type WagmiAppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> &
  AdapterOptions<Config> & {
    wagmiConfig?: CreateConfigParameters
  }

export function createWeb3Modal(options: WagmiAppKitOptions) {
  const wagmiAdapter = new EVMWagmiClient({
    ...options.wagmiConfig,
    caipNetworks: options.caipNetworks,
    projectId: options.projectId
  })

  appkit = new AppKit({
    ...options,
    sdkVersion: `react-wagmi-${ConstantsUtil.VERSION}`,
    adapters: [wagmiAdapter]
  })
  getWeb3Modal(appkit)

  return appkit
}

// -- Hooks -------------------------------------------------------------------
export {
  useWeb3ModalTheme,
  useWeb3Modal,
  useWeb3ModalState,
  useWeb3ModalEvents,
  useWalletInfo
} from '@rerock/appkit/library/react'
