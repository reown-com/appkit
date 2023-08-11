import type { Web3ModalOptions } from './client.js'
import { Web3Modal as Web3ModalCore } from './client.js'

// -- Types -------------------------------------------------------------------
export type Web3ModalProps = Web3ModalOptions

// -- Setup -------------------------------------------------------------------
let modal: Web3ModalCore | undefined = undefined

// -- Lib ---------------------------------------------------------------------
export const Web3Modal = {
  props: ['projectId', 'wagmiConfig', 'chains'] satisfies (keyof Web3ModalProps)[],

  setup(props: Web3ModalProps) {
    modal = new Web3ModalCore(props)
  },

  render() {
    return null
  }
}

export function useWeb3Modal() {
  return (() => modal)()
}
