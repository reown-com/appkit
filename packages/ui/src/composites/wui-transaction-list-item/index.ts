import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import type {
  TransactionDirection,
  TransactionImage,
  TransactionStatus
} from '@reown/appkit-common'

import '../../components/wui-text/index.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import { type TransactionType, TransactionTypePastTense } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-transaction-visual/index.js'
import styles from './styles.js'

@customElement('wui-transaction-list-item')
export class WuiTransactionListItem extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public type: TransactionType = 'approve'

  @property({ type: Array }) public descriptions?: string[]

  @property() public date?: string

  @property({ type: Boolean }) public onlyDirectionIcon?: boolean = false

  @property() public status?: TransactionStatus

  @property() public direction?: TransactionDirection

  @property({ type: Array }) public images: TransactionImage[] = []

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex>
        <wui-transaction-visual
          .status=${this.status}
          direction=${ifDefined(this.direction)}
          type=${this.type}
          .onlyDirectionIcon=${this.onlyDirectionIcon}
          .images=${this.images}
        ></wui-transaction-visual>
        <wui-flex flexDirection="column" gap="1">
          <wui-text variant="lg-medium" color="primary">
            ${TransactionTypePastTense[this.type] || this.type}
          </wui-text>
          <wui-flex class="description-container">
            ${this.templateDescription()} ${this.templateSecondDescription()}
          </wui-flex>
        </wui-flex>
        <wui-text variant="sm-medium" color="secondary"><span>${this.date}</span></wui-text>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private templateDescription() {
    const description = this.descriptions?.[0]

    return description
      ? html`
          <wui-text variant="md-regular" color="secondary">
            <span>${description}</span>
          </wui-text>
        `
      : null
  }

  private templateSecondDescription() {
    const description = this.descriptions?.[1]

    return description
      ? html`
          <wui-icon class="description-separator-icon" size="sm" name="arrowRight"></wui-icon>
          <wui-text variant="md-regular" color="secondary">
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
