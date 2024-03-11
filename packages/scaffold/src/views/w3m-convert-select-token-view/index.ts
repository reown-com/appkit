import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'
import { ConnectionController, RouterController, SwapApiController } from '@web3modal/core'
import type { TokenInfo } from '@web3modal/core/src/controllers/SwapApiController.js'
import { state } from 'lit/decorators.js'

@customElement('w3m-convert-select-token-view')
export class W3mConvertSelectTokenView extends LitElement {
  public static override styles = styles

  private unsubscribe: ((() => void) | undefined)[] = []

  // -- State & Properties -------------------------------- //
  @state() private targetToken = RouterController.state.data?.target

  @state() private sourceToken = SwapApiController.state.sourceToken

  @state() private toToken = SwapApiController.state.toToken

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()

    this.unsubscribe.push(
      ...[
        SwapApiController.subscribe(newState => {
          this.sourceToken = newState.sourceToken
          this.toToken = newState.toToken
        })
      ]
    )
  }

  private onSelectToken(token: TokenInfo) {
    if (this.targetToken === 'sourceToken') {
      SwapApiController.setSourceToken(token)
    } else {
      SwapApiController.setToToken(token)
    }
    SwapApiController.getTokenSwapInfo()
    RouterController.goBack()
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

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" gap="s">
        ${this.templateSearchInput()} ${this.templateSuggestedTokens()} ${this.templateTokens()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private templateSearchInput() {
    return html`
      <wui-flex class="search-input-container" gap="xs">
        <wui-input-text
          class="network-search-input"
          size="sm"
          placeholder="Search token"
          icon="search"
        ></wui-input-text>
      </wui-flex>
    `
  }

  private templateTokens() {
    return html`
      <wui-flex class="tokens-container">
        <wui-flex class="tokens" flexDirection="column">
          ${SwapApiController.state.myTokensWithBalance
            ? html`
                <wui-flex justifyContent="flex-start" padding="s">
                  <wui-text variant="paragraph-500" color="fg-200">Your tokens</wui-text>
                </wui-flex>
                <wui-flex flexDirection="column" gap="xs"> </wui-flex>
                ${Object.values(SwapApiController.state.myTokensWithBalance).map(tokenInfo => {
                  const selected =
                    tokenInfo.symbol === this.sourceToken?.symbol ||
                    tokenInfo.symbol === this.toToken?.symbol
                  return html`
                    <wui-token-list-item
                      ?disabled=${selected}
                      name=${tokenInfo.name}
                      symbol=${tokenInfo.symbol}
                      price=${tokenInfo.price}
                      amount=${ConnectionController.formatUnits(
                        BigInt(tokenInfo.balance),
                        tokenInfo.decimals
                      )}
                      imageSrc=${tokenInfo.logoURI}
                      @click=${() => {
                        if (!selected) this.onSelectToken(tokenInfo)
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

          <wui-flex flexDirection="column" gap="1xs">
            ${SwapApiController.state.popularTokens &&
            Object.values(SwapApiController.state.popularTokens).map(
              tokenInfo => html`
                <wui-token-list-item
                  name=${tokenInfo.name}
                  symbol=${tokenInfo.symbol}
                  imageSrc=${tokenInfo.logoURI}
                  @click=${() => this.onSelectToken(tokenInfo)}
                >
                </wui-token-list-item>
              `
            )}
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `
  }

  private templateSuggestedTokens() {
    const tokens = SwapApiController.state.popularTokens
      ? Object.values(SwapApiController.state.popularTokens).slice(0, 8)
      : null

    if (!tokens) {
      return null
    }

    return html`
      <wui-flex class="suggested-tokens-container" gap="xs">
        ${tokens.map(
          tokenInfo => html`
            <wui-token-button
              text=${tokenInfo.symbol}
              logoURI=${tokenInfo.logoURI}
              @click=${() => this.onSelectToken(tokenInfo)}
            >
            </wui-token-button>
          `
        )}
      </wui-flex>
    `
  }

  private interpolate(inputRange: number[], outputRange: number[], value: number) {
    const originalRangeMin = inputRange[0] as number
    const originalRangeMax = inputRange[1] as number
    const newRangeMin = outputRange[0] as number
    const newRangeMax = outputRange[1] as number

    if (value < originalRangeMin) return newRangeMin
    if (value > originalRangeMax) return newRangeMax

    return (
      ((newRangeMax - newRangeMin) / (originalRangeMax - originalRangeMin)) *
        (value - originalRangeMin) +
      newRangeMin
    )
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
      this.interpolate([0, 100], [0, 1], container.scrollLeft).toString()
    )
    container.style.setProperty(
      '--suggested-tokens-scroll--right-opacity',
      this.interpolate(
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
      this.interpolate([0, 100], [0, 1], container.scrollTop).toString()
    )
    container.style.setProperty(
      '--tokens-scroll--bottom-opacity',
      this.interpolate(
        [0, 100],
        [0, 1],
        container.scrollHeight - container.scrollTop - container.offsetHeight
      ).toString()
    )
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
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-convert-select-token-view': W3mConvertSelectTokenView
  }
}
