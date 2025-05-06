import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { createRef, ref } from 'lit/directives/ref.js'
import type { Ref } from 'lit/directives/ref.js'

import { type ChainNamespace, ConstantsUtil } from '@reown/appkit-common'
import {
  ChainController,
  ConnectionController,
  ConnectorController,
  CoreHelperUtil
} from '@reown/appkit-controllers'
import { EventsController, RouterController, SnackController } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-email-input'
import '@reown/appkit-ui/wui-icon-link'
import '@reown/appkit-ui/wui-loading-spinner'
import '@reown/appkit-ui/wui-text'

import styles from './styles.js'

@customElement('w3m-email-login-widget')
export class W3mEmailLoginWidget extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  private formRef: Ref<HTMLFormElement> = createRef()

  // -- State & Properties -------------------------------- //
  @property() public tabIdx?: number

  @state() public email = ''

  @state() private loading = false

  @state() private error = ''

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
    return html`
      <form ${ref(this.formRef)} @submit=${this.onSubmitEmail.bind(this)}>
        <wui-email-input
          @focus=${this.onFocusEvent.bind(this)}
          .disabled=${this.loading}
          @inputChange=${this.onEmailInputChange.bind(this)}
          tabIdx=${ifDefined(this.tabIdx)}
        >
        </wui-email-input>

        ${this.submitButtonTemplate()}${this.loadingTemplate()}
        <input type="submit" hidden />
      </form>
      ${this.templateError()}
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

  private loadingTemplate() {
    return this.loading
      ? html`<wui-loading-spinner size="md" color="accent-100"></wui-loading-spinner>`
      : null
  }

  private templateError() {
    if (this.error) {
      return html`<wui-text variant="tiny-500" color="error-100">${this.error}</wui-text>`
    }

    return null
  }

  private onEmailInputChange(event: CustomEvent<string>) {
    this.email = event.detail.trim()
    this.error = ''
  }

  private async onSubmitEmail(event: Event) {
    const isAvailableChain = ConstantsUtil.AUTH_CONNECTOR_SUPPORTED_CHAINS.find(
      chain => chain === ChainController.state.activeChain
    )

    if (!isAvailableChain) {
      const caipNetwork = ChainController.getFirstCaipNetworkSupportsAuthConnector()

      if (caipNetwork) {
        /**
         * If we are trying to call this function when active network is nut supported by auth connector, we should switch to the first available network
         * This will redirect us to SwitchNetwork screen and back to the current screen again
         */
        RouterController.push('SwitchNetwork', { network: caipNetwork })

        return
      }
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
      } else if (action === 'CONNECT') {
        await ConnectionController.connectExternal(
          authConnector,
          ChainController.state.activeChain as ChainNamespace
        )
        RouterController.replace('Account')
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
