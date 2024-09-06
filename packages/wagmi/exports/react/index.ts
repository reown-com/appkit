import { AppKit } from '@rerock/base'
import type { AppKitOptions } from '@rerock/base'
import { EVMWagmiClient, type AdapterOptions } from '@rerock/adapter-wagmi'
import { getWeb3Modal } from '@rerock/base/library/react'
import { type Config, type CreateConfigParameters } from 'wagmi'
import { ConstantsUtil } from '@rerock/scaffold-utils'

// -- Setup -------------------------------------------------------------------
let appkit: AppKit | undefined = undefined

export type WagmiAppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> &
  AdapterOptions<Config> & {
    wagmiConfig?: CreateConfigParameters
  }

export function createWeb3Modal(options: WagmiAppKitOptions) {
  const wagmiAdapter = new EVMWagmiClient(options.wagmiConfig)

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
} from '@rerock/base/library/react'
