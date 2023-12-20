import { DateUtil } from '@web3modal/common'
import {
  CoinbaseApiController,
  type CoinbaseTransaction,
  RouterController,
  AccountController
} from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import styles from './styles.js'

@customElement('w3m-onramp-activity-view')
export class W3mOnRampActivityView extends LitElement {
  public static override styles = styles

  @state() private coinbaseTransactions: CoinbaseTransaction[] = []

  public override connectedCallback() {
    super.connectedCallback()
    this.fetchCoinbaseTransactions()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" padding="s" gap="xs">
        ${this.onRampActivitiesTemplate()}
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

  private async fetchCoinbaseTransactions() {
    const address = AccountController.state.address

    if (!address) {
      throw new Error('No address found')
    }

    const coinbaseResponse = await CoinbaseApiController.fetchTransactions({
      accountAddress: address,
      pageSize: 15,
      pageKey: ''
    })

    this.coinbaseTransactions = coinbaseResponse.transactions
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-onramp-activity-view': W3mOnRampActivityView
  }
}
