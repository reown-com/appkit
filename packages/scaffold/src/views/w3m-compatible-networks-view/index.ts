import { AssetUtil, CoreHelperUtil, NetworkController } from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import styles from './styles.js'

@customElement('w3m-compatible-networks-view')
export class W3mCompatibleNetworksView extends LitElement {
  public static override styles = styles

  // -- Render -------------------------------------------- //
  public override render() {
    return html` <wui-flex
      flexDirection="column"
      .padding=${['xs', 's', 'm', 's'] as const}
      gap="xs"
    >
      <wui-banner
        text="Only send funds from these networks to be able receive them"
        icon="warningCircle"
      ></wui-banner>
      ${this.networkTemplate()}
    </wui-flex>`
  }

  // -- Private ------------------------------------------- //
  networkTemplate() {
    const { approvedCaipNetworkIds, requestedCaipNetworks } = NetworkController.state

    const sortedNetworks = CoreHelperUtil.sortRequestedNetworks(
      approvedCaipNetworkIds,
      requestedCaipNetworks
    )

    return sortedNetworks.map(
      network => html`
        <wui-list-network
          imageSrc=${ifDefined(AssetUtil.getNetworkImage(network))}
          name=${network.name ?? 'Unknown'}
          ?transparent=${true}
        >
        </wui-list-network>
      `
    )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-compatible-networks-view': W3mCompatibleNetworksView
  }
}
