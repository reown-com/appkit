import { ConstantsUtil } from '@reown/appkit-core'
import { ThemeMode } from '@reown/appkit/react'

export const defaultCustomizationConfig = {
  features: ConstantsUtil.DEFAULT_FEATURES,
  collapseWallets: false,
  enableWallets: true,
  themeMode: 'dark' as ThemeMode,
  themeVariables: {},
  termsConditionsUrl: 'https://reown.com/terms-of-service',
  privacyPolicyUrl: 'https://reown.com/privacy-policy',
  experimental_enableEmbedded: true
}
