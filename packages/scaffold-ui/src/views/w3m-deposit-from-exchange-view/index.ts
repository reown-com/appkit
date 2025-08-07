import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import {
  AssetUtil,
  ChainController,
  type Exchange,
  ExchangeController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-chip-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-list-item'
import '@reown/appkit-ui/wui-text'

const PRESET_AMOUNTS = [10, 50, 100]

@customElement('w3m-deposit-from-exchange-view')
export class W3mDepositFromExchangeView extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() public network = ChainController.state.activeCaipNetwork
  @state() public exchanges = ExchangeController.state.exchanges

  public constructor() {
    super()
    this.unsubscribe.push()
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" .padding=${['0', 's', 'xl', 's'] as const} gap="xs">
        ${this.amountInputTemplate()} ${this.exchangesTemplate()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private exchangesTemplate() {
    return html`
      <wui-flex flexDirection="column" gap="xs">
        ${this.exchanges.map(
          exchange =>
            html`<wui-list-item>
              <wui-text variant="paragraph-500" color="fg-200">
                Deposit from ${exchange.name}
              </wui-text>
              <wui-icon-link
                size="sm"
                icon="chevronRight"
                iconColor="fg-200"
                @click=${() => this.onExchangeClick(exchange)}
              >
              </wui-icon-link>
            </wui-list-item>`
        )}
      </wui-flex>
    `
  }
  private amountInputTemplate() {
    return html`
      <wui-flex flexDirection="column" gap="xs">
        <wui-flex justifyContent="space-between">
          <wui-text variant="paragraph-500" color="fg-200">Asset</wui-text>
          <wui-chip-button
            data-testid="deposit-from-exchange-asset-button"
            text=${this.network?.nativeCurrency.symbol || ''}
            imageSrc=${AssetUtil.getNetworkImage(this.network)}
            size="sm"
            variant="gray"
            icon=${null}
          ></wui-chip-button>
        </wui-flex>
        <wui-flex>
          <wui-text variant="paragraph-500" color="fg-200"
            >${ExchangeController.state.amount}</wui-text
          >
          <wui-text variant="paragraph-500" color="fg-200"
            >${ExchangeController.state.tokenAmount}</wui-text
          >
          <wui-flex>
            ${PRESET_AMOUNTS.map(amount => html`<wui-button>$${amount}</wui-button>`)}
          </wui-flex>
        </wui-flex>
      </wui-flex>
    `
  }

  private onExchangeClick(exchange: Exchange) {
    if (!ExchangeController.state.amount) {
      ExchangeController.handlePayWithExchange(exchange.id)
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-deposit-from-exchange-view': W3mDepositFromExchangeView
  }
}
