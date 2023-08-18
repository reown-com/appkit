import { ref } from 'vue'
import type { Web3ModalOptions } from '../src/client.js'
import { Web3Modal } from '../src/client.js'
import { VERSION } from '../src/utils/constants.js'

// -- Types -------------------------------------------------------------------
export type { Web3ModalOptions } from '../src/client.js'
type OpenOptions = Parameters<Web3Modal['open']>[0]

// -- Setup -------------------------------------------------------------------
let modal: Web3Modal | undefined = undefined

// -- Lib ---------------------------------------------------------------------
export function createWeb3Modal(options: Omit<Web3ModalOptions, '_sdkVersion'>) {
  if (!modal) {
    modal = new Web3Modal({ ...options, _sdkVersion: `vue-wagmi-${VERSION}` })
  }

  return modal
}

export function useWeb3Modal() {
  if (!modal) {
    throw new Error('Please call "createWeb3Modal" before using "useWeb3Modal" composable')
  }

  async function open(options?: OpenOptions) {
    await modal?.open(options)
  }

  async function close() {
    await modal?.close()
  }

  return ref({
    open,
    close
  })
}

export { defaultWagmiConfig } from '../src/utils/defaultWagmiCoreConfig.js'

export type { DefaultConfigOptions } from '../src/utils/defaultWagmiCoreConfig.js'
