import { AppKit } from '@web3modal/base'
import type { AppKitOptions } from '@web3modal/base'
import { EVMEthers5Client, type AdapterOptions } from '@web3modal/adapter-ethers5'

import { getWeb3Modal } from '@web3modal/base/utils/library/vue'
import { type EthersStoreUtilState } from '@web3modal/scaffold-utils/ethers'

// -- Setup -------------------------------------------------------------------
let appkit: AppKit<EthersStoreUtilState, number> | undefined = undefined
let ethersAdapter: EVMEthers5Client | undefined = undefined

type EthersAppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> &
  AdapterOptions

export function createWeb3Modal(options: EthersAppKitOptions) {
  ethersAdapter = new EVMEthers5Client()
  appkit = new AppKit<EthersStoreUtilState, number>({
    ...options,
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
} from '@web3modal/base/library/vue'
