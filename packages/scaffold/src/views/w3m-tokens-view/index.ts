import { AccountController, PortfolioTokenController } from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import styles from './styles.js'

// -- Helpers --------------------------------------------- //
const LOADING_ITEM_COUNT = 7

@customElement('w3m-tokens-view')
export class W3mTokensView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private address: string | undefined = AccountController.state.address

  @state() private tokens = PortfolioTokenController.state.tokens

  @state() private loading = PortfolioTokenController.state.loading

  @state() private empty = PortfolioTokenController.state.empty

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        AccountController.subscribe(val => {
          if (val.isConnected) {
            if (this.address !== val.address) {
              this.address = val.address
              PortfolioTokenController.resetTokens()
              PortfolioTokenController.fetchTokens(val.address)
            }
          }
        }),
        PortfolioTokenController.subscribe(val => {
          this.tokens = val.tokens
          this.loading = val.loading
          this.empty = val.empty
        })
      ]
    )
  }

  public override firstUpdated() {
    if (this.tokens.length === 0) {
      PortfolioTokenController.fetchTokens(this.address)
    }
    /*
     * IMPLEMENT
     *
     * this.createPaginationObserver()
     */
  }

  /*
   * IMPLEMENT
   *
   * public override updated() {
   *   this.setPaginationObserver()
   * }
   */

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" gap="s">
        ${this.templateRenderTransaction()}
        <!-- ${this.empty ? null : this.templateRenderTransaction()} -->
        <!-- ${this.loading ? this.templateLoading() : null}
        ${!this.loading && this.empty ? this.templateEmpty() : null} -->
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private templateRenderTransaction() {
    return this.tokens.map(
      token => html`
        <wui-flex>
          <wui-text> ${token.name} </wui-text>
        </wui-flex>
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
    return Array(LOADING_ITEM_COUNT)
      .fill(html` <wui-transaction-list-item-loader></wui-transaction-list-item-loader> `)
      .map(item => item)
  }

  /*
   * IMPLEMENT
   *
   * private createPaginationObserver() {
   *   const { projectId } = OptionsController.state
   */

  /*
   * IMPLEMENT
   *
   *   this.paginationObserver = new IntersectionObserver(([element]) => {
   *     if (element?.isIntersecting && !this.loading) {
   *       TransactionsController.fetchTransactions(this.address)
   *       EventsController.sendEvent({
   *         type: 'track',
   *         event: 'LOAD_MORE_TRANSACTIONS',
   *         properties: {
   *           address: this.address,
   *           projectId,
   *           cursor: this.next
   *         }
   *       })
   *     }
   *   }, {})
   *   this.setPaginationObserver()
   * }
   */

  /*
   * IMPLEMENT
   *
   * private setPaginationObserver() {
   *   this.paginationObserver?.disconnect()
   */

  /*
   * IMPLEMENT
   *
   *   const lastItem = this.shadowRoot?.querySelector(`#${PAGINATOR_ID}`)
   *   if (lastItem) {
   *     this.paginationObserver?.observe(lastItem)
   *   }
   * }
   */
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-tokens-view': W3mTokensView
  }
}
