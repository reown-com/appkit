import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { DateUtil, type Transaction } from '@reown/appkit-common'
import {
  AccountController,
  AssetController,
  OnRampController,
  OptionsController,
  TransactionsController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-text'
import '@reown/appkit-ui/wui-transaction-list-item-loader'

import '../../partials/w3m-onramp-activity-item/index.js'
import styles from './styles.js'

// -- Helpers --------------------------------------------- //
const LOADING_ITEM_COUNT = 7

@customElement('w3m-onramp-activity-view')
export class W3mOnRampActivityView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  private refetchTimeout?: ReturnType<typeof setTimeout>

  // -- State & Properties -------------------------------- //
  @state() protected selectedOnRampProvider = OnRampController.state.selectedProvider

  @state() protected loading = false

  @state() private transactions = TransactionsController.state.transactions

  @state() private tokenImages = AssetController.state.tokenImages

  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        OnRampController.subscribeKey('selectedProvider', val => {
          this.selectedOnRampProvider = val
        }),
        AssetController.subscribeKey('tokenImages', val => (this.tokenImages = val)),
        () => {
          clearTimeout(this.refetchTimeout)
        },
        TransactionsController.subscribe(val => {
          this.transactions = [...val.transactions]
        })
      ]
    )
    TransactionsController.clearCursor()
    this.fetchTransactions()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" .padding=${['0', 's', 's', 's']} gap="xs">
        ${this.loading ? this.templateLoading() : this.templateTransactionsByYear()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private templateTransactions(transactions: Transaction[]) {
    return transactions?.map(transaction => {
      const date = DateUtil.formatDate(transaction?.metadata?.minedAt)
      const transfer = transaction.transfers[0]
      const fungibleInfo = transfer?.fungible_info

      if (!fungibleInfo) {
        return null
      }

      const icon = fungibleInfo?.icon?.url || this.tokenImages?.[fungibleInfo.symbol || '']

      return html`
        <w3m-onramp-activity-item
          label="Bought"
          .completed=${transaction.metadata.status === 'ONRAMP_TRANSACTION_STATUS_SUCCESS'}
          .inProgress=${transaction.metadata.status === 'ONRAMP_TRANSACTION_STATUS_IN_PROGRESS'}
          .failed=${transaction.metadata.status === 'ONRAMP_TRANSACTION_STATUS_FAILED'}
          purchaseCurrency=${ifDefined(fungibleInfo.symbol)}
          purchaseValue=${transfer.quantity.numeric}
          date=${date}
          icon=${ifDefined(icon)}
          symbol=${ifDefined(fungibleInfo.symbol)}
        ></w3m-onramp-activity-item>
      `
    })
  }

  private templateTransactionsByYear() {
    if (!this.transactions || this.transactions.length === 0) {
      return html``
    }

    return html`
      <wui-flex flexDirection="column" gap="xs">
        ${this.templateTransactions(this.transactions)}
      </wui-flex>
    `
  }

  private async fetchTransactions() {
    const address = AccountController.state.address
    const projectId = OptionsController.state.projectId

    if (!address) {
      throw new Error('No address found')
    }

    if (!projectId) {
      throw new Error('No projectId found')
    }

    this.loading = true

    await TransactionsController.fetchTransactions(address, 'meld')

    this.loading = false
    this.refetchLoadingTransactions()
  }

  private refetchLoadingTransactions() {
    const loadingTransactions = this.transactions.filter(
      transaction => transaction.metadata.status === 'ONRAMP_TRANSACTION_STATUS_IN_PROGRESS'
    )

    if (loadingTransactions.length === 0) {
      clearTimeout(this.refetchTimeout)

      return
    }

    // Wait 2 seconds before refetching
    this.refetchTimeout = setTimeout(async () => {
      const address = AccountController.state.address
      await TransactionsController.fetchTransactions(address, 'meld')
      this.refetchLoadingTransactions()
    }, 3000)
  }

  private templateLoading() {
    return Array(LOADING_ITEM_COUNT)
      .fill(html` <wui-transaction-list-item-loader></wui-transaction-list-item-loader> `)
      .map(item => item)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-onramp-activity-view': W3mOnRampActivityView
  }
}
