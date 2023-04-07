import { CoreUtil, OptionsCtrl, WcConnectionCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-mobile-connecting-view')
export class W3mMobileConnectingView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @state() public isError = false

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.openMobileApp()
    this.unwatchConnection = WcConnectionCtrl.subscribe(connection => {
      this.isError = connection.pairingError
    })
  }

  public disconnectedCallback() {
    this.unwatchConnection?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly unwatchConnection?: () => void = undefined

  private onFormatAndRedirect(uri: string, forceUniversalUrl = false) {
    const { mobile, name } = CoreUtil.getWalletRouterData()
    const nativeUrl = mobile?.native
    const universalUrl = mobile?.universal

    if (nativeUrl && !forceUniversalUrl) {
      const href = CoreUtil.formatNativeUrl(nativeUrl, uri, name)
      CoreUtil.openHref(href, '_self')
    } else if (universalUrl) {
      const href = CoreUtil.formatUniversalUrl(universalUrl, uri, name)
      CoreUtil.openHref(href, '_self')
    }
  }

  private openMobileApp(forceUniversalUrl = false) {
    WcConnectionCtrl.setPairingError(false)
    const { standaloneUri } = OptionsCtrl.state
    const { pairingUri } = WcConnectionCtrl.state
    const routerData = CoreUtil.getWalletRouterData()
    UiUtil.setRecentWallet(routerData)
    if (standaloneUri) {
      this.onFormatAndRedirect(standaloneUri, forceUniversalUrl)
    } else {
      this.onFormatAndRedirect(pairingUri, forceUniversalUrl)
    }
  }

  private onGoToAppStore(downloadUrl?: string) {
    if (downloadUrl) {
      CoreUtil.openHref(downloadUrl, '_blank')
    }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { name, id, image_id, app, mobile } = CoreUtil.getWalletRouterData()
    const { isWeb } = UiUtil.getCachedRouterWalletPlatforms()
    const downloadUrl = app?.ios
    const universalUrl = mobile?.universal

    return html`
      <w3m-modal-header title=${name}></w3m-modal-header>

      <w3m-modal-content>
        <w3m-connector-waiting
          walletId=${id}
          imageId=${image_id}
          label="Tap 'Open' to continue…"
          .isError=${this.isError}
        ></w3m-connector-waiting>
      </w3m-modal-content>

      <w3m-info-footer class="w3m-note">
        <w3m-text color="secondary" variant="small-thin">
          You can reload the website to try again
          ${universalUrl ? ` or open ${name} using a "Backup" instead` : ''}
        </w3m-text>

        <w3m-platform-selection .isWeb=${isWeb}>
          <div>
            <w3m-button .onClick=${this.openMobileApp.bind(this)} .iconRight=${SvgUtil.RETRY_ICON}>
              Retry
            </w3m-button>

            ${universalUrl
              ? html`<w3m-button
                  variant="outline"
                  .onClick=${() => this.openMobileApp(true)}
                  .iconRight=${SvgUtil.ARROW_UP_RIGHT_ICON}
                >
                  Backup
                </w3m-button>`
              : null}
          </div>
        </w3m-platform-selection>
      </w3m-info-footer>

      <w3m-info-footer class="w3m-app-store">
        <div>
          <w3m-wallet-image walletId=${id} imageId=${image_id}></w3m-wallet-image>
          <w3m-text>${`Get ${name}`}</w3m-text>
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
    'w3m-mobile-connecting-view': W3mMobileConnectingView
  }
}
