import { CoreUtil, WcConnectionCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-desktop-connecting-view')
export class W3mDesktopConnectingView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @state() public isError = false

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.openDesktopApp()
    this.unwatchConnection = WcConnectionCtrl.subscribe(connection => {
      this.isError = connection.pairingError
    })
  }

  public disconnectedCallback() {
    this.unwatchConnection?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly unwatchConnection?: () => void = undefined

  private onFormatAndRedirect(uri: string) {
    const { desktop, name } = CoreUtil.getWalletRouterData()
    const nativeUrl = desktop?.native

    if (nativeUrl) {
      const href = CoreUtil.formatNativeUrl(nativeUrl, uri, name)
      CoreUtil.openHref(href, '_self')
    }
  }

  private openDesktopApp() {
    WcConnectionCtrl.setPairingError(false)
    const { pairingUri } = WcConnectionCtrl.state
    const routerData = CoreUtil.getWalletRouterData()
    UiUtil.setRecentWallet(routerData)
    this.onFormatAndRedirect(pairingUri)
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { name, id, image_id } = CoreUtil.getWalletRouterData()
    const { isMobile, isInjected, isWeb } = UiUtil.getCachedRouterWalletPlatforms()

    return html`
      <w3m-modal-header
        title=${name}
        .onAction=${UiUtil.handleUriCopy}
        .actionIcon=${SvgUtil.COPY_ICON}
        data-testid="view-desktop-connecting-header"
      ></w3m-modal-header>

      <w3m-modal-content>
        <w3m-connector-waiting
          walletId=${id}
          imageId=${image_id}
          label=${`Continue in ${name}...`}
          .isError=${this.isError}
          data-testid="view-desktop-connecting-waiting"
        ></w3m-connector-waiting>
      </w3m-modal-content>

      <w3m-info-footer data-testid="view-desktop-connecting-footer">
        <w3m-text color="secondary" variant="small-thin">
          ${`Connection can continue loading if ${name} is not installed on your device`}
        </w3m-text>

        <w3m-platform-selection
          .isMobile=${isMobile}
          .isInjected=${isInjected}
          .isWeb=${isWeb}
          .isRetry=${true}
        >
          <w3m-button
            .onClick=${this.openDesktopApp.bind(this)}
            .iconRight=${SvgUtil.RETRY_ICON}
            data-testid="view-desktop-connecting-retry-button"
          >
            Retry
          </w3m-button>
        </w3m-platform-selection>
      </w3m-info-footer>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-desktop-connecting-view': W3mDesktopConnectingView
  }
}
