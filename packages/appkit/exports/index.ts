import { AppKit } from '../src/client.js'
import type { AppKitOptions } from '../src/utils/TypesUtil.js'
import packageJson from '../package.json' assert { type: 'json' }

// -- Views ------------------------------------------------------------
export * from '@reown/appkit-scaffold-ui'

// -- Utils & Other -----------------------------------------------------
export * from '../src/utils/index.js'
export type * from '@reown/appkit-core'
export type { CaipNetwork, CaipAddress, CaipNetworkId } from '@reown/appkit-common'
export { CoreHelperUtil, AccountController, NetworkController } from '@reown/appkit-core'

type CreateWeb3Modal = Omit<AppKitOptions, 'sdkType' | 'sdkVersion'>

export function createWeb3Modal(options: CreateWeb3Modal) {
  return new AppKit({
    ...options,
    sdkVersion: `html-multichain-${packageJson.version}`
  })
}

export { AppKit }
export type { AppKitOptions }
