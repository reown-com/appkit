import {
  ChainController,
  ConnectionController,
  CoreHelperUtil,
  EventsController,
  ModalController,
  OptionsController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'

import { W3mEmailOtpWidget } from '../../utils/w3m-email-otp-widget/index.js'
import type { OnOtpResendFn, OnOtpSubmitFn } from '../../utils/w3m-email-otp-widget/index.js'

@customElement('w3m-email-verify-otp-view')
export class W3mEmailVerifyOtpView extends W3mEmailOtpWidget {
  // --  Private ------------------------------------------ //
  override onOtpSubmit: OnOtpSubmitFn = async otp => {
    try {
      if (this.authConnector) {
        await this.authConnector.provider.connectOtp({ otp })
        EventsController.sendEvent({ type: 'track', event: 'EMAIL_VERIFICATION_CODE_PASS' })

        if (ChainController.state.activeChain) {
          await ConnectionController.connectExternal(
            this.authConnector,
            ChainController.state.activeChain
          )
        } else {
          throw new Error('Active chain is not set on ChainControll')
        }

        EventsController.sendEvent({
          type: 'track',
          event: 'CONNECT_SUCCESS',
          properties: { method: 'email', name: this.authConnector.name || 'Unknown' }
        })
        if (!OptionsController.state.siwx) {
          ModalController.close()
        }
      }
    } catch (error) {
      EventsController.sendEvent({
        type: 'track',
        event: 'EMAIL_VERIFICATION_CODE_FAIL',
        properties: { message: CoreHelperUtil.parseError(error) }
      })
      throw error
    }
  }

  override onOtpResend: OnOtpResendFn = async email => {
    if (this.authConnector) {
      await this.authConnector.provider.connectEmail({ email })
      EventsController.sendEvent({ type: 'track', event: 'EMAIL_VERIFICATION_CODE_SENT' })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-email-verify-otp-view': W3mEmailVerifyOtpView
  }
}
