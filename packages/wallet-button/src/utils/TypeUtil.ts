import type { ConstantsUtil } from './ConstantsUtil.js'

export type SocialProvider = (typeof ConstantsUtil.Socials)[number]
export type Wallet =
  | keyof typeof ConstantsUtil.WalletButtonsIds
  | SocialProvider
  | 'walletConnect'
  | 'email'
