import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { IconSizeType, IconType, TabSize, TextType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

// -- Constants ------------------------------------------ //

const TEXT_VARIANT_BY_SIZE = {
  lg: 'lg-regular',
  md: 'md-regular',
  sm: 'sm-regular'
} as Record<TabSize, TextType>

const ICON_SIZE = {
  lg: 'md',
  md: 'sm',
  sm: 'sm'
} as Record<TabSize, IconSizeType>

// -- Component ------------------------------------------ //
@customElement('wui-tab-item')
export class WuiTab extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public icon: IconType = 'mobile'

  @property() public size: TabSize = 'md'

  @property() public label = ''

  @property({ type: Boolean }) public active = false

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button data-active=${this.active}>
        ${this.icon
          ? html`<wui-icon size=${ICON_SIZE[this.size]} name=${this.icon}></wui-icon>`
          : ''}
        <wui-text variant=${TEXT_VARIANT_BY_SIZE[this.size]}> ${this.label} </wui-text>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-tab-item': WuiTab
  }
}
