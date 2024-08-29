import { getWeb3Modal } from '@web3modal/base/library/vue'
import { AppKit } from '@web3modal/base'
import { SolanaWeb3JsClient } from '@web3modal/adapter-solana'
import type { CaipNetwork } from '@web3modal/common'
import type { Provider } from '@web3modal/adapter-solana'
import type { SolanaAppKitOptions } from './options'

// -- Types -------------------------------------------------------------------
export type { SolanaAppKitOptions, Provider }

// -- Setup -------------------------------------------------------------------
let appkit: AppKit | undefined = undefined
let solanaAdapter: SolanaWeb3JsClient | undefined = undefined

export function createWeb3Modal(options: SolanaAppKitOptions) {
  solanaAdapter = new SolanaWeb3JsClient({
    wallets: options.wallets
  })
  appkit = new AppKit({
    ...options,
    adapters: [solanaAdapter]
  })
  getWeb3Modal(appkit)

  return appkit
}

// -- Composites --------------------------------------------------------------
export function useDisconnect() {
  async function disconnect() {
    await solanaAdapter?.connectionControllerClient?.disconnect()
  }

  return {
    disconnect
  }
}

export function useSwitchNetwork() {
  async function switchNetwork(chainId: string) {
    await solanaAdapter?.switchNetwork({ id: chainId } as CaipNetwork)
  }

  return {
    switchNetwork
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export function useWeb3ModalError() {
  // eslint-disable-next-line no-warning-comments
  // TODO fix error hook
}

export {
  useWeb3ModalTheme,
  useWeb3Modal,
  useWeb3ModalState,
  useWeb3ModalEvents
} from '@web3modal/base/library/vue'
