import { CoreUtil, RouterCtrl, ToastCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-install-connector-view')
export class W3mInstallConnectorView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- private ------------------------------------------------------ //
  private getRouterData() {
    const data = RouterCtrl.state.data?.InstallConnector
    if (!data) {
      throw new Error('Missing router data')
    }

    return data
  }

  private onInstall() {
    const { url } = this.getRouterData()
    CoreUtil.openHref(url, '_blank')
  }

  private onMobile() {
    const { name } = this.getRouterData()
    RouterCtrl.push('ConnectWallet')
    ToastCtrl.openToast(`Scan the code with ${name}`, 'success')
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { name, id, isMobile } = this.getRouterData()

    return html`
      <w3m-modal-header title=${name}></w3m-modal-header>
      <w3m-modal-content>
        <div class="w3m-injected-wrapper">
          <w3m-wallet-image walletId=${id} size="lg"></w3m-wallet-image>
          <div class="w3m-install-title">
            <w3m-text variant="big-bold">Install ${name}</w3m-text>
            <w3m-text color="secondary" variant="medium-thin" class="w3m-info-text">
              To connect ${name}, install the browser extension.
            </w3m-text>
          </div>
          <div class="w3m-install-actions">
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
