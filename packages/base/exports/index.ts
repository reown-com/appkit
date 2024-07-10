import { ConstantsUtil } from '@web3modal/scaffold-utils'
import { AppKit } from '../src/client.js'
import type { AppKitOptions } from '../utils/TypesUtil.js'

// -- Views ------------------------------------------------------------
export * from '@web3modal/scaffold-ui'

// -- Utils & Other -----------------------------------------------------
export type * from '@web3modal/core'
export { CoreHelperUtil } from '@web3modal/core'

export function createWeb3Modal(options: AppKitOptions) {
  return new AppKit({ ...options, sdkVersion: `html-multichain-${ConstantsUtil.VERSION}` })
}

export { AppKit }
export type { AppKitOptions }
