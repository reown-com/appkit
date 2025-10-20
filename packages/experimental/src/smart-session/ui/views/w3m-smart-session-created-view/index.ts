import { LitElement, html } from 'lit'

import { NavigationUtil } from '@laughingwhales/appkit-common'
import { CoreHelperUtil, RouterController } from '@laughingwhales/appkit-controllers'
import { customElement } from '@laughingwhales/appkit-ui'
import '@laughingwhales/appkit-ui/wui-button'
import '@laughingwhales/appkit-ui/wui-flex'
import '@laughingwhales/appkit-ui/wui-icon-box'
import '@laughingwhales/appkit-ui/wui-link'
import '@laughingwhales/appkit-ui/wui-text'

import styles from './styles.js'

@customElement('w3m-smart-session-created-view')
export class W3mSmartSessionCreatedView extends LitElement {
  public static override styles = styles

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex
        flexDirection="column"
        alignItems="center"
        gap="6"
        .padding=${['0', '0', '4', '0'] as const}
      >
        ${this.onboardingTemplate()}
        <wui-link
          @click=${() => {
            CoreHelperUtil.openHref(NavigationUtil.URLS.FAQ, '_blank')
          }}
        >
          What's a Smart Session?
        </wui-link>
        ${this.buttonsTemplate()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private onboardingTemplate() {
    return html` <wui-flex
      flexDirection="column"
      gap="6"
      alignItems="center"
      .padding=${['0', '6', '0', '6'] as const}
    >
      <wui-flex gap="3" alignItems="center" justifyContent="center">
        <wui-icon-box size="xl" color="accent-primary" icon="clock"></wui-icon-box>
      </wui-flex>
      <wui-flex flexDirection="column" alignItems="center" gap="3">
        <wui-text align="center" variant="md-medium" color="primary">
          Smart Session created successfully
        </wui-text>
        <wui-text align="center" variant="md-regular" color="primary">
          You can manage your session from your account settings.
        </wui-text>
      </wui-flex>
    </wui-flex>`
  }

  private buttonsTemplate() {
    return html`<wui-flex
      .padding=${['0', '4', '0', '4'] as const}
      gap="3"
      class="continue-button-container"
    >
      <wui-button fullWidth size="lg" borderRadius="xs" @click=${this.redirectToAccount.bind(this)}>
        Got it!
      </wui-button>
    </wui-flex>`
  }

  private redirectToAccount() {
    RouterController.replace('Account')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-smart-session-created-view': W3mSmartSessionCreatedView
  }
}
