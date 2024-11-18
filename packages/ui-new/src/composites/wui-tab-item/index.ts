import { html, LitElement } from 'lit'
import '../../components/wui-icon/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'
import { property } from 'lit/decorators.js'
import type { IconType, TabSize } from '../../utils/TypeUtil.js'

// -- Constants ------------------------------------------ //

const TEXT_VARIANT_BY_SIZE = {
  lg: 'lg-regular',
  md: 'md-regular',
  sm: 'sm-regular'
}

const ICON_SIZE = {
  lg: 'sm',
  md: 'xs',
  sm: 'xxs'
}

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
      <button data-active=${this.active} data-testid="tab-${this.label.toLowerCase()}">
        <wui-icon size=${ICON_SIZE[this.size]} name=${this.icon}></wui-icon>
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
