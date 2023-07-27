import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-image'
import { resetStyles } from '../../utils/ThemeUtil'
import type { TransactionIconType, TransactionType } from '../../utils/TypesUtil'
import '../wui-icon-box'
import styles from './styles'

// -- Helpers -------------------------------- //
const outgoing: TransactionType[] = ['withdrawed', 'buy', 'cryptoSent', 'nftSent']
const incoming: TransactionType[] = ['deposited', 'received', 'bought', 'minted']
const nft: TransactionType[] = ['minted', 'bought', 'nftSent']
const currency: TransactionType[] = ['deposited', 'withdrawed', 'cryptoSent', 'buy', 'received']

@customElement('wui-transaction-visual')
export class WuiTransactionVisual extends LitElement {
  public static styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public type: TransactionType = 'buy'

  @property() public imageSrc?: string

  // -- Render -------------------------------------------- //
  public render() {
    let color: 'blue-100' | 'error-100' | 'success-100' | 'inverse-100' = 'blue-100'
    let icon: TransactionIconType = 'arrowTop'

    if (outgoing.includes(this.type)) {
      color = 'inverse-100'
      icon = 'arrowTop'
    } else if (incoming.includes(this.type) && nft.includes(this.type)) {
      color = 'blue-100'
      icon = 'arrowBottom'
    } else if (incoming.includes(this.type) && currency.includes(this.type)) {
      color = 'success-100'
      icon = 'arrowBottom'
    } else {
      color = 'blue-100'
      icon = 'swap'
    }

    this.dataset.type = this.type

    return html`
      ${this.templateVisual()}
      <wui-icon-box
        size="xs"
        iconColor=${color}
        backgroundColor=${color}
        background="opaque"
        .icon=${icon}
        ?border=${true}
      ></wui-icon-box>
    `
  }

  // -- Private ------------------------------------------- //
  private templateVisual() {
    if (this.imageSrc) {
      return html`<wui-image src=${this.imageSrc} alt=${this.type}></wui-image>`
    } else if (nft.includes(this.type)) {
      return html`<wui-icon size="inherit" color="fg-200" name="nftPlaceholder"></wui-icon>`
    }

    return html`<wui-icon size="inherit" color="fg-200" name="coinPlaceholder"></wui-icon>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-transaction-visual': WuiTransactionVisual
  }
}
