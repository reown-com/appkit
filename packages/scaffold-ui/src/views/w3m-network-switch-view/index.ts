import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import {
  AssetUtil,
  ChainController,
  ConnectorController,
  RouterController,
  SIWXUtil
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

  private switchSuccessTimeout?: ReturnType<typeof setTimeout>

  // -- State & Properties -------------------------------- //
  @state() private showRetry = false

  @state() public error = false

  @state() public success = false

  public constructor() {
    super()
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
    if (this.switchSuccessTimeout) {
      clearTimeout(this.switchSuccessTimeout)
      this.switchSuccessTimeout = undefined
    }
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
        data-success=${this.success}
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

          ${this.error || this.success ? null : html`<wui-loading-hexagon></wui-loading-hexagon>`}
          ${this.success
            ? html`<wui-icon-box color="success" icon="checkmark" size="sm"></wui-icon-box>`
            : html`<wui-icon-box color="error" icon="close" size="sm"></wui-icon-box>`}
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

    if (this.success) {
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

    if (this.success) {
      return `Switched to ${this.network?.name ?? 'Unknown'}`
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
      this.success = false
      if (ChainController.state.activeChain !== this.network?.chainNamespace) {
        ChainController.setIsSwitchingNamespace(true)
      }
      if (this.network) {
        await ChainController.switchActiveNetwork(this.network, { throwOnFailure: true })
        const isAuthenticated = await SIWXUtil.isAuthenticated()

        // If not authenticated, wait for siwx prompt, else go back to previous view
        if (isAuthenticated) {
          this.onSwitchSuccess()
        }
      }
    } catch (error) {
      this.error = true
      ChainController.setIsSwitchingNamespace(false)
    }
  }

  private async onSwitchSuccess() {
    this.success = true

    /*
     * If the view is torn down before this fires (modal closed, navigated away),
     * disconnectedCallback cancels the timeout and this promise never resolves,
     * so goBack() below never fires against a navigation stack that has moved on.
     */
    await new Promise<void>(resolve => {
      this.switchSuccessTimeout = setTimeout(resolve, 1100)
    })

    RouterController.goBack()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-network-switch-view': W3mNetworkSwitchView
  }
}
