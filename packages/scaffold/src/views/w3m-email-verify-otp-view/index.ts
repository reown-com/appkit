import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import {
  RouterController,
  SnackController,
  ModalController,
  EventsController,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil
} from '@web3modal/core'
import { state } from 'lit/decorators.js'
import styles from './styles.js'
import { W3mFrameHelpers } from '@web3modal/wallet'

// -- Helpers ------------------------------------------- //
const OTP_LENGTH = 6

@customElement('w3m-email-verify-otp-view')
export class W3mEmailVerifyOtpView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  protected readonly email = RouterController.state.data?.email

  protected readonly emailConnector = ConnectorController.getEmailConnector()

  // -- State & Properties -------------------------------- //
  @state() private loading = false

  @state() private timeoutTimeLeft = W3mFrameHelpers.getTimeToNextEmailLogin()

  @state() private error = ''

  private OTPTimeout: NodeJS.Timeout | undefined

  public override firstUpdated() {
    this.startOTPTimeout()
  }

  public override disconnectedCallback() {
    clearTimeout(this.OTPTimeout)
  }

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.email) {
      throw new Error('w3m-email-verify-otp-view: No email provided')
    }

    const isResendDisabled = Boolean(this.timeoutTimeLeft)

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

        <wui-text variant="small-400" color="fg-200">The code expires in 20 minutes</wui-text>

        ${this.loading
          ? html`<wui-loading-spinner size="xl" color="accent-100"></wui-loading-spinner>`
          : html` <wui-flex flexDirection="column" alignItems="center" gap="xs">
              <wui-otp
                dissabled
                length="6"
                @inputChange=${this.onOtpInputChange.bind(this)}
              ></wui-otp>
              ${this.error
                ? html`<wui-text variant="small-400" color="error-100"
                    >${this.error}. Try Again</wui-text
                  >`
                : null}
            </wui-flex>`}

        <wui-flex alignItems="center">
          <wui-text variant="small-400" color="fg-200">Didn't receive it?</wui-text>
          <wui-link @click=${this.onResendCode.bind(this)} .disabled=${isResendDisabled}>
            Resend ${isResendDisabled ? `in ${this.timeoutTimeLeft}s` : 'Code'}
          </wui-link>
        </wui-flex>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private startOTPTimeout() {
    this.OTPTimeout = setInterval(() => {
      if (this.timeoutTimeLeft > 0) {
        this.timeoutTimeLeft = W3mFrameHelpers.getTimeToNextEmailLogin()
      } else {
        clearInterval(this.OTPTimeout)
      }
    }, 1000)
  }

  private async onOtpInputChange(event: CustomEvent<string>) {
    try {
      if (!this.loading) {
        const otp = event.detail
        if (this.emailConnector && otp.length === OTP_LENGTH) {
          this.loading = true
          await this.emailConnector.provider.connectOtp({ otp })
          EventsController.sendEvent({ type: 'track', event: 'EMAIL_VERIFICATION_CODE_PASS' })
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
      EventsController.sendEvent({ type: 'track', event: 'EMAIL_VERIFICATION_CODE_FAIL' })
      this.error = CoreHelperUtil.parseError(error)
      this.loading = false
    }
  }

  private async onResendCode() {
    try {
      if (!this.loading && !this.timeoutTimeLeft) {
        const emailConnector = ConnectorController.getEmailConnector()
        if (!emailConnector || !this.email) {
          throw new Error('w3m-email-login-widget: Unable to resend email')
        }
        this.loading = true
        await emailConnector.provider.connectEmail({ email: this.email })
        EventsController.sendEvent({ type: 'track', event: 'EMAIL_VERIFICATION_CODE_SENT' })
        this.startOTPTimeout()
        SnackController.showSuccess('Code email resent')
      }
    } catch (error) {
      SnackController.showError(error)
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
