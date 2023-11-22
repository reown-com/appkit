import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'

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

const popularItems = [
  {
    name: 'Solana',
    symbol: 'SOL',
    price: '134.56',
    value: '0.567'
  },
  {
    name: 'Polkadot',
    symbol: 'DOT',
    price: '78.90',
    value: '0.678'
  },
  {
    name: 'Dogecoin',
    symbol: 'DOGE',
    price: '0.123',
    value: '0.789'
  },
  {
    name: 'Chainlink',
    symbol: 'LINK',
    price: '23.45',
    value: '0.890'
  },
  {
    name: 'Litecoin',
    symbol: 'LTC',
    price: '145.67',
    value: '0.901'
  },
  {
    name: 'VeChain',
    symbol: 'VET',
    price: '0.345',
    value: '0.012'
  },
  {
    name: 'Stellar',
    symbol: 'XLM',
    price: '0.456',
    value: '0.123'
  },
  {
    name: 'Cosmos',
    symbol: 'ATOM',
    price: '67.89',
    value: '0.234'
  },
  {
    name: 'Terra',
    symbol: 'LUNA',
    price: '12.34',
    value: '0.345'
  },
  {
    name: 'Filecoin',
    symbol: 'FIL',
    price: '234.56',
    value: '0.456'
  },
  {
    name: 'TRON',
    symbol: 'TRX',
    price: '0.789',
    value: '0.567'
  },
  {
    name: 'Ethereum Classic',
    symbol: 'ETC',
    price: '45.67',
    value: '0.678'
  },
  {
    name: 'Tezos',
    symbol: 'XTZ',
    price: '6.78',
    value: '0.789'
  },
  {
    name: 'Monero',
    symbol: 'XMR',
    price: '123.45',
    value: '0.890'
  }
]

@customElement('w3m-swap-select-token-view')
export class W3mSwapSelectTokenView extends LitElement {
  public static override styles = styles
  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
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
          ${popularItems.map(
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
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-swap-select-token-view': W3mSwapSelectTokenView
  }
}
