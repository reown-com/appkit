import type { OptionsControllerState } from '@web3modal/core'
import { AppKit } from '../src/client'

// -- Views ------------------------------------------------------------
export * from '@web3modal/scaffold-ui'

// -- Utils & Other -----------------------------------------------------
export type * from '@web3modal/core'
export { CoreHelperUtil } from '@web3modal/core'

export function createAppKit(options: OptionsControllerState) {
  return new AppKit({ ...options })
}

export { AppKit }
