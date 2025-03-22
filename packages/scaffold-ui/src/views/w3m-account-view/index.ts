import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import { ChainController, ConnectorController, RouterController } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import { CaipNetworksUtil } from '@reown/appkit-utils'

import '../../partials/w3m-account-default-widget/index.js'
import '../../partials/w3m-account-wallet-features-widget/index.js'

@customElement('w3m-account-view')
export class W3mAccountView extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  @state() namespace = ChainController.state.activeChain

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe.push(
      ChainController.subscribeKey('activeChain', namespace => {
        this.namespace = namespace
      })
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  public override firstUpdated() {
    // Process URL parameters as soon as the component is first updated
    this.handleUrlParameters()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.namespace) {
      return null
    }

    const connectorId = ConnectorController.getConnectorId(this.namespace)
    const authConnector = ConnectorController.getAuthConnector()

    return html`
      ${authConnector && connectorId === CommonConstantsUtil.CONNECTOR_ID.AUTH
        ? this.walletFeaturesTemplate()
        : this.defaultTemplate()}
    `
  }

  // -- Private ------------------------------------------- //
  private walletFeaturesTemplate() {
    return html`<w3m-account-wallet-features-widget></w3m-account-wallet-features-widget>`
  }

  private defaultTemplate() {
    return html`<w3m-account-default-widget></w3m-account-default-widget>`
  }

  /**
   * Parses URL parameters and redirects based on action
   */
  private async handleUrlParameters(): Promise<void> {
    // Get URL search parameters
    const urlParams = new URLSearchParams(window.location.search)
    const action = urlParams.get('action')

    if (!action) {
      return
    }

    // Handle different actions
    switch (action.toLowerCase()) {
      case 'swap':
        // If action is swap, handle chain switching if needed
        const chainId = urlParams.get('chainId')
        if (chainId) {
          await this.handleChainSwitch(chainId)
        }

        // Redirect to Swap view with the same URL parameters
        RouterController.push('Swap')
        break

      case 'send':
        // Similar handling for send action
        const sendChainId = urlParams.get('chainId')
        if (sendChainId) {
          await this.handleChainSwitch(sendChainId)
        }

        // Redirect to WalletSend view
        RouterController.push('WalletSend')
        break

      // Add more action handlers as needed

      default:
        // No matching action found, stay on current view
        break
    }
  }

  /**
   * Handles switching to the appropriate chain based on chainId
   * @param chainId - The chain ID to switch to
   */
  private async handleChainSwitch(chainId: string): Promise<void> {
    // Get requested networks to find the one with matching chainId
    const requestedNetworks = ChainController.getAllRequestedCaipNetworks()
    const targetNetwork = requestedNetworks.find(network => {
      return network.id.toString() === chainId
    })

    // If no matching network found, return
    if (!targetNetwork) {
      return
    }

    CaipNetworksUtil.onSwitchNetwork(targetNetwork)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-view': W3mAccountView
  }
}
