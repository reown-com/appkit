import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import { ParseUtil } from '@reown/appkit-common'
import {
  ChainController,
  OnRampController,
  type OnRampCryptoCurrency,
  type OnRampFiatCurrency,
  RouterController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-input-text'
import '@reown/appkit-ui/wui-text'
import '@reown/appkit-ui/wui-token-button'
import '@reown/appkit-ui/wui-token-list-item'
import '@reown/appkit-ui/wui-token-list-item-loader'

import styles from './styles.js'

@customElement('w3m-buy-select-token-view')
export class W3mBuySelectTokenView extends LitElement {
  public static override styles = styles

  private unsubscribe: ((() => void) | undefined)[] = []

  private onRampSelectType = RouterController.state.data?.onRampSelectType

  // -- State & Properties -------------------------------- //
  @state() private searchValue = ''
  @state() private fiatCurrencies = OnRampController.state.fiatCurrencies
  @state() private cryptoCurrencies = OnRampController.state.cryptoCurrencies
  @state() private fiatCurrenciesLoading = OnRampController.state.fiatCurrenciesLoading
  @state() private cryptoCurrenciesLoading = OnRampController.state.cryptoCurrenciesLoading

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()

    this.unsubscribe.push(
      OnRampController.subscribe(newState => {
        this.fiatCurrencies = newState.fiatCurrencies
        this.cryptoCurrencies = newState.cryptoCurrencies
        this.fiatCurrenciesLoading = newState.fiatCurrenciesLoading
        this.cryptoCurrenciesLoading = newState.cryptoCurrenciesLoading
      })
    )
  }

  public override async firstUpdated() {
    if (this.onRampSelectType === 'fiat') {
      await OnRampController.getFiatCurrencies()
    } else {
      await OnRampController.getCryptoCurrencies()
    }
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" gap="3">
        ${this.templateSearchInput()} ${this.templateTokens()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private onSelectToken(token: unknown) {
    if (this.onRampSelectType === 'fiat') {
      OnRampController.setSelectedFiatCurrency(token as OnRampFiatCurrency)
    } else {
      OnRampController.setSelectedCryptoCurrency(token as OnRampCryptoCurrency)
    }
    RouterController.goBack()
  }

  private templateSearchInput() {
    const placeholder = this.onRampSelectType === 'fiat' ? 'Search currency' : 'Search token'
    const testId =
      this.onRampSelectType === 'fiat'
        ? 'swap-select-token-search-input'
        : 'onramp-select-token-search-input'

    return html`
      <wui-flex .padding=${['1', '3', '0', '3']} gap="2">
        <wui-input-text
          data-testid=${testId}
          class="network-search-input"
          size="sm"
          placeholder=${placeholder}
          icon="search"
          .value=${this.searchValue}
          @inputChange=${this.onSearchInputChange.bind(this)}
        ></wui-input-text>
      </wui-flex>
    `
  }

  private templateAllTokens() {
    const isLoading = this.fiatCurrenciesLoading || this.cryptoCurrenciesLoading

    if (isLoading) {
      return html`
        <wui-token-list-item-loader></wui-token-list-item-loader>
        <wui-token-list-item-loader></wui-token-list-item-loader>
        <wui-token-list-item-loader></wui-token-list-item-loader>
        <wui-token-list-item-loader></wui-token-list-item-loader>
        <wui-token-list-item-loader></wui-token-list-item-loader>
      `
    }

    if (this.onRampSelectType === 'fiat') {
      const filteredFiatCurrencies = this.filterTokensWithText<OnRampFiatCurrency[]>(
        this.fiatCurrencies,
        this.searchValue
      )

      return html`
        ${filteredFiatCurrencies.map(
          fiatCurrency => html`
            <wui-token-list-item
              data-testid="buy-select-token-item-${fiatCurrency.symbol}"
              name=${fiatCurrency.name}
              symbol=${fiatCurrency.symbol}
              imageSrc=${this.getImageSrc(fiatCurrency)}
              @click=${() => this.onSelectToken(fiatCurrency)}
            >
            </wui-token-list-item>
          `
        )}
      `
    }

    const filteredCryptoCurrencies = this.filterTokensWithText<OnRampCryptoCurrency[]>(
      this.cryptoCurrencies,
      this.searchValue
    )
    const namespace = ChainController.state.activeChain
    const activeCaipNetwork = ChainController.getActiveCaipNetwork(namespace)

    if (!activeCaipNetwork) {
      return null
    }

    const { chainId } = ParseUtil.parseCaipNetworkId(activeCaipNetwork.caipNetworkId)

    return html`
      ${filteredCryptoCurrencies
        .filter(
          cryptoCurrency =>
            cryptoCurrency.network.chainId &&
            cryptoCurrency.network.chainId.toString() === chainId.toString()
        )
        .map(
          cryptoCurrency => html`
            <wui-token-list-item
              data-testid="buy-select-token-item-${cryptoCurrency.symbol}"
              name=${cryptoCurrency.name}
              symbol=${cryptoCurrency.symbol}
              imageSrc=${this.getImageSrc(cryptoCurrency)}
              @click=${() => this.onSelectToken(cryptoCurrency)}
            >
            </wui-token-list-item>
          `
        )}
    `
  }

  private templateTokens() {
    return html`
      <wui-flex class="tokens-container">
        <wui-flex class="tokens" .padding=${['0', '2', '2', '2'] as const} flexDirection="column">
          <wui-flex justifyContent="flex-start" padding="3">
            <wui-text variant="md-medium" color="secondary">Tokens</wui-text>
          </wui-flex>
          ${this.templateAllTokens()}
        </wui-flex>
      </wui-flex>
    `
  }

  private onSearchInputChange(event: CustomEvent<string>) {
    this.searchValue = event.detail
  }

  private filterTokensWithText<T>(
    tokens: OnRampFiatCurrency[] | OnRampCryptoCurrency[],
    text: string
  ) {
    return tokens
      .filter(token => `${token.symbol} ${token.name}`.toLowerCase().includes(text.toLowerCase()))
      .sort((a, b) => {
        const aText = `${a.symbol} ${a.name}`.toLowerCase()
        const bText = `${b.symbol} ${b.name}`.toLowerCase()
        const aIndex = aText.indexOf(text.toLowerCase())
        const bIndex = bText.indexOf(text.toLowerCase())

        return aIndex - bIndex
      }) as T
  }

  private getImageSrc(currency: OnRampFiatCurrency | OnRampCryptoCurrency) {
    if (!currency) {
      return null
    }

    if ('icon' in currency) {
      const base64 = btoa(unescape(encodeURIComponent(currency.icon)))
      const src = 'data:image/svg+xml;base64,' + base64

      return src
    }

    return currency.image.small ?? null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-buy-select-token-view': W3mBuySelectTokenView
  }
}
