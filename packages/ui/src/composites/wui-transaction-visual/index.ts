import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil'
import '../wui-icon-box'
import '../../components/wui-image'
import styles from './styles'
import type { TransactionIconType, TransactionType } from '../../utils/TypesUtil'

@customElement('wui-transaction-visual')
export class WuiTransactionVisual extends LitElement {
  public static styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public type: TransactionType = 'buy'

  @property() public imageSrc = ''

  // -- Render -------------------------------------------- //
  public render() {
    let color: 'blue-100' | 'error-100' | 'success-100' = 'blue-100'
    let icon: TransactionIconType = 'arrowTop'
    if (
      this.type === 'bought' ||
      this.type === 'buy' ||
      this.type === 'deposited' ||
      this.type === 'cryptoSent' ||
      this.type === 'minted'
    ) {
      color = 'error-100'
      icon = 'arrowBottom'
    } else if (this.type === 'withdrawed' || this.type === 'received' || this.type === 'nftSent') {
      color = 'success-100'
      icon = 'arrowTop'
    } else {
      color = 'blue-100'
      icon = 'swap'
    }

    return html` <wui-image type=${this.type} src=${this.imageSrc}></wui-image>
      <wui-icon-box
        size="sm"
        iconColor=${color}
        backgroundColor=${color}
        icon=${icon}
        ?border=${true}
      ></wui-icon-box>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-transaction-visual': WuiTransactionVisual
  }
}
