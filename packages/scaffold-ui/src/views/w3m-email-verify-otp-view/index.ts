import { customElement } from '@web3modal/ui'
import { W3mEmailOtpWidget } from '../../utils/w3m-email-otp-widget/index.js'
import type { OnOtpSubmitFn, OnOtpResendFn } from '../../utils/w3m-email-otp-widget/index.js'
import {
  EventsController,
  ConnectionController,
  ModalController,
  NetworkController,
  RouterController,
  AccountController,
  ChainController
} from '@web3modal/core'
import { state } from 'lit/decorators.js'

@customElement('w3m-email-verify-otp-view')
export class W3mEmailVerifyOtpView extends W3mEmailOtpWidget {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State ------------------------------------------- //
  @state() private smartAccountDeployed = AccountController.getProperty('smartAccountDeployed')

  public constructor() {
    super()

    this.unsubscribe.push(
      ChainController.subscribe(val => {
        const accountState = val.activeChain ? val.chains[val.activeChain]?.accountState : undefined
        this.smartAccountDeployed = accountState?.smartAccountDeployed || false
      })
    )
  }

  // --  Private ------------------------------------------ //
  override onOtpSubmit: OnOtpSubmitFn = async otp => {
    try {
      if (this.authConnector) {
        const smartAccountEnabled = NetworkController.checkIfSmartAccountEnabled()
        await this.authConnector.provider.connectOtp({ otp })
        EventsController.sendEvent({ type: 'track', event: 'EMAIL_VERIFICATION_CODE_PASS' })
        await ConnectionController.connectExternal(this.authConnector)
        EventsController.sendEvent({
          type: 'track',
          event: 'CONNECT_SUCCESS',
          properties: { method: 'email', name: this.authConnector.name || 'Unknown' }
        })

        if (smartAccountEnabled && !this.smartAccountDeployed) {
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
