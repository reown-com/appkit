import type { TemplateResult } from 'lit'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { colorStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { ColorType, IconType, SizeType } from '../../utils/TypesUtil.js'
import styles from './styles.js'

// -- Svg's-------------------------------- //
import { appleSvg } from '../../assets/svg/apple.js'
import { arrowBottomSvg } from '../../assets/svg/arrow-bottom.js'
import { arrowLeftSvg } from '../../assets/svg/arrow-left.js'
import { arrowRightSvg } from '../../assets/svg/arrow-right.js'
import { arrowTopSvg } from '../../assets/svg/arrow-top.js'
import { browserSvg } from '../../assets/svg/browser.js'
import { checkmarkSvg } from '../../assets/svg/checkmark.js'
import { chevronBottomSvg } from '../../assets/svg/chevron-bottom.js'
import { chevronLeftSvg } from '../../assets/svg/chevron-left.js'
import { chevronRightSvg } from '../../assets/svg/chevron-right.js'
import { chevronTopSvg } from '../../assets/svg/chevron-top.js'
import { clockSvg } from '../../assets/svg/clock.js'
import { closeSvg } from '../../assets/svg/close.js'
import { coinPlaceholderSvg } from '../../assets/svg/coinPlaceholder.js'
import { compassSvg } from '../../assets/svg/compass.js'
import { copySvg } from '../../assets/svg/copy.js'
import { cursorSvg } from '../../assets/svg/cursor.js'
import { desktopSvg } from '../../assets/svg/desktop.js'
import { disconnectSvg } from '../../assets/svg/disconnect.js'
import { discordSvg } from '../../assets/svg/discord.js'
import { etherscanSvg } from '../../assets/svg/etherscan.js'
import { extensionSvg } from '../../assets/svg/extension.js'
import { externalLinkSvg } from '../../assets/svg/external-link.js'
import { facebookSvg } from '../../assets/svg/facebook.js'
import { filtersSvg } from '../../assets/svg/filters.js'
import { githubSvg } from '../../assets/svg/github.js'
import { googleSvg } from '../../assets/svg/google.js'
import { helpCircleSvg } from '../../assets/svg/help-circle.js'
import { infoCircleSvg } from '../../assets/svg/info-circle.js'
import { mailSvg } from '../../assets/svg/mail.js'
import { mobileSvg } from '../../assets/svg/mobile.js'
import { networkPlaceholderSvg } from '../../assets/svg/network-placeholder.js'
import { nftPlaceholderSvg } from '../../assets/svg/nftPlaceholder.js'
import { offSvg } from '../../assets/svg/off.js'
import { qrCodeIcon } from '../../assets/svg/qr-code.js'
import { refreshSvg } from '../../assets/svg/refresh.js'
import { searchSvg } from '../../assets/svg/search.js'
import { swapHorizontalSvg } from '../../assets/svg/swapHorizontal.js'
import { swapVerticalSvg } from '../../assets/svg/swapVertical.js'
import { telegramSvg } from '../../assets/svg/telegram.js'
import { twitchSvg } from '../../assets/svg/twitch.js'
import { twitterSvg } from '../../assets/svg/twitter.js'
import { twitterIconSvg } from '../../assets/svg/twitterIcon.js'
import { walletPlaceholderSvg } from '../../assets/svg/wallet-placeholder.js'
import { walletSvg } from '../../assets/svg/wallet.js'
import { walletConnectSvg } from '../../assets/svg/walletconnect.js'
import { warningCircleSvg } from '../../assets/svg/warning-circle.js'
import { allWalletsSvg } from '../../assets/svg/all-wallets.js'

const svgOptions: Record<IconType, TemplateResult<2>> = {
  allWallets: allWalletsSvg,
  apple: appleSvg,
  arrowBottom: arrowBottomSvg,
  arrowLeft: arrowLeftSvg,
  arrowRight: arrowRightSvg,
  arrowTop: arrowTopSvg,
  browser: browserSvg,
  checkmark: checkmarkSvg,
  chevronBottom: chevronBottomSvg,
  chevronLeft: chevronLeftSvg,
  chevronRight: chevronRightSvg,
  chevronTop: chevronTopSvg,
  clock: clockSvg,
  close: closeSvg,
  compass: compassSvg,
  coinPlaceholder: coinPlaceholderSvg,
  copy: copySvg,
  cursor: cursorSvg,
  desktop: desktopSvg,
  disconnect: disconnectSvg,
  discord: discordSvg,
  etherscan: etherscanSvg,
  extension: extensionSvg,
  externalLink: externalLinkSvg,
  facebook: facebookSvg,
  filters: filtersSvg,
  github: githubSvg,
  google: googleSvg,
  helpCircle: helpCircleSvg,
  infoCircle: infoCircleSvg,
  mail: mailSvg,
  mobile: mobileSvg,
  networkPlaceholder: networkPlaceholderSvg,
  nftPlaceholder: nftPlaceholderSvg,
  off: offSvg,
  qrCode: qrCodeIcon,
  refresh: refreshSvg,
  search: searchSvg,
  swapHorizontal: swapHorizontalSvg,
  swapVertical: swapVerticalSvg,
  telegram: telegramSvg,
  twitch: twitchSvg,
  twitter: twitterSvg,
  twitterIcon: twitterIconSvg,
  wallet: walletSvg,
  walletConnect: walletConnectSvg,
  walletPlaceholder: walletPlaceholderSvg,
  warningCircle: warningCircleSvg
}

@customElement('wui-icon')
export class WuiIcon extends LitElement {
  public static override styles = [resetStyles, colorStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public size: SizeType = 'md'

  @property() public name: IconType = 'copy'

  @property() public color: ColorType = 'fg-300'

  // -- Render -------------------------------------------- //
  public override render() {
    this.style.cssText = `
      --local-color: ${`var(--wui-color-${this.color});`}
      --local-width: ${`var(--wui-icon-size-${this.size});`}
    `

    return html`${svgOptions[this.name]}`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-icon': WuiIcon
  }
}
