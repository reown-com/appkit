import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import { type Connector, ConnectorController, OptionsController } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import { ConstantsUtil as AppKitConstantsUtil } from '@reown/appkit-utils'

@customElement('w3m-email-login-view')
export class W3mEmailLoginView extends LitElement {
  // -- Members ------------------------------------------- //
  protected authConnector = ConnectorController.getAuthConnector()

  private isEmailEnabled = OptionsController.state.remoteFeatures?.email

  private isAuthEnabled = this.checkIfAuthEnabled(ConnectorController.state.connectors)

  // -- State & Properties -------------------------------- //
  @state() private connectors = ConnectorController.state.connectors

  public constructor() {
    super()
    ConnectorController.subscribeKey('connectors', val => {
      this.connectors = val
      this.isAuthEnabled = this.checkIfAuthEnabled(this.connectors)
    })
  }

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.isEmailEnabled) {
      throw new Error('w3m-email-login-view: Email is not enabled')
    }

    if (!this.isAuthEnabled) {
      throw new Error('w3m-email-login-view: No auth connector provided')
    }

    return html`<wui-flex
      flexDirection="column"
      .padding=${['3xs', 'm', 'm', 'm'] as const}
      gap="l"
    >
      <w3m-email-login-widget></w3m-email-login-widget>
    </wui-flex> `
  }

  // -- Private ------------------------------------------- //
  private checkIfAuthEnabled(connectors: Connector[]) {
    const namespacesWithAuthConnector = connectors
      .filter(c => c.type === AppKitConstantsUtil.CONNECTOR_TYPE_AUTH)
      .map(i => i.chain)
    const authSupportedNamespaces = CommonConstantsUtil.AUTH_CONNECTOR_SUPPORTED_CHAINS

    return authSupportedNamespaces.some(ns => namespacesWithAuthConnector.includes(ns))
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-email-login-view': W3mEmailLoginView
  }
}
