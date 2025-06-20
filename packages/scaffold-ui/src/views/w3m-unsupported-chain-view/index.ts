import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import type { CaipNetwork, ChainNamespace } from '@reown/appkit-common'
import {
  AccountController,
  AssetController,
  AssetUtil,
  ChainController,
  ConnectionController,
  ConnectorController,
  ConstantsUtil,
  CoreHelperUtil,
  EventsController,
  OptionsController,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-list-item'
import '@reown/appkit-ui/wui-list-network'
import '@reown/appkit-ui/wui-separator'
import '@reown/appkit-ui/wui-text'

import styles from './styles.js'

@customElement('w3m-unsupported-chain-view')
export class W3mUnsupportedChainView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  protected readonly swapUnsupportedChain = RouterController.state.data?.swapUnsupportedChain

  private unsubscribe: (() => void)[] = []

  // -- State & Properties --------------------------------- //
  @state() private disconecting = false

  @state() private remoteFeatures = OptionsController.state.remoteFeatures

  public constructor() {
    super()
    this.unsubscribe.push(
      AssetController.subscribeNetworkImages(() => this.requestUpdate()),
      OptionsController.subscribeKey('remoteFeatures', val => {
        this.remoteFeatures = val
      })
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

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
          ${this.descriptionTemplate()}
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
  private descriptionTemplate() {
    if (this.swapUnsupportedChain) {
      return html`
        <wui-text variant="small-400" color="fg-200" align="center">
          The swap feature doesn’t support your current network. Switch to an available option to
          continue.
        </wui-text>
      `
    }

    return html`
      <wui-text variant="small-400" color="fg-200" align="center">
        This app doesn’t support your current network. Switch to an available option to continue.
      </wui-text>
    `
  }

  private networksTemplate() {
    const requestedCaipNetworks = ChainController.getAllRequestedCaipNetworks()
    const approvedCaipNetworkIds = ChainController.getAllApprovedCaipNetworkIds()

    const sortedNetworks = CoreHelperUtil.sortRequestedNetworks(
      approvedCaipNetworkIds,
      requestedCaipNetworks
    )

    const filteredNetworks = this.swapUnsupportedChain
      ? sortedNetworks.filter(network =>
          ConstantsUtil.SWAP_SUPPORTED_NETWORKS.includes(network.caipNetworkId)
        )
      : sortedNetworks

    return filteredNetworks.map(
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

      const namespace = ChainController.state.activeChain as ChainNamespace
      const connectionsByNamespace = ConnectionController.getConnections(namespace)
      const hasConnections = connectionsByNamespace.length > 0
      const connectorId = ConnectorController.state.activeConnectorIds[namespace]
      const isMultiWalletEnabled = this.remoteFeatures?.multiWallet
      await ConnectionController.disconnect(isMultiWalletEnabled ? { id: connectorId } : {})
      if (hasConnections && isMultiWalletEnabled) {
        RouterController.push('ProfileWallets')
        SnackController.showSuccess('Wallet deleted')
      }
    } catch {
      EventsController.sendEvent({ type: 'track', event: 'DISCONNECT_ERROR' })
      SnackController.showError('Failed to disconnect')
    } finally {
      this.disconecting = false
    }
  }

  private async onSwitchNetwork(network: CaipNetwork) {
    const caipAddress = AccountController.state.caipAddress
    const approvedCaipNetworkIds = ChainController.getAllApprovedCaipNetworkIds()
    const supportsAllNetworks = ChainController.getNetworkProp(
      'supportsAllNetworks',
      network.chainNamespace
    )

    const routerData = RouterController.state.data

    if (caipAddress) {
      if (approvedCaipNetworkIds?.includes(network.caipNetworkId)) {
        await ChainController.switchActiveNetwork(network)
      } else if (supportsAllNetworks) {
        RouterController.push('SwitchNetwork', { ...routerData, network })
      } else {
        RouterController.push('SwitchNetwork', { ...routerData, network })
      }
    } else if (!caipAddress) {
      ChainController.setActiveCaipNetwork(network)
      RouterController.push('Connect')
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-unsupported-chain-view': W3mUnsupportedChainView
  }
}
