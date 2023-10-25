import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'
import { RouterController, ConnectorController } from '@web3modal/core'

@customElement('w3m-email-verify-device-view')
export class W3mEmailVerifyDeviceView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  protected readonly email = RouterController.state.data?.email

  protected readonly emailConnecotr = ConnectorController.getEmailConnector()

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.email) {
      throw new Error('w3m-email-verify-device-view: No email provided')
    }

    return html` <wui-flex> TODO </wui-flex> `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-email-verify-device-view': W3mEmailVerifyDeviceView
  }
}
