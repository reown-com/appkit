import { ChainController, ConnectorController, CoreHelperUtil } from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ref, createRef } from 'lit/directives/ref.js'
import type { Ref } from 'lit/directives/ref.js'
import styles from './styles.js'
import { SnackController, RouterController, EventsController } from '@reown/appkit-core'
import { ConstantsUtil } from '@reown/appkit-common'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-email-login-widget')
export class W3mEmailLoginWidget extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  private formRef: Ref<HTMLFormElement> = createRef()

  // -- State & Properties -------------------------------- //

  @state() private email = ''

  @state() private loading = false

  @state() private error = ''

  public constructor() {
    super()
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
    const showSubmitButton = !this.loading && this.email.length > 3

    return html`
      <form ${ref(this.formRef)} @submit=${this.onSubmitEmail.bind(this)}>
        <wui-email-input
          @focus=${this.onFocusEvent.bind(this)}
          @inputChange=${this.onEmailInputChange.bind(this)}
          ?disabled=${this.loading}
          ?loading=${this.loading}
          .onSubmit=${ifDefined(showSubmitButton ? this.onSubmitEmail.bind(this) : undefined)}
        >
        </wui-email-input>

        <input type="submit" hidden />
      </form>
      ${this.templateError()}
    `
  }

  // -- Private ------------------------------------------- //
  private templateError() {
    if (this.error) {
      return html`<wui-text variant="md-regular" color="error">${this.error}</wui-text>`
    }

    return null
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
