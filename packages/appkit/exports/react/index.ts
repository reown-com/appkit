import type { OptionsControllerState } from '@web3modal/core'
import { AppKit } from '../../src/client'
import { getAppKit } from './hooks'

// -- Views ------------------------------------------------------------
export * from '@web3modal/scaffold-ui'

// -- Hooks ------------------------------------------------------------
export * from './hooks'

// -- Utils & Other -----------------------------------------------------
export type * from '@web3modal/core'
export { CoreHelperUtil } from '@web3modal/core'

let modal: AppKit | undefined = undefined

export function createAppKit(options: OptionsControllerState) {
  if (!modal) {
    modal = new AppKit({ ...options })
    getAppKit(modal)
  }

  return modal
}
