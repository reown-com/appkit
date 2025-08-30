import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import {
  AssetUtil,
  ChainController,
  ConnectorController,
  RouterController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-icon-box'
import '@reown/appkit-ui/wui-loading-hexagon'
import '@reown/appkit-ui/wui-network-image'
import '@reown/appkit-ui/wui-text'

import styles from './styles.js'

@customElement('w3m-network-switch-view')
export class W3mNetworkSwitchView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private network = RouterController.state.data?.network

  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private showRetry = false

  @state() public error = false

  public constructor() {
    super()
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  public override firstUpdated() {
    this.onSwitchNetwork()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.network) {
      throw new Error('w3m-network-switch-view: No network provided')
    }

    this.onShowRetry()
    const label = this.getLabel()
    const subLabel = this.getSubLabel()

    return html`
      <wui-flex
        data-error=${this.error}
        flexDirection="column"
        alignItems="center"
        .padding=${['10', '5', '10', '5'] as const}
        gap="7"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-network-image
            size="lg"
            imageSrc=${ifDefined(AssetUtil.getNetworkImage(this.network))}
          ></wui-network-image>

          ${this.error ? null : html`<wui-loading-hexagon></wui-loading-hexagon>`}

          <wui-icon-box color="error" icon="close" size="sm"></wui-icon-box>
        </wui-flex>

        <wui-flex flexDirection="column" alignItems="center" gap="2">
          <wui-text align="center" variant="h6-regular" color="primary">${label}</wui-text>
          <wui-text align="center" variant="md-regular" color="secondary">${subLabel}</wui-text>
        </wui-flex>

        <wui-button
          data-retry=${this.showRetry}
          variant="accent-primary"
          size="md"
          .disabled=${!this.error}
          @click=${this.onSwitchNetwork.bind(this)}
        >
          <wui-icon color="inherit" slot="iconLeft" name="refresh"></wui-icon>
          Try again
        </wui-button>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private getSubLabel() {
    const connectorId = ConnectorController.getConnectorId(ChainController.state.activeChain)
    const authConnector = ConnectorController.getAuthConnector()
    if (authConnector && connectorId === CommonConstantsUtil.CONNECTOR_ID.AUTH) {
      return ''
    }

    return this.error
      ? 'Switch can be declined if chain is not supported by a wallet or previous request is still active'
      : 'Accept connection request in your wallet'
  }

  private getLabel() {
    const connectorId = ConnectorController.getConnectorId(ChainController.state.activeChain)
    const authConnector = ConnectorController.getAuthConnector()
    if (authConnector && connectorId === CommonConstantsUtil.CONNECTOR_ID.AUTH) {
      return `Switching to ${this.network?.name ?? 'Unknown'} network...`
    }

    return this.error ? 'Switch declined' : 'Approve in wallet'
  }

  private onShowRetry() {
    if (this.error && !this.showRetry) {
      this.showRetry = true
      const retryButton = this.shadowRoot?.querySelector('wui-button') as HTMLElement
      retryButton?.animate([{ opacity: 0 }, { opacity: 1 }], {
        fill: 'forwards',
        easing: 'ease'
      })
    }
  }

  private async onSwitchNetwork() {
    try {
      this.error = false
      if (ChainController.state.activeChain !== this.network?.chainNamespace) {
        ChainController.setIsSwitchingNamespace(true)
      }
      if (this.network) {
        await ChainController.switchActiveNetwork(this.network)
      }
    } catch (error) {
      this.error = true
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-network-switch-view': W3mNetworkSwitchView
  }
}
