import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import {
  ChainController,
  OptionsController,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'
import { UiHelperUtil, customElement } from '@reown/appkit-ui'

import { CloudAuthSIWX } from '../../configs/index.js'
import './email-suffixes-widget.js'
import styles from './styles.js'

@customElement('w3m-data-capture-view')
export class W3mDataCaptureView extends LitElement {
  public static override styles = [styles]

  @state() private email =
    RouterController.state.data?.email ?? ChainController.getAccountProp('user')?.email ?? ''

  @state() private address = ChainController.getAccountProp('address') ?? ''

  @state() private loading = false

  @state() private appName = OptionsController.state.metadata?.name ?? 'This app'

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
        ${this.paragraph()} ${this.emailInput()} ${this.footerActions()}
      </wui-flex>
    `
  }

  private paragraph() {
    if (this.loading) {
      return html`
        <wui-text variant="paragraph-400" color="fg-100" align="center"
          >We are verifying your account with email <b>${this.email}</b> and address
          <b
            >${UiHelperUtil.getTruncateString({
              string: this.address,
              charsEnd: 4,
              charsStart: 4,
              truncate: 'middle'
            })}</b
          >, please wait a moment.</wui-text
        >
      `
    }

    return html`
      <wui-text variant="paragraph-400" color="fg-100" align="center">
        ${this.isRequired
          ? `${this.appName} requires your email for authentication.`
          : `${this.appName} is requesting your email for authentication.`}
      </wui-text>
    `
  }

  private emailInput() {
    if (this.loading) {
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

    return html`
      <wui-flex flexDirection="column">
        <wui-email-input
          .value=${this.email}
          .disabled=${this.loading}
          @inputChange=${changeHandler}
          @keydown=${keydownHandler}
        ></wui-email-input>

        <w3m-email-suffixes-widget
          .email=${this.email}
          @change=${changeHandler}
        ></w3m-email-suffixes-widget>
      </wui-flex>
    `
  }

  private footerActions() {
    return html`
      <wui-flex flexDirection="row" fullWidth gap="s">
        ${this.isRequired
          ? null
          : html`<wui-button
              size="lg"
              variant="neutral"
              fullWidth
              .disabled=${this.loading}
              @click=${this.onSkip.bind(this)}
              >Skip this step</wui-button
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
    `
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
