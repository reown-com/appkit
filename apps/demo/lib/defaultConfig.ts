import { ConstantsUtil, type ThemeMode } from '@reown/appkit-controllers'

export const defaultCustomizationConfig = {
  features: ConstantsUtil.DEFAULT_FEATURES,
  collapseWallets: false,
  enableWallets: true,
  themeMode: 'dark' as ThemeMode,
  themeVariables: {},
  termsConditionsUrl: 'https://reown.com/terms-of-service',
  privacyPolicyUrl: 'https://reown.com/privacy-policy',
  enableEmbedded: true
}
