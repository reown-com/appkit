import { ConnectionController, RouterController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import styles from './styles'

@customElement('w3m-connecting-view')
export class W3mConnectingView extends LitElement {
  public static styles = styles

  // -- Members ------------------------------------------- //
  private readonly connector = RouterController.state.data?.connector

  public constructor() {
    super()
    this.onConnect()
  }

  // -- Render -------------------------------------------- //
  public render() {
    if (!this.connector) {
      throw new Error('w3m-connecting-view: No connector provided')
    }

    return html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${['3xl', 'l', '3xl', 'l'] as const}
        gap="xl"
      >
        <wui-flex justifyContent="center" alignItems="center" id="thumbnail">
          <wui-loading-thumbnail></wui-loading-thumbnail>
          <wui-wallet-image size="lg"></wui-wallet-image>
        </wui-flex>

        <wui-flex flexDirection="column" alignItems="center" gap="xs">
          <wui-text variant="paragraph-500" color="fg-100">Continue in MetaMask</wui-text>
          <wui-text variant="small-500" color="fg-200">
            Accept connection request in the wallet
          </wui-text>
        </wui-flex>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private async onConnect() {
    if (this.connector) {
      await ConnectionController.connectExternal(this.connector.id)
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connecting-view': W3mConnectingView
  }
}
