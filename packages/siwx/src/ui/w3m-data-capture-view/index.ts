import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import { ChainController, OptionsController } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'

import { CloudAuthSIWX } from '../../configs/index.js'

@customElement('w3m-data-capture-view')
export class W3mDataCaptureView extends LitElement {
  @state() private email?: string

  @state() private loading = false

  @state() private siwx = OptionsController.state.siwx as CloudAuthSIWX

  public override firstUpdated() {
    if (!this.siwx || !(this.siwx instanceof CloudAuthSIWX)) {
      throw new Error('CloudAuthSIWX is not initialized')
    }
  }

  public override render() {
    return html`
      <wui-flex flexDirection="column" .padding=${['3xs', 'm', 'm', 'm'] as const} gap="l">
        ${this.emailInput()}

        <wui-button
          size="lg"
          variant="main"
          fullWidth
          @click=${this.onSubmit.bind(this)}
          .loading=${this.loading}
        >
          Continue
        </wui-button>
      </wui-flex>
    `
  }

  private onEmailInputChange(event: CustomEvent<string>) {
    this.email = event.detail
  }

  private emailInput() {
    if (!OptionsController.state.remoteFeatures?.emailCapture) {
      return null
    }

    return html`<wui-email-input
      .value=${this.email}
      @inputChange=${this.onEmailInputChange.bind(this)}
    ></wui-email-input>`
  }

  private async onSubmit() {
    const accountData = ChainController.getAccountData()

    if (!accountData?.caipAddress || !this.email) {
      throw new Error('No account data found')
    }

    try {
      this.loading = true
      const otp = await this.siwx.requestEmailOtp({
        email: this.email,
        account: accountData.caipAddress
      })

      console.log('otp success:', otp)
    } catch (error) {
      console.error('otp error', error)
    } finally {
      this.loading = false
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-data-capture-view': W3mDataCaptureView
  }
}
