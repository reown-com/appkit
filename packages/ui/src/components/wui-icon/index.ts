import type { TemplateResult } from 'lit'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { colorStyles, resetStyles } from '../../utils/ThemeUtil'
import type { ColorType, IconType, SizeType } from '../../utils/TypesUtil'
import { clockSvg } from '@web3modal/ui/src/assets/svg/clock'
import { closeSvg } from '@web3modal/ui/src/assets/svg/close'
import { copySvg } from '@web3modal/ui/src/assets/svg/copy'
import { searchSvg } from '@web3modal/ui/src/assets/svg/search'
import { walletSvg } from '@web3modal/ui/src/assets/svg/wallet'
import { walletPlaceholderSvg } from '@web3modal/ui/src/assets/svg/wallet-placeholder'

import styles from './styles'

const svgOptions: Record<IconType, TemplateResult<2>> = {
  clock: clockSvg,
  close: closeSvg,
  copy: copySvg,
  search: searchSvg,
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
    let size = 'inherit'
    switch (this.size) {
      case 'xxs':
        size = '8px'
        break
      case 'xs':
        size = '10px'
        break
      case 'sm':
        size = '12px'
        break
      case 'md':
        size = '14px'
        break
      case 'lg':
        size = '18px'
        break
      default:
        size = 'inherit'
    }

    this.style.cssText = `
      color: ${`var(--wui-color-${this.color})`};
      width: ${size};
      height: ${size};
    `

    return html`${svgOptions[this.name]}`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-icon': WuiIcon
  }
}
