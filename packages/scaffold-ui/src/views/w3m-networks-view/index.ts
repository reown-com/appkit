import { type CaipNetwork } from '@reown/appkit-common'
import {
  AccountController,
  AssetUtil,
  ChainController,
  ConnectorController,
  CoreHelperUtil,
  EventsController,
  NetworkController,
  RouterController,
  StorageUtil
} from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import styles from './styles.js'

@customElement('w3m-networks-view')
export class W3mNetworksView extends LitElement {
  public static override styles = styles
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() public network = ChainController.state.activeCaipNetwork

  @state() private filteredNetworks?: CaipNetwork[]

  @state() private search = ''

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe.push(
      ChainController.subscribeKey('activeCaipNetwork', val => (this.network = val))
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
    const requestedCaipNetworks = ChainController.getRequestedCaipNetworks()
    const approvedCaipNetworkIds = NetworkController.state.approvedCaipNetworkIds
    const sortedNetworks = CoreHelperUtil.sortRequestedNetworks(
      approvedCaipNetworkIds,
      requestedCaipNetworks
    )

    if (this.search) {
      this.filteredNetworks = sortedNetworks?.filter(
        network => network?.name?.toLowerCase().includes(this.search.toLowerCase())
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
    const isNamespaceConnected = AccountController.getCaipAddress(networkNamespace)
    const approvedCaipNetworkIds = ChainController.getAllApprovedCaipNetworks()
    const supportsAllNetworks =
      ChainController.getNetworkProp('supportsAllNetworks', networkNamespace) !== false
    const type = StorageUtil.getConnectedConnector()
    const authConnector = ConnectorController.getAuthConnector()
    const isConnectedWithAuth = type === 'AUTH' && authConnector

    if (!isNamespaceConnected || supportsAllNetworks || isConnectedWithAuth) {
      return false
    }

    return !approvedCaipNetworkIds?.includes(network.id)
  }

  private async onSwitchNetwork(network: CaipNetwork) {
    const isCurrentNamespaceConnected = AccountController.state.caipAddress
    const isNamespaceConnected = AccountController.getCaipAddress(network.chainNamespace)
    const isSameNetwork = network.id === this.network?.id

    const supportsAllNetworks = NetworkController.state.supportsAllNetworks
    const routerData = RouterController.state.data

    const type = StorageUtil.getConnectedConnector()
    const authConnector = ConnectorController.getAuthConnector()
    const isConnectedWithAuth = type === 'AUTH' && authConnector

    if (isSameNetwork) {
      return
    }

    if (isNamespaceConnected) {
      if (supportsAllNetworks || isConnectedWithAuth) {
        RouterController.push('SwitchNetwork', { ...routerData, network })
      } else {
        await ChainController.switchActiveNetwork(network)
      }
    } else {
      // eslint-disable-next-line no-lonely-if
      if (ChainController.state.noAdapters) {
        RouterController.push('ConnectingWalletConnect')
      } else if (isConnectedWithAuth) {
        RouterController.push('SwitchNetwork', { ...routerData, network })
      } else {
        // eslint-disable-next-line no-lonely-if
        if (isCurrentNamespaceConnected) {
          RouterController.push('SwitchActiveChain', {
            switchToChain: network.chainNamespace,
            navigateTo: 'Connect',
            navigateWithReplace: true,
            network
          })
        } else {
          ChainController.setActiveCaipNetwork(network)
        }
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-networks-view': W3mNetworksView
  }
}
