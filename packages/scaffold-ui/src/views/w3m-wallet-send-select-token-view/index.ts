import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import type { Balance } from '@reown/appkit-common'
import { ChainController, CoreHelperUtil, RouterController } from '@reown/appkit-controllers'
import { sendActor } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-icon-box'
import '@reown/appkit-ui/wui-input-text'
import '@reown/appkit-ui/wui-link'
import '@reown/appkit-ui/wui-list-token'
import '@reown/appkit-ui/wui-separator'
import '@reown/appkit-ui/wui-text'

import styles from './styles.js'

@customElement('w3m-wallet-send-select-token-view')
export class W3mSendSelectTokenView extends LitElement {
  public static override styles = styles

  // -- State & Properties -------------------------------- //
  @state() private tokenBalances: Balance[] = []
  @state() private tokens?: Balance[]
  @state() private filteredTokens?: Balance[]
  @state() private search = ''

  private unsubscribe: (() => void)[] = []

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()

    // Initialize from current actor state
    const snapshot = sendActor.getSnapshot()
    this.tokenBalances = snapshot.context.tokenBalances

    // Fetch balances when this view is loaded if not already available
    if (snapshot.context.tokenBalances.length === 0 && !snapshot.matches('loadingBalances')) {
      sendActor.send({ type: 'FETCH_BALANCES' })
    }

    // Subscribe to actor state changes
    this.unsubscribe.push(
      sendActor.subscribe(actorSnapshot => {
        this.tokenBalances = actorSnapshot.context.tokenBalances
        this.requestUpdate()
      }).unsubscribe
    )
  }

  public override disconnectedCallback() {
    super.disconnectedCallback()
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column">
        ${this.templateSearchInput()} <wui-separator></wui-separator> ${this.templateTokens()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //

  private templateSearchInput() {
    return html`
      <wui-flex gap="xs" padding="s">
        <wui-input-text
          @inputChange=${this.onInputChange.bind(this)}
          class="network-search-input"
          size="sm"
          placeholder="Search token"
          icon="search"
        ></wui-input-text>
      </wui-flex>
    `
  }

  private templateTokens() {
    this.tokens = this.tokenBalances?.filter(
      token => token.chainId === ChainController.state.activeCaipNetwork?.caipNetworkId
    )
    if (this.search) {
      this.filteredTokens = this.tokenBalances?.filter(token =>
        token.name.toLowerCase().includes(this.search.toLowerCase())
      )
    } else {
      this.filteredTokens = this.tokens
    }

    return html`
      <wui-flex
        class="contentContainer"
        flexDirection="column"
        .padding=${['0', 's', '0', 's'] as const}
      >
        <wui-flex justifyContent="flex-start" .padding=${['m', 's', 's', 's'] as const}>
          <wui-text variant="paragraph-500" color="fg-200">Your tokens</wui-text>
        </wui-flex>
        <wui-flex flexDirection="column" gap="xs">
          ${this.filteredTokens && this.filteredTokens.length > 0
            ? this.filteredTokens.map(
                token =>
                  html`<wui-list-token
                    @click=${this.handleTokenClick.bind(this, token)}
                    ?clickable=${true}
                    tokenName=${token.name}
                    tokenImageUrl=${token.iconUrl}
                    tokenAmount=${token.quantity.numeric}
                    tokenValue=${ifDefined(token.value)}
                    tokenCurrency=${token.symbol}
                  ></wui-list-token>`
              )
            : html`<wui-flex
                .padding=${['4xl', '0', '0', '0'] as const}
                alignItems="center"
                flexDirection="column"
                gap="l"
              >
                <wui-icon-box
                  icon="coinPlaceholder"
                  size="inherit"
                  iconColor="fg-200"
                  backgroundColor="fg-200"
                  iconSize="lg"
                ></wui-icon-box>
                <wui-flex
                  class="textContent"
                  gap="xs"
                  flexDirection="column"
                  justifyContent="center"
                  flexDirection="column"
                >
                  <wui-text variant="paragraph-500" align="center" color="fg-100"
                    >No tokens found</wui-text
                  >
                  <wui-text variant="small-400" align="center" color="fg-200"
                    >Your tokens will appear here</wui-text
                  >
                </wui-flex>
                <wui-link @click=${this.onBuyClick.bind(this)}>Buy</wui-link>
              </wui-flex>`}
        </wui-flex>
      </wui-flex>
    `
  }

  private onBuyClick() {
    RouterController.push('OnRampProviders')
  }
  private onInputChange(event: CustomEvent<string>) {
    this.onDebouncedSearch(event.detail)
  }

  private onDebouncedSearch = CoreHelperUtil.debounce((value: string) => {
    this.search = value
  })

  private handleTokenClick(token: Balance) {
    sendActor.send({ type: 'SELECT_TOKEN', token })
    RouterController.goBack()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-send-select-token-view': W3mSendSelectTokenView
  }
}
