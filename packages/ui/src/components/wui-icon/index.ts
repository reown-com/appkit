import type { TemplateResult } from 'lit'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { arrowBottomSvg } from '../../assets/svg/arrow-buttom'
import { arrowTopSvg } from '../../assets/svg/arrow-top'
import { checkmarkSvg } from '../../assets/svg/checkmark'
import { chevronRightSvg } from '../../assets/svg/chevron-right'
import { clockSvg } from '../../assets/svg/clock'
import { closeSvg } from '../../assets/svg/close'
import { copySvg } from '../../assets/svg/copy'
import { cursorSvg } from '../../assets/svg/cursor'
import { disconnectSvg } from '../../assets/svg/disconnect'
import { externalLinkSvg } from '../../assets/svg/external-link'
import { searchSvg } from '../../assets/svg/search'
import { swapSvg } from '../../assets/svg/swap'
import { walletSvg } from '../../assets/svg/wallet'
import { walletPlaceholderSvg } from '../../assets/svg/wallet-placeholder'
import { colorStyles, resetStyles } from '../../utils/ThemeUtil'
import type { ColorType, IconType, SizeType } from '../../utils/TypesUtil'
import styles from './styles'

const svgOptions: Record<IconType, TemplateResult<2>> = {
  arrowBottom: arrowBottomSvg,
  arrowTop: arrowTopSvg,
  checkmark: checkmarkSvg,
  chevronRight: chevronRightSvg,
  clock: clockSvg,
  close: closeSvg,
  copy: copySvg,
  cursor: cursorSvg,
  disconnect: disconnectSvg,
  externalLink: externalLinkSvg,
  search: searchSvg,
  swap: swapSvg,
  wallet: walletSvg,
  walletPlaceholder: walletPlaceholderSvg
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
