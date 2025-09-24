import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { type CaipNetwork, ConstantsUtil } from '@reown/appkit-common'
import {
  AssetController,
  AssetUtil,
  ChainController,
  ConnectorController,
  CoreHelperUtil,
  NetworkUtil
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-input-text'
import '@reown/appkit-ui/wui-link'
import '@reown/appkit-ui/wui-list-network'
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
        .padding=${['0', '3', '3', '3'] as const}
        flexDirection="column"
        gap="2"
      >
        ${this.networksTemplate()}
      </wui-flex>
    `
  }

  // Private Methods ------------------------------------- //
  private templateSearchInput() {
    return html`
      <wui-flex gap="2" .padding=${['0', '3', '3', '3'] as const}>
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
    const isNextNamespaceConnected = Boolean(
      ChainController.getAccountData(networkNamespace)?.caipAddress
    )
    const approvedCaipNetworkIds = ChainController.getAllApprovedCaipNetworkIds()
    const shouldSupportAllNetworks =
      ChainController.getNetworkProp('supportsAllNetworks', networkNamespace) !== false
    const connectorId = ConnectorController.getConnectorId(networkNamespace)
    const authConnector = ConnectorController.getAuthConnector()
    const isConnectedWithAuth = connectorId === ConstantsUtil.CONNECTOR_ID.AUTH && authConnector

    if (!isNextNamespaceConnected || shouldSupportAllNetworks || isConnectedWithAuth) {
      return false
    }

    return !approvedCaipNetworkIds?.includes(network.caipNetworkId)
  }

  private onSwitchNetwork(network: CaipNetwork) {
    NetworkUtil.onSwitchNetwork({ network })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-networks-view': W3mNetworksView
  }
}
