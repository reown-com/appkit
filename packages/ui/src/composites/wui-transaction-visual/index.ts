import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { resetStyles } from '../../utils/ThemeUtil'
import '../wui-icon-box'
import '../../components/wui-image'
import styles from './styles'
import type { TransactionIconType, TransactionType } from '../../utils/TypesUtil'

@customElement('wui-transaction-visual')
export class WuiTransactionVisual extends LitElement {
  public static styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public type: TransactionType = 'buy'

  @property() public imageSrc = ''

  // -- Render -------------------------------------------- //
  public render() {
    let color: 'blue-100' | 'error-100' | 'success-100' = 'blue-100'
    let icon: TransactionIconType = 'arrowTop'
    const outgoing: TransactionType[] = ['withdrawed', 'buy', 'cryptoSent', 'nftSent']
    const incoming: TransactionType[] = ['deposited', 'received', 'bought', 'minted']

    if (outgoing.includes(this.type)) {
      color = 'blue-100'
      icon = 'arrowTop'
    } else if (incoming.includes(this.type)) {
      color = 'success-100'
      icon = 'arrowBottom'
    } else {
      color = 'blue-100'
      icon = 'swap'
    }

    return html` <wui-image
        data-type=${this.type}
        src=${this.imageSrc}
        alt=${this.type}
      ></wui-image>
      <wui-icon-box
        size="xs"
        iconColor=${color}
        backgroundColor=${color}
        background="opaque"
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
