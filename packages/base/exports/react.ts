import { AppKit } from '../src/client.js'
import type { AppKitOptions } from '../src/utils/TypesUtil.js'
import { getWeb3Modal } from '../src/library/react/index.js'

// -- Views ------------------------------------------------------------
export * from '@rerock/scaffold-ui'

// -- Hooks ------------------------------------------------------------
export * from '../src/library/react/index.js'

// -- Utils & Other -----------------------------------------------------
export * from '../src/utils/index.js'
export type * from '@rerock/core'
export { CoreHelperUtil, AccountController, NetworkController } from '@rerock/core'

export let modal: AppKit | undefined = undefined

type CreateWeb3Modal = Omit<AppKitOptions, 'sdkType' | 'sdkVersion'>

export function createWeb3Modal(options: CreateWeb3Modal) {
  if (!modal) {
    modal = new AppKit(options)
    getWeb3Modal(modal)
  }

  return modal
}

export { AppKit }
export type { AppKitOptions }

// -- Hooks ------------------------------------------------------------
export * from '../src/library/react/index.js'
export { useWeb3ModalAccount, useWeb3ModalNetwork } from '@rerock/core/react'
