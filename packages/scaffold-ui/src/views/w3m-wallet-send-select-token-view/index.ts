import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import type { Balance } from '@reown/appkit-common'
import {
  ChainController,
  CoreHelperUtil,
  RouterController,
  SendController
} from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'

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
                    tokenValue=${token.value}
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
