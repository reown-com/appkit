import { ConnectionController, RouterController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { animate } from 'motion'
import styles from './styles'

@customElement('w3m-connecting-external-view')
export class W3mConnectingExternalView extends LitElement {
  public static styles = styles

  // -- Members ------------------------------------------- //
  private readonly connector = RouterController.state.data?.connector

  // -- State & Properties -------------------------------- //
  @state() private error = false

  @state() private showRetry = false

  public firstUpdated() {
    this.onConnect()
  }

  // -- Render -------------------------------------------- //
  public render() {
    if (!this.connector) {
      throw new Error('w3m-connecting-view: No connector provided')
    }

    const label = `Continue in ${this.connector.name}`
    const subLabel = this.error ? 'Connection declined' : 'Accept connection request in the wallet'
    const subLabelColor = this.error ? 'error-100' : 'fg-200'

    return html`
      <wui-flex
        data-error=${this.error}
        flexDirection="column"
        alignItems="center"
        .padding=${['3xl', 'l', '3xl', 'l'] as const}
        gap="xl"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-wallet-image size="lg"></wui-wallet-image>
          ${this.error ? null : html`<wui-loading-thumbnail></wui-loading-thumbnail>`}
          <wui-icon-box
            backgroundColor="error-100"
            background="opaque"
            iconColor="error-100"
            icon="close"
            size="sm"
            border
          ></wui-icon-box>
        </wui-flex>

        <wui-flex flexDirection="column" alignItems="center" gap="xs">
          <wui-text variant="paragraph-500" color="fg-100">${label}</wui-text>
          <wui-text variant="small-500" color=${subLabelColor}>${subLabel}</wui-text>
        </wui-flex>

        <wui-button
          data-retry=${this.showRetry}
          size="sm"
          variant="fill"
          .disabled=${!this.error}
          @click=${this.onConnect.bind(this)}
        >
          <wui-icon color="inherit" slot="iconLeft" name="swap"></wui-icon>
          Try again
        </wui-button>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private async onConnect() {
    try {
      this.error = false
      if (this.connector) {
        await ConnectionController.connectExternal(this.connector.id)
      }
    } catch {
      this.error = true
      this.onShowRetry()
    }
  }

  private onShowRetry() {
    if (!this.showRetry) {
      this.showRetry = true
      const retryButton = this.shadowRoot?.querySelector('wui-button') as HTMLElement
      animate(retryButton, { opacity: [0, 1] })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-external-view': W3mConnectingExternalView
  }
}
