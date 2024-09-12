import { ConstantsUtil } from '@rerock/scaffold-utils'
import { AppKit } from '../src/client.js'
import type { AppKitOptions } from '../src/utils/TypesUtil.js'

// -- Views ------------------------------------------------------------
export * from '@rerock/scaffold-ui'

// -- Utils & Other -----------------------------------------------------
export * from '../src/utils/index.js'
export type * from '@rerock/appkit-core'
export type { CaipNetwork, CaipAddress, CaipNetworkId } from '@rerock/appkit-common'
export { CoreHelperUtil, AccountController, NetworkController } from '@rerock/appkit-core'

type CreateWeb3Modal = Omit<AppKitOptions, 'sdkType' | 'sdkVersion'>

export function createWeb3Modal(options: CreateWeb3Modal) {
  return new AppKit({
    ...options,
    sdkVersion: `html-multichain-${ConstantsUtil.VERSION}`
  })
}

export { AppKit }
export type { AppKitOptions }
