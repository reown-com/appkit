import { customElement } from '@web3modal/ui'
import { RouterController } from '@web3modal/core'
import { LitElement, html } from 'lit'

@customElement('w3m-upgrade-to-smart-account-view')
export class W3mUpgradeToSmartAccountView extends LitElement {
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
        <wui-visual name="onrampCard"></wui-visual>
        <wui-visual name="onrampCard"></wui-visual>
        <wui-visual name="onrampCard"></wui-visual>
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
      <wui-button variant="accentBg" @click=${RouterController.goBack} size="lg" borderRadius="xs">
        Do it later
      </wui-button>
      <wui-button size="lg" borderRadius="xs"> Continue </wui-button>
    </wui-flex>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-upgrade-to-smart-account-view': W3mUpgradeToSmartAccountView
  }
}
