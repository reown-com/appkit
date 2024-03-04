import { customElement } from '@web3modal/ui'
import { W3mEmailOtpWidget } from '../../utils/w3m-email-otp-widget/index.js'
import type { OnOtpSubmitFn, OnOtpResendFn } from '../../utils/w3m-email-otp-widget/index.js'
import {
  EventsController,
  ConnectionController,
  ModalController,
  NetworkController,
  RouterController,
  AccountController
} from '@web3modal/core'
import { state } from 'lit/decorators.js'
import { W3mFrameHelpers } from '@web3modal/wallet'

@customElement('w3m-email-verify-otp-view')
export class W3mEmailVerifyOtpView extends W3mEmailOtpWidget {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State ------------------------------------------- //
  @state() private network = NetworkController.state.caipNetwork
  @state() private smartAccountDeployed = AccountController.state.smartAccountDeployed

  public constructor() {
    super()

    this.unsubscribe.push(
      NetworkController.subscribeKey('caipNetwork', val => {
        this.network = val
      }),
      AccountController.subscribeKey('smartAccountDeployed', val => {
        this.smartAccountDeployed = val
      })
    )
  }

  // --  Private ------------------------------------------ //
  override onOtpSubmit: OnOtpSubmitFn = async otp => {
    try {
      if (this.emailConnector) {
        await this.emailConnector.provider.connectOtp({ otp })
        EventsController.sendEvent({ type: 'track', event: 'EMAIL_VERIFICATION_CODE_PASS' })
        await ConnectionController.connectExternal(this.emailConnector)
        EventsController.sendEvent({
          type: 'track',
          event: 'CONNECT_SUCCESS',
          properties: { method: 'email', name: this.emailConnector.name || 'Unknown' }
        })

        const networkId = this.network?.id?.split(':')?.[1]
        if (W3mFrameHelpers.checkIfSmartAccountEnabled(networkId) && !this.smartAccountDeployed) {
          RouterController.push('UpgradeToSmartAccount')
        } else {
          ModalController.close()
        }
      }
    } catch (error) {
      EventsController.sendEvent({ type: 'track', event: 'EMAIL_VERIFICATION_CODE_FAIL' })
      throw error
    }
  }

  override onOtpResend: OnOtpResendFn = async email => {
    if (this.emailConnector) {
      await this.emailConnector.provider.connectEmail({ email })
      EventsController.sendEvent({ type: 'track', event: 'EMAIL_VERIFICATION_CODE_SENT' })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-email-verify-otp-view': W3mEmailVerifyOtpView
  }
}
