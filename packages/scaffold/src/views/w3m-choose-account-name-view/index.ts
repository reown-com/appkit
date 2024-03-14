import { customElement } from '@web3modal/ui'
import { ConnectorController, RouterController, SnackController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import styles from './styles.js'

@customElement('w3m-choose-account-name-view')
export class W3mChooseAccountNameView extends LitElement {
  public static override styles = styles

  // -- State & Properties -------------------------------- //
  @state() private emailConnector = ConnectorController.getEmailConnector()

  @state() private loading = false

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        gap="xxl"
        .padding=${['0', '0', 'l', '0'] as const}
      >
        ${this.onboardingTemplate()} ${this.buttonsTemplate()}
        <wui-link>
          Learn more about names
          <wui-icon color="inherit" slot="iconRight" name="externalLink"></wui-icon>
        </wui-link>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private onboardingTemplate() {
    return html` <wui-flex
      flexDirection="column"
      gap="xxl"
      alignItems="center"
      .padding=${['0', 'xxl', '0', 'xxl'] as const}
    >
      <wui-flex gap="s" alignItems="center" justifyContent="center">
        <wui-visual name="profile"></wui-visual>
      </wui-flex>
      <wui-flex flexDirection="column" alignItems="center" gap="s">
        <wui-text align="center" variant="medium-600" color="fg-100">
          Choose your account name
        </wui-text>
        <wui-text align="center" variant="paragraph-400" color="fg-100">
          Finally say goodbye to 0x addresses, name your account to make it easier to exchange
          assets
        </wui-text>
      </wui-flex>
    </wui-flex>`
  }

  private buttonsTemplate() {
    return html`<wui-flex
      .padding=${['0', '2l', '0', '2l'] as const}
      gap="s"
      class="continue-button-container"
    >
      <wui-button
        fullWidth
        .loading=${this.loading}
        size="lg"
        borderRadius="xs"
        @click=${this.setPreferSmartAccount.bind(this)}
        >Choose name
      </wui-button>
    </wui-flex>`
  }

  private setPreferSmartAccount = async () => {
    if (this.emailConnector) {
      try {
        this.loading = true
        await this.emailConnector.provider.setPreferredAccount('smartAccount')
        await this.emailConnector.provider.connect({ preferredAccountType: 'smartAccount' })
        this.loading = false
        RouterController.push('Account')
      } catch (e) {
        SnackController.showError('Error upgrading to smart account')
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-choose-account-name-view': W3mChooseAccountNameView
  }
}
