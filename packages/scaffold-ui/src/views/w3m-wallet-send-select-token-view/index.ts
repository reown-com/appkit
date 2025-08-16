import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import type { Balance } from '@reown/appkit-common'
import {
  ChainController,
  CoreHelperUtil,
  RouterController,
  SendController,
  SwapController
} from '@reown/appkit-controllers'
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

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private tokenBalances = SendController.state.tokenBalances

  @state() private tokens?: Balance[]

  @state() private filteredTokens?: Balance[]

  @state() private search = ''

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    this.fetchBalancesAndNetworkPrice()
    this.unsubscribe.push(
      ...[
        SendController.subscribe(val => {
          this.tokenBalances = val.tokenBalances
        })
      ]
    )
  }

  public override disconnectedCallback() {
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

  private async fetchBalancesAndNetworkPrice() {
    if (!this.tokenBalances || this.tokenBalances?.length === 0) {
      await this.fetchBalances()
      await this.fetchNetworkPrice()
    }
  }

  private async fetchBalances() {
    await SendController.fetchTokenBalance()
    SendController.fetchNetworkBalance()
  }

  private async fetchNetworkPrice() {
    await SwapController.getNetworkTokenPrice()
  }

  private templateSearchInput() {
    return html`
      <wui-flex gap="2" padding="3">
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
        .padding=${['0', '3', '0', '3'] as const}
      >
        <wui-flex justifyContent="flex-start" .padding=${['4', '3', '3', '3'] as const}>
          <wui-text variant="md-medium" color="secondary">Your tokens</wui-text>
        </wui-flex>
        <wui-flex flexDirection="column" gap="2">
          ${this.filteredTokens && this.filteredTokens.length > 0
            ? this.filteredTokens.map(
                token =>
                  html`<wui-list-token
                    @click=${this.handleTokenClick.bind(this, token)}
                    ?clickable=${true}
                    tokenName=${token.name}
                    tokenImageUrl=${token.iconUrl}
                    tokenAmount=${token.quantity.numeric}
                    tokenValue=${token.value}
                    tokenCurrency=${token.symbol}
                  ></wui-list-token>`
              )
            : html`<wui-flex
                .padding=${['20', '0', '0', '0'] as const}
                alignItems="center"
                flexDirection="column"
                gap="4"
              >
                <wui-icon-box icon="coinPlaceholder" color="default" size="lg"></wui-icon-box>
                <wui-flex
                  class="textContent"
                  gap="2"
                  flexDirection="column"
                  justifyContent="center"
                  flexDirection="column"
                >
                  <wui-text variant="lg-medium" align="center" color="primary">
                    No tokens found
                  </wui-text>
                  <wui-text variant="lg-regular" align="center" color="secondary">
                    Your tokens will appear here
                  </wui-text>
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
    SendController.setToken(token)
    SendController.setTokenAmount(undefined)
    RouterController.goBack()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-send-select-token-view': W3mSendSelectTokenView
  }
}
