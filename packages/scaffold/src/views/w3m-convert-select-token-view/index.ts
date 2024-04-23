import { customElement, MathUtil } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'
import { RouterController, ConvertController, type ConvertTokenWithBalance } from '@web3modal/core'
import { state } from 'lit/decorators.js'

@customElement('w3m-convert-select-token-view')
export class W3mConvertSelectTokenView extends LitElement {
  public static override styles = styles

  private unsubscribe: ((() => void) | undefined)[] = []

  // -- State & Properties -------------------------------- //
  @state() private interval?: NodeJS.Timeout

  @state() private targetToken = RouterController.state.data?.target

  @state() private sourceToken = ConvertController.state.sourceToken

  @state() private toToken = ConvertController.state.toToken

  @state() private searchValue = ''

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()

    this.unsubscribe.push(
      ...[
        ConvertController.subscribe(newState => {
          this.sourceToken = newState.sourceToken
          this.toToken = newState.toToken
        })
      ]
    )

    this.watchTokens()
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
  private watchTokens() {
    this.interval = setInterval(() => {
      ConvertController.getNetworkTokenPrice()
      ConvertController.getMyTokensWithBalance()
    }, 5000)
  }

  private onSelectToken(token: ConvertTokenWithBalance) {
    if (this.targetToken === 'sourceToken') {
      ConvertController.setSourceToken(token)
    } else {
      ConvertController.setToToken(token)
    }
    RouterController.goBack()
  }

  private templateSearchInput() {
    return html`
      <wui-flex class="search-input-container" gap="xs">
        <wui-input-text
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
    const yourTokens = ConvertController.state.myTokensWithBalance
      ? Object.values(ConvertController.state.myTokensWithBalance)
      : []
    const tokens = ConvertController.state.popularTokens
      ? ConvertController.state.popularTokens
      : []

    const filteredYourTokens: ConvertTokenWithBalance[] = this.filterTokensWithText<
      ConvertTokenWithBalance[]
    >(yourTokens, this.searchValue)
    const filteredTokens = this.filterTokensWithText<ConvertTokenWithBalance[]>(
      tokens,
      this.searchValue
    )

    return html`
      <wui-flex class="tokens-container">
        <wui-flex class="tokens" flexDirection="column">
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
            <wui-text variant="paragraph-500" color="fg-200">Popular tokens</wui-text>
          </wui-flex>
          ${filteredTokens?.length > 0
            ? filteredTokens.map(
                token => html`
                  <wui-token-list-item
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
    const tokens = ConvertController.state.suggestedTokens
      ? ConvertController.state.suggestedTokens.slice(0, 8)
      : null

    if (!tokens) {
      return null
    }

    return html`
      <wui-flex class="suggested-tokens-container" gap="xs">
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

  private filterTokensWithText<T>(tokens: ConvertTokenWithBalance[], text: string) {
    return tokens.filter(token =>
      `${token.symbol} ${token.name} ${token.address}`.toLowerCase().includes(text.toLowerCase())
    ) as T
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-convert-select-token-view': W3mConvertSelectTokenView
  }
}
