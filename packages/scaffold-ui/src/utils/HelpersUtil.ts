import { type ChainNamespace, ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'

import { ConstantsUtil } from './ConstantsUtil.js'

export const HelpersUtil = {
  getTabsByNamespace(namespace?: ChainNamespace) {
    const isEVM = Boolean(namespace) && namespace === CommonConstantsUtil.CHAIN.EVM

    if (!isEVM) {
      return []
    }

    return ConstantsUtil.ACCOUNT_TABS
  }
}
