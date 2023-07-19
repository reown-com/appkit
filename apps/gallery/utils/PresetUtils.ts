import type {
  TextType,
  ColorType,
  FlexDirectionType,
  FlexWrapType,
  FlexBasisType,
  FlexGrowType,
  FlexShrinkType,
  FlexAlignItemsType,
  FlexJustifyContentType,
  BorderRadiusType,
  SpacingType,
  GridContentType,
  GridItemsType,
  IconType,
  PlacementType,
  ButtonType,
  ChipType,
  TransactionType,
  CardSelectType,
  BackgroundType,
  TagType,
  AccountEntryType,
  ThemeType
} from '@web3modal/ui/src/utils/TypesUtil'

export const colorOptions: ColorType[] = [
  'blue-100',
  'error-100',
  'fg-100',
  'fg-200',
  'fg-300',
  'inherit',
  'inverse-000',
  'inverse-100',
  'success-100'
]

export const textOptions: TextType[] = [
  'micro-700',
  'micro-600',
  'tiny-500',
  'tiny-600',
  'small-500',
  'small-600',
  'paragraph-500',
  'paragraph-600',
  'paragraph-700',
  'large-500',
  'large-600',
  'large-700'
]

export const flexDirectionOptions: FlexDirectionType[] = [
  'column-reverse',
  'column',
  'row-reverse',
  'row'
]

export const flexWrapOptions: FlexWrapType[] = ['nowrap', 'wrap-reverse', 'wrap']

export const flexBasisOptions: FlexBasisType[] = [
  'auto',
  'content',
  'fit-content',
  'max-content',
  'min-content'
]

export const flexGrowOptions: FlexGrowType[] = ['0', '1']

export const flexShrinkOptions: FlexShrinkType[] = ['0', '1']

export const flexAlignItemsOptions: FlexAlignItemsType[] = [
  'baseline',
  'center',
  'flex-end',
  'flex-start',
  'stretch'
]

export const flexJustifyContentOptions: FlexJustifyContentType[] = [
  'center',
  'flex-end',
  'flex-start',
  'space-around',
  'space-between',
  'space-evenly'
]

export const gridContentOptions: GridContentType[] = [
  'center',
  'end',
  'space-around',
  'space-between',
  'space-evenly',
  'start',
  'stretch'
]

export const walletImagesOptions = [
  {
    src: 'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/7a33d7f1-3d12-4b5c-f3ee-5cd83cb1b500?projectId=a8d876c6f91c3748db621583fad358f1',
    walletName: 'Rainbow'
  },
  {
    src: 'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/f216b371-96cf-409a-9d88-296392b85800?projectId=f63a70d1bd9dd78b5eb556c25d11cf05',
    walletName: 'Zerion'
  },
  {
    src: 'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/a7f416de-aa03-4c5e-3280-ab49269aef00?projectId=f63a70d1bd9dd78b5eb556c25d11cf05',
    walletName: 'Ledger'
  },
  {
    src: 'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/7e1514ba-932d-415d-1bdb-bccb6c2cbc00?projectId=f63a70d1bd9dd78b5eb556c25d11cf05',
    walletName: 'Fireblocks'
  }
]

export const walletImageSrc =
  'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/7a33d7f1-3d12-4b5c-f3ee-5cd83cb1b500?projectId=a8d876c6f91c3748db621583fad358f1'

export const networkImageSrc =
  'https://explorer-api.walletconnect.com/w3m/v1/getAssetImage/692ed6ba-e569-459a-556a-776476829e00?projectId=a8d876c6f91c3748db621583fad358f1'

export const avatarImageSrc =
  'https://i.seadn.io/gcs/files/007a5af0d93d561f87c8d026ddd5179e.png?auto=format&dpr=1&w=1000'

export const externalLink = 'https://www.fireblocks.com'

export const address = '0xDBbD65026a07cFbFa1aa92744E4D69951686077d'

export const gridItemsOptions: GridItemsType[] = ['center', 'end', 'start', 'stretch']

export const borderRadiusOptions: BorderRadiusType[] = ['4xs', '3xs', 'xxs', 'xs', 's', 'm', 'l']

export const spacingOptions: SpacingType[] = ['4xs', '3xs', 'xxs', 'xs', 's', 'm', 'l', 'xl', '3xl']

export const iconOptions: IconType[] = [
  'arrowBottom',
  'arrowLeft',
  'arrowRight',
  'arrowTop',
  'browser',
  'checkmark',
  'chevronBottom',
  'chevronLeft',
  'chevronRight',
  'chevronTop',
  'clock',
  'close',
  'coinPlaceholder',
  'compass',
  'copy',
  'cursor',
  'desktop',
  'disconnect',
  'etherscan',
  'externalLink',
  'filters',
  'helpCircle',
  'infoCircle',
  'mail',
  'mobile',
  'networkPlaceholder',
  'nftPlaceholder',
  'off',
  'search',
  'swap',
  'twitter',
  'wallet',
  'walletConnect',
  'walletPlaceholder',
  'warningCircle'
]

export const placementOptions: PlacementType[] = ['top', 'right', 'bottom', 'left']

export const chipOptions: ChipType[] = ['fill', 'transparent', 'shade']

export const buttonOptions: ButtonType[] = ['fill', 'accent', 'shade']

export const transactionOptions: TransactionType[] = [
  'bought',
  'buy',
  'deposited',
  'minted',
  'received',
  'nftSent',
  'cryptoSent',
  'swapped',
  'withdrawed'
]

export const cardSelectOptions: CardSelectType[] = ['network', 'wallet']

export const backgroundOptions: BackgroundType[] = ['opaque', 'transparent']

export const tagOptions: TagType[] = ['main', 'shade']

export const accountEntryOptions: AccountEntryType[] = ['icon', 'image']

export const themeOptions: ThemeType[] = ['dark', 'light']
