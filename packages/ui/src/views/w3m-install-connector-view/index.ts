import { CoreUtil, RouterCtrl, ToastCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-install-connector-view')
export class W3mInstallConnectorView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- private ------------------------------------------------------ //

  private onInstall() {
    const { homepage } = CoreUtil.getConnectingRouterData()
    if (homepage) {
      CoreUtil.openHref(homepage, '_blank')
    }
  }

  private onMobile() {
    const { name } = CoreUtil.getConnectingRouterData()
    RouterCtrl.push('ConnectWallet')
    ToastCtrl.openToast(`Scan the code with ${name}`, 'success')
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { name, id, mobile } = CoreUtil.getConnectingRouterData()
    const isMobile = mobile && (mobile.native || mobile.universal)

    return html`
      <w3m-modal-header title=${name}></w3m-modal-header>
      <w3m-modal-content>
        <div class="w3m-wrapper">
          <w3m-wallet-image walletId=${id}></w3m-wallet-image>
          <div class="w3m-title">
            <w3m-text>Install ${name}</w3m-text>
            <w3m-text color="secondary" variant="small-thin" class="w3m-info-text">
              To connect ${name}, install the browser extension.
            </w3m-text>
          </div>
          <div class="w3m-actions">
            <w3m-button .onClick=${this.onInstall.bind(this)} .iconLeft=${SvgUtil.ARROW_DOWN_ICON}>
              Install Extension
            </w3m-button>

            ${isMobile
              ? html`
                  <w3m-button .onClick=${this.onMobile.bind(this)} .iconLeft=${SvgUtil.MOBILE_ICON}>
                    ${name} Mobile
                  </w3m-button>
                `
              : null}
          </div>
        </div>
      </w3m-modal-content>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-install-connector-view': W3mInstallConnectorView
  }
}
