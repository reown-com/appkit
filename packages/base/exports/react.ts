import { AppKit } from '../src/client.js'
import type { AppKitOptions } from '../src/utils/TypesUtil.js'
import { getWeb3Modal } from '../src/library/react/index.js'
import { ConstantsUtil } from '@web3modal/scaffold-utils'

// -- Views ------------------------------------------------------------
export * from '@web3modal/scaffold-ui'

// -- Hooks ------------------------------------------------------------
export * from '../src/library/react/index.js'

// -- Utils & Other -----------------------------------------------------
export * from '../src/utils/index.js'
export type * from '@web3modal/core'
export type { CaipNetwork, CaipAddress, CaipNetworkId } from '@web3modal/common'
export { CoreHelperUtil, AccountController, NetworkController } from '@web3modal/core'

export let modal: AppKit | undefined = undefined

type CreateWeb3Modal = Omit<AppKitOptions, 'sdkType' | 'sdkVersion'>

export function createWeb3Modal(options: CreateWeb3Modal) {
  if (!modal) {
    modal = new AppKit({ ...options, sdkVersion: `react-multichain-${ConstantsUtil.VERSION}` })
    getWeb3Modal(modal)
  }

  return modal
}

export { AppKit }
export type { AppKitOptions }

// -- Hooks ------------------------------------------------------------
export * from '../src/library/react/index.js'
export { useWeb3ModalAccount, useWeb3ModalNetwork } from '@web3modal/core/react'
