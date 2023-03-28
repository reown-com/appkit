import { ClientCtrl, CoreUtil, ModalCtrl, OptionsCtrl, RouterCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-ios-connector-view')
export class W3mIosConnectorView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @state() private isError = false

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

  private onFormatAndRedirect(uri: string, forceUniversalUrl = false) {
    const { nativeUrl, universalUrl, name } = this.getRouterData()
    if (nativeUrl && !forceUniversalUrl) {
      const href = CoreUtil.formatNativeUrl(nativeUrl, uri, name)
      CoreUtil.openHref(href, '_self')
    } else if (universalUrl) {
      const href = CoreUtil.formatUniversalUrl(universalUrl, uri, name)
      CoreUtil.openHref(href, '_self')
    }
  }

  private async createConnectionAndWait(forceUniversalUrl = false) {
    this.isError = false
    const { standaloneUri } = OptionsCtrl.state
    const routerWalletData = this.getRouterData()
    UiUtil.setRecentWallet(routerWalletData)
    if (standaloneUri) {
      this.onFormatAndRedirect(standaloneUri)
    } else {
      try {
        await ClientCtrl.client().connectWalletConnect(uri => {
          this.onFormatAndRedirect(uri, forceUniversalUrl)
        }, OptionsCtrl.state.selectedChain?.id)
        ModalCtrl.close()
      } catch (err) {
        this.isError = true
      }
    }
  }

  private onGoToAppStore(downloadUrl?: string) {
    if (downloadUrl) {
      CoreUtil.openHref(downloadUrl, '_blank')
    }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const routerWalletData = this.getRouterData()
    const { name, id, imageId, downloadUrl, universalUrl } = routerWalletData
    const optimisticName = UiUtil.getWalletName(name)

    return html`
      <w3m-modal-header title=${optimisticName}></w3m-modal-header>

      <w3m-modal-content>
        <w3m-connector-waiting
          walletId=${id}
          imageId=${imageId}
          label="Tap 'Open' to continue…"
          .isError=${this.isError}
        ></w3m-connector-waiting>
      </w3m-modal-content>

      <w3m-info-footer class="w3m-note">
        <w3m-text color="secondary" variant="small-thin">
          ${`You can reload the website to try again`}
          ${universalUrl ? ` or open ${optimisticName} using a Backup Link instead` : ''}
        </w3m-text>

        <div>
          <w3m-button
            variant="outline"
            .onClick=${async () => this.createConnectionAndWait()}
            .iconRight=${SvgUtil.RETRY_ICON}
          >
            Try Again
          </w3m-button>

          ${universalUrl
            ? html`<w3m-button
                variant="outline"
                .onClick=${async () => this.createConnectionAndWait(true)}
                .iconRight=${SvgUtil.ARROW_UP_RIGHT_ICON}
              >
                Backup Link
              </w3m-button>`
            : null}
        </div>
      </w3m-info-footer>

      <w3m-info-footer class="w3m-app-store">
        <div>
          <w3m-wallet-image walletId=${id} imageId=${imageId}></w3m-wallet-image>
          <w3m-text>${`Get ${optimisticName}`}</w3m-text>
        </div>
        <w3m-button
          .iconRight=${SvgUtil.ARROW_RIGHT_ICON}
          .onClick=${() => this.onGoToAppStore(downloadUrl)}
          variant="ghost"
        >
          App Store
        </w3m-button>
      </w3m-info-footer>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-ios-connector-view': W3mIosConnectorView
  }
}
