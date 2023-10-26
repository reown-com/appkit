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

  public constructor() {
    super()
    this.listenForDeviceApproval()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.email) {
      throw new Error('w3m-email-verify-device-view: No email provided')
    }
    if (!this.emailConnecotr) {
      throw new Error('w3m-email-verify-device-view: No email provided')
    }

    return html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${['l', '0', 'l', '0'] as const}
        gap="l"
      >
        <wui-text variant="paragraph-500" color="fg-100">
          Register this device to continue
        </wui-text>

        <wui-flex flexDirection="column" alignItems="center">
          <wui-text variant="small-500" color="fg-200">Check the instructions sent to</wui-text>
          <wui-text variant="paragraph-600" color="fg-100">${this.email}</wui-text>
        </wui-flex>

        <wui-flex alignItems="center">
          <wui-text variant="small-500" color="fg-200">Didn't receive it?</wui-text>
          <wui-link>Resend code</wui-link>
        </wui-flex>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private async listenForDeviceApproval() {
    if (this.emailConnecotr) {
      await this.emailConnecotr.provider.connectDevice()
      RouterController.replace('EmailVerifyOtp', { email: this.email })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-email-verify-device-view': W3mEmailVerifyDeviceView
  }
}
