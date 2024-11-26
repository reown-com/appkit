import { ConnectorController, StorageUtil } from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'

@customElement('w3m-account-view')
export class W3mAccountView extends LitElement {
  // -- Render -------------------------------------------- //

  public override render() {
    const connectedConnectorType = StorageUtil.getConnectedConnector()
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
