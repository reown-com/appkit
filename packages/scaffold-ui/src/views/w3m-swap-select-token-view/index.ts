import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import { RouterController, SwapController, type SwapTokenWithBalance } from '@reown/appkit-core'
import { MathUtil, customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-input-text'
import '@reown/appkit-ui/wui-text'
import '@reown/appkit-ui/wui-token-button'
import '@reown/appkit-ui/wui-token-list-item'

import styles from './styles.js'

@customElement('w3m-swap-select-token-view')
export class W3mSwapSelectTokenView extends LitElement {
  public static override styles = styles

  private unsubscribe: ((() => void) | undefined)[] = []

  // -- State & Properties -------------------------------- //
  @state() private interval?: NodeJS.Timeout

  @state() private targetToken = RouterController.state.data?.target

  @state() private sourceToken = SwapController.state.sourceToken

  @state() private sourceTokenAmount = SwapController.state.sourceTokenAmount

  @state() private toToken = SwapController.state.toToken

  @state() private myTokensWithBalance = SwapController.state.myTokensWithBalance

  @state() private popularTokens = SwapController.state.popularTokens

  @state() private searchValue = ''

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()

    this.unsubscribe.push(
      ...[
        SwapController.subscribe(newState => {
          this.sourceToken = newState.sourceToken
          this.toToken = newState.toToken
          this.myTokensWithBalance = newState.myTokensWithBalance
        })
      ]
    )
  }

  public override updated() {
    const suggestedTokensContainer = this.renderRoot?.querySelector('.suggested-tokens-container')
    suggestedTokensContainer?.addEventListener(
      'scroll',
      this.handleSuggestedTokensScroll.bind(this)
    )

    const tokensList = this.renderRoot?.querySelector('.tokens')
    tokensList?.addEventListener('scroll', this.handleTokenListScroll.bind(this))
  }

  public override disconnectedCallback() {
    super.disconnectedCallback()
    const suggestedTokensContainer = this.renderRoot?.querySelector('.suggested-tokens-container')
    const tokensList = this.renderRoot?.querySelector('.tokens')

    suggestedTokensContainer?.removeEventListener(
      'scroll',
      this.handleSuggestedTokensScroll.bind(this)
    )
    tokensList?.removeEventListener('scroll', this.handleTokenListScroll.bind(this))
    clearInterval(this.interval)
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" gap="s">
        ${this.templateSearchInput()} ${this.templateSuggestedTokens()} ${this.templateTokens()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private onSelectToken(token: SwapTokenWithBalance) {
    if (this.targetToken === 'sourceToken') {
      SwapController.setSourceToken(token)
    } else {
      SwapController.setToToken(token)
      if (this.sourceToken && this.sourceTokenAmount) {
        SwapController.swapTokens()
      }
    }
    RouterController.goBack()
  }

  private templateSearchInput() {
    return html`
      <wui-flex .padding=${['3xs', 's', '0', 's']} gap="xs">
        <wui-input-text
          data-testid="swap-select-token-search-input"
          class="network-search-input"
          size="sm"
          placeholder="Search token"
          icon="search"
          .value=${this.searchValue}
          @inputChange=${this.onSearchInputChange.bind(this)}
        ></wui-input-text>
      </wui-flex>
    `
  }

  private templateTokens() {
    const yourTokens = this.myTokensWithBalance ? Object.values(this.myTokensWithBalance) : []
    const tokens = this.popularTokens ? this.popularTokens : []

    const filteredYourTokens: SwapTokenWithBalance[] = this.filterTokensWithText<
      SwapTokenWithBalance[]
    >(yourTokens, this.searchValue)
    const filteredTokens = this.filterTokensWithText<SwapTokenWithBalance[]>(
      tokens,
      this.searchValue
    )

    return html`
      <wui-flex class="tokens-container">
        <wui-flex class="tokens" .padding=${['0', 's', 's', 's']} flexDirection="column">
          ${filteredYourTokens?.length > 0
            ? html`
                <wui-flex justifyContent="flex-start" padding="s">
                  <wui-text variant="paragraph-500" color="fg-200">Your tokens</wui-text>
                </wui-flex>
                ${filteredYourTokens.map(token => {
                  const selected =
                    token.symbol === this.sourceToken?.symbol ||
                    token.symbol === this.toToken?.symbol

                  return html`
                    <wui-token-list-item
                      data-testid="swap-select-token-item-${token.symbol}"
                      name=${token.name}
                      ?disabled=${selected}
                      symbol=${token.symbol}
                      price=${token?.price}
                      amount=${token?.quantity?.numeric}
                      imageSrc=${token.logoUri}
                      @click=${() => {
                        if (!selected) {
                          this.onSelectToken(token)
                        }
                      }}
                    >
                    </wui-token-list-item>
                  `
                })}
              `
            : null}

          <wui-flex justifyContent="flex-start" padding="s">
            <wui-text variant="paragraph-500" color="fg-200">Tokens</wui-text>
          </wui-flex>
          ${filteredTokens?.length > 0
            ? filteredTokens.map(
                token => html`
                  <wui-token-list-item
                    data-testid="swap-select-token-item-${token.symbol}"
                    name=${token.name}
                    symbol=${token.symbol}
                    imageSrc=${token.logoUri}
                    @click=${() => this.onSelectToken(token)}
                  >
                  </wui-token-list-item>
                `
              )
            : null}
        </wui-flex>
      </wui-flex>
    `
  }

  private templateSuggestedTokens() {
    const tokens = SwapController.state.suggestedTokens
      ? SwapController.state.suggestedTokens.slice(0, 8)
      : null

    if (!tokens) {
      return null
    }

    return html`
      <wui-flex class="suggested-tokens-container" .padding=${['0', 's', '0', 's']} gap="xs">
        ${tokens.map(
          token => html`
            <wui-token-button
              text=${token.symbol}
              imageSrc=${token.logoUri}
              @click=${() => this.onSelectToken(token)}
            >
            </wui-token-button>
          `
        )}
      </wui-flex>
    `
  }

  private onSearchInputChange(event: CustomEvent<string>) {
    this.searchValue = event.detail
  }

  private handleSuggestedTokensScroll() {
    const container = this.renderRoot?.querySelector('.suggested-tokens-container') as
      | HTMLElement
      | undefined

    if (!container) {
      return
    }

    container.style.setProperty(
      '--suggested-tokens-scroll--left-opacity',
      MathUtil.interpolate([0, 100], [0, 1], container.scrollLeft).toString()
    )
    container.style.setProperty(
      '--suggested-tokens-scroll--right-opacity',
      MathUtil.interpolate(
        [0, 100],
        [0, 1],
        container.scrollWidth - container.scrollLeft - container.offsetWidth
      ).toString()
    )
  }

  private handleTokenListScroll() {
    const container = this.renderRoot?.querySelector('.tokens') as HTMLElement | undefined

    if (!container) {
      return
    }

    container.style.setProperty(
      '--tokens-scroll--top-opacity',
      MathUtil.interpolate([0, 100], [0, 1], container.scrollTop).toString()
    )
    container.style.setProperty(
      '--tokens-scroll--bottom-opacity',
      MathUtil.interpolate(
        [0, 100],
        [0, 1],
        container.scrollHeight - container.scrollTop - container.offsetHeight
      ).toString()
    )
  }

  private filterTokensWithText<T>(tokens: SwapTokenWithBalance[], text: string) {
    return tokens.filter(token =>
      `${token.symbol} ${token.name} ${token.address}`.toLowerCase().includes(text.toLowerCase())
    ) as T
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-swap-select-token-view': W3mSwapSelectTokenView
  }
}
