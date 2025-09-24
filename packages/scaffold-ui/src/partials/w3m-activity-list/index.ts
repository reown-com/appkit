import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'

import { DateUtil } from '@reown/appkit-common'
import type { Transaction } from '@reown/appkit-common'
import {
  ChainController,
  CoreHelperUtil,
  EventsController,
  OptionsController,
  RouterController,
  TransactionsController,
  getPreferredAccountType
} from '@reown/appkit-controllers'
import { TransactionUtil, customElement } from '@reown/appkit-ui'
import type { TransactionType } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon-box'
import '@reown/appkit-ui/wui-link'
import '@reown/appkit-ui/wui-text'
import '@reown/appkit-ui/wui-transaction-list-item'
import '@reown/appkit-ui/wui-transaction-list-item-loader'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

import styles from './styles.js'

// -- Helpers --------------------------------------------- //
const PAGINATOR_ID = 'last-transaction'
const LOADING_ITEM_COUNT = 7

@customElement('w3m-activity-list')
export class W3mActivityList extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  private paginationObserver?: IntersectionObserver = undefined

  // -- State & Properties -------------------------------- //
  @property() public page: 'account' | 'activity' = 'activity'

  @state() private caipAddress = ChainController.state.activeCaipAddress

  @state() private transactionsByYear = TransactionsController.state.transactionsByYear

  @state() private loading = TransactionsController.state.loading

  @state() private empty = TransactionsController.state.empty

  @state() private next = TransactionsController.state.next

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    TransactionsController.clearCursor()
    this.unsubscribe.push(
      ...[
        ChainController.subscribeKey('activeCaipAddress', val => {
          if (val) {
            if (this.caipAddress !== val) {
              TransactionsController.resetTransactions()
              TransactionsController.fetchTransactions(val)
            }
          }
          this.caipAddress = val
        }),
        ChainController.subscribeKey('activeCaipNetwork', () => {
          this.updateTransactionView()
        }),
        TransactionsController.subscribe(val => {
          this.transactionsByYear = val.transactionsByYear
          this.loading = val.loading
          this.empty = val.empty
          this.next = val.next
        })
      ]
    )
  }

  public override firstUpdated() {
    this.updateTransactionView()
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
    return html` ${this.empty ? null : this.templateTransactionsByYear()}
    ${this.loading ? this.templateLoading() : null}
    ${!this.loading && this.empty ? this.templateEmpty() : null}`
  }

  // -- Private ------------------------------------------- //
  private updateTransactionView() {
    TransactionsController.resetTransactions()
    if (this.caipAddress) {
      TransactionsController.fetchTransactions(CoreHelperUtil.getPlainAddress(this.caipAddress))
    }
  }

  private templateTransactionsByYear() {
    const sortedYearKeys = Object.keys(this.transactionsByYear).sort().reverse()

    return sortedYearKeys.map(year => {
      const yearInt = parseInt(year, 10)

      const sortedMonthIndexes = new Array(12)
        .fill(null)
        .map((_, idx) => {
          const groupTitle = TransactionUtil.getTransactionGroupTitle(yearInt, idx)
          const transactions = this.transactionsByYear[yearInt]?.[idx]

          return {
            groupTitle,
            transactions
          }
        })
        .filter(({ transactions }) => transactions)
        .reverse()

      return sortedMonthIndexes.map(({ groupTitle, transactions }, index) => {
        const isLastGroup = index === sortedMonthIndexes.length - 1

        if (!transactions) {
          return null
        }

        return html`
          <wui-flex
            flexDirection="column"
            class="group-container"
            last-group="${isLastGroup ? 'true' : 'false'}"
            data-testid="month-indexes"
          >
            <wui-flex
              alignItems="center"
              flexDirection="row"
              .padding=${['2', '3', '3', '3'] as const}
            >
              <wui-text variant="md-medium" color="secondary" data-testid="group-title">
                ${groupTitle}
              </wui-text>
            </wui-flex>
            <wui-flex flexDirection="column" gap="2">
              ${this.templateTransactions(transactions, isLastGroup)}
            </wui-flex>
          </wui-flex>
        `
      })
    })
  }

  private templateRenderTransaction(transaction: Transaction, isLastTransaction: boolean) {
    const { date, descriptions, direction, images, status, type, transfers, isAllNFT } =
      this.getTransactionListItemProps(transaction)

    return html`
      <wui-transaction-list-item
        date=${date}
        .direction=${direction}
        id=${isLastTransaction && this.next ? PAGINATOR_ID : ''}
        status=${status}
        type=${type}
        .images=${images}
        .onlyDirectionIcon=${isAllNFT || transfers.length === 1}
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

  private emptyStateActivity() {
    return html`<wui-flex
      class="emptyContainer"
      flexGrow="1"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      .padding=${['10', '5', '10', '5'] as const}
      gap="5"
      data-testid="empty-activity-state"
    >
      <wui-icon-box color="default" icon="wallet" size="xl"></wui-icon-box>
      <wui-flex flexDirection="column" alignItems="center" gap="2">
        <wui-text align="center" variant="lg-medium" color="primary">No Transactions yet</wui-text>
        <wui-text align="center" variant="lg-regular" color="secondary"
          >Start trading on dApps <br />
          to grow your wallet!</wui-text
        >
      </wui-flex>
    </wui-flex>`
  }

  private emptyStateAccount() {
    return html`<wui-flex
      class="contentContainer"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      gap="4"
      data-testid="empty-account-state"
    >
      <wui-icon-box icon="swapHorizontal" size="lg" color="default"></wui-icon-box>
      <wui-flex
        class="textContent"
        gap="2"
        flexDirection="column"
        justifyContent="center"
        flexDirection="column"
      >
        <wui-text variant="md-regular" align="center" color="primary">No activity yet</wui-text>
        <wui-text variant="sm-regular" align="center" color="secondary"
          >Your next transactions will appear here</wui-text
        >
      </wui-flex>
      <wui-link @click=${this.onReceiveClick.bind(this)}>Trade</wui-link>
    </wui-flex>`
  }

  private templateEmpty() {
    if (this.page === 'account') {
      return html`${this.emptyStateAccount()}`
    }

    return html`${this.emptyStateActivity()}`
  }

  private templateLoading() {
    if (this.page === 'activity') {
      return Array(LOADING_ITEM_COUNT)
        .fill(html` <wui-transaction-list-item-loader></wui-transaction-list-item-loader> `)
        .map(item => item)
    }

    return null
  }

  private onReceiveClick() {
    RouterController.push('WalletReceive')
  }

  private createPaginationObserver() {
    const { projectId } = OptionsController.state

    this.paginationObserver = new IntersectionObserver(([element]) => {
      if (element?.isIntersecting && !this.loading) {
        TransactionsController.fetchTransactions(CoreHelperUtil.getPlainAddress(this.caipAddress))
        EventsController.sendEvent({
          type: 'track',
          event: 'LOAD_MORE_TRANSACTIONS',
          properties: {
            address: CoreHelperUtil.getPlainAddress(this.caipAddress),
            projectId,
            cursor: this.next,
            isSmartAccount:
              getPreferredAccountType(ChainController.state.activeChain) ===
              W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
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
    const date = DateUtil.formatDate(transaction?.metadata?.minedAt)
    const transfers = TransactionUtil.mergeTransfers(transaction?.transfers)
    const descriptions = TransactionUtil.getTransactionDescriptions(transaction, transfers)
    const transfer = transfers?.[0]
    const isAllNFT = Boolean(transfer) && transfers?.every(item => Boolean(item.nft_info))
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
    'w3m-activity-list': W3mActivityList
  }
}
