export type ColorType =
  | 'accent-100'
  | 'error-100'
  | 'fg-100'
  | 'fg-150'
  | 'fg-200'
  | 'fg-250'
  | 'fg-300'
  | 'inherit'
  | 'inverse-000'
  | 'inverse-100'
  | 'success-100'
  | 'gray-glass-005'
  | 'gray-glass-020'

export type TextType =
  | 'large-500'
  | 'large-600'
  | 'large-700'
  | 'medium-400'
  | 'medium-600'
  | 'medium-title-600'
  | 'micro-600'
  | 'title-6-600'
  | 'micro-700'
  | 'mini-700'
  | 'paragraph-400'
  | 'paragraph-500'
  | 'paragraph-600'
  | 'paragraph-700'
  | 'small-400'
  | 'small-500'
  | 'small-600'
  | 'tiny-400'
  | 'tiny-500'
  | 'tiny-600'
  | '2xl-500'

export type TextAlign = 'center' | 'left' | 'right'

export type LineClamp = '1' | '2'

export type SizeType = 'inherit' | 'xl' | 'lg' | 'md' | 'mdl' | 'sm' | 'xs' | 'xxs' | 'xxl'

export type SpacingType =
  | '0'
  | '1xs'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '3xs'
  | '4xs'
  | 'l'
  | '2l'
  | 'm'
  | 's'
  | 'xl'
  | 'xs'
  | 'xxl'
  | 'xxs'

export type BorderRadiusType = Exclude<SpacingType, '1xs' | 'xl' | 'xxl'> | 'xs'

export type FlexDirectionType = 'column-reverse' | 'column' | 'row-reverse' | 'row'

export type FlexWrapType = 'nowrap' | 'wrap-reverse' | 'wrap'

export type FlexBasisType = 'auto' | 'content' | 'fit-content' | 'max-content' | 'min-content'

export type FlexGrowType = '0' | '1'

export type FlexShrinkType = '0' | '1'

export type FlexAlignItemsType = 'baseline' | 'center' | 'flex-end' | 'flex-start' | 'stretch'

export type FlexJustifyContentType =
  | 'center'
  | 'flex-end'
  | 'flex-start'
  | 'space-around'
  | 'space-between'
  | 'space-evenly'

export interface IWalletImage {
  src: string
  walletName?: string
}

export type GridContentType =
  | 'center'
  | 'end'
  | 'space-around'
  | 'space-between'
  | 'space-evenly'
  | 'start'
  | 'stretch'

export type GridItemsType = 'center' | 'end' | 'start' | 'stretch'

export type IconType =
  | 'add'
  | 'allWallets'
  | 'arrowBottomCircle'
  | 'appStore'
  | 'chromeStore'
  | 'apple'
  | 'arrowBottom'
  | 'arrowLeft'
  | 'arrowRight'
  | 'arrowTop'
  | 'bank'
  | 'browser'
  | 'card'
  | 'checkmark'
  | 'checkmarkBold'
  | 'chevronBottom'
  | 'chevronLeft'
  | 'chevronRight'
  | 'chevronTop'
  | 'clock'
  | 'close'
  | 'coinPlaceholder'
  | 'compass'
  | 'copy'
  | 'cursor'
  | 'cursorTransparent'
  | 'desktop'
  | 'disconnect'
  | 'discord'
  | 'etherscan'
  | 'extension'
  | 'externalLink'
  | 'facebook'
  | 'farcaster'
  | 'filters'
  | 'github'
  | 'google'
  | 'helpCircle'
  | 'image'
  | 'id'
  | 'infoCircle'
  | 'lightbulb'
  | 'mail'
  | 'mobile'
  | 'more'
  | 'networkPlaceholder'
  | 'nftPlaceholder'
  | 'off'
  | 'playStore'
  | 'plus'
  | 'qrCode'
  | 'recycleHorizontal'
  | 'refresh'
  | 'search'
  | 'send'
  | 'swapHorizontal'
  | 'swapHorizontalBold'
  | 'swapHorizontalMedium'
  | 'swapHorizontalRoundedBold'
  | 'swapVertical'
  | 'telegram'
  | 'threeDots'
  | 'twitch'
  | 'twitter'
  | 'twitterIcon'
  | 'verify'
  | 'verifyFilled'
  | 'wallet'
  | 'walletConnect'
  | 'walletConnectLightBrown'
  | 'walletPlaceholder'
  | 'warningCircle'
  | 'x'
  | 'info'
  | 'exclamationTriangle'

export type VisualType =
  | 'browser'
  | 'meld'
  | 'coinbase'
  | 'dao'
  | 'defi'
  | 'defiAlt'
  | 'eth'
  | 'google'
  | 'layers'
  | 'lightbulb'
  | 'lock'
  | 'login'
  | 'network'
  | 'nft'
  | 'noun'
  | 'onrampCard'
  | 'profile'
  | 'system'
  | 'moonpay'
  | 'stripe'
  | 'paypal'
  | 'pencil'
  | 'solana'

export type VisualSize = 'sm' | 'md' | 'lg'

export type LogoType =
  | 'apple'
  | 'discord'
  | 'facebook'
  | 'github'
  | 'google'
  | 'more'
  | 'telegram'
  | 'twitch'
  | 'x'
  | 'farcaster'

export type PlacementType = 'bottom' | 'left' | 'right' | 'top'

export type ChipType = 'fill' | 'shade' | 'shadeSmall' | 'transparent' | 'success' | 'error'

export type ChipButtonVariant = 'accent' | 'main' | 'shade' | 'gray'

export type ButtonSize = 'lg' | 'md'

export type ButtonVariant =
  | 'main'
  | 'inverse'
  | 'accent'
  | 'accent-error'
  | 'accent-success'
  | 'neutral'

export type TransactionType =
  | 'approve'
  | 'bought'
  | 'borrow'
  | 'burn'
  | 'cancel'
  | 'claim'
  | 'deploy'
  | 'deposit'
  | 'execute'
  | 'mint'
  | 'receive'
  | 'repay'
  | 'send'
  | 'stake'
  | 'trade'
  | 'unstake'
  | 'withdraw'

// eslint-disable-next-line no-shadow
export enum TransactionTypePastTense {
  'approve' = 'approved',
  'bought' = 'bought',
  'borrow' = 'borrowed',
  'burn' = 'burnt',
  'cancel' = 'canceled',
  'claim' = 'claimed',
  'deploy' = 'deployed',
  'deposit' = 'deposited',
  'execute' = 'executed',
  'mint' = 'minted',
  'receive' = 'received',
  'repay' = 'repaid',
  'send' = 'sent',
  'sell' = 'sold',
  'stake' = 'staked',
  'trade' = 'swapped',
  'unstake' = 'unstaked',
  'withdraw' = 'withdrawn'
}

export type TransactionIconType =
  | 'arrowBottom'
  | 'arrowTop'
  | 'swapVertical'
  | 'swapHorizontalBold'
  | 'checkmark'
  | 'close'

export type CardSelectType = 'network' | 'wallet'

export type BackgroundType = 'opaque' | 'gray' | 'transparent'

export type TagType = 'main' | 'shade' | 'error' | 'success'

export type AccountEntryType = 'icon' | 'image'

export type ThemeType = 'dark' | 'light'

export type InputType =
  | 'button'
  | 'checkbox'
  | 'color'
  | 'date'
  | 'datetime-local'
  | 'email'
  | 'file'
  | 'hidden'
  | 'image'
  | 'month'
  | 'number'
  | 'password'
  | 'radio'
  | 'range'
  | 'reset'
  | 'search'
  | 'submit'
  | 'tel'
  | 'text'
  | 'time'
  | 'url'
  | 'week'

export interface ThemeVariables {
  '--w3m-font-family'?: string
  '--w3m-accent'?: string
  '--w3m-color-mix'?: string
  '--w3m-color-mix-strength'?: number
  '--w3m-font-size-master'?: string
  '--w3m-border-radius-master'?: string
  '--w3m-z-index'?: number
}

export type IconBoxBorderType = 'wui-color-bg-125' | 'wui-accent-glass-010'

export type TruncateType = 'start' | 'middle' | 'end'

export type WalletGuideType = 'get-started' | 'explore'

export type TruncateOptions = {
  string: string
  charsStart: number
  charsEnd: number
  truncate: TruncateType
}

export interface TokenInfo {
  address: `0x${string}`
  symbol: string
  name: string
  decimals: number
  logoURI: string
  domainVersion?: string
  eip2612?: boolean
  isFoT?: boolean
  tags?: string[]
}
