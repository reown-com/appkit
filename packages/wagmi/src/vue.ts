import type { Web3ModalOptions } from './client.js'
import { Web3Modal as Web3ModalCore } from './client.js'

let modal: Web3ModalCore | undefined = undefined

export const Web3Modal = {
  props: ['projectId', 'wagmiConfig', 'chains'] as (keyof Web3ModalOptions)[],

  setup(props: Web3ModalOptions) {
    modal = new Web3ModalCore(props)
  },

  render() {
    return null
  }
}

export function useWeb3Modal() {
  if (!modal) {
    throw new Error('useWeb3Modal function used before <Web3Modal /> component was mounted')
  }

  return modal
}
