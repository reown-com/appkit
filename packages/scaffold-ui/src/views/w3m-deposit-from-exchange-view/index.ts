import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import { ChainController, ExchangeController } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-list-item'
import '@reown/appkit-ui/wui-text'

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
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-deposit-from-exchange-view': W3mDepositFromExchangeView
  }
}
