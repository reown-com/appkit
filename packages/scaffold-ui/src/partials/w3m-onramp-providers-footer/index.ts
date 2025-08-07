import { LitElement, html } from 'lit'

import {
  ChainController,
  EventsController,
  OptionsController,
  RouterController,
  getPreferredAccountType
} from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon'
import '@reown/appkit-ui/wui-link'
import '@reown/appkit-ui/wui-text'
import { W3mFrameRpcConstants } from '@reown/appkit-wallet/utils'

import styles from './styles.js'

@customElement('w3m-onramp-providers-footer')
export class W3mOnRampProvidersFooter extends LitElement {
  public static override styles = [styles]

  // -- Render -------------------------------------------- //
  public override render() {
    const { termsConditionsUrl, privacyPolicyUrl } = OptionsController.state

    if (!termsConditionsUrl && !privacyPolicyUrl) {
      return null
    }

    return html`
      <wui-flex
        .padding=${['4', '3', '3', '3'] as const}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="3"
      >
        <wui-text color="secondary" variant="md-regular" align="center">
          We work with the best providers to give you the lowest fees and best support. More options
          coming soon!
        </wui-text>

        ${this.howDoesItWorkTemplate()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private howDoesItWorkTemplate() {
    return html` <wui-link @click=${this.onWhatIsBuy.bind(this)}>
      <wui-icon size="xs" color="accent-primary" slot="iconLeft" name="helpCircle"></wui-icon>
      How does it work?
    </wui-link>`
  }

  private onWhatIsBuy() {
    EventsController.sendEvent({
      type: 'track',
      event: 'SELECT_WHAT_IS_A_BUY',
      properties: {
        isSmartAccount:
          getPreferredAccountType(ChainController.state.activeChain) ===
          W3mFrameRpcConstants.ACCOUNT_TYPES.SMART_ACCOUNT
      }
    })
    RouterController.push('WhatIsABuy')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-onramp-providers-footer': W3mOnRampProvidersFooter
  }
}
