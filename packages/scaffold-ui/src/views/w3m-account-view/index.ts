import { ConnectorController, StorageUtil } from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'

@customElement('w3m-account-view')
export class W3mAccountView extends LitElement {
  // -- Render -------------------------------------------- //

  public override render() {
    const connectorId = StorageUtil.getConnectedConnectorId()
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
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-view': W3mAccountView
  }
}
