import {
  AccountController,
  EventsController,
  OptionsController,
  RouterController
} from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'
import { W3mFrameRpcConstants } from '@web3modal/wallet'

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
        .padding=${['m', 's', 's', 's'] as const}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="s"
      >
        <wui-text color="fg-250" variant="small-400" align="center">
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
      <wui-icon size="xs" color="accent-100" slot="iconLeft" name="helpCircle"></wui-icon>
      How does it work?
    </wui-link>`
  }

  private onWhatIsBuy() {
    EventsController.sendEvent({
      type: 'track',
      event: 'SELECT_WHAT_IS_A_BUY',
      properties: {
        isSmartAccount:
          AccountController.state.preferredAccountType ===
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
