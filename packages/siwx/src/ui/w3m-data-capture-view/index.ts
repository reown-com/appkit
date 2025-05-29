import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import {
  ChainController,
  OptionsController,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'

import { CloudAuthSIWX } from '../../configs/index.js'

@customElement('w3m-data-capture-view')
export class W3mDataCaptureView extends LitElement {
  @state() private email = RouterController.state.data?.email ?? ''

  @state() private loading = false

  @state() private siwx = OptionsController.state.siwx as CloudAuthSIWX

  @state() private isRequired =
    Array.isArray(OptionsController.state.remoteFeatures?.emailCapture) &&
    OptionsController.state.remoteFeatures?.emailCapture.includes('required')

  public override firstUpdated() {
    if (!this.siwx || !(this.siwx instanceof CloudAuthSIWX)) {
      throw new Error('CloudAuthSIWX is not initialized')
    }

    if (this.email) {
      this.onSubmit()
    }
  }

  public override render() {
    return html`
      <wui-flex flexDirection="column" .padding=${['3xs', 'm', 'm', 'm'] as const} gap="l">
        ${this.emailInput()}

        <wui-flex flexDirection="row" fullWidth gap="s">
          ${this.isRequired
            ? null
            : html`<wui-button
                size="lg"
                variant="secondary"
                fullWidth
                @click=${this.onSkip.bind(this)}
                >Skip</wui-button
              >`}

          <wui-button
            size="lg"
            variant="main"
            type="submit"
            fullWidth
            .loading=${this.loading}
            @click=${this.onSubmit.bind(this)}
          >
            Continue
          </wui-button>
        </wui-flex>
      </wui-flex>
    `
  }

  private emailInput() {
    if (!OptionsController.state.remoteFeatures?.emailCapture) {
      return null
    }

    const keydownHandler = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        this.onSubmit()
      }
    }

    const changeHandler = (event: CustomEvent<string>) => {
      this.email = event.detail
    }

    return html`<wui-email-input
      .value=${this.email}
      .disabled=${this.loading}
      @inputChange=${changeHandler}
      @keydown=${keydownHandler}
    ></wui-email-input>`
  }

  private async onSubmit() {
    const account = ChainController.getActiveCaipAddress()

    if (!account || !this.email) {
      throw new Error('No account data found')
    }

    try {
      this.loading = true
      const otp = await this.siwx.requestEmailOtp({
        email: this.email,
        account
      })

      if (otp.uuid === null) {
        RouterController.replace('SIWXSignMessage')
      } else {
        RouterController.replace('DataCaptureOtpConfirm', { email: this.email })
      }
    } catch (error) {
      SnackController.showError('Failed to send email OTP')
    } finally {
      this.loading = false
    }
  }

  private onSkip() {
    RouterController.replace('SIWXSignMessage')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-data-capture-view': W3mDataCaptureView
  }
}
