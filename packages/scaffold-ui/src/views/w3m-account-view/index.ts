import { ChainController, ConnectorController, StorageUtil } from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

@customElement('w3m-account-view')
export class W3mAccountView extends LitElement {
  // -- Members -------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties --------------------------------- //
  @state() private activeNetwork = ChainController.state.activeChain

  // -- Lifecycle ------------------------------------------ //
  public constructor() {
    super()
    this.unsubscribe.push(
      ChainController.subscribeKey('activeChain', val => {
        this.activeNetwork = val
      })
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //

  public override render() {
    if (!this.activeNetwork) {
      return null
    }
    const connectedConnectorType = StorageUtil.getConnectedConnector(this.activeNetwork)
    const authConnector = ConnectorController.getAuthConnector()

    return html`
      ${authConnector && connectedConnectorType === 'ID_AUTH'
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
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-view': W3mAccountView
  }
}
