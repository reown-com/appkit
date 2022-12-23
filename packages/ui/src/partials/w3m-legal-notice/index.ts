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
    const isLegal = termsOfServiceUrl || privacyPolicyUrl

    if (!isLegal) {
      return null
    }

    return html`
      <div>
        <p>hello legal</p>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-legal-notice': W3mLegalNotice
  }
}
