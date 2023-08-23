import { CoreUtil, WcConnectionCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-web-connecting-view')
export class W3mWebConnectingView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @state() public isError = false

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.openWebWallet()
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
    const universalUrl = desktop?.universal

    if (universalUrl) {
      const href = CoreUtil.formatUniversalUrl(universalUrl, uri, name)
      CoreUtil.openHref(href, '_blank')
    }
  }

  private openWebWallet() {
    WcConnectionCtrl.setPairingError(false)
    const { pairingUri } = WcConnectionCtrl.state
    const routerData = CoreUtil.getWalletRouterData()
    UiUtil.setRecentWallet(routerData)
    this.onFormatAndRedirect(pairingUri)
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { name, id, image_id } = CoreUtil.getWalletRouterData()
    const { isMobile, isInjected, isDesktop } = UiUtil.getCachedRouterWalletPlatforms()
    const isMobilePlatform = CoreUtil.isMobile()

    return html`
      <w3m-modal-header
        title=${name}
        .onAction=${UiUtil.handleUriCopy}
        .actionIcon=${SvgUtil.COPY_ICON}
        data-testid="view-web-connecting-header"
      ></w3m-modal-header>

      <w3m-modal-content data-testid="view-web-connecting-content">
        <w3m-connector-waiting
          walletId=${id}
          imageId=${image_id}
          label=${`Continue in ${name}...`}
          .isError=${this.isError}
          data-testid="view-web-connecting-waiting"
        ></w3m-connector-waiting>
      </w3m-modal-content>

      <w3m-info-footer data-testid="view-web-connecting-footer">
        <w3m-text color="secondary" variant="small-thin">
          ${`${name} web app has opened in a new tab. Go there, accept the connection, and come back`}
        </w3m-text>

        <w3m-platform-selection
          .isMobile=${isMobile}
          .isInjected=${isMobilePlatform ? false : isInjected}
          .isDesktop=${isMobilePlatform ? false : isDesktop}
          .isRetry=${true}
        >
          <w3m-button
            .onClick=${this.openWebWallet.bind(this)}
            .iconRight=${SvgUtil.RETRY_ICON}
            data-testid="view-web-connecting-retry-button"
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
    'w3m-web-connecting-view': W3mWebConnectingView
  }
}
