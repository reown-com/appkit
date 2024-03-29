import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-text/index.js'
import '../../components/wui-image/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'
import { UiHelperUtil } from '../../utils/UiHelperUtil.js'

@customElement('wui-list-address')
export class WuiListAddress extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public address = ''

  @property() public addressTitle = ''

  @property({ type: Number }) public balance = 23.18

  @property({ type: Boolean }) public clickable = false

  @property({ type: Boolean }) public selected = false

  @property() onSelect?: Function

  handleClick = (event: Event) => {
    // @ts-ignore
    this.onSelect?.(this.address, event?.target?.checked)
  }
  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="row" justifyContent="space-between">
        <wui-flex gap="s" alignItems="center">
          <wui-avatar address=${this.address}></wui-avatar>
          <wui-flex flexDirection="column">
            <wui-text class="address" variant="paragraph-500" color="fg-100"
              >${UiHelperUtil.getTruncateString({
                string: this.address,
                charsStart: 4,
                charsEnd: 6,
                truncate: 'middle'
              })}</wui-text
            >
            <wui-text class="address-description" variant="small-400"
              >${this.addressTitle}</wui-text
            ></wui-flex
          >
        </wui-flex>
        <wui-flex gap="s" alignItems="center">
          <wui-text variant="small-400">$${this.balance.toFixed(2)}</wui-text>
          <input
            type="checkbox"
            ${this.selected ? 'checked' : ''}
            @click="${(event: Event) => this.handleClick(event)}"
            ="checkbox"
          />
        </wui-flex>
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-list-address': WuiListAddress
  }
}
