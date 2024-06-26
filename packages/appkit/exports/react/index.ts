import { AppKit } from '../../src/client'
import { getAppKit } from './hooks'
import type { AppKitOptions } from '../../utils/TypesUtil'

// -- Views ------------------------------------------------------------
export * from '@web3modal/scaffold-ui'

// -- Hooks ------------------------------------------------------------
export * from './hooks'

// -- Utils & Other -----------------------------------------------------
export type * from '@web3modal/core'
export { CoreHelperUtil } from '@web3modal/core'

let modal: AppKit | undefined = undefined

export function createAppKit(options: AppKitOptions) {
  if (!modal) {
    modal = new AppKit({ ...options })
    getAppKit(modal)
  }

  return modal
}
