import { AppKit } from '../src/client'
import type { AppKitOptions } from '../utils/TypesUtil'

// -- Views ------------------------------------------------------------
export * from '@web3modal/scaffold-ui'

// -- Utils & Other -----------------------------------------------------
export type * from '@web3modal/core'
export { CoreHelperUtil } from '@web3modal/core'

export function createAppKit(options: AppKitOptions) {
  return new AppKit({ ...options })
}

export { AppKit }
