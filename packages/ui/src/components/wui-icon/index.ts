import type { TemplateResult } from 'lit'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { colorStyles, resetStyles } from '../../utils/ThemeUtil'
import type { ColorType, IconType, SizeType } from '../../utils/TypesUtil'
import styles from './styles'

// -- Svg's-------------------------------- //
import { appleSvg } from '../../assets/svg/apple'
import { arrowBottomSvg } from '../../assets/svg/arrow-bottom'
import { arrowLeftSvg } from '../../assets/svg/arrow-left'
import { arrowRightSvg } from '../../assets/svg/arrow-right'
import { arrowTopSvg } from '../../assets/svg/arrow-top'
import { browserSvg } from '../../assets/svg/browser'
import { checkmarkSvg } from '../../assets/svg/checkmark'
import { chevronBottomSvg } from '../../assets/svg/chevron-bottom'
import { chevronLeftSvg } from '../../assets/svg/chevron-left'
import { chevronRightSvg } from '../../assets/svg/chevron-right'
import { chevronTopSvg } from '../../assets/svg/chevron-top'
import { clockSvg } from '../../assets/svg/clock'
import { closeSvg } from '../../assets/svg/close'
import { coinPlaceholderSvg } from '../../assets/svg/coinPlaceholder'
import { compassSvg } from '../../assets/svg/compass'
import { copySvg } from '../../assets/svg/copy'
import { cursorSvg } from '../../assets/svg/cursor'
import { desktopSvg } from '../../assets/svg/desktop'
import { disconnectSvg } from '../../assets/svg/disconnect'
import { discordSvg } from '../../assets/svg/discord'
import { etherscanSvg } from '../../assets/svg/etherscan'
import { extensionSvg } from '../../assets/svg/extension'
import { externalLinkSvg } from '../../assets/svg/external-link'
import { facebookSvg } from '../../assets/svg/facebook'
import { filtersSvg } from '../../assets/svg/filters'
import { githubSvg } from '../../assets/svg/github'
import { googleSvg } from '../../assets/svg/google'
import { helpCircleSvg } from '../../assets/svg/help-circle'
import { infoCircleSvg } from '../../assets/svg/info-circle'
import { mailSvg } from '../../assets/svg/mail'
import { mobileSvg } from '../../assets/svg/mobile'
import { networkPlaceholderSvg } from '../../assets/svg/network-placeholder'
import { nftPlaceholderSvg } from '../../assets/svg/nftPlaceholder'
import { offSvg } from '../../assets/svg/off'
import { refreshSvg } from '../../assets/svg/refresh'
import { searchSvg } from '../../assets/svg/search'
import { swapHorizontalSvg } from '../../assets/svg/swapHorizontal'
import { swapVerticalSvg } from '../../assets/svg/swapVertical'
import { telegramSvg } from '../../assets/svg/telegram'
import { twitchSvg } from '../../assets/svg/twitch'
import { twitterSvg } from '../../assets/svg/twitter'
import { twitterIconSvg } from '../../assets/svg/twitterIcon'
import { walletSvg } from '../../assets/svg/wallet'
import { walletPlaceholderSvg } from '../../assets/svg/wallet-placeholder'
import { walletConnectSvg } from '../../assets/svg/walletconnect'
import { warningCircleSvg } from '../../assets/svg/warning-circle'

const svgOptions: Record<IconType, TemplateResult<2>> = {
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
  public static styles = [resetStyles, colorStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public size: SizeType = 'md'

  @property() public name: IconType = 'copy'

  @property() public color: ColorType = 'fg-300'

  // -- Render -------------------------------------------- //
  public render() {
    this.style.cssText = `
      color: ${`var(--wui-color-${this.color});`}
      width: ${`var(--wui-icon-size-${this.size});`}
    `

    return html`${svgOptions[this.name]}`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-icon': WuiIcon
  }
}
