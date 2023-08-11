import { ref } from 'vue'
import type { Web3ModalOptions } from './client.js'
import { Web3Modal } from './client.js'

// -- Types -------------------------------------------------------------------
export type { Web3ModalOptions } from './client.js'

// -- Setup -------------------------------------------------------------------
let modal: Web3Modal | undefined = undefined

// -- Lib ---------------------------------------------------------------------
export function useWeb3Modal(options?: Web3ModalOptions) {
  if (!modal) {
    if (!options) {
      throw new Error('useWeb3Modal: options are required on first call')
    }
    modal = new Web3Modal(options)
  }

  const modalRef = ref({
    open: modal.open.bind(modal),
    close: modal.close.bind(modal)
  })

  return modalRef
}
