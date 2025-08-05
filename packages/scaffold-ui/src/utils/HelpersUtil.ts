import { type ChainNamespace, ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import { OptionsController } from '@reown/appkit-controllers'

import { ConstantsUtil } from './ConstantsUtil.js'

export const HelpersUtil = {
  getTabsByNamespace(namespace?: ChainNamespace) {
    const isEVM = Boolean(namespace) && namespace === CommonConstantsUtil.CHAIN.EVM

    if (!isEVM) {
      return []
    }

    if (OptionsController.state.remoteFeatures?.activity === false) {
      return ConstantsUtil.ACCOUNT_TABS.filter(tab => tab.label !== 'Activity')
    }

    return ConstantsUtil.ACCOUNT_TABS
  },
  isValidReownName(name: string) {
    return /^[a-zA-Z0-9]+$/gu.test(name)
  },
  validateReownName(name: string) {
    const sanitizedName = name.replace(/\^/gu, '').toLowerCase()

    return sanitizedName.replace(/[^a-zA-Z0-9]/gu, '')
  }
}
