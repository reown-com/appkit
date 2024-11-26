import { customElement } from '@reown/appkit-ui'
import {
  ConnectionController,
  ConnectorController,
  RouterController,
  CoreHelperUtil,
  SnackController
} from '@reown/appkit-core'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet'
import { NavigationUtil } from '@reown/appkit-common'

@customElement('w3m-upgrade-to-smart-account-view')
export class W3mUpgradeToSmartAccountView extends LitElement {
  // -- State & Properties -------------------------------- //
  @state() private authConnector = ConnectorController.getAuthConnector()

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
        <wui-link
          @click=${() => {
            CoreHelperUtil.openHref(NavigationUtil.URLS.FAQ, '_blank')
          }}
        >
          Learn more
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
        <wui-visual name="google"></wui-visual>
        <wui-visual name="pencil"></wui-visual>
        <wui-visual name="lightbulb"></wui-visual>
      </wui-flex>
      <wui-flex flexDirection="column" alignItems="center" gap="s">
        <wui-text align="center" variant="medium-600" color="fg-100">
          Discover Smart Accounts
        </wui-text>
        <wui-text align="center" variant="paragraph-400" color="fg-100">
          Access advanced features such as username, social login, improved security and a smoother
          user experience!
        </wui-text>
      </wui-flex>
    </wui-flex>`
  }

  private buttonsTemplate() {
    return html`<wui-flex .padding=${['0', '2l', '0', '2l'] as const} gap="s">
      <wui-button
        variant="accent"
        @click=${this.redirectToAccount.bind(this)}
        size="lg"
        borderRadius="xs"
      >
        Do it later
      </wui-button>
      <wui-button
        .loading=${this.loading}
        size="lg"
        borderRadius="xs"
        @click=${this.setPreferSmartAccount.bind(this)}
        >Continue
      </wui-button>
    </wui-flex>`
  }

  private setPreferSmartAccount = async () => {
    if (this.authConnector) {
      try {
        this.loading = true
        await ConnectionController.setPreferredAccountType(
          W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
        )
        this.loading = false
        RouterController.push('Account')
      } catch (e) {
        SnackController.showError('Error upgrading to smart account')
      }
    }
  }

  private redirectToAccount() {
    RouterController.push('Account')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-upgrade-to-smart-account-view': W3mUpgradeToSmartAccountView
  }
}
