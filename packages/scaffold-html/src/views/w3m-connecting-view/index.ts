import { ConnectionController, RouterController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('w3m-connecting-view')
export class W3mConnectingView extends LitElement {
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
      <wui-flex flexDirection="column" padding="l" gap="xs" alignItems="center">
        <wui-loading-thumbnail></wui-loading-thumbnail>
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
