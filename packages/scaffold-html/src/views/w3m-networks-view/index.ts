import { NetworkController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-networks-view')
export class W3mNetworksView extends LitElement {
  // -- Members ------------------------------------------- //
  private requestedNetworks = NetworkController.state.requestedCaipNetworks

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
    const { caipNetwork } = NetworkController.state

    return this.requestedNetworks?.map(
      network => html`
        <wui-card-select
          .selected=${caipNetwork?.id === network.id}
          imageSrc=${ifDefined(network.imageSrc)}
          type="network"
          name=${network.name ?? network.id}
          @click=${() => null}
        ></wui-card-select>
      `
    )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-networks-view': W3mNetworksView
  }
}
