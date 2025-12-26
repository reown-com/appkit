import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { ChainController } from '@reown/appkit-controllers'
import { PayController } from '@reown/appkit-pay'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-text'

import styles from './styles.js'

@customElement('w3m-pay-header')
export class W3mPayHeader extends LitElement {
  public static override styles = [styles]

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property() public paymentAsset = PayController.state.paymentAsset
  @property() public amount = PayController.state.amount

  public constructor() {
    super()
    this.unsubscribe.push(
      PayController.subscribeKey('paymentAsset', val => {
        this.paymentAsset = val
      }),
      PayController.subscribeKey('amount', val => {
        this.amount = val
      })
    )
  }

  // -- Lifecycle ----------------------------------------- //
  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const allNetworks = ChainController.getAllRequestedCaipNetworks()
    const targetNetwork = allNetworks.find(net => net.caipNetworkId === this.paymentAsset.network)

    return html`<wui-flex
      alignItems="center"
      gap="1"
      .padding=${['1', '2', '1', '1'] as const}
      class="transfers-badge"
    >
      <wui-image src=${ifDefined(this.paymentAsset.metadata.logoURI)} size="xl"></wui-image>
      <wui-text variant="lg-regular" color="primary">
        ${this.amount} ${this.paymentAsset.metadata.symbol}
      </wui-text>
      <wui-text variant="sm-regular" color="secondary">
        on ${targetNetwork?.name ?? 'Unknown'}
      </wui-text>
    </wui-flex>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-pay-header': W3mPayHeader
  }
}
