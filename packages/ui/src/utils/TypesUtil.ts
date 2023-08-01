export type ColorType =
  | 'blue-100'
  | 'error-100'
  | 'fg-100'
  | 'fg-200'
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

export type TagType = 'main' | 'shade'

export type AccountEntryType = 'icon' | 'image'

export type ThemeType = 'dark' | 'light'
