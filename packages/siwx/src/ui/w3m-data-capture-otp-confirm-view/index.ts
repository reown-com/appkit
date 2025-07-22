import { state } from 'lit/decorators.js'

import {
  ChainController,
  OptionsController,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'
import {
  type OnOtpResendFn,
  type OnOtpSubmitFn,
  W3mEmailOtpWidget
} from '@reown/appkit-scaffold-ui/email'
import { customElement } from '@reown/appkit-ui'

import { ReownAuthentication } from '../../configs/index.js'

@customElement('w3m-data-capture-otp-confirm-view')
export class W3mDataCaptureOtpConfirmView extends W3mEmailOtpWidget {
  @state() private siwx = OptionsController.state.siwx as ReownAuthentication

  public override connectedCallback() {
    if (!this.siwx || !(this.siwx instanceof ReownAuthentication)) {
      SnackController.showError('ReownAuthentication is not initialized.')
    }

    super.connectedCallback()
  }

  override onOtpSubmit: OnOtpSubmitFn = async otp => {
    await this.siwx.confirmEmailOtp({ code: otp })
    RouterController.replace('SIWXSignMessage')
  }

  override shouldSubmitOnOtpChange() {
    return this.otp.length === W3mEmailOtpWidget.OTP_LENGTH
  }

  override onOtpResend: OnOtpResendFn = async email => {
    const accountData = ChainController.getAccountData()

    if (!accountData?.caipAddress) {
      throw new Error('No account data found')
    }

    await this.siwx.requestEmailOtp({
      email,
      account: accountData.caipAddress
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-data-capture-otp-confirm-view': W3mDataCaptureOtpConfirmView
  }
}
