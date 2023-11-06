import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import styles from './styles.js'
import { EventsController, TransactionsController, type Transaction } from '@web3modal/core'

const PAGINATOR_ID = 'last-transaction'
const FLOAT_FIXED_VALUE = 6

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
    // todo(enes): refactor and handle all possible cases
    return this.transactions.map((transaction, index) => {
      const { description, direction, isNFT, imageURL, status, type } =
        this.getTransactionListItemProps(transaction)

      return html`
        <wui-transaction-list-item
          id=${index === this.transactions.length - 1 && this.next !== null ? PAGINATOR_ID : ''}
          type=${type}
          description=${description}
          status=${status}
          direction=${direction}
          imageURL=${imageURL}
          isNFT=${isNFT}
        ></wui-transaction-list-item>
      `
    })
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

  private getTransactionListItemProps(transaction: Transaction) {
    const haveTransfer = transaction.transfers?.length > 0
    const isNFT = haveTransfer && transaction.transfers?.every(transfer => !!transfer.nft_info)
    const isFungible =
      haveTransfer && transaction.transfers?.every(transfer => !!transfer.fungible_info)
    const transfer = transaction?.transfers?.[0]
    const quantity = this.getQuantityFixedValue(transfer?.quantity.numeric)

    let imageURL = null
    if (transfer && isNFT) {
      imageURL = transfer?.nft_info?.content?.preview?.url
    } else if (transfer && isNFT) {
      imageURL = transfer?.fungible_info?.icon?.url
    }

    let description = ''
    if (isNFT) {
      description = transfer?.nft_info?.name || '-'
    } else if (isFungible) {
      description = [quantity, transfer?.fungible_info?.symbol].join(' ').trim() || '-'
    } else {
      description = transaction?.metadata?.status || '-'
    }

    return {
      direction: transfer?.direction,
      description,
      isNFT,
      imageURL,
      type: transaction.metadata?.operationType,
      status: transaction.metadata?.status
    }
  }

  private getQuantityFixedValue(value: string | undefined) {
    if (!value) return null

    const parsetValue = parseFloat(value)
    return parsetValue.toFixed(FLOAT_FIXED_VALUE)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-transactions-view': W3mTransactionsView
  }
}
