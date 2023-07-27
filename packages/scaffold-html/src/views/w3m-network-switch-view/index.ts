import { NetworkController, RouterController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { animate } from 'motion'
import styles from './styles'

@customElement('w3m-network-switch-view')
export class W3mNetworkSwitchView extends LitElement {
  public static styles = styles

  // -- Members ------------------------------------------- //
  private network = RouterController.state.data?.network

  // -- State & Properties -------------------------------- //
  @state() private showRetry = false

  @state() public error = false

  public firstUpdated() {
    this.onSwitchNetwork()
  }

  // -- Render -------------------------------------------- //
  public render() {
    if (!this.network) {
      throw new Error('w3m-network-switch-view: No network provided')
    }

    this.onShowRetry()

    return html`
      <wui-flex
        data-error=${this.error}
        flexDirection="column"
        alignItems="center"
        .padding=${['3xl', 'xl', '3xl', 'xl'] as const}
        gap="xl"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-network-image
            size="lg"
            imageSrc=${ifDefined(this.network.imageSrc)}
          ></wui-network-image>
          ${this.error ? null : html`<wui-loading-hexagon></wui-loading-hexagon>`}
          <wui-icon-box
            backgroundColor="error-100"
            background="opaque"
            iconColor="error-100"
            icon="close"
            size="sm"
            border
          ></wui-icon-box>
        </wui-flex>

        <wui-text variant="small-500" color="fg-200">
          Accept connection request in your wallet
        </wui-text>

        <wui-button
          data-retry=${this.showRetry}
          size="sm"
          variant="fill"
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
  private onShowRetry() {
    if (this.error && !this.showRetry) {
      this.showRetry = true
      const retryButton = this.shadowRoot?.querySelector('wui-button') as HTMLElement
      animate(retryButton, { opacity: [0, 1] })
    }
  }

  private async onSwitchNetwork() {
    try {
      this.error = false
      if (this.network) {
        await NetworkController.switchActiveNetwork(this.network)
        RouterController.goBack()
      }
    } catch {
      this.error = true
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-network-switch-view': W3mNetworkSwitchView
  }
}
