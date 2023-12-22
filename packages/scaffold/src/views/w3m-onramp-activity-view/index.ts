import { DateUtil } from '@web3modal/common'
import {
  CoinbaseApiController,
  type CoinbaseTransaction,
  AccountController,
  OnRampController
} from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import styles from './styles.js'

// -- Helpers --------------------------------------------- //
const LOADING_ITEM_COUNT = 7

@customElement('w3m-onramp-activity-view')
export class W3mOnRampActivityView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() protected selectedOnRampProvider = OnRampController.state.selectedProvider

  @state() protected loading = false

  @state() private coinbaseTransactions: CoinbaseTransaction[] = []

  public constructor() {
    console.log('W3mOnRampActivityView')
    super()
    this.unsubscribe.push(
      ...[
        OnRampController.subscribeKey('selectedProvider', val => {
          this.selectedOnRampProvider = val
        })
      ]
    )
    this.fetchTransactions()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" padding="s" gap="xs">
        ${this.loading ? this.templateLoading() : this.onRampActivitiesTemplate()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private onRampActivitiesTemplate() {
    return this.coinbaseTransactions.map(transaction => {
      const date = DateUtil.getRelativeDateFromNow(transaction.created_at)

      return html`
        <wui-onramp-activity-item
          label="Bought"
          .completed=${transaction.status === 'ONRAMP_TRANSACTION_STATUS_SUCCESS'}
          .inProgress=${transaction.status === 'ONRAMP_TRANSACTION_STATUS_IN_PROGRESS'}
          .failed=${transaction.status === 'ONRAMP_TRANSACTION_STATUS_FAILED'}
          purchaseCurrency=${transaction.purchase_amount.currency}
          purchaseValue=${transaction.purchase_amount.value}
          date=${date}
          feeRange=${transaction.payment_total}
        ></wui-onramp-activity-item>
      `
    })
  }

  private async fetchTransactions() {
    const provider = OnRampController.state.selectedProvider?.name
    console.log('provider', provider)

    if (provider === 'coinbase') {
      await this.fetchCoinbaseTransactions()
    }
  }

  private async fetchCoinbaseTransactions() {
    const address = AccountController.state.address

    if (!address) {
      throw new Error('No address found')
    }

    this.loading = true

    const coinbaseResponse = await CoinbaseApiController.fetchTransactions({
      accountAddress: address,
      pageSize: 15,
      pageKey: ''
    })

    this.loading = false
    this.coinbaseTransactions = coinbaseResponse.transactions
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
