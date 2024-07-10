import { ConstantsUtil } from '@web3modal/scaffold-utils'
import { getWeb3Modal } from '@web3modal/scaffold-react'
import { AppKit } from '../src/client.js'
import type { AppKitOptions } from '../utils/TypesUtil.js'

// -- Views ------------------------------------------------------------
export * from '@web3modal/scaffold-ui'

// -- Hooks ------------------------------------------------------------
export * from '@web3modal/scaffold-react'

// -- Utils & Other -----------------------------------------------------
export type * from '@web3modal/core'
export { CoreHelperUtil } from '@web3modal/core'

let modal: AppKit | undefined = undefined

export function createWeb3Modal(options: AppKitOptions) {
  if (!modal) {
    modal = new AppKit({ ...options, sdkVersion: `react-multichain-${ConstantsUtil.VERSION}` })
    getWeb3Modal(modal)
  }

  return modal
}

export { AppKit }
export type { AppKitOptions }
