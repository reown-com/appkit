import { ConstantsUtil, type CaipNetwork } from '@rerock/common'
import {
  AccountController,
  AssetUtil,
  ChainController,
  CoreHelperUtil,
  EventsController,
  NetworkController,
  RouterController
} from '@rerock/core'
import { customElement } from '@rerock/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import styles from './styles.js'
import { NetworkUtil } from '../../utils/NetworkUtil.js'

@customElement('w3m-networks-view')
export class W3mNetworksView extends LitElement {
  public static override styles = styles
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() public network = NetworkController.state.caipNetwork

  @state() public requestedCaipNetworks = NetworkController.getRequestedCaipNetworks()

  @state() private filteredNetworks?: CaipNetwork[]

  @state() private search = ''

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe.push(
      NetworkController.subscribeKey('caipNetwork', val => (this.network = val))
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
    const requestedCaipNetworks = NetworkController.getRequestedCaipNetworks()
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
    const isNamespaceConnected = AccountController.getChainIsConnected(networkNamespace)
    const approvedCaipNetworkIds = ChainController.getNetworkProp(
      'approvedCaipNetworkIds',
      networkNamespace
    )
    const supportsAllNetworks = ChainController.getNetworkProp(
      'supportsAllNetworks',
      networkNamespace
    )

    if (!isNamespaceConnected || supportsAllNetworks) {
      return false
    }

    return !approvedCaipNetworkIds?.includes(network.id)
  }

  private async onSwitchNetwork(network: CaipNetwork) {
    const isCurrentNamespaceConnected = AccountController.state.isConnected
    const isNamespaceConnected = AccountController.getChainIsConnected(network.chainNamespace)
    const isEIP155Namespace = network.chainNamespace === ConstantsUtil.CHAIN.EVM
    const isSameNetwork = network.id === this.network?.id

    const supportsAllNetworks = NetworkController.state.supportsAllNetworks
    const routerData = RouterController.state.data

    if (isSameNetwork) {
      return
    }

    if (isNamespaceConnected) {
      if (supportsAllNetworks) {
        RouterController.push('SwitchNetwork', { ...routerData, network })
      } else {
        await NetworkController.switchActiveNetwork(network)
        if (isEIP155Namespace) {
          await NetworkUtil.onNetworkChange()
        }
      }
    } else {
      // eslint-disable-next-line no-lonely-if
      if (ChainController.state.noAdapters) {
        RouterController.push('ConnectingWalletConnect')
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
          NetworkController.setActiveCaipNetwork(network)
          await NetworkUtil.onNetworkChange()
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
