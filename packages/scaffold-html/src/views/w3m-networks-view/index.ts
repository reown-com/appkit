import type { CaipNetwork } from '@web3modal/core'
import { AccountController, NetworkController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-networks-view')
export class W3mNetworksView extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() public caipNetwork = NetworkController.state.caipNetwork

  public constructor() {
    super()
    this.unsubscribe.push(
      NetworkController.subscribeKey('caipNetwork', val => (this.caipNetwork = val))
    )
  }

  public disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public render() {
    return html`
      <wui-grid padding="s" gridTemplateColumns="repeat(4, 1fr)" rowGap="l" columnGap="xs">
        ${this.networksTemplate()}
      </wui-grid>

      <wui-separator></wui-separator>

      <wui-flex padding="s">
        <wui-text variant="small-500" color="fg-300" align="center">
          Your connected wallet may not support some of the networks available for this dApp
        </wui-text>
      </wui-flex>
    `
  }

  // Private Methods ------------------------------------- //
  private networksTemplate() {
    const { approvedCaipNetworkIds, requestedCaipNetworks } = NetworkController.state
    const approvedIds = approvedCaipNetworkIds
    const requested = requestedCaipNetworks

    if (approvedIds?.length) {
      requested?.sort((a, b) => approvedIds.indexOf(b.id) - approvedIds.indexOf(a.id))
    }

    return requested?.map(
      network => html`
        <wui-card-select
          .selected=${this.caipNetwork?.id === network.id}
          imageSrc=${ifDefined(network.imageSrc)}
          type="network"
          name=${network.name ?? network.id}
          @click=${() => this.onSwitchNetwork(network)}
          .disabled=${approvedIds && !approvedIds.includes(network.id)}
        ></wui-card-select>
      `
    )
  }

  private async onSwitchNetwork(network: CaipNetwork) {
    if (AccountController.state.isConnected) {
      await NetworkController.switchActiveNetwork(network)
    } else {
      NetworkController.setCaipNetwork(network)
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-networks-view': W3mNetworksView
  }
}
