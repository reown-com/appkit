import { ClientCtrl, CoreUtil, ModalCtrl, OptionsCtrl, RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { PresetUtil } from '../../utils/PresetUtil'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-desktop-connector-view')
export class W3mDesktopConnectorView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.onConnect()
  }

  // -- private ------------------------------------------------------ //
  private getRouterData() {
    const data = RouterCtrl.state.data?.DesktopConnector
    if (!data) {
      throw new Error('Missing router data')
    }

    return data
  }

  private onOpenHref(uri: string) {
    const { native, name } = this.getRouterData()
    if (native) {
      const href = CoreUtil.formatNativeUrl(native, uri, name)
      if (href) {
        CoreUtil.openHref(href)
      }
    }
  }

  private async onConnect() {
    const { standaloneUri } = OptionsCtrl.state
    if (standaloneUri) {
      this.onOpenHref(standaloneUri)
    } else {
      await ClientCtrl.client().connectWalletConnect(
        uri => this.onOpenHref(uri),
        OptionsCtrl.state.selectedChainId
      )
      ModalCtrl.close()
    }
  }

  private onMobile() {
    RouterCtrl.push('Qrcode')
  }

  private onInstall(link: string) {
    CoreUtil.openHref(link, '_blank')
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { name, icon, universal, walletId } = this.getRouterData()
    const optimisticName = PresetUtil.optimisticName(name)

    return html`
      <w3m-modal-header title=${optimisticName}></w3m-modal-header>

      <w3m-modal-content>
        <div class="w3m-wrapper">
          ${icon
            ? html`<w3m-wallet-image src=${icon} size="lg"></w3m-wallet-image>`
            : html`<w3m-wallet-image size="lg" walletid=${ifDefined(walletId)}></w3m-wallet-image>`}

          <div class="w3m-connecting-title">
            <w3m-spinner size="22" color=${ThemeUtil.color().foreground[2]}></w3m-spinner>
            <w3m-text variant="large-bold" color="secondary">
              ${`Continue in ${optimisticName}...`}
            </w3m-text>
          </div>

          <div class="w3m-install-actions">
            <w3m-button .onClick=${this.onConnect.bind(this)} .iconRight=${SvgUtil.RETRY_ICON}>
              Retry
            </w3m-button>

            ${universal
              ? html`
                  <w3m-button
                    .onClick=${() => this.onInstall(universal)}
                    .iconLeft=${SvgUtil.ARROW_UP_RIGHT_ICON}
                  >
                    Go to Wallet
                  </w3m-button>
                `
              : html`
                  <w3m-button .onClick=${this.onMobile} .iconLeft=${SvgUtil.MOBILE_ICON}>
                    Connect with Mobile
                  </w3m-button>
                `}
          </div>
        </div>
      </w3m-modal-content>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-desktop-connector-view': W3mDesktopConnectorView
  }
}
