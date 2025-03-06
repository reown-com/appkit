import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import { ChainController, ConnectorController } from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'

import '../../partials/w3m-account-default-widget/index.js'
import '../../partials/w3m-account-wallet-features-widget/index.js'

@customElement('w3m-account-view')
export class W3mAccountView extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  @state() namespace = ChainController.state.activeChain

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe.push(
      ChainController.subscribeKey('activeChain', namespace => {
        this.namespace = namespace
      })
    )
  }

  // -- Render -------------------------------------------- //

  public override render() {
    if (!this.namespace) {
      return null
    }

    const connectorId = ConnectorController.getConnectorId(this.namespace)
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
