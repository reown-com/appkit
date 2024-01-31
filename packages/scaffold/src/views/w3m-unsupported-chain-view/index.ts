import {
  AccountController,
  AssetUtil,
  ConnectionController,
  CoreHelperUtil,
  EventsController,
  ModalController,
  NetworkController,
  RouterController,
  RouterUtil,
  SnackController
} from '@web3modal/core'

import type { CaipNetwork } from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import styles from './styles.js'

@customElement('w3m-unsupported-chain-view')
export class W3mUnsupportedChainView extends LitElement {
  public static override styles = styles

  // -- State & Properties --------------------------------- //
  @state() private disconecting = false

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex class="container" flexDirection="column" gap="0">
        <wui-flex
          class="container"
          flexDirection="column"
          .padding=${['m', 'xl', 'xs', 'xl'] as const}
          alignItems="center"
          gap="xl"
        >
          <wui-text variant="small-400" color="fg-200" align="center">
            This app doesn’t support your current network. Switch to an available option following
            to continue.
          </wui-text>
        </wui-flex>

        <wui-flex flexDirection="column" padding="s" gap="xs">
          ${this.networksTemplate()}
        </wui-flex>

        <wui-separator text="or"></wui-separator>
        <wui-flex flexDirection="column" padding="s" gap="xs">
          <wui-list-item
            variant="icon"
            iconVariant="overlay"
            icon="disconnect"
            ?chevron=${false}
            .loading=${this.disconecting}
            @click=${this.onDisconnect.bind(this)}
            data-testid="disconnect-button"
          >
            <wui-text variant="paragraph-500" color="fg-200">Disconnect</wui-text>
          </wui-list-item>
        </wui-flex>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //

  private networksTemplate() {
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
          @click=${() => this.onSwitchNetwork(network)}
        >
        </wui-list-network>
      `
    )
  }

  private async onDisconnect() {
    try {
      this.disconecting = true
      await ConnectionController.disconnect()
      EventsController.sendEvent({
        type: 'track',
        event: 'DISCONNECT_SUCCESS'
      })
      ModalController.close()
    } catch {
      EventsController.sendEvent({ type: 'track', event: 'DISCONNECT_ERROR' })
      SnackController.showError('Failed to disconnect')
    } finally {
      this.disconecting = false
    }
  }

  private async onSwitchNetwork(network: CaipNetwork) {
    const { isConnected } = AccountController.state
    const { approvedCaipNetworkIds, supportsAllNetworks, caipNetwork } = NetworkController.state
    const { data } = RouterController.state

    if (isConnected && caipNetwork?.id !== network.id) {
      if (approvedCaipNetworkIds?.includes(network.id)) {
        await NetworkController.switchActiveNetwork(network)
        RouterUtil.navigateAfterNetworkSwitch()
      } else if (supportsAllNetworks) {
        RouterController.push('SwitchNetwork', { ...data, network })
      }
    } else if (!isConnected) {
      NetworkController.setCaipNetwork(network)
      RouterController.push('Connect')
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-unsupported-chain-view': W3mUnsupportedChainView
  }
}
