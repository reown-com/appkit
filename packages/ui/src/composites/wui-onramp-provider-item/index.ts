import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-icon/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { ColorType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-onramp-provider-item')
export class WuiOnRampProviderItem extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public disabled = false

  @property() color: ColorType = 'inherit'

  @property() public label: string = ''

  @property() public imageURL: string = ''

  @property() public feeRange = ''

  @property() public onClick: (() => void) | null = null

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button ?disabled=${this.onClick} ontouchstart>
        <wui-image class="provider-image" src=${this.imageURL}></wui-image>
        <wui-flex flexDirection="column" gap="4xs">
          <wui-text variant="paragraph-500" color="fg-100">${this.label}</wui-text>
          <wui-text variant="tiny-500" color="fg-100">
            <wui-text variant="tiny-400" color="fg-200">Fees</wui-text>
            ${this.feeRange}
          </wui-text>
        </wui-flex>
        <wui-icon name="chevronRight" color="fg-300"></wui-icon>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-onramp-provider-item': WuiOnRampProviderItem
  }
}
