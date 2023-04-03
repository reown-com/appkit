import { ClientCtrl, CoreUtil, ModalCtrl, OptionsCtrl, RouterCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-desktop-connector-view')
export class W3mDesktopConnectorView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @state() private uri = ''
  @state() private isError = false

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.createConnectionAndWait()
  }

  // -- private ------------------------------------------------------ //
  private getRouterData() {
    const data = RouterCtrl.state.data?.Connecting
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
      CoreUtil.openHref(href, '_blank')
    }
  }

  private async createConnectionAndWait() {
    this.isError = false
    const { standaloneUri } = OptionsCtrl.state
    const routerWalletData = this.getRouterData()
    UiUtil.setRecentWallet(routerWalletData)
    if (standaloneUri) {
      this.onFormatAndRedirect(standaloneUri)
    } else {
      try {
        await ClientCtrl.client().connectWalletConnect(uri => {
          this.uri = uri
          this.onFormatAndRedirect(uri)
        }, OptionsCtrl.state.selectedChain?.id)
        ModalCtrl.close()
      } catch (err) {
        this.isError = true
      }
    }
  }

  private onConnectWithMobile() {
    RouterCtrl.push('Qrcode')
  }

  private onGoToWallet() {
    const { universalUrl, name } = this.getRouterData()
    if (universalUrl) {
      const href = CoreUtil.formatUniversalUrl(universalUrl, this.uri, name)
      CoreUtil.openHref(href, '_blank')
    }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const routerWalletData = this.getRouterData()
    const { name, universalUrl, id, imageId } = routerWalletData

    return html`
      <w3m-modal-header title=${name}></w3m-modal-header>

      <w3m-modal-content>
        <w3m-connector-waiting
          walletId=${id}
          imageId=${imageId}
          label=${`Continue in ${name}...`}
          .isError=${this.isError}
        ></w3m-connector-waiting>
      </w3m-modal-content>

      <w3m-info-footer>
        <w3m-text color="secondary" variant="small-thin">
          ${`Connection can be declined if ${name} is not installed on your device`}
        </w3m-text>

        <div class="w3m-actions">
          <w3m-button
            variant="outline"
            .onClick=${async () => this.createConnectionAndWait()}
            .iconRight=${SvgUtil.RETRY_ICON}
          >
            Retry
          </w3m-button>

          ${universalUrl
            ? html`
                <w3m-button
                  variant="outline"
                  .onClick=${this.onGoToWallet.bind(this)}
                  .iconLeft=${SvgUtil.ARROW_UP_RIGHT_ICON}
                >
                  Go to Wallet
                </w3m-button>
              `
            : html`
                <w3m-button
                  variant="outline"
                  .onClick=${this.onConnectWithMobile}
                  .iconLeft=${SvgUtil.MOBILE_ICON}
                >
                  Use Mobile
                </w3m-button>
              `}
        </div>
      </w3m-info-footer>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-desktop-connector-view': W3mDesktopConnectorView
  }
}
