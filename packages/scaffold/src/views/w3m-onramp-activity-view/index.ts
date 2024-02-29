import { DateUtil, type Transaction } from '@web3modal/common'
import {
  AccountController,
  AssetController,
  OnRampController,
  OptionsController,
  TransactionsController
} from '@web3modal/core'
import { TransactionUtil, customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import styles from './styles.js'
import { ifDefined } from 'lit/directives/if-defined.js'

// -- Helpers --------------------------------------------- //
const LOADING_ITEM_COUNT = 7

@customElement('w3m-onramp-activity-view')
export class W3mOnRampActivityView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  private refetchTimeout: NodeJS.Timeout | undefined = undefined

  // -- State & Properties -------------------------------- //
  @state() protected selectedOnRampProvider = OnRampController.state.selectedProvider

  @state() protected loading = false

  @state() private coinbaseTransactions = TransactionsController.state.coinbaseTransactions

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
          this.coinbaseTransactions = { ...val.coinbaseTransactions }
        })
      ]
    )
    this.fetchTransactions()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" padding="s" gap="xs">
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
        <wui-onramp-activity-item
          label="Bought"
          .completed=${transaction.metadata.status === 'ONRAMP_TRANSACTION_STATUS_SUCCESS'}
          .inProgress=${transaction.metadata.status === 'ONRAMP_TRANSACTION_STATUS_IN_PROGRESS'}
          .failed=${transaction.metadata.status === 'ONRAMP_TRANSACTION_STATUS_FAILED'}
          purchaseCurrency=${ifDefined(fungibleInfo.symbol)}
          purchaseValue=${transfer.quantity.numeric}
          date=${date}
          icon=${ifDefined(icon)}
          symbol=${ifDefined(fungibleInfo.symbol)}
        ></wui-onramp-activity-item>
      `
    })
  }

  private templateTransactionsByYear() {
    const sortedYearKeys = Object.keys(this.coinbaseTransactions).sort().reverse()

    return sortedYearKeys.map(year => {
      const yearInt = parseInt(year, 10)

      const sortedMonthIndexes = new Array(12)
        .fill(null)
        .map((_, idx) => idx)
        .reverse()

      return sortedMonthIndexes.map(month => {
        const groupTitle = TransactionUtil.getTransactionGroupTitle(yearInt, month)
        const transactions = this.coinbaseTransactions[yearInt]?.[month]

        if (!transactions) {
          return null
        }

        return html`
          <wui-flex flexDirection="column">
            <wui-flex
              alignItems="center"
              flexDirection="row"
              .padding=${['xs', 's', 's', 's'] as const}
            >
              <wui-text variant="paragraph-500" color="fg-200">${groupTitle}</wui-text>
            </wui-flex>
            <wui-flex flexDirection="column" gap="xs">
              ${this.templateTransactions(transactions)}
            </wui-flex>
          </wui-flex>
        `
      })
    })
  }

  private async fetchTransactions() {
    const provider = 'coinbase'

    if (provider === 'coinbase') {
      await this.fetchCoinbaseTransactions()
    }
  }

  private async fetchCoinbaseTransactions() {
    const address = AccountController.state.address
    const projectId = OptionsController.state.projectId

    if (!address) {
      throw new Error('No address found')
    }

    if (!projectId) {
      throw new Error('No projectId found')
    }

    this.loading = true

    await TransactionsController.fetchTransactions(address, 'coinbase')

    this.loading = false
    this.refetchLoadingTransactions()
  }

  private refetchLoadingTransactions() {
    const today = new Date()
    const currentMonthTxs = this.coinbaseTransactions[today.getFullYear()]?.[today.getMonth()] || []

    const loadingTransactions = currentMonthTxs.filter(
      transaction => transaction.metadata.status === 'ONRAMP_TRANSACTION_STATUS_IN_PROGRESS'
    )

    if (loadingTransactions.length === 0) {
      clearTimeout(this.refetchTimeout)

      return
    }

    // Wait 2 seconds before refetching
    this.refetchTimeout = setTimeout(async () => {
      const address = AccountController.state.address
      await TransactionsController.fetchTransactions(address, 'coinbase')
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
