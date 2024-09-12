import { AppKit } from '@rerock/appkit'
import type { AppKitOptions } from '@rerock/appkit'
import { EVMEthers5Client, type AdapterOptions } from '@rerock/appkit-adapter-ethers5'

import { getWeb3Modal } from '@rerock/appkit/library/vue'
import { ConstantsUtil } from '@rerock/appkit-utils'

// -- Setup -------------------------------------------------------------------
let appkit: AppKit | undefined = undefined
let ethersAdapter: EVMEthers5Client | undefined = undefined

type EthersAppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> &
  AdapterOptions

export function createWeb3Modal(options: EthersAppKitOptions) {
  ethersAdapter = new EVMEthers5Client()
  appkit = new AppKit({
    ...options,
    sdkVersion: `vue-ethers5-${ConstantsUtil.VERSION}`,
    adapters: [ethersAdapter]
  })
  getWeb3Modal(appkit)

  return appkit
}

// -- Composites --------------------------------------------------------------
export function useWeb3ModalProvider() {
  // Implement this
}

export function useDisconnect() {
  async function disconnect() {
    await ethersAdapter?.disconnect()
  }

  return {
    disconnect
  }
}

export function useSwitchNetwork() {
  // Implement this
}

export function useWeb3ModalAccount() {
  // Implement this
}

export function useWeb3ModalError() {
  // Implement this
}

export {
  useWeb3ModalTheme,
  useWeb3Modal,
  useWeb3ModalState,
  useWeb3ModalEvents,
  useWalletInfo
} from '@rerock/appkit/library/vue'
