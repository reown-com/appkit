import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { ParseUtil } from '@reown/appkit-common'
import {
  AssetUtil,
  MOCK_TOKENS,
  RouterController,
  TransfersController,
  type TransfersToken
} from '@reown/appkit-controllers'
import { MathUtil, customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-input-text'
import '@reown/appkit-ui/wui-text'
import '@reown/appkit-ui/wui-token-list-item'

import styles from './styles.js'

@customElement('w3m-transfers-select-token-view')
export class W3mTransfersSelectTokenView extends LitElement {
  public static override styles = styles

  private unsubscribe: ((() => void) | undefined)[] = []

  @state() private targetToken = RouterController.state.data?.target

  @state() private sourceToken = TransfersController.state.sourceToken

  @state() private toToken = TransfersController.state.toToken

  @state() private tokens = MOCK_TOKENS

  @state() private searchValue = ''

  public constructor() {
    super()

    this.unsubscribe.push(
      TransfersController.subscribe(newState => {
        this.sourceToken = newState.sourceToken
        this.toToken = newState.toToken
      })
    )
  }

  public override updated() {
    const tokensList = this.renderRoot?.querySelector('.tokens')
    tokensList?.addEventListener('scroll', this.handleTokenListScroll.bind(this))
  }

  public override disconnectedCallback() {
    super.disconnectedCallback()
    const tokensList = this.renderRoot?.querySelector('.tokens')
    tokensList?.removeEventListener('scroll', this.handleTokenListScroll.bind(this))
    this.unsubscribe.forEach(unsubscribe => unsubscribe?.())
  }

  public override render() {
    return html`
      <wui-flex flexDirection="column" gap="3">
        ${this.templateSearchInput()} ${this.templateTokenList()}
      </wui-flex>
    `
  }

  private templateSearchInput() {
    return html`
      <wui-flex .padding=${['0', '3', '0', '3'] as const} gap="2">
        <wui-input-text
          data-testid="transfer-select-token-search-input"
          class="search-input"
          size="sm"
          placeholder="Search token"
          icon="search"
          .value=${this.searchValue}
          @inputChange=${this.onSearchInputChange.bind(this)}
        ></wui-input-text>
      </wui-flex>
    `
  }

  private templateTokenList() {
    // Filter tokens based on search value
    const filteredTokens = this.filterTokensWithText(this.tokens, this.searchValue)

    const { chainId: toTokenChainId } = this.toToken?.caipNetworkId
      ? ParseUtil.parseCaipNetworkId(this.toToken?.caipNetworkId)
      : {}

    if (filteredTokens.length === 0) {
      return html`
        <wui-flex class="tokens-container">
          <wui-flex
            class="tokens"
            flexDirection="column"
            .padding=${['3', '2', '2', '2'] as const}
            alignItems="center"
          >
            <wui-text variant="paragraph-500" color="fg-tertiary">No tokens found</wui-text>
          </wui-flex>
        </wui-flex>
      `
    }

    return html`
      <wui-flex class="tokens-container">
        <wui-flex
          class="tokens"
          flexDirection="column"
          .padding=${['0', '2', '2', '2'] as const}
          gap="1"
        >
          <wui-flex justifyContent="flex-start" padding="3">
            <wui-text variant="md-medium" color="secondary">Tokens</wui-text>
          </wui-flex>
          ${filteredTokens
            .filter(token => {
              if (!toTokenChainId) {
                return true
              }

              const { chainId: tokenChainId } = ParseUtil.parseCaipNetworkId(token.caipNetworkId)

              return tokenChainId?.toString() !== toTokenChainId.toString()
            })
            .map(token => {
              const selected =
                token.address === this.sourceToken?.address ||
                token.address === this.toToken?.address

              const { chainNamespace: tokenChainNamespace } = ParseUtil.parseCaipNetworkId(
                token.caipNetworkId
              )

              return html`
                <wui-token-list-item
                  data-testid="transfer-select-token-${token.symbol}-${tokenChainNamespace}"
                  name=${token.name}
                  ?disabled=${selected}
                  symbol=${token.symbol}
                  imageSrc=${token.logoUri}
                  chainImageSrc=${ifDefined(
                    AssetUtil.getNetworkImageByCaipNetworkId(token.caipNetworkId)
                  )}
                  @click=${() => this.onSelectToken(token)}
                >
                </wui-token-list-item>
              `
            })}
        </wui-flex>
      </wui-flex>
    `
  }

  private onSelectToken(token: TransfersToken) {
    if (this.targetToken === 'sourceToken') {
      TransfersController.setSourceToken(token)
    } else {
      TransfersController.setToToken(token)
    }
    RouterController.goBack()
  }

  private onSearchInputChange(event: CustomEvent<string>) {
    this.searchValue = event.detail
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

  private filterTokensWithText(tokens: TransfersToken[], text: string): TransfersToken[] {
    if (!text) {
      return tokens
    }

    const searchLower = text.toLowerCase()

    return tokens.filter(token => {
      const searchableText = `${token.symbol} ${token.name} ${token.address}`.toLowerCase()
      return searchableText.includes(searchLower)
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-transfers-select-token-view': W3mTransfersSelectTokenView
  }
}
