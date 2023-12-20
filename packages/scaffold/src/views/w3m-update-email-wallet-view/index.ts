import { ConnectorController } from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ref, createRef } from 'lit/directives/ref.js'
import type { Ref } from 'lit/directives/ref.js'
import styles from './styles.js'
import { SnackController } from '@web3modal/core'

@customElement('w3m-update-email-wallet-view')
export class W3mUpdateEmailWalletView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private formRef: Ref<HTMLFormElement> = createRef()

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
    const showSubmit = !this.loading && this.email.length > 3

    return html`
      <wui-flex flexDirection="column" padding="m" gap="m">
        <form ${ref(this.formRef)} @submit=${this.onSubmitEmail.bind(this)}>
          <wui-email-input
            .disabled=${this.loading}
            @inputChange=${this.onEmailInputChange.bind(this)}
          >
          </wui-email-input>
          <input type="submit" hidden />
        </form>

        <wui-button
          size="md"
          variant="fill"
          fullWidth
          @click=${this.onSubmitEmail.bind(this)}
          .disabled=${!showSubmit}
          .loading=${this.loading}
        >
          Continue
        </wui-button>
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
      const emailConnector = ConnectorController.getEmailConnector()

      if (!emailConnector) {
        throw new Error('w3m-update-email-wallet: Email connector not found')
      }

      await emailConnector.provider.updateEmail({ email: this.email })
      // TODO: Check if action was to redirect (i.e. email-sent)
      // Go to holding view
    } catch (error) {
      SnackController.showError(error)
    } finally {
      this.loading = false
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-update-email-wallet-view': W3mUpdateEmailWalletView
  }
}
