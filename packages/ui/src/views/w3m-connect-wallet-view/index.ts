import { CoreUtil } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ThemeUtil } from '../../utils/ThemeUtil'

@customElement('w3m-connect-wallet-view')
export class W3mConnectWalletView extends LitElement {
  public static styles = [ThemeUtil.globalCss]

  // -- private ------------------------------------------------------ //
  private viewTemplate() {
    if (CoreUtil.isAndroid()) {
      return html`<w3m-android-wallet-selection></w3m-android-wallet-selection>`
    }

    if (CoreUtil.isMobile()) {
      return html`<w3m-mobile-wallet-selection></w3m-mobile-wallet-selection>`
    }

    return html`<w3m-desktop-wallet-selection></w3m-desktop-wallet-selection>`
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      ${this.viewTemplate()}
      <w3m-legal-notice></w3m-legal-notice>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-wallet-view': W3mConnectWalletView
  }
}
