import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'
import { RouterController, SwapApiController } from '@web3modal/core'
import type { TokenInfo } from '@web3modal/core/src/controllers/SwapApiController.js'
import { state } from 'lit/decorators.js'

const yourItems = [
  {
    name: 'Ethereum',
    symbol: 'ETH',
    price: '3,324.34',
    value: '0.854'
  },
  {
    name: 'Avalanche',
    symbol: 'AVAX',
    price: '2,543.12',
    value: '0.723'
  },
  {
    name: 'Bitcoin',
    symbol: 'BTC',
    price: '47,892.56',
    value: '0.654'
  },
  {
    name: 'Cardano',
    symbol: 'ADA',
    price: '2.34',
    value: '0.345'
  },
  {
    name: 'Ripple',
    symbol: 'XRP',
    price: '1.23',
    value: '0.456'
  }
]

@customElement('w3m-swap-select-token-view')
export class W3mSwapSelectTokenView extends LitElement {
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
    RouterController.goBack()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" padding="s">
        ${this.templateSearchInput()} ${this.templateListTokens()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private templateSearchInput() {
    return html`
      <wui-flex gap="xs">
        <wui-input-text size="sm" placeholder="Search token" icon="search"></wui-input-text>
      </wui-flex>
    `
  }

  private templateListTokens() {
    return html`
      <wui-flex class="token-list" flexDirection="column">
        <wui-flex justifyContent="flex-start" padding="s">
          <wui-text variant="paragraph-500" color="fg-200">Your tokens</wui-text>
        </wui-flex>
        <wui-flex flexDirection="column" gap="1xs">
          ${yourItems.map(
            item => html`
              <wui-token-list-item
                name=${item.name}
                symbol=${item.symbol}
                price=${`$${item.price}`}
                amount=${item.value}
                imageSrc="https://explorer-api.walletconnect.com/w3m/v1/getAssetImage/692ed6ba-e569-459a-556a-776476829e00?projectId=c1781fc385454899a2b1385a2b83df3b"
              >
              </wui-token-list-item>
            `
          )}
        </wui-flex>
        <wui-flex justifyContent="flex-start" padding="s">
          <wui-text variant="paragraph-500" color="fg-200">Popular tokens</wui-text>
        </wui-flex>
        <wui-flex flexDirection="column" gap="1xs">
          ${SwapApiController.state.tokens &&
          Object.values(SwapApiController.state.tokens).map(
            tokenInfo => html`
              <wui-token-list-item
                name=${tokenInfo.name}
                symbol=${tokenInfo.symbol}
                price=${tokenInfo.decimals}
                amount=${10}
                imageSrc=${tokenInfo.logoURI}
                @click=${() => this.onSelectToken(tokenInfo)}
              >
              </wui-token-list-item>
            `
          )}
        </wui-flex>
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-swap-select-token-view': W3mSwapSelectTokenView
  }
}
