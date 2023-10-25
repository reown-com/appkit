import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'
import {
  RouterController,
  SnackController,
  ModalController,
  EventsController,
  ConnectionController
} from '@web3modal/core'

// -- Helpers ------------------------------------------- //
const OTP_LENGTH = 6

@customElement('w3m-confirm-email-view')
export class W3mConfirmEmailView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  protected readonly email = RouterController.state.data?.email

  protected readonly emailConnecotr = RouterController.state.data?.connector

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.email) {
      throw new Error('w3m-confirm-email-view: No email provided')
    }

    return html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${['l', '0', 'l', '0'] as const}
        gap="l"
      >
        <wui-flex flexDirection="column" alignItems="center">
          <wui-text variant="paragraph-500" color="fg-100"> Enter the code we sent to </wui-text>
          <wui-text variant="paragraph-600" color="fg-100">${this.email}</wui-text>
        </wui-flex>

        <wui-text variant="small-500" color="fg-200">The code expires in 10 minutes</wui-text>

        <wui-otp dissabled length="6" @inputChange=${this.onOtpInputChange.bind(this)}></wui-otp>

        <wui-flex alignItems="center">
          <wui-text variant="small-500" color="fg-200">Didn't receive it?</wui-text>
          <wui-link>Resend code</wui-link>
        </wui-flex>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private async onOtpInputChange(event: CustomEvent<string>) {
    try {
      const otp = event.detail
      if (this.emailConnecotr?.type === 'EMAIL' && otp.length === OTP_LENGTH) {
        // @ts-expect-error - Exists on email provider
        await this.emailConnecotr.provider.connectOtp(otp)
        await ConnectionController.connectExternal(this.emailConnecotr)
        ModalController.close()
        EventsController.sendEvent({
          type: 'track',
          event: 'CONNECT_SUCCESS',
          properties: { method: 'email' }
        })
      }
    } catch (error) {
      SnackController.showError((error as Error)?.message)
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-confirm-email-view': W3mConfirmEmailView
  }
}
