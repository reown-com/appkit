import type { CaipNetwork, Chain } from '@web3modal/core'
import {
  AccountController,
  AssetUtil,
  ChainController,
  CoreHelperUtil,
  EventsController,
  NetworkController,
  RouterController,
  RouterUtil
} from '@web3modal/core'
import { customElement } from '@web3modal/ui'
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
  @state() public caipNetwork = NetworkController.activeNetwork()

  public constructor() {
    super()
    this.unsubscribe.push(
      NetworkController.subscribeKey(
        'caipNetwork',
        () => (this.caipNetwork = NetworkController.activeNetwork())
      )
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-grid padding="s" gridTemplateColumns="repeat(4, 1fr)" rowGap="l" columnGap="xs">
        ${this.networksTemplate()}
      </wui-grid>

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
  private onNetworkHelp() {
    EventsController.sendEvent({ type: 'track', event: 'CLICK_NETWORK_HELP' })
    RouterController.push('WhatIsANetwork')
  }

  private networksTemplate() {
    const supportsAllNetworks = NetworkController.getSupportsAllNetworks()
    const requestedCaipNetworks = NetworkController.getRequestedCaipNetworks(true)
    const approvedCaipNetworkIds = NetworkController.getApprovedCaipNetworkIds()
    console.log(
      '>>> [W3mNetworksView] networksTemplate: ',
      requestedCaipNetworks,
      approvedCaipNetworkIds
    )

    const sortedNetworks = CoreHelperUtil.sortRequestedNetworks(
      approvedCaipNetworkIds,
      requestedCaipNetworks
    )

    return sortedNetworks?.map(
      network => html`
        <wui-card-select
          .selected=${this.caipNetwork?.id === network.id}
          imageSrc=${ifDefined(AssetUtil.getNetworkImage(network))}
          type="network"
          name=${network.name ?? network.id}
          @click=${() => this.onSwitchNetwork(network, 'evm')}
          .disabled=${!supportsAllNetworks && !approvedCaipNetworkIds?.includes(network.id)}
          data-testid=${`w3m-network-switch-${network.name ?? network.id}`}
        ></wui-card-select>
      `
    )
  }

  private async onSwitchNetwork(network: CaipNetwork, chain?: Chain) {
    const { isConnected } = AccountController.state
    const caipNetwork = NetworkController.activeNetwork()
    const supportsAllNetworks = NetworkController.getSupportsAllNetworks()
    const approvedCaipNetworkIds = NetworkController.getApprovedCaipNetworkIds(chain)

    console.log('>>> [onSwitchNetwork]', approvedCaipNetworkIds, supportsAllNetworks)

    const { data } = RouterController.state

    if (isConnected && caipNetwork?.id !== network.id) {
      console.log('>>> [onSwitchNetwork] 1')
      if (approvedCaipNetworkIds?.includes(network.id)) {
        await NetworkController.switchActiveNetwork(network)
        RouterUtil.navigateAfterNetworkSwitch()
        console.log('>>> [onSwitchNetwork] 2')
      } else if (supportsAllNetworks) {
        console.log('>>> [onSwitchNetwork] 3')
        RouterController.push('SwitchNetwork', { ...data, network })
      }
    } else if (!isConnected) {
      console.log('>>> [onSwitchNetwork] 4', ChainController.state.activeChain)
      NetworkController.setCaipNetwork(network, network.id.includes('solana') ? 'solana' : 'evm')
      RouterController.push('Connect')
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-networks-view': W3mNetworksView
  }
}
