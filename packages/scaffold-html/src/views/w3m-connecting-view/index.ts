import { ConnectionController, RouterController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import styles from './styles'

@customElement('w3m-connecting-view')
export class W3mConnectingView extends LitElement {
  public static styles = styles

  // -- Members ------------------------------------------- //
  private readonly connector = RouterController.state.data?.connector

  // -- State & Properties -------------------------------- //
  @state() private error = false

  public constructor() {
    super()
    this.onConnect()
  }

  // -- Render -------------------------------------------- //
  public render() {
    if (!this.connector) {
      throw new Error('w3m-connecting-view: No connector provided')
    }

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
          ${this.thumbnailTemplate()}
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
          <wui-text variant="paragraph-500" color="fg-100">Continue in MetaMask</wui-text>
          <wui-text variant="small-500" color=${subLabelColor}>${subLabel}</wui-text>
        </wui-flex>

        ${this.tryAgainTemplate()}
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
    }
  }

  private thumbnailTemplate() {
    if (this.error) {
      return null
    }

    return html`<wui-loading-thumbnail></wui-loading-thumbnail>`
  }

  private tryAgainTemplate() {
    if (this.error) {
      return html`
        <wui-button size="sm" variant="fill" @click=${this.onConnect.bind(this)}>
          Try again
        </wui-button>
      `
    }

    return null
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-view': W3mConnectingView
  }
}
