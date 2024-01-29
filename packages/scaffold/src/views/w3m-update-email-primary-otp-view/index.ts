import { customElement } from '@web3modal/ui'
import { W3mEmailOtpWidget } from '../../utils/w3m-email-otp-widget/index.js'
import type { OnOtpSubmitFn } from '../../utils/w3m-email-otp-widget/index.js'
import { EventsController, RouterController } from '@web3modal/core'

@customElement('w3m-update-email-primary-otp-view')
export class W3mUpdateEmailPrimaryOtpView extends W3mEmailOtpWidget {
  public constructor() {
    super()
  }

  // --  Private ------------------------------------------ //
  override onOtpSubmit: OnOtpSubmitFn = async otp => {
    try {
      if (this.emailConnector) {
        await this.emailConnector.provider.updateEmailPrimaryOtp({ otp })
        EventsController.sendEvent({ type: 'track', event: 'EMAIL_VERIFICATION_CODE_PASS' })
        RouterController.replace('UpdateEmailSecondaryOtp', { email: this.email })
      }
    } catch (error) {
      EventsController.sendEvent({ type: 'track', event: 'EMAIL_VERIFICATION_CODE_FAIL' })
      throw error
    }
  }

  override onStartOver = () => {
    RouterController.replace('UpdateEmailWallet')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-update-email-primary-otp-view': W3mUpdateEmailPrimaryOtpView
  }
}
