import { DateUtil } from '@web3modal/common'
import type { Transaction } from '@web3modal/common'
import {
  AccountController,
  EventsController,
  OptionsController,
  TransactionsController
} from '@web3modal/core'
import { TransactionUtil, customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import styles from './styles.js'
import type { TransactionType } from '@web3modal/ui/src/utils/TypeUtil.js'

// -- Helpers --------------------------------------------- //
const PAGINATOR_ID = 'last-transaction'
const LOADING_ITEM_COUNT = 7

@customElement('w3m-transactions-view')
export class W3mTransactionsView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  private paginationObserver?: IntersectionObserver = undefined

  // -- State & Properties -------------------------------- //
  @state() private address: string | undefined = AccountController.state.address

  @state() private isFirstUpdate = true

  /** Keep track of the previous chain in chase the chain changes while the component is mounted */
  @state() private chainInMemory: string | undefined

  @state() private transactions = TransactionsController.state.transactions

  @state() private transactionsByYear = TransactionsController.state.transactionsByYear

  @state() private loading = TransactionsController.state.loading

  @state() private empty = TransactionsController.state.empty

  @state() private next = TransactionsController.state.next

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        AccountController.subscribe(val => {
          if (val.isConnected) {
            if (this.address !== val.address) {
              this.address = val.address
              TransactionsController.resetTransactions()
              TransactionsController.fetchTransactions(val.address)
            }
          }
        }),
        TransactionsController.subscribe(val => {
          if (val.chainInView !== this.chainInMemory && !this.isFirstUpdate) {
            this.chainInMemory = val.chainInView
            TransactionsController.resetTransactions()
            TransactionsController.fetchTransactions(this.address)
            TransactionsController.setPrevChainInView(val.chainInView)
          }
          this.transactions = val.transactions
          this.transactionsByYear = val.transactionsByYear
          this.loading = val.loading
          this.empty = val.empty
          this.next = val.next
        })
      ]
    )
  }

  public override firstUpdated() {
    const prevChainInView = TransactionsController.state.prevChainInView
    const chainInView = TransactionsController.state.chainInView
    this.chainInMemory = chainInView

    if (this.transactions.length === 0) {
      TransactionsController.fetchTransactions(this.address)
    } else if (prevChainInView !== chainInView) {
      TransactionsController.resetTransactions()
      TransactionsController.fetchTransactions(this.address)
    }
    /* Prevent resetTransactions when coming back */
    TransactionsController.setPrevChainInView(chainInView)
    this.isFirstUpdate = false
    this.createPaginationObserver()
  }

  public override updated() {
    this.setPaginationObserver()
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" padding="s" gap="s">
        ${this.empty ? null : this.templateTransactionsByYear()}
        ${this.loading ? this.templateLoading() : null}
        ${!this.loading && this.empty ? this.templateEmpty() : null}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private templateTransactionsByYear() {
    const sortedYearKeys = Object.keys(this.transactionsByYear).sort().reverse()

    return sortedYearKeys.map((year, index) => {
      const isLastGroup = index === sortedYearKeys.length - 1
      const yearInt = parseInt(year, 10)
      const groupTitle = TransactionUtil.getTransactionGroupTitle(yearInt)
      const transactions = this.transactionsByYear[yearInt]

      if (!transactions) {
        return null
      }

      return html`
        <wui-flex flexDirection="column" gap="s">
          <wui-flex
            alignItems="center"
            flexDirection="row"
            .padding=${['xs', 's', 's', 's'] as const}
          >
            <wui-text variant="paragraph-500" color="fg-200">${groupTitle}</wui-text>
          </wui-flex>
          <wui-flex flexDirection="column" gap="xs">
            ${this.templateTransactions(transactions, isLastGroup)}
          </wui-flex>
        </wui-flex>
      `
    })
  }

  private templateRenderTransaction(transaction: Transaction, isLastTransaction: boolean) {
    const { date, descriptions, direction, isAllNFT, images, status, transfers, type } =
      this.getTransactionListItemProps(transaction)
    const haveMultipleTransfers = transfers?.length > 1
    const haveTwoTransfers = transfers?.length === 2

    if (haveTwoTransfers && !isAllNFT) {
      return html`
        <wui-transaction-list-item
          date=${date}
          .direction=${direction}
          id=${isLastTransaction && this.next ? PAGINATOR_ID : ''}
          status=${status}
          type=${type}
          .images=${images}
          .descriptions=${descriptions}
        ></wui-transaction-list-item>
      `
    }

    if (haveMultipleTransfers) {
      return transfers.map((transfer, index) => {
        const description = TransactionUtil.getTransferDescription(transfer)
        const isLastTransfer = isLastTransaction && index === transfers.length - 1

        return html` <wui-transaction-list-item
          date=${date}
          direction=${transfer.direction}
          id=${isLastTransfer && this.next ? PAGINATOR_ID : ''}
          status=${status}
          type=${type}
          .onlyDirectionIcon=${true}
          .images=${[images?.[index]]}
          .descriptions=${[description]}
        ></wui-transaction-list-item>`
      })
    }

    return html`
      <wui-transaction-list-item
        date=${date}
        .direction=${direction}
        id=${isLastTransaction && this.next ? PAGINATOR_ID : ''}
        status=${status}
        type=${type}
        .images=${images}
        .descriptions=${descriptions}
      ></wui-transaction-list-item>
    `
  }

  private templateTransactions(transactions: Transaction[], isLastGroup: boolean) {
    return transactions.map((transaction, index) => {
      const isLastTransaction = isLastGroup && index === transactions.length - 1

      return html`${this.templateRenderTransaction(transaction, isLastTransaction)}`
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
    return Array(LOADING_ITEM_COUNT)
      .fill(html` <wui-transaction-list-item-loader></wui-transaction-list-item-loader> `)
      .map(item => item)
  }

  private createPaginationObserver() {
    const { projectId } = OptionsController.state

    this.paginationObserver = new IntersectionObserver(([element]) => {
      if (element?.isIntersecting && !this.loading) {
        TransactionsController.fetchTransactions(this.address)
        EventsController.sendEvent({
          type: 'track',
          event: 'LOAD_MORE_TRANSACTIONS',
          properties: {
            address: this.address,
            projectId,
            cursor: this.next
          }
        })
      }
    }, {})
    this.setPaginationObserver()
  }

  private setPaginationObserver() {
    this.paginationObserver?.disconnect()

    const lastItem = this.shadowRoot?.querySelector(`#${PAGINATOR_ID}`)
    if (lastItem) {
      this.paginationObserver?.observe(lastItem)
    }
  }

  private getTransactionListItemProps(transaction: Transaction) {
    const date = DateUtil.getRelativeDateFromNow(transaction?.metadata?.minedAt)
    const descriptions = TransactionUtil.getTransactionDescriptions(transaction)

    const transfers = transaction?.transfers
    const transfer = transaction?.transfers?.[0]
    const isAllNFT =
      Boolean(transfer) && transaction?.transfers?.every(item => Boolean(item.nft_info))
    const images = TransactionUtil.getTransactionImages(transfers)

    return {
      date,
      direction: transfer?.direction,
      descriptions,
      isAllNFT,
      images,
      status: transaction.metadata?.status,
      transfers,
      type: transaction.metadata?.operationType as TransactionType
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-transactions-view': W3mTransactionsView
  }
}
