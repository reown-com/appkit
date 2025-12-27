import type { TemplateResult } from 'lit'
import { LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import { html, unsafeStatic } from 'lit/static-html.js'

import { appStoreSvg } from '../../assets/svg/app-store.js'
import { appleSvg } from '../../assets/svg/apple.js'
import { bitcoinSvg } from '../../assets/svg/bitcoin.js'
import { chromeStoreSvg } from '../../assets/svg/chrome-store.js'
import { coinsSvg } from '../../assets/svg/coins.js'
import { cursorSvg } from '../../assets/svg/cursor.js'
import { discordSvg } from '../../assets/svg/discord.js'
import { ethereumSvg } from '../../assets/svg/ethereum.js'
import { etherscanSvg } from '../../assets/svg/etherscan.js'
import { facebookSvg } from '../../assets/svg/facebook.js'
import { farcasterSvg } from '../../assets/svg/farcaster.js'
import { githubSvg } from '../../assets/svg/github.js'
import { googleSvg } from '../../assets/svg/google.js'
import { infoSealSvg } from '../../assets/svg/info.js'
import { paperPlaneTitleSvg } from '../../assets/svg/paper-plane-titl.js'
import { playStoreSvg } from '../../assets/svg/play-store.js'
import { reownSvg } from '../../assets/svg/reown-logo.js'
import { solanaSvg } from '../../assets/svg/solana.js'
import { telegramSvg } from '../../assets/svg/telegram.js'
import { tonSvg } from '../../assets/svg/ton.js'
import { twitchSvg } from '../../assets/svg/twitch.js'
import { twitterIconSvg } from '../../assets/svg/twitterIcon.js'
import {
  walletConnectBrownSvg,
  walletConnectInvertSvg,
  walletConnectLightBrownSvg,
  walletConnectSvg
} from '../../assets/svg/walletconnect.js'
import { xSvg } from '../../assets/svg/x.js'
import { vars } from '../../utils/ThemeHelperUtil.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import type { IconColorType, IconSizeType, IconType, IconWeightType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

// -- Phosphor Icons Mapping -------------------------------- //
const phosphorIconsMap: Record<string, string> = {
  add: 'ph-plus',
  allWallets: 'ph-dots-three',
  arrowBottom: 'ph-arrow-down',
  arrowBottomCircle: 'ph-arrow-circle-down',
  arrowClockWise: 'ph-arrow-clockwise',
  arrowLeft: 'ph-arrow-left',
  arrowRight: 'ph-arrow-right',
  arrowTop: 'ph-arrow-up',
  arrowTopRight: 'ph-arrow-up-right',
  bank: 'ph-bank',
  bin: 'ph-trash',
  browser: 'ph-browser',
  card: 'ph-credit-card',
  checkmark: 'ph-check',
  checkmarkBold: 'ph-check',
  chevronBottom: 'ph-caret-down',
  chevronLeft: 'ph-caret-left',
  chevronRight: 'ph-caret-right',
  chevronTop: 'ph-caret-up',
  clock: 'ph-clock',
  close: 'ph-x',
  coinPlaceholder: 'ph-circle-half',
  compass: 'ph-compass',
  copy: 'ph-copy',
  desktop: 'ph-desktop',
  dollar: 'ph-currency-dollar',
  download: 'ph-vault',
  exclamationCircle: 'ph-warning-circle',
  extension: 'ph-puzzle-piece',
  externalLink: 'ph-arrow-square-out',
  filters: 'ph-funnel-simple',
  helpCircle: 'ph-question',
  id: 'ph-identification-card',
  image: 'ph-image',
  info: 'ph-info',
  lightbulb: 'ph-lightbulb',
  mail: 'ph-envelope',
  mobile: 'ph-device-mobile',
  more: 'ph-dots-three',
  networkPlaceholder: 'ph-globe',
  nftPlaceholder: 'ph-image',
  plus: 'ph-plus',
  power: 'ph-power',
  qrCode: 'ph-qr-code',
  questionMark: 'ph-question',
  refresh: 'ph-arrow-clockwise',
  recycleHorizontal: 'ph-arrows-clockwise',
  search: 'ph-magnifying-glass',
  sealCheck: 'ph-seal-check',
  send: 'ph-paper-plane-right',
  signOut: 'ph-sign-out',
  spinner: 'ph-spinner',
  swapHorizontal: 'ph-arrows-left-right',
  swapVertical: 'ph-arrows-down-up',
  threeDots: 'ph-dots-three',
  user: 'ph-user',
  verify: 'ph-seal-check',
  verifyFilled: 'ph-seal-check',
  wallet: 'ph-wallet',
  warning: 'ph-warning',
  warningCircle: 'ph-warning-circle',

  /*
   * Icons keeping as SVG (no direct Phosphor equivalents or brand-specific)
   */
  appStore: '',
  apple: '',
  bitcoin: '',
  coins: '',
  chromeStore: '',
  cursor: '',
  discord: '',
  ethereum: '',
  etherscan: '',
  facebook: '',
  farcaster: '',
  github: '',
  google: '',
  playStore: '',
  paperPlaneTitle: '',
  reown: '',
  solana: '',
  ton: '',
  telegram: '',
  twitch: '',
  twitterIcon: '',
  twitter: '',
  walletConnect: '',
  walletConnectBrown: '',
  walletConnectLightBrown: '',
  x: '',
  infoSeal: ''
}

// Dynamic imports for Phosphor components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const phosphorImports: Record<string, () => Promise<any>> = {
  'ph-arrow-circle-down': () => import('@phosphor-icons/webcomponents/PhArrowCircleDown'),
  'ph-arrow-clockwise': () => import('@phosphor-icons/webcomponents/PhArrowClockwise'),
  'ph-arrow-down': () => import('@phosphor-icons/webcomponents/PhArrowDown'),
  'ph-arrow-left': () => import('@phosphor-icons/webcomponents/PhArrowLeft'),
  'ph-arrow-right': () => import('@phosphor-icons/webcomponents/PhArrowRight'),
  'ph-arrow-square-out': () => import('@phosphor-icons/webcomponents/PhArrowSquareOut'),
  'ph-arrows-down-up': () => import('@phosphor-icons/webcomponents/PhArrowsDownUp'),
  'ph-arrows-left-right': () => import('@phosphor-icons/webcomponents/PhArrowsLeftRight'),
  'ph-arrow-up': () => import('@phosphor-icons/webcomponents/PhArrowUp'),
  'ph-arrow-up-right': () => import('@phosphor-icons/webcomponents/PhArrowUpRight'),
  'ph-arrows-clockwise': () => import('@phosphor-icons/webcomponents/PhArrowsClockwise'),
  'ph-bank': () => import('@phosphor-icons/webcomponents/PhBank'),
  'ph-browser': () => import('@phosphor-icons/webcomponents/PhBrowser'),
  'ph-caret-down': () => import('@phosphor-icons/webcomponents/PhCaretDown'),
  'ph-caret-left': () => import('@phosphor-icons/webcomponents/PhCaretLeft'),
  'ph-caret-right': () => import('@phosphor-icons/webcomponents/PhCaretRight'),
  'ph-caret-up': () => import('@phosphor-icons/webcomponents/PhCaretUp'),
  'ph-check': () => import('@phosphor-icons/webcomponents/PhCheck'),
  'ph-circle-half': () => import('@phosphor-icons/webcomponents/PhCircleHalf'),
  'ph-clock': () => import('@phosphor-icons/webcomponents/PhClock'),
  'ph-compass': () => import('@phosphor-icons/webcomponents/PhCompass'),
  'ph-copy': () => import('@phosphor-icons/webcomponents/PhCopy'),
  'ph-credit-card': () => import('@phosphor-icons/webcomponents/PhCreditCard'),
  'ph-currency-dollar': () => import('@phosphor-icons/webcomponents/PhCurrencyDollar'),
  'ph-desktop': () => import('@phosphor-icons/webcomponents/PhDesktop'),
  'ph-device-mobile': () => import('@phosphor-icons/webcomponents/PhDeviceMobile'),
  'ph-dots-three': () => import('@phosphor-icons/webcomponents/PhDotsThree'),
  'ph-vault': () => import('@phosphor-icons/webcomponents/PhVault'),
  'ph-envelope': () => import('@phosphor-icons/webcomponents/PhEnvelope'),
  'ph-funnel-simple': () => import('@phosphor-icons/webcomponents/PhFunnelSimple'),
  'ph-globe': () => import('@phosphor-icons/webcomponents/PhGlobe'),
  'ph-identification-card': () => import('@phosphor-icons/webcomponents/PhIdentificationCard'),
  'ph-image': () => import('@phosphor-icons/webcomponents/PhImage'),
  'ph-info': () => import('@phosphor-icons/webcomponents/PhInfo'),
  'ph-lightbulb': () => import('@phosphor-icons/webcomponents/PhLightbulb'),
  'ph-magnifying-glass': () => import('@phosphor-icons/webcomponents/PhMagnifyingGlass'),
  'ph-paper-plane-right': () => import('@phosphor-icons/webcomponents/PhPaperPlaneRight'),
  'ph-plus': () => import('@phosphor-icons/webcomponents/PhPlus'),
  'ph-power': () => import('@phosphor-icons/webcomponents/PhPower'),
  'ph-puzzle-piece': () => import('@phosphor-icons/webcomponents/PhPuzzlePiece'),
  'ph-qr-code': () => import('@phosphor-icons/webcomponents/PhQrCode'),
  'ph-question': () => import('@phosphor-icons/webcomponents/PhQuestion'),
  'ph-question-circle': () => import('@phosphor-icons/webcomponents/PhQuestionMark'),
  'ph-seal-check': () => import('@phosphor-icons/webcomponents/PhSealCheck'),
  'ph-sign-out': () => import('@phosphor-icons/webcomponents/PhSignOut'),
  'ph-spinner': () => import('@phosphor-icons/webcomponents/PhSpinner'),
  'ph-trash': () => import('@phosphor-icons/webcomponents/PhTrash'),
  'ph-user': () => import('@phosphor-icons/webcomponents/PhUser'),
  'ph-wallet': () => import('@phosphor-icons/webcomponents/PhWallet'),
  'ph-warning': () => import('@phosphor-icons/webcomponents/PhWarning'),
  'ph-warning-circle': () => import('@phosphor-icons/webcomponents/PhWarningCircle'),
  'ph-x': () => import('@phosphor-icons/webcomponents/PhX')
}

// -- SVG Options ------------------------------------------ //
const svgOptions: Partial<Record<IconType, TemplateResult<2>>> = {
  appStore: appStoreSvg,
  apple: appleSvg,
  bitcoin: bitcoinSvg,
  coins: coinsSvg,
  chromeStore: chromeStoreSvg,
  cursor: cursorSvg,
  discord: discordSvg,
  ethereum: ethereumSvg,
  etherscan: etherscanSvg,
  facebook: facebookSvg,
  farcaster: farcasterSvg,
  github: githubSvg,
  google: googleSvg,
  playStore: playStoreSvg,
  paperPlaneTitle: paperPlaneTitleSvg,
  reown: reownSvg,
  solana: solanaSvg,
  ton: tonSvg,
  telegram: telegramSvg,
  twitch: twitchSvg,
  twitter: xSvg,
  twitterIcon: twitterIconSvg,
  walletConnect: walletConnectSvg,
  walletConnectInvert: walletConnectInvertSvg,
  walletConnectBrown: walletConnectBrownSvg,
  walletConnectLightBrown: walletConnectLightBrownSvg,
  x: xSvg,
  infoSeal: infoSealSvg
}

// -- Constants ------------------------------------------ //
export const ICON_COLOR = {
  'accent-primary': vars.tokens.core.iconAccentPrimary,
  'accent-certified': vars.tokens.core.iconAccentCertified,
  'foreground-secondary': vars.tokens.theme.foregroundSecondary,
  default: vars.tokens.theme.iconDefault,
  success: vars.tokens.core.iconSuccess,
  error: vars.tokens.core.iconError,
  warning: vars.tokens.core.iconWarning,
  inverse: vars.tokens.theme.iconInverse
}

@customElement('wui-icon')
export class WuiIcon extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public size: IconSizeType = 'md'

  @property() public name: IconType = 'copy'

  @property() public weight: IconWeightType = 'bold'

  @property() public color: IconColorType = 'inherit'

  // -- Render -------------------------------------------- //
  public override render() {
    const getSize = {
      xxs: '2',
      xs: '3',
      sm: '3',
      md: '4',
      mdl: '5',
      lg: '5',
      xl: '6',
      xxl: '7',
      inherit: 'inherit'
    } as const

    this.style.cssText = `
      --local-width: ${this.size === 'inherit' ? 'inherit' : `var(--apkt-spacing-${getSize[this.size]})`};
      --local-color: ${this.color === 'inherit' ? 'inherit' : ICON_COLOR[this.color]}
    `

    // Check if the icon should use Phosphor
    const phosphorIconTag = phosphorIconsMap[this.name]

    if (phosphorIconTag && phosphorIconTag !== '') {
      // Import the Phosphor icon component dynamically
      const importFn = phosphorImports[phosphorIconTag]
      if (importFn) {
        importFn()
      }

      const tag = unsafeStatic(phosphorIconTag)

      const getPhosphorSize = {
        xxs: '0.5em',
        xs: '0.75em',
        sm: '0.75em',
        md: '1em',
        mdl: '1.25em',
        lg: '1.25em',
        xl: '1.5em',
        xxl: '1.75em'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any

      // Return the Phosphor icon with dynamic tag
      // eslint-disable-next-line lit/binding-positions, lit/no-invalid-html
      return html`<${tag} size=${getPhosphorSize[this.size]} weight="${this.weight}"></${tag}>`
    }

    // Fallback to regular SVG
    return svgOptions[this.name] || html``
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-icon': WuiIcon
  }
}
