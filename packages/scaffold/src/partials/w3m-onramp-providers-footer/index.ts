import { OptionsController, RouterController } from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
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
        .padding=${['m', 's', 's', 's'] as const}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="s"
      >
        <wui-text color="fg-250" variant="small-400" align="center">
          We work with the best providers to fit your buyer needs, region, and to get you the lowest
          fees
        </wui-text>

        ${this.whatIsBuyTemplate()}
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private whatIsBuyTemplate() {
    return html` <wui-link @click=${this.onWhatIsBuy.bind(this)}>
      <wui-icon size="xs" color="accent-100" slot="iconLeft" name="helpCircle"></wui-icon>
      What is Buy
    </wui-link>`
  }

  private onWhatIsBuy() {
    RouterController.push('WhatIsABuy')
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-onramp-providers-footer': W3mOnRampProvidersFooter
  }
}
