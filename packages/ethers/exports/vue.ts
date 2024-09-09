import { AppKit } from '@rerock/base'
import type { AppKitOptions } from '@rerock/base'
import { EVMEthersClient, type AdapterOptions } from '@rerock/adapter-ethers'
import { getWeb3Modal } from '@rerock/base/library/vue'
import { ConstantsUtil } from '@rerock/scaffold-utils'

// -- Types -------------------------------------------------------------
export type { AdapterOptions } from '@rerock/adapter-ethers'

// -- Setup -------------------------------------------------------------------
let appkit: AppKit | undefined = undefined
let ethersAdapter: EVMEthersClient | undefined = undefined

type EthersAppKitOptions = Omit<AppKitOptions, 'adapters' | 'sdkType' | 'sdkVersion'> &
  AdapterOptions

export function createWeb3Modal(options: EthersAppKitOptions) {
  ethersAdapter = new EVMEthersClient()
  appkit = new AppKit({
    ...options,
    sdkVersion: `vue-ethers-${ConstantsUtil.VERSION}`,
    adapters: [ethersAdapter]
  })
  getWeb3Modal(appkit)

  return appkit
}

// -- Composites --------------------------------------------------------------
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
  // Reimplement this
}

export function useWeb3ModalError() {
  // Reimplement this
}

export {
  useWeb3ModalTheme,
  useWeb3Modal,
  useWeb3ModalState,
  useWeb3ModalEvents,
  useWalletInfo
} from '@rerock/base/library/vue'
