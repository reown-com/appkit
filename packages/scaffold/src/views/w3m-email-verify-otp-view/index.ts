import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import {
  RouterController,
  SnackController,
  ModalController,
  EventsController,
  ConnectionController,
  ConnectorController
} from '@web3modal/core'
import { state } from 'lit/decorators.js'

// -- Helpers ------------------------------------------- //
const OTP_LENGTH = 6

@customElement('w3m-email-verify-otp-view')
export class W3mEmailVerifyOtpView extends LitElement {
  // -- Members ------------------------------------------- //
  protected readonly email = RouterController.state.data?.email

  protected readonly emailConnector = ConnectorController.getEmailConnector()

  // -- State & Properties -------------------------------- //
  @state() private loading = false

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.email) {
      throw new Error('w3m-email-verify-otp-view: No email provided')
    }

    return html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${['l', '0', 'l', '0'] as const}
        gap="l"
      >
        <wui-flex flexDirection="column" alignItems="center">
          <wui-text variant="paragraph-400" color="fg-100"> Enter the code we sent to </wui-text>
          <wui-text variant="paragraph-500" color="fg-100">${this.email}</wui-text>
        </wui-flex>

        <wui-text variant="small-400" color="fg-200">The code expires in 10 minutes</wui-text>

        ${this.loading
          ? html`<wui-loading-spinner size="lg" color="accent-100"></wui-loading-spinner></wui-link>`
          : html`<wui-otp
              dissabled
              length="6"
              @inputChange=${this.onOtpInputChange.bind(this)}
            ></wui-otp>`}

        <wui-flex alignItems="center">
          <wui-text variant="small-400" color="fg-200">Didn't receive it?</wui-text>
          <wui-link @click=${this.onResendCode.bind(this)}>Resend code</wui-link>
        </wui-flex>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private async onOtpInputChange(event: CustomEvent<string>) {
    try {
      if (!this.loading) {
        const otp = event.detail
        if (this.emailConnector && otp.length === OTP_LENGTH) {
          this.loading = true
          await this.emailConnector.provider.connectOtp({ otp })
          await ConnectionController.connectExternal(this.emailConnector)
          ModalController.close()
          EventsController.sendEvent({
            type: 'track',
            event: 'CONNECT_SUCCESS',
            properties: { method: 'email' }
          })
        }
      }
    } catch (error) {
      const message = typeof error === 'string' ? error : (error as Error)?.message
      SnackController.showError(message)
      this.loading = false
    }
  }

  private async onResendCode() {
    try {
      if (!this.loading) {
        const emailConnector = ConnectorController.getEmailConnector()
        if (!emailConnector || !this.email) {
          throw new Error('w3m-email-login-widget: Unable to resend email')
        }
        this.loading = true
        await emailConnector.provider.connectEmail({ email: this.email })
        SnackController.showSuccess('New Email sent')
      }
    } catch (error) {
      SnackController.showError((error as Error)?.message)
    } finally {
      this.loading = false
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-email-verify-otp-view': W3mEmailVerifyOtpView
  }
}
