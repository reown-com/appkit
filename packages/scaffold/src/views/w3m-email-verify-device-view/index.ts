import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'
import { RouterController, ConnectorController } from '@web3modal/core'

@customElement('w3m-email-verify-device-view')
export class W3mEmailVerifyDeviceView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  protected readonly email = RouterController.state.data?.email

  protected readonly emailConnector = ConnectorController.getEmailConnector()

  public constructor() {
    super()
    this.listenForDeviceApproval()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.email) {
      throw new Error('w3m-email-verify-device-view: No email provided')
    }
    if (!this.emailConnector) {
      throw new Error('w3m-email-verify-device-view: No email provided')
    }

    return html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${['0', '3xl', 'xxl', '3xl'] as const}
      >
        <wui-flex justifyContent="center" .padding=${['0', '0', 'xxl', '0'] as const}>
          <wui-icon-box
            size="xl"
            iconcolor="accent-100"
            backgroundcolor="accent-100"
            icon="verify"
            background="opaque"
          ></wui-icon-box>
        </wui-flex>
        <wui-text variant="large-600" color="fg-100"> Register this device to continue </wui-text>
        <wui-flex
          flexDirection="column"
          alignItems="center"
          .padding=${['s', '0', '0', '0'] as const}
        >
          <wui-text variant="paragraph-400" color="fg-200">Check the instructions sent to</wui-text>
          <wui-text variant="paragraph-600" color="fg-100">${this.email}</wui-text>
        </wui-flex>

        <wui-flex alignItems="center" .padding=${['xxl', '0', '0', '0'] as const}>
          <wui-text variant="paragraph-400" color="fg-200" align="center">
            This is a quick one-time approval that will keep your account secure</wui-text
          >
        </wui-flex>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private async listenForDeviceApproval() {
    if (this.emailConnector) {
      await this.emailConnector.provider.connectDevice()
      RouterController.replace('EmailVerifyOtp', { email: this.email })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-email-verify-device-view': W3mEmailVerifyDeviceView
  }
}
