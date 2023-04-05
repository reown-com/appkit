import { ClientCtrl, CoreUtil, ModalCtrl, OptionsCtrl } from '@web3modal/core'
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
  @state() private isError = false

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.createConnectionAndWait()
  }

  // -- private ------------------------------------------------------ //

  private onFormatAndRedirect(uri: string) {
    const { desktop, name } = CoreUtil.getWalletRouterData()
    const nativeUrl = desktop?.native
    const universalUrl = desktop?.universal

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
    const routerData = CoreUtil.getWalletRouterData()
    UiUtil.setRecentWallet(routerData)
    if (standaloneUri) {
      this.onFormatAndRedirect(standaloneUri)
    } else {
      try {
        await ClientCtrl.client().connectWalletConnect(uri => {
          this.onFormatAndRedirect(uri)
        }, OptionsCtrl.state.selectedChain?.id)
        ModalCtrl.close()
      } catch (err) {
        this.isError = true
      }
    }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { name, id, image_id } = CoreUtil.getWalletRouterData()

    return html`
      <w3m-modal-header title=${name}></w3m-modal-header>

      <w3m-modal-content>
        <w3m-connector-waiting
          walletId=${id}
          imageId=${image_id}
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
        </div>
      </w3m-info-footer>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-desktop-connecting-view': W3mDesktopConnectingView
  }
}
