import { AppKit } from '../../src/client.js'
import { getAppKit } from './hooks.js'
import type { AppKitOptions } from '../../utils/TypesUtil.js'

// -- Views ------------------------------------------------------------
export * from '@web3modal/scaffold-ui'

// -- Hooks ------------------------------------------------------------
export * from './hooks.js'

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
