import { type ChainNamespace, ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import { OptionsController, RouterController } from '@reown/appkit-controllers'

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

  isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/gu.test(email)
  },

  validateReownName(name: string) {
    const sanitizedName = name.replace(/\^/gu, '').toLowerCase()

    return sanitizedName.replace(/[^a-zA-Z0-9]/gu, '')
  },

  hasFooter() {
    const view = RouterController.state.view

    if (ConstantsUtil.VIEWS_WITH_LEGAL_FOOTER.includes(view)) {
      const { termsConditionsUrl, privacyPolicyUrl } = OptionsController.state
      const legalCheckbox = OptionsController.state.features?.legalCheckbox
      const showOnlyBranding = (!termsConditionsUrl && !privacyPolicyUrl) || legalCheckbox

      if (showOnlyBranding) {
        return false
      }

      return true
    }

    return ConstantsUtil.VIEWS_WITH_DEFAULT_FOOTER.includes(view)
  }
}
