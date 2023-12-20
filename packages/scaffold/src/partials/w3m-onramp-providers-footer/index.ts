import { OptionsController } from '@web3modal/core'
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
        gap="s"
        justifyContent="center"
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
    const { termsConditionsUrl } = OptionsController.state
    if (!termsConditionsUrl) {
      return null
    }

    return html`<a href=${termsConditionsUrl}>
      <wui-icon name="helpCircle" color="accent-100"></wui-icon>
      <wui-text variant="small-600" color="accent-100">What is Buy</wui-text></a
    >`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-onramp-providers-footer': W3mOnRampProvidersFooter
  }
}
