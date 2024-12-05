import type { ConstantsUtil } from './ConstantsUtil.js'

type SocialProvider = 'google' | 'github' | 'apple' | 'facebook' | 'x' | 'discord' | 'farcaster'

export type WalletButtonType =
  | keyof typeof ConstantsUtil.WalletButtonsIds
  | SocialProvider
  | 'walletConnect'
