import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import {
  ConnectorController,
  CoreHelperUtil,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-link'
import '@reown/appkit-ui/wui-loading-spinner'
import '@reown/appkit-ui/wui-otp'
import '@reown/appkit-ui/wui-text'
import { W3mFrameHelpers } from '@reown/appkit-wallet'

import styles from './styles.js'

// -- Types --------------------------------------------- //
export type OnOtpSubmitFn = (otp: string) => Promise<void>
export type OnOtpResendFn = (email: string) => Promise<void>
export type OnStartOverFn = () => void

@customElement('w3m-email-otp-widget')
export class W3mEmailOtpWidget extends LitElement {
  public static readonly OTP_LENGTH = 6

  public static override styles = styles

  // -- State & Properties -------------------------------- //
  private OTPTimeout?: ReturnType<typeof setInterval>

  @state() private loading = false

  @state() private timeoutTimeLeft = W3mFrameHelpers.getTimeToNextEmailLogin()

  @state() private error = ''

  protected otp = ''

  public email = RouterController.state.data?.email

  public onOtpSubmit: OnOtpSubmitFn | undefined

  public onOtpResend: OnOtpResendFn | undefined

  public onStartOver: OnStartOverFn | undefined

  public authConnector = ConnectorController.getAuthConnector()

  public override firstUpdated() {
    this.startOTPTimeout()
  }

  public override disconnectedCallback() {
    clearTimeout(this.OTPTimeout)
  }

  public constructor() {
    super()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.email) {
      throw new Error('w3m-email-otp-widget: No email provided')
    }
    const isResendDisabled = Boolean(this.timeoutTimeLeft)
    const footerLabels = this.getFooterLabels(isResendDisabled)

    return html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${['4', '0', '4', '0'] as const}
        gap="4"
      >
        <wui-flex
          class="email-display"
          flexDirection="column"
          alignItems="center"
          .padding=${['0', '5', '0', '5'] as const}
        >
          <wui-text variant="md-regular" color="primary" align="center">
            Enter the code we sent to
          </wui-text>
          <wui-text variant="md-medium" color="primary" lineClamp="1" align="center">
            ${this.email}
          </wui-text>
        </wui-flex>

        <wui-text variant="sm-regular" color="secondary">The code expires in 20 minutes</wui-text>

        ${this.loading
          ? html`<wui-loading-spinner size="xl" color="accent-primary"></wui-loading-spinner>`
          : html` <wui-flex flexDirection="column" alignItems="center" gap="2">
              <wui-otp
                dissabled
                length="6"
                @inputChange=${this.onOtpInputChange.bind(this)}
                .otp=${this.otp}
              ></wui-otp>
              ${this.error
                ? html`
                    <wui-text variant="sm-regular" align="center" color="error">
                      ${this.error}. Try Again
                    </wui-text>
                  `
                : null}
            </wui-flex>`}

        <wui-flex alignItems="center" gap="2">
          <wui-text variant="sm-regular" color="secondary">${footerLabels.title}</wui-text>
          <wui-link @click=${this.onResendCode.bind(this)} .disabled=${isResendDisabled}>
            ${footerLabels.action}
          </wui-link>
        </wui-flex>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private startOTPTimeout() {
    this.timeoutTimeLeft = W3mFrameHelpers.getTimeToNextEmailLogin()
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
        this.otp = event.detail
        if (this.shouldSubmitOnOtpChange()) {
          this.loading = true
          await this.onOtpSubmit?.(this.otp)
        }
      }
    } catch (error) {
      this.error = CoreHelperUtil.parseError(error)
      this.loading = false
    }
  }

  private async onResendCode() {
    try {
      if (this.onOtpResend) {
        if (!this.loading && !this.timeoutTimeLeft) {
          this.error = ''
          this.otp = ''
          const authConnector = ConnectorController.getAuthConnector()
          if (!authConnector || !this.email) {
            throw new Error('w3m-email-otp-widget: Unable to resend email')
          }
          this.loading = true
          await this.onOtpResend(this.email)
          this.startOTPTimeout()
          SnackController.showSuccess('Code email resent')
        }
      } else if (this.onStartOver) {
        this.onStartOver()
      }
    } catch (error) {
      SnackController.showError(error)
    } finally {
      this.loading = false
    }
  }

  private getFooterLabels(isResendDisabled: boolean) {
    if (this.onStartOver) {
      return {
        title: 'Something wrong?',
        action: `Try again ${isResendDisabled ? `in ${this.timeoutTimeLeft}s` : ''}`
      }
    }

    return {
      title: `Didn't receive it?`,
      action: `Resend ${isResendDisabled ? `in ${this.timeoutTimeLeft}s` : 'Code'}`
    }
  }

  protected shouldSubmitOnOtpChange() {
    return this.authConnector && this.otp.length === W3mEmailOtpWidget.OTP_LENGTH
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-email-otp-widget': W3mEmailOtpWidget
  }
}
