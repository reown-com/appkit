import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-text/index.js'
import type { TransactionDirection, TransactionStatus } from '@web3modal/core'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-transaction-visual/index.js'
import styles from './styles.js'
import type { TransactionType } from '../../utils/TypeUtil.js'

@customElement('wui-transaction-list-item')
export class WuiTransactionListItem extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public type?: TransactionType

  @property() public description?: string

  @property() public status?: TransactionStatus

  @property() public direction?: TransactionDirection

  @property() public imageURL?: string

  @property({ type: Boolean }) public isNFT?: boolean

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex>
        <wui-transaction-visual
          status=${this.status}
          direction=${this.direction}
          type=${this.type}
          isNFT=${this.isNFT}
          imageURL=${this.imageURL}
        ></wui-transaction-visual>
        <wui-flex flexDirection="column" gap="3xs">
          <wui-text variant="paragraph-600" color="fg-100">${this.type}</wui-text>
          <wui-text variant="small-500" color="fg-200"><span>${this.description}</span></wui-text>
        </wui-flex>
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-transaction-list-item': WuiTransactionListItem
  }
}
