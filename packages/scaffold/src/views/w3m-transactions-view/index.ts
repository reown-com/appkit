import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import styles from './styles.js'
import { EventsController, TransactionsController } from '@web3modal/core'

const PAGINATOR_ID = 'last-transaction'

@customElement('w3m-transactions-view')
export class W3mTransactionsView extends LitElement {
  public static override styles = styles

  // -- State & Properties -------------------------------- //
  private unsubscribe: (() => void)[] = []

  private paginationObserver?: IntersectionObserver = undefined

  @state() private transactions = TransactionsController.state.transactions

  @state() private loading = TransactionsController.state.loading

  @state() private empty = TransactionsController.state.empty

  @state() private next = TransactionsController.state.next

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        TransactionsController.subscribe(val => {
          this.transactions = val.transactions
          this.loading = val.loading
          this.empty = val.empty
          this.next = val.next
        })
      ]
    )
  }

  public override firstUpdated() {
    if (this.transactions.length === 0) {
      this.fetchTransactions()
      this.createPaginationObserver()
    }
  }

  public override updated() {
    this.paginationObserver?.disconnect()

    const lastItem = this.shadowRoot?.querySelector(`#${PAGINATOR_ID}`)
    if (lastItem) {
      this.paginationObserver?.observe(lastItem)
    }
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" padding="s" gap="s">
        ${this.empty ? this.templateEmpty() : this.templateTransactions()}
        ${this.loading ? this.templateLoading() : null}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private templateTransactions() {
    console.log('loader', this.transactions.length - 1, this.next)
    return this.transactions.map(
      (transaction, index) => html`
        <wui-transaction-list-item
          id=${index === this.transactions.length - 1 && this.next !== null ? PAGINATOR_ID : ''}
          .transaction=${transaction}
        ></wui-transaction-list-item>
      `
    )
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
          <wui-text align="center" variant="paragraph-500" color="fg-100"
            >No Transactions yet</wui-text
          >
          <wui-text align="center" variant="small-500" color="fg-200"
            >Start trading on dApps <br />
            to grow your wallet!</wui-text
          >
        </wui-flex>
      </wui-flex>
    `
  }

  private templateLoading() {
    return Array(5)
      .fill(null)
      .map(() => html` <wui-transaction-list-item-loader></wui-transaction-list-item-loader> `)
  }

  private createPaginationObserver() {
    this.paginationObserver = new IntersectionObserver(([element]) => {
      if (element?.isIntersecting && !this.loading) {
        this.fetchTransactions()
        EventsController.sendEvent({ type: 'track', event: 'LOAD_MORE_TRANSACTIONS' })
      }
    }, {})
  }

  // Private Methods ------------------------------------- //
  private async fetchTransactions() {
    await TransactionsController.fetchTransactions()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-transactions-view': W3mTransactionsView
  }
}
