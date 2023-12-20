import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'
import { RouterController, ConnectorController, SnackController } from '@web3modal/core'
import { state } from 'lit/decorators.js'

@customElement('w3m-update-email-wallet-waiting-view')
export class W3mUpdateEmailWalletWaitingView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  protected readonly email = RouterController.state.data?.email

  protected readonly emailConnector = ConnectorController.getEmailConnector()

  public constructor() {
    super()
    this.listenForEmailUpdateApproval()
  }

  // -- State & Properties -------------------------------- //
  @state() private loading = false

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.email) {
      throw new Error('w3m-update-email-wallet-waiting-view: No email provided')
    }
    if (!this.emailConnector) {
      throw new Error('w3m-update-email-wallet-waiting-view: No email provided')
    }

    return html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        .padding=${['0', '2xl', 'xxl', '2xl'] as const}
      >
        <wui-flex justifyContent="center" .padding=${['0', '0', 'xxl', '0'] as const}>
          <wui-icon-box
            size="xl"
            iconcolor="accent-100"
            backgroundcolor="accent-100"
            icon="verify"
            background="opaque"
          ></wui-icon-box>
        </wui-flex>

        <wui-text variant="paragraph-400" color="fg-100">
          Approve login the link we sent to
        </wui-text>
        <wui-text variant="paragraph-400" color="fg-100">${this.email}</wui-text>

        <wui-text variant="paragraph-400" color="fg-200" align="center">
          You will receive then an approval request on your former mail to confirm the new one
        </wui-text>

        <wui-flex alignItems="center" id="w3m-resend-section">
          ${this.loading
            ? html`<wui-loading-spinner size="xl" color="accent-100"></wui-loading-spinner>`
            : html` <wui-link @click=${this.onResendCode.bind(this)}>Resend email</wui-link>`}
        </wui-flex>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private async listenForEmailUpdateApproval() {
    if (this.emailConnector) {
      await this.emailConnector.provider.awaitUpdateEmail()
      RouterController.replace('Account')
      SnackController.showSuccess('Email updated')
    }
  }

  private async onResendCode() {
    try {
      if (!this.loading) {
        if (!this.emailConnector || !this.email) {
          throw new Error('w3m-update-email-wallet-waiting-view: Unable to resend email')
        }
        this.loading = true
        await this.emailConnector.provider.updateEmail({ email: this.email })
        SnackController.showSuccess('New Email sent')
      }
    } catch (error) {
      SnackController.showError(error)
    } finally {
      this.loading = false
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-update-email-wallet-waiting-view': W3mUpdateEmailWalletWaitingView
  }
}
