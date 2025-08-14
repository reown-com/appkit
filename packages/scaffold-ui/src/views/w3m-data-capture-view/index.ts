import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import { SafeLocalStorage, SafeLocalStorageKeys } from '@reown/appkit-common'
import {
  ChainController,
  OptionsController,
  RouterController,
  SnackController
} from '@reown/appkit-controllers'
import { ReownAuthentication } from '@reown/appkit-controllers/features'
import { UiHelperUtil, customElement } from '@reown/appkit-ui'

import styles from './styles.js'

@customElement('w3m-data-capture-view')
export class W3mDataCaptureView extends LitElement {
  public static override styles = [styles]

  @state() private email =
    RouterController.state.data?.email ?? ChainController.getAccountData()?.user?.email ?? ''

  @state() private address = ChainController.getAccountData()?.address ?? ''

  @state() private loading = false

  @state() private appName = OptionsController.state.metadata?.name ?? 'AppKit'

  @state() private siwx = OptionsController.state.siwx as ReownAuthentication

  @state() private isRequired =
    Array.isArray(OptionsController.state.remoteFeatures?.emailCapture) &&
    OptionsController.state.remoteFeatures?.emailCapture.includes('required')

  @state() private recentEmails = this.getRecentEmails()

  public override connectedCallback() {
    if (!this.siwx || !(this.siwx instanceof ReownAuthentication)) {
      SnackController.showError('ReownAuthentication is not initialized. Please contact support.')
    }

    super.connectedCallback()
  }

  public override firstUpdated() {
    this.loading = false
    this.recentEmails = this.getRecentEmails()

    if (this.email) {
      this.onSubmit()
    }
  }

  public override render() {
    return html`
      <wui-flex flexDirection="column" .padding=${['3xs', 'm', 'm', 'm'] as const} gap="l">
        ${this.hero()} ${this.paragraph()} ${this.emailInput()} ${this.recentEmailsWidget()}
        ${this.footerActions()}
      </wui-flex>
    `
  }

  private hero() {
    return html`
      <div class="hero" data-state=${this.loading ? 'loading' : 'default'}>
        ${this.heroRow(['id', 'mail', 'wallet', 'x', 'solana', 'qrCode'])}
        ${this.heroRow(['mail', 'farcaster', 'wallet', 'discord', 'mobile', 'qrCode'])}
        <div class="hero-row">
          ${this.heroIcon('github')} ${this.heroIcon('bank')}
          <wui-icon-box
            size="xl"
            iconSize="xxl"
            iconColor=${this.loading ? 'fg-100' : 'accent-100'}
            backgroundColor=${this.loading ? 'fg-100' : 'accent-100'}
            icon=${this.loading ? 'id' : 'user'}
            isOpaque
            class="hero-main-icon"
            data-state=${this.loading ? 'loading' : 'default'}
          >
          </wui-icon-box>
          ${this.heroIcon('id')} ${this.heroIcon('card')}
        </div>
        ${this.heroRow(['google', 'id', 'github', 'verify', 'apple', 'mobile'])}
      </div>
    `
  }

  private heroRow(icons: string[]) {
    return html`
      <div class="hero-row" data-state=${this.loading ? 'loading' : 'default'}>
        ${icons.map(this.heroIcon.bind(this))}
      </div>
    `
  }

  private heroIcon(icon: string) {
    return html`
      <wui-icon-box
        size="xl"
        iconSize="xxl"
        iconColor="fg-100"
        backgroundColor="fg-100"
        icon=${icon}
        data-state=${this.loading ? 'loading' : 'default'}
        isOpaque
        class="hero-row-icon"
      >
      </wui-icon-box>
    `
  }

  private paragraph() {
    if (this.loading) {
      return html`
        <wui-text variant="paragraph-400" color="fg-200" align="center"
          >We are verifying your account with email
          <wui-text variant="paragraph-600" color="accent-100">${this.email}</wui-text> and address
          <wui-text variant="paragraph-600" color="fg-100">
            ${UiHelperUtil.getTruncateString({
              string: this.address,
              charsEnd: 4,
              charsStart: 4,
              truncate: 'middle'
            })} </wui-text
          >, please wait a moment.</wui-text
        >
      `
    }

    if (this.isRequired) {
      return html`
        <wui-text variant="paragraph-600" color="fg-100" align="center">
          ${this.appName} requires your email for authentication.
        </wui-text>
      `
    }

    return html`
      <wui-flex flexDirection="column" gap="xs" alignItems="center">
        <wui-text variant="paragraph-600" color="fg-100" align="center" size>
          ${this.appName} would like to collect your email.
        </wui-text>

        <wui-text variant="small-400" color="fg-200" align="center">
          Don't worry, it's optional&mdash;you can skip this step.
        </wui-text>
      </wui-flex>
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

  private recentEmailsWidget() {
    if (this.recentEmails.length === 0 || this.loading) {
      return null
    }

    const recentEmailSelectHandler = (event: CustomEvent<string>) => {
      this.email = event.detail
      this.onSubmit()
    }

    return html`
      <w3m-recent-emails-widget
        .emails=${this.recentEmails}
        @select=${recentEmailSelectHandler}
      ></w3m-recent-emails-widget>
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
          .disabled=${!this.email || !this.isValidEmail(this.email)}
          .loading=${this.loading}
          @click=${this.onSubmit.bind(this)}
        >
          Continue
        </wui-button>
      </wui-flex>
    `
  }

  private async onSubmit() {
    if (!(this.siwx instanceof ReownAuthentication)) {
      SnackController.showError('ReownAuthentication is not initialized. Please contact support.')

      return
    }

    const account = ChainController.getActiveCaipAddress()

    if (!account) {
      throw new Error('Account is not connected.')
    }

    if (!this.isValidEmail(this.email)) {
      SnackController.showError('Please provide a valid email.')

      return
    }

    try {
      this.loading = true
      const otp = await this.siwx.requestEmailOtp({
        email: this.email,
        account
      })

      this.pushRecentEmail(this.email)

      if (otp.uuid === null) {
        RouterController.replace('SIWXSignMessage')
      } else {
        RouterController.replace('DataCaptureOtpConfirm', { email: this.email })
      }
    } catch (error) {
      SnackController.showError('Failed to send email OTP')

      this.loading = false
    }
  }

  private onSkip() {
    RouterController.replace('SIWXSignMessage')
  }

  private getRecentEmails() {
    const recentEmails = SafeLocalStorage.getItem(SafeLocalStorageKeys.RECENT_EMAILS)
    const parsedEmails = recentEmails ? recentEmails.split(',') : []

    return parsedEmails.filter(this.isValidEmail.bind(this)).slice(0, 3)
  }

  private pushRecentEmail(email: string) {
    const recentEmails = this.getRecentEmails()
    const newEmails = Array.from(new Set([email, ...recentEmails])).slice(0, 3)
    SafeLocalStorage.setItem(SafeLocalStorageKeys.RECENT_EMAILS, newEmails.join(','))
  }

  private isValidEmail(email: string) {
    return /^\S+@\S+\.\S+$/u.test(email)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-data-capture-view': W3mDataCaptureView
  }
}
