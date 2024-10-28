import {
  ChainController,
  ConnectorController,
  CoreHelperUtil,
  OptionsController,
  type WalletGuideType
} from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ref, createRef } from 'lit/directives/ref.js'
import type { Ref } from 'lit/directives/ref.js'
import styles from './styles.js'
import { SnackController, RouterController, EventsController } from '@reown/appkit-core'
import { ConstantsUtil } from '@reown/appkit-common'

@customElement('w3m-email-login-widget')
export class W3mEmailLoginWidget extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  private formRef: Ref<HTMLFormElement> = createRef()

  // -- State & Properties -------------------------------- //
  @state() private connectors = ConnectorController.state.connectors

  @state() private authConnector = this.connectors.find(c => c.type === 'AUTH')

  @state() private email = ''

  @state() private loading = false

  @state() private error = ''

  @property() private walletGuide: WalletGuideType = 'get-started'

  public constructor() {
    super()
    this.unsubscribe.push(
      ConnectorController.subscribeKey('connectors', val => {
        this.connectors = val
        this.authConnector = val.find(c => c.type === 'AUTH')
      })
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  public override firstUpdated() {
    this.formRef.value?.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        this.onSubmitEmail(event)
      }
    })
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const email = OptionsController.state.features?.email

    if (!this.authConnector || !email) {
      return null
    }

    return html`
      <form ${ref(this.formRef)} @submit=${this.onSubmitEmail.bind(this)}>
        <wui-email-input
          @focus=${this.onFocusEvent.bind(this)}
          .disabled=${this.loading}
          @inputChange=${this.onEmailInputChange.bind(this)}
          .errorMessage=${this.error}
        >
        </wui-email-input>

        ${this.submitButtonTemplate()}${this.loadingTemplate()}
        <input type="submit" hidden />
      </form>
      ${this.separatorTemplate()}
    `
  }

  // -- Private ------------------------------------------- //
  private submitButtonTemplate() {
    const showSubmit = !this.loading && this.email.length > 3

    return showSubmit
      ? html`
          <wui-icon-link
            size="sm"
            icon="chevronRight"
            iconcolor="accent-100"
            @click=${this.onSubmitEmail.bind(this)}
          >
          </wui-icon-link>
        `
      : null
  }

  private separatorTemplate() {
    const socials = OptionsController.state.features?.socials
    const multipleConnectors = this.connectors.length > 1
    const enableWallets = OptionsController.state.enableWallets
    const emailShowWallets = OptionsController.state.features?.emailShowWallets

    const hideSeparator =
      (socials && socials.length) || emailShowWallets || !multipleConnectors || !enableWallets

    if (hideSeparator && this.walletGuide === 'get-started') {
      return null
    }

    if (socials && socials.length > 0) {
      return null
    }

    return html`
      <wui-flex
        data-testid="w3m-email-login-or-separator"
        .padding=${['xxs', '0', '0', '0'] as const}
      >
        <wui-separator text="or"></wui-separator>
      </wui-flex>
    `
  }
  private loadingTemplate() {
    return this.loading
      ? html`<wui-loading-spinner size="md" color="accent-100"></wui-loading-spinner>`
      : null
  }

  private onEmailInputChange(event: CustomEvent<string>) {
    this.email = event.detail.trim()
    this.error = ''
  }

  private async onSubmitEmail(event: Event) {
    const availableChains = [ConstantsUtil.CHAIN.EVM, ConstantsUtil.CHAIN.SOLANA]
    const isAvailableChain = availableChains.find(
      chain => chain === ChainController.state.activeChain
    )

    if (!isAvailableChain) {
      RouterController.push('SwitchActiveChain', {
        switchToChain: ConstantsUtil.CHAIN.EVM
      })

      return
    }

    try {
      if (this.loading) {
        return
      }
      this.loading = true
      event.preventDefault()
      const authConnector = ConnectorController.getAuthConnector()

      if (!authConnector) {
        throw new Error('w3m-email-login-widget: Auth connector not found')
      }
      const { action } = await authConnector.provider.connectEmail({ email: this.email })
      EventsController.sendEvent({ type: 'track', event: 'EMAIL_SUBMITTED' })
      if (action === 'VERIFY_OTP') {
        EventsController.sendEvent({ type: 'track', event: 'EMAIL_VERIFICATION_CODE_SENT' })
        RouterController.push('EmailVerifyOtp', { email: this.email })
      } else if (action === 'VERIFY_DEVICE') {
        RouterController.push('EmailVerifyDevice', { email: this.email })
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const parsedError = CoreHelperUtil.parseError(error)
      if (parsedError?.includes('Invalid email')) {
        this.error = 'Invalid email. Try again.'
      } else {
        SnackController.showError(error)
      }
    } finally {
      this.loading = false
    }
  }

  private onFocusEvent() {
    EventsController.sendEvent({ type: 'track', event: 'EMAIL_LOGIN_SELECTED' })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-email-login-widget': W3mEmailLoginWidget
  }
}
