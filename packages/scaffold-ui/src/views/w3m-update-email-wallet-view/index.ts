import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { createRef, ref } from 'lit/directives/ref.js'
import type { Ref } from 'lit/directives/ref.js'

import { ConnectorController } from '@reown/appkit-core'
import { EventsController, RouterController, SnackController } from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-email-input'
import '@reown/appkit-ui/wui-flex'

import styles from './styles.js'

@customElement('w3m-update-email-wallet-view')
export class W3mUpdateEmailWalletView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private formRef: Ref<HTMLFormElement> = createRef()

  private initialEmail = RouterController.state.data?.email ?? ''

  // -- State & Properties -------------------------------- //
  @state() private email = ''

  @state() private loading = false

  public override firstUpdated() {
    this.formRef.value?.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        this.onSubmitEmail(event)
      }
    })
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const showSubmit = !this.loading && this.email.length > 3 && this.email !== this.initialEmail

    return html`
      <wui-flex flexDirection="column" padding="m" gap="m">
        <form ${ref(this.formRef)} @submit=${this.onSubmitEmail.bind(this)}>
          <wui-email-input
            value=${this.initialEmail}
            .disabled=${this.loading}
            @inputChange=${this.onEmailInputChange.bind(this)}
          >
          </wui-email-input>
          <input type="submit" hidden />
        </form>

        <wui-flex gap="s">
          <wui-button size="md" variant="neutral" fullWidth @click=${RouterController.goBack}>
            Cancel
          </wui-button>

          <wui-button
            size="md"
            variant="main"
            fullWidth
            @click=${this.onSubmitEmail.bind(this)}
            .disabled=${!showSubmit}
            .loading=${this.loading}
          >
            Save
          </wui-button>
        </wui-flex>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private onEmailInputChange(event: CustomEvent<string>) {
    this.email = event.detail
  }

  private async onSubmitEmail(event: Event) {
    try {
      if (this.loading) {
        return
      }

      this.loading = true
      event.preventDefault()
      const authConnector = ConnectorController.getAuthConnector()

      if (!authConnector) {
        throw new Error('w3m-update-email-wallet: Auth connector not found')
      }

      const response = await authConnector.provider.updateEmail({ email: this.email })
      EventsController.sendEvent({ type: 'track', event: 'EMAIL_EDIT' })

      if (response.action === 'VERIFY_SECONDARY_OTP') {
        RouterController.push('UpdateEmailSecondaryOtp', {
          email: this.initialEmail,
          newEmail: this.email
        })
      } else {
        RouterController.push('UpdateEmailPrimaryOtp', {
          email: this.initialEmail,
          newEmail: this.email
        })
      }
    } catch (error) {
      SnackController.showError(error)
      this.loading = false
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-update-email-wallet-view': W3mUpdateEmailWalletView
  }
}
