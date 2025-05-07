import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { type CaipNetwork, ConstantsUtil } from '@reown/appkit-common'
import {
  AccountController,
  AssetController,
  AssetUtil,
  ChainController,
  ConnectorController,
  CoreHelperUtil,
  EventsController,
  RouterController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-input-text'
import '@reown/appkit-ui/wui-link'
import '@reown/appkit-ui/wui-list-network'
import '@reown/appkit-ui/wui-separator'
import '@reown/appkit-ui/wui-text'

import styles from './styles.js'

@customElement('w3m-networks-view')
export class W3mNetworksView extends LitElement {
  public static override styles = styles
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() public network = ChainController.state.activeCaipNetwork

  @state() public requestedCaipNetworks = ChainController.getCaipNetworks()

  @state() private filteredNetworks?: CaipNetwork[]

  @state() private search = ''

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe.push(
      AssetController.subscribeNetworkImages(() => this.requestUpdate()),
      ChainController.subscribeKey('activeCaipNetwork', val => (this.network = val)),
      ChainController.subscribe(() => {
        this.requestedCaipNetworks = ChainController.getAllRequestedCaipNetworks()
      })
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      ${this.templateSearchInput()}
      <wui-flex
        class="container"
        .padding=${['0', 's', 's', 's'] as const}
        flexDirection="column"
        gap="xs"
      >
        ${this.networksTemplate()}
      </wui-flex>

      <wui-separator></wui-separator>

      <wui-flex padding="s" flexDirection="column" gap="m" alignItems="center">
        <wui-text variant="small-400" color="fg-300" align="center">
          Your connected wallet may not support some of the networks available for this dApp
        </wui-text>
        <wui-link @click=${this.onNetworkHelp.bind(this)}>
          <wui-icon size="xs" color="accent-100" slot="iconLeft" name="helpCircle"></wui-icon>
          What is a network
        </wui-link>
      </wui-flex>
    `
  }

  // Private Methods ------------------------------------- //
  private templateSearchInput() {
    return html`
      <wui-flex gap="xs" .padding=${['0', 's', 's', 's'] as const}>
        <wui-input-text
          @inputChange=${this.onInputChange.bind(this)}
          class="network-search-input"
          size="md"
          placeholder="Search network"
          icon="search"
        ></wui-input-text>
      </wui-flex>
    `
  }

  private onInputChange(event: CustomEvent<string>) {
    this.onDebouncedSearch(event.detail)
  }

  private onDebouncedSearch = CoreHelperUtil.debounce((value: string) => {
    this.search = value
  }, 100)

  private onNetworkHelp() {
    EventsController.sendEvent({ type: 'track', event: 'CLICK_NETWORK_HELP' })
    RouterController.push('WhatIsANetwork')
  }

  private networksTemplate() {
    const approvedCaipNetworkIds = ChainController.getAllApprovedCaipNetworkIds()

    const sortedNetworks = CoreHelperUtil.sortRequestedNetworks(
      approvedCaipNetworkIds,
      this.requestedCaipNetworks
    )

    if (this.search) {
      this.filteredNetworks = sortedNetworks?.filter(network =>
        network?.name?.toLowerCase().includes(this.search.toLowerCase())
      )
    } else {
      this.filteredNetworks = sortedNetworks
    }

    return this.filteredNetworks?.map(
      network => html`
        <wui-list-network
          .selected=${this.network?.id === network.id}
          imageSrc=${ifDefined(AssetUtil.getNetworkImage(network))}
          type="network"
          name=${network.name ?? network.id}
          @click=${() => this.onSwitchNetwork(network)}
          .disabled=${this.getNetworkDisabled(network)}
          data-testid=${`w3m-network-switch-${network.name ?? network.id}`}
        ></wui-list-network>
      `
    )
  }

  private getNetworkDisabled(network: CaipNetwork) {
    const networkNamespace = network.chainNamespace
    const isNextNamespaceConnected = AccountController.getCaipAddress(networkNamespace)
    const approvedCaipNetworkIds = ChainController.getAllApprovedCaipNetworkIds()
    const supportsAllNetworks =
      ChainController.getNetworkProp('supportsAllNetworks', networkNamespace) !== false
    const connectorId = ConnectorController.getConnectorId(networkNamespace)
    const authConnector = ConnectorController.getAuthConnector()
    const isConnectedWithAuth = connectorId === ConstantsUtil.CONNECTOR_ID.AUTH && authConnector

    if (!isNextNamespaceConnected || supportsAllNetworks || isConnectedWithAuth) {
      return false
    }

    return !approvedCaipNetworkIds?.includes(network.caipNetworkId)
  }

  private onSwitchNetwork(network: CaipNetwork) {
    const routerData = RouterController.state.data
    const isSameNetwork = network.id === this.network?.id

    if (isSameNetwork) {
      return
    }

    const isDifferentNamespace = network.chainNamespace !== ChainController.state.activeChain
    const isCurrentNamespaceConnected = AccountController.state.caipAddress
    const isNextNamespaceConnected = AccountController.getCaipAddress(network.chainNamespace)
    const connectorId = ConnectorController.getConnectorId(ChainController.state.activeChain)

    /**
     * If the network is supported by the auth connector, we don't need to show switch active chain view.
     * But there are some cases like switching from Ethereum to Bitcoin where Bitcoin is not supported by the auth connector and users should connect with another connector.
     */
    const isConnectedWithAuth = connectorId === ConstantsUtil.CONNECTOR_ID.AUTH
    const isSupportedForAuthConnector = ConstantsUtil.AUTH_CONNECTOR_SUPPORTED_CHAINS.find(
      c => c === network.chainNamespace
    )

    if (isCurrentNamespaceConnected) {
      if (isConnectedWithAuth && isSupportedForAuthConnector) {
        // If user connected with auth connector and the next network is supported by the auth connector, we don't need to show switch active chain view.
        RouterController.push('SwitchNetwork', { ...routerData, network })
      } else if (
        // 1. If user connected with auth connector and the next network is not supported by the auth connector, we need to show switch active chain view.
        (isConnectedWithAuth && !isSupportedForAuthConnector) ||
        // 2. If user connected with non-auth connector, we should check if user switching to a different namespace and next namespace is not connected.
        (isDifferentNamespace && !isNextNamespaceConnected)
      ) {
        RouterController.push('SwitchActiveChain', {
          switchToChain: network.chainNamespace,
          navigateTo: 'Connect',
          navigateWithReplace: true,
          network
        })
      } else {
        // For any other case, we redirect to switch network page
        RouterController.push('SwitchNetwork', { ...routerData, network })
      }
    } else {
      RouterController.push('SwitchNetwork', { ...routerData, network })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-networks-view': W3mNetworksView
  }
}
