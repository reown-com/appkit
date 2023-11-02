import { CoreHelperUtil, RouterController } from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import styles from './styles.js'
import { TransactionsController } from '@web3modal/core' 

@customElement('w3m-transactions-view')
export class W3mTransactionsView extends LitElement {
  public static override styles = styles
  
  // -- State & Properties -------------------------------- //
  private unsubscribe: (() => void)[] = []
  
  @state() private transactions = TransactionsController.state.transactions

  @state() private loading = TransactionsController.state.loading

  @state() private empty = TransactionsController.state.empty
  

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        TransactionsController.subscribe(val => {
          this.transactions = val.transactions
          this.loading = val.loading
          this.empty = val.empty
        }),
      ]
    )
  }

  public override firstUpdated() {
    this.initialFetch()
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }
  
  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" padding="s" gap="s">
        ${this.loading ? this.templateLoading() : this.empty ? this.templateEmpty() : this.templateTransactions()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private templateTransactions() {
    return this.transactions.map((transaction) => html`
      <wui-transaction-list-item
        type=${transaction.type}
        imageSrc=${transaction.imageSrc}
        date=${transaction.date}
        transactionDetail=${"+5 ETH"}
      ></wui-transaction-list-item>
    `)
  }
 
  private templateEmpty() {
      return html`
        <wui-flex
          flexGrow="1"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          .padding=${['3xl', 'xl', '3xl', 'xl'] as const}
          gap="xl"
        >
          <wui-icon-box
            backgroundColor="glass-005"
            background="gray"
            iconColor="fg-200"
            icon="wallet"
            size="lg"
            ?border=${true}
            borderColor="wui-color-bg-125"
          ></wui-icon-box>
          <wui-flex flexDirection="column" alignItems="center" gap="xs">
            <wui-text align="center" variant="paragraph-500" color="fg-100">No Transactions yet</wui-text>
            <wui-text align="center" variant="small-500" color="fg-200">Start trading on dApps <br/> to grow your wallet!</wui-text>
          </wui-flex>
        </wui-flex>
      `
  }

  private templateLoading() {
      return Array(5).fill(null).map(()=> html`
        <wui-transaction-list-item-loader></wui-transaction-list-item-loader>
    `)
  }

  // Private Methods ------------------------------------- //
  private async initialFetch() {
   await TransactionsController.fetchTransactions()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-transactions-view': W3mTransactionsView
  }
}
