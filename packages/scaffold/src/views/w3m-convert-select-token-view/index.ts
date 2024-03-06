import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'
import { ConnectionController, RouterController, SwapApiController } from '@web3modal/core'
import type { TokenInfo } from '@web3modal/core/src/controllers/SwapApiController.js'
import { state } from 'lit/decorators.js'

@customElement('w3m-convert-select-token-view')
export class W3mConvertSelectTokenView extends LitElement {
  public static override styles = styles

  @state() private targetToken = RouterController.state.data?.target

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
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
        <wui-flex class="tokens scroll-start" flexDirection="column">
          ${SwapApiController.state.myTokensWithBalance &&
          html`<wui-flex justifyContent="flex-start" padding="s">
            <wui-text variant="paragraph-500" color="fg-200">Your tokens</wui-text>
          </wui-flex>`}

          <wui-flex flexDirection="column" gap="xs">
            ${SwapApiController.state.myTokensWithBalance &&
            Object.values(SwapApiController.state.myTokensWithBalance).map(
              tokenInfo => html`
                <wui-token-list-item
                  name=${tokenInfo.name}
                  symbol=${tokenInfo.symbol}
                  price=${tokenInfo.price}
                  amount=${ConnectionController.formatUnits(
                    BigInt(tokenInfo.balance),
                    tokenInfo.decimals
                  )}
                  imageSrc=${tokenInfo.logoURI}
                  @click=${() => this.onSelectToken(tokenInfo)}
                >
                </wui-token-list-item>
              `
            )}
          </wui-flex>
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
      <wui-flex class="suggested-tokens-container scroll-start" gap="xs">
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

  private handleSuggestedTokensScroll() {
    const container = this.renderRoot?.querySelector('.suggested-tokens-container') as HTMLElement

    const scrollStart = container.scrollLeft === 0
    const scrollEnd =
      Math.abs(Math.round(container.scrollLeft + container.offsetWidth) - container.scrollWidth) < 2

    if (scrollStart) {
      container.classList.add('scroll-start')
      container.classList.remove('scroll-end')
    } else if (scrollEnd) {
      container.classList.add('scroll-end')
      container.classList.remove('scroll-start')
    } else {
      container.classList.remove('scroll-start')
      container.classList.remove('scroll-end')
    }
  }

  private handleTokenListScroll() {
    const container = this.renderRoot?.querySelector('.tokens') as HTMLElement

    const scrollStart = container.scrollTop === 0
    const scrollEnd =
      Math.abs(Math.round(container.scrollTop + container.offsetHeight) - container.scrollHeight) <
      2

    if (scrollStart) {
      container.classList.add('scroll-start')
      container.classList.remove('scroll-end')
    } else if (scrollEnd) {
      container.classList.add('scroll-end')
      container.classList.remove('scroll-start')
    } else {
      container.classList.remove('scroll-start')
      container.classList.remove('scroll-end')
    }
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
