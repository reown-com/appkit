import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-text/index.js'
import type { Transaction } from '@web3modal/core'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { TransactionType } from '../../utils/TypeUtil.js'
import { UiHelperUtil } from '../../utils/UiHelperUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import '../wui-transaction-visual/index.js'
import styles from './styles.js'

@customElement('wui-transaction-list-item')
export class WuiTransactionListItem extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Object }) public transaction?: Transaction

  @property() public transactionDetail = ''

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.transaction) {
      return null
    }

    // todo(enes): refactor and handle all possible cases
    const isNFT = this.transaction.transfers?.every(transfer => !!transfer.nft_info)
    const isFungible = this.transaction.transfers?.every(transfer => !!transfer.fungible_info)
    const transfer = this.transaction?.transfers?.[0]
    const haveMultipleTransfers = this.transaction.transfers?.length > 1
    const imageURL = transfer?.nft_info?.content?.preview?.url

    let description = ''
    if (isNFT) {
      description = transfer?.nft_info?.name || '-'
    } else if (isFungible) {
      description = transfer?.fungible_info?.symbol || '-'
    } else {
    }

    const minedDate = new Date(this.transaction.metadata.minedAt)
    const formattedDate = UiHelperUtil.getFormattedDate(minedDate)

    return html`
      <wui-flex>
        <wui-transaction-visual 
          .transfer=${transfer}
          .transaction=${this.transaction}
          imageSrc=${imageURL}
        ></wui-transaction-visual>
        <wui-flex flexDirection="column" gap="3xs">
          <wui-text variant="paragraph-600" color="fg-100">${this.transaction.metadata.operationType}</wui-text>
          <wui-text variant="small-500" color="fg-200">${description}</wui-text>
        </wui-flex>
        <wui-text variant="micro-700" color="fg-300">${formattedDate}</wui-text>
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-transaction-list-item': WuiTransactionListItem
  }
}
