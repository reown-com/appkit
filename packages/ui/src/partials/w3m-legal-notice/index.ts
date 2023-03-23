import { ConfigCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-legal-notice')
export class W3mLegalNotice extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- render ------------------------------------------------------- //
  protected render() {
    const { termsOfServiceUrl, privacyPolicyUrl } = ConfigCtrl.state
    const isLegal = termsOfServiceUrl ?? privacyPolicyUrl

    if (!isLegal) {
      return null
    }

    return html`
      <div>
        <w3m-text variant="small-regular" color="secondary">
          By connecting your wallet to this app, you agree to the app's
          ${termsOfServiceUrl
            ? html`<a href=${termsOfServiceUrl} target="_blank" rel="noopener noreferrer">
                Terms of Service
              </a>`
            : null}
          ${termsOfServiceUrl && privacyPolicyUrl ? 'and' : null}
          ${privacyPolicyUrl
            ? html`<a href=${privacyPolicyUrl} target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>`
            : null}
        </w3m-text>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-legal-notice': W3mLegalNotice
  }
}
