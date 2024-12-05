import type {
  AccountEntryType,
  BackgroundType,
  BorderRadiusType,
  ButtonVariant,
  CardSelectType,
  ChipButtonVariant,
  ChipType,
  TextColorType,
  FlexAlignItemsType,
  FlexBasisType,
  FlexDirectionType,
  FlexGrowType,
  FlexJustifyContentType,
  FlexShrinkType,
  FlexWrapType,
  GridContentType,
  GridItemsType,
  IconBoxBorderType,
  IconType,
  LogoType,
  PlacementType,
  ButtonShortcutVariant,
  SpacingType,
  TagVariant,
  TextAlign,
  TextType,
  ThemeType,
  TransactionType,
  VisualType,
  ButtonLinkVariant,
  DomainChipVariant,
  ToastMessageVariant
} from '@reown/appkit-ui-new/src/utils/TypeUtil'
import type { TransactionStatus, TransactionDirection } from '@reown/appkit-common'

export const textColorOptions: TextColorType[] = [
  'primary',
  'secondary',
  'tertiary',
  'invert',
  'error',
  'warning',
  'accent-primary'
]

export const iconColorOptions = ['accent', 'inverse']

// @TODO: Deprecate this
export const colorOptions = iconColorOptions

export const backgroundColorOptions = ['foregroundSecondary', 'foregroundAccent010']

export const textOptions: TextType[] = [
  'h1-regular-mono',
  'h1-regular',
  'h1-medium',
  'h2-regular-mono',
  'h2-regular',
  'h2-medium',
  'h3-regular-mono',
  'h3-regular',
  'h3-medium',
  'h4-regular-mono',
  'h4-regular',
  'h4-medium',
  'h5-regular-mono',
  'h5-regular',
  'h5-medium',
  'h6-regular-mono',
  'h6-regular',
  'h6-medium',
  'lg-regular-mono',
  'lg-regular',
  'lg-medium',
  'md-regular-mono',
  'md-regular',
  'md-medium',
  'sm-regular-mono',
  'sm-regular',
  'sm-medium'
]

export const textAlignOptions: TextAlign[] = ['center', 'left', 'right']

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
    src: 'https://explorer-api.walletconnect.org/v3/logo/md/018b2d52-10e9-4158-1fde-a5d5bac5aa00?projectId=c1781fc385454899a2b1385a2b83df3b',
    walletName: 'MetaMask'
  },
  {
    src: 'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/7a33d7f1-3d12-4b5c-f3ee-5cd83cb1b500?projectId=c1781fc385454899a2b1385a2b83df3b',
    walletName: 'Rainbow'
  },
  {
    src: 'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/f216b371-96cf-409a-9d88-296392b85800?projectId=c1781fc385454899a2b1385a2b83df3b',
    walletName: 'Zerion'
  },
  {
    src: 'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/a7f416de-aa03-4c5e-3280-ab49269aef00?projectId=c1781fc385454899a2b1385a2b83df3b',
    walletName: 'Ledger'
  },
  {
    src: 'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/7e1514ba-932d-415d-1bdb-bccb6c2cbc00?projectId=c1781fc385454899a2b1385a2b83df3b',
    walletName: 'Fireblocks'
  }
]

export const walletImageSrc =
  'https://explorer-api.walletconnect.com/w3m/v1/getWalletImage/7a33d7f1-3d12-4b5c-f3ee-5cd83cb1b500?projectId=c1781fc385454899a2b1385a2b83df3b'

export const networkImageSrc =
  'https://explorer-api.walletconnect.com/w3m/v1/getAssetImage/692ed6ba-e569-459a-556a-776476829e00?projectId=c1781fc385454899a2b1385a2b83df3b'

export const networkImages = [
  'https://explorer-api.walletconnect.com/w3m/v1/getAssetImage/692ed6ba-e569-459a-556a-776476829e00?projectId=c1781fc385454899a2b1385a2b83df3b',
  'https://explorer-api.walletconnect.com/w3m/v1/getAssetImage/30c46e53-e989-45fb-4549-be3bd4eb3b00?projectId=c1781fc385454899a2b1385a2b83df3b',
  'https://explorer-api.walletconnect.com/w3m/v1/getAssetImage/93564157-2e8e-4ce7-81df-b264dbee9b00?projectId=c1781fc385454899a2b1385a2b83df3b',
  'https://explorer-api.walletconnect.com/w3m/v1/getAssetImage/ab9c186a-c52f-464b-2906-ca59d760a400?projectId=c1781fc385454899a2b1385a2b83df3b',
  'https://explorer-api.walletconnect.com/w3m/v1/getAssetImage/41d04d42-da3b-4453-8506-668cc0727900?projectId=c1781fc385454899a2b1385a2b83df3b'
]

export const avatarImageSrc =
  'https://i.seadn.io/gcs/files/007a5af0d93d561f87c8d026ddd5179e.png?auto=format&dpr=1&w=1000'

export const transactionImageSrc =
  'https://uploads-ssl.webflow.com/61fe6bb74158b468a1112105/61fe8900148b6e6ee7c2c4e4_Profile%20Pic_Smoker-p-500.jpeg'

export const externalLink = 'https://www.fireblocks.com'

export const address = '0xDBbD65026a07cFbFa1aa92744E4D69951686077d'

export const gridItemsOptions: GridItemsType[] = ['center', 'end', 'start', 'stretch']

export const borderRadiusOptions: BorderRadiusType[] = ['4xs', '3xs', 'xxs', 'xs', 's', 'm', 'l']

export const spacingOptions: SpacingType[] = [
  '4xs',
  '3xs',
  'xxs',
  'xs',
  's',
  'm',
  'l',
  '2l',
  'xl',
  '3xl'
]

export const toastMessageOptions: ToastMessageVariant[] = ['info', 'success', 'warning', 'error']

export const iconOptions: IconType[] = [
  'allWallets',
  'apple',
  'arrowBottom',
  'arrowLeft',
  'arrowRight',
  'arrowTop',
  'browser',
  'checkmark',
  'checkmarkVerified',
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
  'discord',
  'etherscan',
  'extension',
  'externalLink',
  'facebook',
  'filters',
  'github',
  'google',
  'helpCircle',
  'infoCircle',
  'mail',
  'mobile',
  'networkPlaceholder',
  'nftPlaceholder',
  'off',
  'qrCode',
  'refresh',
  'search',
  'swapHorizontal',
  'swapVertical',
  'telegram',
  'twitch',
  'twitterIcon',
  'twitter',
  'verify',
  'verifyFilled',
  'wallet',
  'walletConnect',
  'walletPlaceholder',
  'warningCircle'
]

export const visualOptions: VisualType[] = [
  'browser',
  'dao',
  'defi',
  'defiAlt',
  'eth',
  'layers',
  'lock',
  'login',
  'network',
  'nft',
  'noun',
  'profile',
  'system',
  'coinbase',
  'stripe',
  'moonpay',
  'paypal'
]

export const logoOptions: LogoType[] = [
  'apple',
  'discord',
  'facebook',
  'github',
  'google',
  'telegram',
  'twitch',
  'x'
]

export const placementOptions: PlacementType[] = ['top', 'right', 'bottom', 'left']

export const chipButtonVariants: ChipButtonVariant[] = ['main', 'accent', 'primary']

export const domainChipVariants: DomainChipVariant[] = ['success', 'warning', 'error']

export const chipVariants: ChipType[] = [
  'fill',
  'transparent',
  'shade',
  'success',
  'shadeSmall',
  'error'
]

export const buttonOptions: ButtonVariant[] = [
  'accent-primary',
  'accent-secondary',
  'neutral-primary',
  'neutral-secondary',
  'error-primary',
  'error-secondary'
]

export const buttonShortcutOptions: ButtonShortcutVariant[] = ['accent', 'secondary']

export const buttonLinkOptions: ButtonLinkVariant[] = ['accent', 'secondary']

export const transactionTypeOptions: TransactionType[] = [
  'approve',
  'bought',
  'borrow',
  'burn',
  'cancel',
  'claim',
  'deploy',
  'deposit',
  'execute',
  'mint',
  'receive',
  'repay',
  'send',
  'stake',
  'trade',
  'unstake',
  'withdraw'
]

export const transactionDirectionOptions: TransactionDirection[] = ['in', 'out']

export const transactionStatusOptions: TransactionStatus[] = ['confirmed', 'pending', 'failed']

export const cardSelectOptions: CardSelectType[] = ['network', 'wallet']

export const backgroundOptions: BackgroundType[] = ['opaque', 'transparent']

export const tagOptions: TagVariant[] = [
  'accent',
  'info',
  'success',
  'warning',
  'error',
  'certified'
]

export const accountEntryOptions: AccountEntryType[] = ['icon', 'image']

export const themeOptions: ThemeType[] = ['dark', 'light']

export const iconBoxBorderOptions: IconBoxBorderType[] = [
  'wui-color-bg-125',
  'wui-accent-glass-010'
]

export const signTypedData = {
  domain: {
    name: 'Ether Mail',
    version: '1',
    chainId: 1,
    verifyingContract: '0xcccccccccccccccccccccccccccccccccccccccc'
  },
  primaryType: 'Mail',
  types: {
    EIP712Domain: [
      {
        name: 'name',
        type: 'string'
      },
      {
        name: 'version',
        type: 'string'
      },
      {
        name: 'chainId',
        type: 'uint256'
      },
      {
        name: 'verifyingContract',
        type: 'address'
      }
    ],
    Person: [
      {
        name: 'name',
        type: 'string'
      },
      {
        name: 'wallet',
        type: 'address'
      }
    ],
    Mail: [
      {
        name: 'from',
        type: 'Person'
      },
      {
        name: 'to',
        type: 'Person'
      },
      {
        name: 'contents',
        type: 'string'
      }
    ]
  },
  message: {
    from: {
      name: 'Cow',
      wallet: '0xcd2a3d9f938e13cd947ec05abc7fe734df8dd826'
    },
    to: {
      name: 'Bob',
      wallet: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    },
    contents: 'Hello, Bob!'
  }
}
