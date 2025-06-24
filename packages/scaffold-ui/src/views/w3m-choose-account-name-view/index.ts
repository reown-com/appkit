import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import { type ChainNamespace, NavigationUtil } from '@reown/appkit-common'
import {
  ChainController,
  CoreHelperUtil,
  EventsController,
  RouterController,
  getPreferredAccountType
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-icon-box'
import '@reown/appkit-ui/wui-link'
import '@reown/appkit-ui/wui-text'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

import styles from './styles.js'

@customElement('w3m-choose-account-name-view')
export class W3mChooseAccountNameView extends LitElement {
  public static override styles = styles

  // -- State & Properties -------------------------------- //
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
        <wui-icon-box
          icon="id"
          size="xl"
          iconSize="xxl"
          iconColor="fg-200"
          backgroundColor="fg-200"
        ></wui-icon-box>
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
        @click=${this.handleContinue.bind(this)}
        >Choose name
      </wui-button>
    </wui-flex>`
  }

  private handleContinue() {
    const activeChainNamespace = ChainController.state.activeChain as ChainNamespace

    RouterController.push('RegisterAccountName')
    EventsController.sendEvent({
      type: 'track',
      event: 'OPEN_ENS_FLOW',
      properties: {
        isSmartAccount:
          getPreferredAccountType(activeChainNamespace) ===
          W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
      }
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-choose-account-name-view': W3mChooseAccountNameView
  }
}
