import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { TransactionType } from '../../utils/TypesUtil.js'
import { UiHelperUtil } from '../../utils/UiHelperUtils.js'
import '../wui-transaction-visual/index.js'
import styles from './styles.js'

@customElement('wui-list-transaction')
export class WuiListTransaction extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public type: TransactionType = 'bought'

  @property({ type: Boolean }) public disabled = false

  @property() public imageSrc = ''

  @property({ attribute: false }) public date: Date = new Date()

  @property() public transactionDetail = ''

  // -- Render -------------------------------------------- //
  public override render() {
    const isSent = this.type === 'nftSent' || this.type === 'cryptoSent'
    const title = isSent ? 'Sent' : this.type

    const formattedDate = UiHelperUtil.getFormattedDate(this.date)

    return html`
      <button ?disabled=${this.disabled} ontouchstart>
        <wui-transaction-visual
          type=${this.type}
          imageSrc=${this.imageSrc}
        ></wui-transaction-visual>
        <wui-flex flexDirection="column" gap="3xs">
          <wui-text variant="paragraph-600" color="fg-100">${title}</wui-text>
          <wui-text variant="small-500" color="fg-200">${this.transactionDetail}</wui-text>
        </wui-flex>
        <wui-text variant="micro-700" color="fg-300">${formattedDate}</wui-text>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-list-transaction': WuiListTransaction
  }
}
