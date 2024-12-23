import {
  ConnectorController,
  StorageUtil,
  type AccountType,
  AccountController
} from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import { state } from 'lit/decorators.js'

@customElement('w3m-account-view')
export class W3mAccountView extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() public allAccounts: AccountType[] = AccountController.state.allAccounts

  public constructor() {
    super()
    this.unsubscribe.push(
      AccountController.subscribeKey('allAccounts', val => (this.allAccounts = val))
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const connectorId = StorageUtil.getConnectedConnectorId()
    const authConnector = ConnectorController.getAuthConnector()
    const isAuthConnector = connectorId === CommonConstantsUtil.CONNECTOR_ID.AUTH

    const hasMultipleAccounts = this.allAccounts.length > 1

    return html`
      ${hasMultipleAccounts && authConnector && isAuthConnector
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
