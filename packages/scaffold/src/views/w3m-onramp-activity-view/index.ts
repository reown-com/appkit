import { CoinbaseApiController, type CoinbaseTransaction, RouterController } from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

@customElement('w3m-onramp-activity-view')
export class W3mOnRampActivityView extends LitElement {
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
    return this.coinbaseTransactions.map(
      provider => html`
        <wui-onramp-provider-item
          label=${provider.created_at}
          feeRange=${provider.payment_total}
          @click=${() => {}}
        ></wui-onramp-provider-item>
      `
    )
  }

  private async fetchCoinbaseTransactions() {
    const coinbaseResponse = await CoinbaseApiController.fetchTransactions({
      accountAddress: '',
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
