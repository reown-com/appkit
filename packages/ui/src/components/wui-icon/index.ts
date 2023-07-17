import type { TemplateResult } from 'lit'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { arrowBottomSvg } from '../../assets/svg/arrow-bottom'
import { arrowLeftSvg } from '../../assets/svg/arrow-left'
import { arrowRightSvg } from '../../assets/svg/arrow-right'
import { arrowTopSvg } from '../../assets/svg/arrow-top'
import { checkmarkSvg } from '../../assets/svg/checkmark'
import { chevronRightSvg } from '../../assets/svg/chevron-right'
import { clockSvg } from '../../assets/svg/clock'
import { closeSvg } from '../../assets/svg/close'
import { copySvg } from '../../assets/svg/copy'
import { cursorSvg } from '../../assets/svg/cursor'
import { disconnectSvg } from '../../assets/svg/disconnect'
import { externalLinkSvg } from '../../assets/svg/external-link'
import { helpCircleSvg } from '../../assets/svg/help-circle'
import { mailSvg } from '../../assets/svg/mail'
import { searchSvg } from '../../assets/svg/search'
import { swapSvg } from '../../assets/svg/swap'
import { walletSvg } from '../../assets/svg/wallet'
import { walletConnectSvg } from '../../assets/svg/walletconnect'
import { walletPlaceholderSvg } from '../../assets/svg/wallet-placeholder'
import { colorStyles, resetStyles } from '../../utils/ThemeUtil'
import type { ColorType, IconType, SizeType } from '../../utils/TypesUtil'
import styles from './styles'
import { networkPlaceholderSvg } from '../../assets/svg/network-placeholder'
import { browserSvg } from '../../assets/svg/browser'
import { chevronBottomSvg } from '../../assets/svg/chevron-bottom'
import { chevronLeftSvg } from '../../assets/svg/chevron-left'
import { chevronTopSvg } from '../../assets/svg/chevron-top'
import { compassSvg } from '../../assets/svg/compass'
import { desktopSvg } from '../../assets/svg/desktop'
import { etherscanSvg } from '../../assets/svg/etherscan'
import { filtersSvg } from '../../assets/svg/filters'
import { infoCircleSvg } from '../../assets/svg/info-circle'
import { mobileSvg } from '../../assets/svg/mobile'
import { offSvg } from '../../assets/svg/off'
import { twitterSvg } from '../../assets/svg/twitter'
import { warningCircleSvg } from '../../assets/svg/warning-circle'

const svgOptions: Record<IconType, TemplateResult<2>> = {
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
  copy: copySvg,
  cursor: cursorSvg,
  desktop: desktopSvg,
  disconnect: disconnectSvg,
  etherscan: etherscanSvg,
  externalLink: externalLinkSvg,
  filters: filtersSvg,
  helpCircle: helpCircleSvg,
  infoCircle: infoCircleSvg,
  mail: mailSvg,
  mobile: mobileSvg,
  networkPlaceholder: networkPlaceholderSvg,
  off: offSvg,
  search: searchSvg,
  swap: swapSvg,
  twitter: twitterSvg,
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
      color: ${`var(--wui-color-${this.color});`};
      width: ${`var(--wui-icon-size-${this.size});`};
    `

    return html`${svgOptions[this.name]}`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-icon': WuiIcon
  }
}
