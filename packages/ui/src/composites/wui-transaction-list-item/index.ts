import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import { type TransactionType, TransactionTypePastTense } from '../../utils/TypeUtil.js'
import type { TransactionStatus, TransactionDirection } from '@web3modal/common'
import '../../components/wui-text/index.js'
import '../wui-transaction-visual/index.js'
import styles from './styles.js'

@customElement('wui-transaction-list-item')
export class WuiTransactionListItem extends LitElement {
  public static override styles = [styles]

  // -- State & Properties -------------------------------- //
  @property() public type: TransactionType = 'approve'

  @property() public descriptions?: string[]

  @property() public date?: string

  @property() public status?: TransactionStatus

  @property() public direction?: TransactionDirection

  @property() public imageURL?: string

  @property() public secondImageURL?: string

  @property({ type: Boolean }) public isNFT?: boolean

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex>
        <wui-transaction-visual
          status=${this.status}
          direction=${this.direction}
          type=${this.type}
          .isNFT=${this.isNFT}
          imageURL=${this.imageURL}
          secondImageURL=${this.secondImageURL}
        ></wui-transaction-visual>
        <wui-flex flexDirection="column" gap="3xs">
          <wui-text variant="paragraph-600" color="fg-100"
            >${TransactionTypePastTense[this.type]}</wui-text
          >
          <wui-flex class="description-container">
            ${this.templateDescription()} ${this.templateSecondDescription()}
          </wui-flex>
        </wui-flex>
        <wui-text variant="micro-700" color="fg-300"><span>${this.date}</span></wui-text>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private templateDescription() {
    const description = this.descriptions?.[0]

    return description
      ? html`
          <wui-text variant="small-500" color="fg-200">
            <span>${description}</span>
          </wui-text>
        `
      : null
  }

  private templateSecondDescription() {
    const description = this.descriptions?.[1]

    return description
      ? html`
          <wui-icon class="description-separator-icon" size="xxs" name="arrowRight"></wui-icon>
          <wui-text variant="small-400" color="fg-200">
            <span>${description}</span>
          </wui-text>
        `
      : null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-transaction-list-item': WuiTransactionListItem
  }
}
