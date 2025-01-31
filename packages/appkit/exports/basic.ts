import { CoreHelperUtil } from '@reown/appkit-core'

import { AppKit } from '../src/client/appkit-basic.js'
import type { AppKitOptions } from '../src/utils/TypesUtil.js'
import { PACKAGE_VERSION } from './constants.js'

// -- Utils & Other -----------------------------------------------------
export type * from '@reown/appkit-core'
export type { CaipNetwork, CaipAddress, CaipNetworkId } from '@reown/appkit-common'

export type CreateAppKit = Omit<AppKitOptions, 'sdkType' | 'sdkVersion' | 'basic'>

export function createAppKit(options: CreateAppKit) {
  return new AppKit({
    ...options,
    basic: true,
    sdkVersion: CoreHelperUtil.generateSdkVersion(options.adapters ?? [], 'html', PACKAGE_VERSION)
  })
}

export { AppKit }
export type { AppKitOptions }
