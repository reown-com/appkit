import {
  ClientCtrl,
  CoreUtil,
  ModalCtrl,
  OptionsCtrl,
  RouterCtrl,
  ToastCtrl
} from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-ios-connector-view')
export class W3mIosConnectorView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.createConnectionAndWait()
  }

  // -- private ------------------------------------------------------ //
  private getRouterData() {
    const data = RouterCtrl.state.data?.IosConnector
    if (!data) {
      throw new Error('Missing router data')
    }

    return data
  }

  private onFormatAndRedirect(uri: string) {
    const { nativeUrl, universalUrl, name } = this.getRouterData()
    if (nativeUrl) {
      const href = CoreUtil.formatNativeUrl(nativeUrl, uri, name)
      CoreUtil.openHref(href, '_self')
    } else if (universalUrl) {
      const href = CoreUtil.formatUniversalUrl(universalUrl, uri, name)
      CoreUtil.openHref(href, '_self')
    }
  }

  private async createConnectionAndWait(retry = 0) {
    CoreUtil.removeWalletConnectDeepLink()
    const { standaloneUri } = OptionsCtrl.state
    const routerWalletData = this.getRouterData()
    if (standaloneUri) {
      UiUtil.setRecentWallet(routerWalletData)
      this.onFormatAndRedirect(standaloneUri)
    } else {
      try {
        await ClientCtrl.client().connectWalletConnect(uri => {
          this.onFormatAndRedirect(uri)
        }, OptionsCtrl.state.selectedChain?.id)
        UiUtil.setRecentWallet(routerWalletData)
        ModalCtrl.close()
      } catch (err) {
        ToastCtrl.openToast('Connection request declined', 'error')
        if (retry < 2) {
          this.createConnectionAndWait(retry + 1)
        }
      }
    }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const routerWalletData = this.getRouterData()
    const { name, id, imageId } = routerWalletData
    const optimisticName = UiUtil.getWalletName(name)

    return html`
      <w3m-modal-header title=${optimisticName}></w3m-modal-header>

      <w3m-modal-content>
        <div class="w3m-wrapper">
          <w3m-wallet-image walletId=${id} imageId=${imageId}></w3m-wallet-image>

          <div class="w3m-connecting-title">
            <w3m-spinner></w3m-spinner>
            <w3m-text variant="big-bold" color="secondary">
              ${`Continue in ${optimisticName}...`}
            </w3m-text>
          </div>

          <div class="w3m-install-actions">
            <w3m-button
              .onClick=${async () => this.createConnectionAndWait()}
              .iconRight=${SvgUtil.RETRY_ICON}
            >
              Retry
            </w3m-button>
          </div>
        </div>
      </w3m-modal-content>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-ios-connector-view': W3mIosConnectorView
  }
}
