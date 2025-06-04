import type { TemplateResult } from 'lit'
import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { until } from 'lit/directives/until.js'

import { globalSvgCache } from '../../utils/CacheUtil.js'
import { colorStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { ColorType, IconType, SizeType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

const ICONS = {
  add: async () => (await import('../../assets/svg/add.js')).addSvg,
  allWallets: async () => (await import('../../assets/svg/all-wallets.js')).allWalletsSvg,
  arrowBottomCircle: async () =>
    (await import('../../assets/svg/arrow-bottom-circle.js')).arrowBottomCircleSvg,
  appStore: async () => (await import('../../assets/svg/app-store.js')).appStoreSvg,
  apple: async () => (await import('../../assets/svg/apple.js')).appleSvg,
  arrowBottom: async () => (await import('../../assets/svg/arrow-bottom.js')).arrowBottomSvg,
  arrowLeft: async () => (await import('../../assets/svg/arrow-left.js')).arrowLeftSvg,
  arrowRight: async () => (await import('../../assets/svg/arrow-right.js')).arrowRightSvg,
  arrowTop: async () => (await import('../../assets/svg/arrow-top.js')).arrowTopSvg,
  bank: async () => (await import('../../assets/svg/bank.js')).bankSvg,
  browser: async () => (await import('../../assets/svg/browser.js')).browserSvg,
  bin: async () => (await import('../../assets/svg/bin.js')).binSvg,
  bitcoin: async () => (await import('../../assets/svg/bitcoin.js')).bitcoinSvg,
  card: async () => (await import('../../assets/svg/card.js')).cardSvg,
  checkmark: async () => (await import('../../assets/svg/checkmark.js')).checkmarkSvg,
  checkmarkBold: async () => (await import('../../assets/svg/checkmark-bold.js')).checkmarkBoldSvg,
  chevronBottom: async () => (await import('../../assets/svg/chevron-bottom.js')).chevronBottomSvg,
  chevronLeft: async () => (await import('../../assets/svg/chevron-left.js')).chevronLeftSvg,
  chevronRight: async () => (await import('../../assets/svg/chevron-right.js')).chevronRightSvg,
  chevronTop: async () => (await import('../../assets/svg/chevron-top.js')).chevronTopSvg,
  chromeStore: async () => (await import('../../assets/svg/chrome-store.js')).chromeStoreSvg,
  clock: async () => (await import('../../assets/svg/clock.js')).clockSvg,
  close: async () => (await import('../../assets/svg/close.js')).closeSvg,
  compass: async () => (await import('../../assets/svg/compass.js')).compassSvg,
  coinPlaceholder: async () =>
    (await import('../../assets/svg/coinPlaceholder.js')).coinPlaceholderSvg,
  copy: async () => (await import('../../assets/svg/copy.js')).copySvg,
  cursor: async () => (await import('../../assets/svg/cursor.js')).cursorSvg,
  cursorTransparent: async () =>
    (await import('../../assets/svg/cursor-transparent.js')).cursorTransparentSvg,
  circle: async () => (await import('../../assets/svg/circle.js')).circleSvg,
  desktop: async () => (await import('../../assets/svg/desktop.js')).desktopSvg,
  disconnect: async () => (await import('../../assets/svg/disconnect.js')).disconnectSvg,
  discord: async () => (await import('../../assets/svg/discord.js')).discordSvg,
  ethereum: async () => (await import('../../assets/svg/ethereum.js')).ethereumSvg,
  etherscan: async () => (await import('../../assets/svg/etherscan.js')).etherscanSvg,
  extension: async () => (await import('../../assets/svg/extension.js')).extensionSvg,
  externalLink: async () => (await import('../../assets/svg/external-link.js')).externalLinkSvg,
  facebook: async () => (await import('../../assets/svg/facebook.js')).facebookSvg,
  farcaster: async () => (await import('../../assets/svg/farcaster.js')).farcasterSvg,
  filters: async () => (await import('../../assets/svg/filters.js')).filtersSvg,
  github: async () => (await import('../../assets/svg/github.js')).githubSvg,
  google: async () => (await import('../../assets/svg/google.js')).googleSvg,
  helpCircle: async () => (await import('../../assets/svg/help-circle.js')).helpCircleSvg,
  image: async () => (await import('../../assets/svg/image.js')).imageSvg,
  id: async () => (await import('../../assets/svg/id.js')).idSvg,
  infoCircle: async () => (await import('../../assets/svg/info-circle.js')).infoCircleSvg,
  lightbulb: async () => (await import('../../assets/svg/lightbulb.js')).lightbulbSvg,
  mail: async () => (await import('../../assets/svg/mail.js')).mailSvg,
  mobile: async () => (await import('../../assets/svg/mobile.js')).mobileSvg,
  more: async () => (await import('../../assets/svg/more.js')).moreSvg,
  networkPlaceholder: async () =>
    (await import('../../assets/svg/network-placeholder.js')).networkPlaceholderSvg,
  nftPlaceholder: async () =>
    (await import('../../assets/svg/nftPlaceholder.js')).nftPlaceholderSvg,
  off: async () => (await import('../../assets/svg/off.js')).offSvg,
  playStore: async () => (await import('../../assets/svg/play-store.js')).playStoreSvg,
  plus: async () => (await import('../../assets/svg/plus.js')).plusSvg,
  qrCode: async () => (await import('../../assets/svg/qr-code.js')).qrCodeIcon,
  recycleHorizontal: async () =>
    (await import('../../assets/svg/recycle-horizontal.js')).recycleHorizontalSvg,
  refresh: async () => (await import('../../assets/svg/refresh.js')).refreshSvg,
  search: async () => (await import('../../assets/svg/search.js')).searchSvg,
  send: async () => (await import('../../assets/svg/send.js')).sendSvg,
  swapHorizontal: async () =>
    (await import('../../assets/svg/swapHorizontal.js')).swapHorizontalSvg,
  swapHorizontalMedium: async () =>
    (await import('../../assets/svg/swapHorizontalMedium.js')).swapHorizontalMediumSvg,
  swapHorizontalBold: async () =>
    (await import('../../assets/svg/swapHorizontalBold.js')).swapHorizontalBoldSvg,
  swapHorizontalRoundedBold: async () =>
    (await import('../../assets/svg/swapHorizontalRoundedBold.js')).swapHorizontalRoundedBoldSvg,
  swapVertical: async () => (await import('../../assets/svg/swapVertical.js')).swapVerticalSvg,
  solana: async () => (await import('../../assets/svg/solana.js')).solanaSvg,
  telegram: async () => (await import('../../assets/svg/telegram.js')).telegramSvg,
  threeDots: async () => (await import('../../assets/svg/three-dots.js')).threeDotsSvg,
  twitch: async () => (await import('../../assets/svg/twitch.js')).twitchSvg,
  twitter: async () => (await import('../../assets/svg/x.js')).xSvg,
  twitterIcon: async () => (await import('../../assets/svg/twitterIcon.js')).twitterIconSvg,
  verify: async () => (await import('../../assets/svg/verify.js')).verifySvg,
  verifyFilled: async () => (await import('../../assets/svg/verify-filled.js')).verifyFilledSvg,
  wallet: async () => (await import('../../assets/svg/wallet.js')).walletSvg,
  walletConnect: async () => (await import('../../assets/svg/walletconnect.js')).walletConnectSvg,
  walletConnectLightBrown: async () =>
    (await import('../../assets/svg/walletconnect.js')).walletConnectLightBrownSvg,
  walletConnectBrown: async () =>
    (await import('../../assets/svg/walletconnect.js')).walletConnectBrownSvg,
  walletPlaceholder: async () =>
    (await import('../../assets/svg/wallet-placeholder.js')).walletPlaceholderSvg,
  warningCircle: async () => (await import('../../assets/svg/warning-circle.js')).warningCircleSvg,
  x: async () => (await import('../../assets/svg/x.js')).xSvg,
  info: async () => (await import('../../assets/svg/info.js')).infoSvg,
  exclamationTriangle: async () =>
    (await import('../../assets/svg/exclamation-triangle.js')).exclamationTriangleSvg,
  reown: async () => (await import('../../assets/svg/reown-logo.js')).reownSvg,
  'x-mark': async () => (await import('../../assets/svg/x-mark.js')).xMarkSvg
} as const

async function getSvg(name: IconType) {
  if (globalSvgCache.has(name)) {
    return globalSvgCache.get(name) as Promise<TemplateResult<2>>
  }

  const importFn = ICONS[name as keyof typeof ICONS] ?? ICONS.copy
  const svgPromise = importFn()

  globalSvgCache.set(name, svgPromise)

  return svgPromise
}

@customElement('wui-icon')
export class WuiIcon extends LitElement {
  public static override styles = [resetStyles, colorStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public size: SizeType = 'md'

  @property() public name: IconType = 'copy'

  @property() public color: ColorType = 'fg-300'

  @property() public aspectRatio = '1 / 1'

  // -- Render -------------------------------------------- //
  public override render() {
    this.style.cssText = `
      --local-color: ${`var(--wui-color-${this.color});`}
      --local-width: ${`var(--wui-icon-size-${this.size});`}
      --local-aspect-ratio: ${this.aspectRatio}
    `

    return html`${until(getSvg(this.name), html`<div class="fallback"></div>`)}`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-icon': WuiIcon
  }
}
