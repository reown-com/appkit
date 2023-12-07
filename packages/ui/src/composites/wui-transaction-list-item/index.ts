import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import {
  type TransactionType,
  type TransactionIconType,
  TransactionTypePastTense
} from '../../utils/TypeUtil.js'
import type { TransactionStatus, TransactionDirection, TransactionImage } from '@web3modal/common'
import { resetStyles } from '../../utils/ThemeUtil.js'
import '../../components/wui-text/index.js'
import '../wui-transaction-visual/index.js'
import '../wui-icon-box/index.js'
import styles from './styles.js'

@customElement('wui-transaction-list-item')
export class WuiTransactionListItem extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public type: TransactionType = 'approve'

  @property() public descriptions?: string[]

  @property() public date?: string

  @property() public onlyDirectionIcon?: boolean = false

  @property() public status?: TransactionStatus

  @property() public direction?: TransactionDirection

  @property() public images: TransactionImage[] = []

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex>
        <wui-transaction-visual
          direction=${this.direction}
          type=${this.type}
          onlyDirectionIcon=${this.onlyDirectionIcon}
          .images=${this.images}
        ></wui-transaction-visual>
        <wui-flex flexDirection="column" gap="3xs">
          <wui-flex flexDirection="row" alignItems="center" gap="3xs">
            ${this.templateIcon()}
            <wui-text variant="paragraph-600" color="fg-100">
              ${TransactionTypePastTense[this.type]}
            </wui-text>
          </wui-flex>
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

  private templateIcon() {
    let color: 'accent-100' | 'error-100' | 'success-100' | 'inverse-100' = 'accent-100'
    let icon: TransactionIconType | undefined = undefined

    icon = this.getIcon()

    if (this.status) {
      color = this.getStatusColor()
    }

    if (!icon) {
      return null
    }

    return html`
      <wui-icon-box
        size="xs"
        iconColor=${color}
        backgroundColor=${color}
        background="opaque"
        icon=${icon}
        ?border=${true}
        borderColor="wui-color-bg-125"
      ></wui-icon-box>
    `
  }

  private getDirectionIcon() {
    switch (this.direction) {
      case 'in':
        return 'arrowBottom'
      case 'out':
        return 'arrowTop'
      default:
        return undefined
    }
  }

  private getIcon() {
    if (this.onlyDirectionIcon) {
      return this.getDirectionIcon()
    }

    if (this.type === 'trade') {
      return 'swapHorizontalBold'
    } else if (this.type === 'approve') {
      return 'checkmark'
    } else if (this.type === 'cancel') {
      return 'close'
    }

    return this.getDirectionIcon()
  }

  private getStatusColor() {
    switch (this.status) {
      case 'confirmed':
        return 'success-100'
      case 'failed':
        return 'error-100'
      case 'pending':
        return 'inverse-100'
      default:
        return 'accent-100'
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-transaction-list-item': WuiTransactionListItem
  }
}
