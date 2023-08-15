import { ref } from 'vue'
import type { Web3ModalOptions } from './client.js'
import { Web3Modal } from './client.js'

// -- Types -------------------------------------------------------------------
export type { Web3ModalOptions } from './client.js'

// -- Setup -------------------------------------------------------------------
let modal: Web3Modal | undefined = undefined

// -- Lib ---------------------------------------------------------------------
export function createWeb3Modal(options: Web3ModalOptions) {
  if (!modal) {
    modal = new Web3Modal(options)
  }

  return modal
}

export function useWeb3Modal() {
  if (!modal) {
    throw new Error('Please call "createWeb3Modal" before using "useWeb3Modal" composable')
  }

  const modalRef = ref({
    open: modal.open.bind(modal),
    close: modal.close.bind(modal)
  })

  return modalRef
}
