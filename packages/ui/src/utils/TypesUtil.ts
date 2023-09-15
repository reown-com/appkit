export type ColorType =
  | 'accent-100'
  | 'error-100'
  | 'fg-100'
  | 'fg-200'
  | 'fg-250'
  | 'fg-300'
  | 'inherit'
  | 'inverse-000'
  | 'inverse-100'
  | 'success-100'

export type TextType =
  | 'large-500'
  | 'large-600'
  | 'large-700'
  | 'micro-600'
  | 'micro-700'
  | 'paragraph-500'
  | 'paragraph-600'
  | 'paragraph-700'
  | 'small-500'
  | 'small-600'
  | 'tiny-500'
  | 'tiny-600'

export type TextAlign = 'center' | 'left' | 'right'

export type SizeType = 'inherit' | 'lg' | 'md' | 'sm' | 'xs' | 'xxs'

export type SpacingType =
  | '0'
  | '1xs'
  | '3xl'
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

export type BorderRadiusType = Exclude<SpacingType, 'xl' | 'xxl'>

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
  | 'allWallets'
  | 'apple'
  | 'arrowBottom'
  | 'arrowLeft'
  | 'arrowRight'
  | 'arrowTop'
  | 'browser'
  | 'checkmark'
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
  | 'desktop'
  | 'disconnect'
  | 'discord'
  | 'etherscan'
  | 'extension'
  | 'externalLink'
  | 'facebook'
  | 'filters'
  | 'github'
  | 'google'
  | 'helpCircle'
  | 'infoCircle'
  | 'mail'
  | 'mobile'
  | 'networkPlaceholder'
  | 'nftPlaceholder'
  | 'off'
  | 'qrCode'
  | 'refresh'
  | 'search'
  | 'swapHorizontal'
  | 'swapVertical'
  | 'telegram'
  | 'twitch'
  | 'twitter'
  | 'twitterIcon'
  | 'wallet'
  | 'walletConnect'
  | 'walletPlaceholder'
  | 'warningCircle'

export type VisualType =
  | 'browser'
  | 'dao'
  | 'defi'
  | 'defiAlt'
  | 'eth'
  | 'layers'
  | 'lock'
  | 'login'
  | 'network'
  | 'nft'
  | 'noun'
  | 'profile'
  | 'system'

export type LogoType =
  | 'apple'
  | 'discord'
  | 'facebook'
  | 'github'
  | 'google'
  | 'telegram'
  | 'twitch'
  | 'twitter'

export type PlacementType = 'bottom' | 'left' | 'right' | 'top'

export type ChipType = 'fill' | 'shade' | 'transparent'

export type ButtonType = 'accent' | 'fill' | 'shade' | 'fullWidth'

export type TransactionType =
  | 'bought'
  | 'buy'
  | 'cryptoSent'
  | 'deposited'
  | 'minted'
  | 'nftSent'
  | 'received'
  | 'swapped'
  | 'withdrawed'

export type TransactionIconType = 'arrowBottom' | 'arrowTop' | 'swapVertical' | 'swapHorizontal'

export type CardSelectType = 'network' | 'wallet'

export type BackgroundType = 'opaque' | 'transparent'

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
