import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-image/index.js'
import '../../components/wui-text/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-chip/index.js'
import '../wui-icon-box/index.js'
import styles from './styles.js'

@customElement('wui-list-wallet-transaction')
export class WuiListWalletTransaction extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public amount = ''

  @property() public networkCurreny = ''

  @property() public networkImageUrl = ''

  @property() public receiverAddress = ''

  @property() public addressExplorerUrl = ''

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex justifyContent="space-between" alignItems="center">
        <wui-text variant="md-regular" color="secondary">Sending</wui-text>
        <wui-flex gap="1" alignItems="center">
          <wui-text variant="md-medium" color="primary">
            ${this.amount} ${this.networkCurreny}
          </wui-text>
          ${this.templateNetworkVisual()}
        </wui-flex>
      </wui-flex>
      <wui-flex justifyContent="space-between" alignItems="center">
        <wui-text variant="md-regular" color="secondary">To</wui-text>
        <wui-chip
          icon="externalLink"
          variant="shadeSmall"
          href=${this.addressExplorerUrl}
          title=${this.receiverAddress}
        ></wui-chip>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private templateNetworkVisual() {
    if (this.networkImageUrl) {
      return html`<wui-image src=${this.networkImageUrl} alt="Network Image"></wui-image>`
    }

    return html`<wui-icon-box color="secondary" icon="networkPlaceholder"></wui-icon-box>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-list-wallet-transaction': WuiListWalletTransaction
  }
}
