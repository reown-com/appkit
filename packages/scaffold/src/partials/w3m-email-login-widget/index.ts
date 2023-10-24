import { ConnectorController } from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ref, createRef } from 'lit/directives/ref.js'
import type { Ref } from 'lit/directives/ref.js'
import styles from './styles.js'
import { SnackController, RouterController } from '@web3modal/core'

@customElement('w3m-email-login-widget')
export class W3mEmailLoginWidget extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  private formRef: Ref<HTMLFormElement> = createRef()

  // -- State & Properties -------------------------------- //
  @state() private connectors = ConnectorController.state.connectors

  @state() private email = ''

  public constructor() {
    super()
    this.unsubscribe.push(
      ConnectorController.subscribeKey('connectors', val => (this.connectors = val))
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
    const connector = this.connectors.find(c => c.type === 'EMAIL')

    if (!connector) {
      return null
    }

    return html`
      <form ${ref(this.formRef)} @submit=${this.onSubmitEmail.bind(this)}>
        <wui-email-input @inputChange=${this.onEmailInputChange.bind(this)}></wui-email-input>
        <input type="submit" hidden />
      </form>
      <wui-separator text="or"></wui-separator>
    `
  }

  // -- Private ------------------------------------------- //
  private onEmailInputChange(event: CustomEvent) {
    this.email = event.detail
  }

  private async onSubmitEmail(event: Event) {
    try {
      event.preventDefault()
      const emailConnector = ConnectorController.state.connectors.find(c => c.type === 'EMAIL')
      if (emailConnector?.provider) {
        RouterController.push('ConfirmEmail', { email: this.email })
        // @ts-expect-error - Exists on email provider
        // await emailConnector.provider.connectEmail(this.email)
      }
    } catch {
      SnackController.showError('Unable to login')
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-email-login-widget': W3mEmailLoginWidget
  }
}
