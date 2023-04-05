import { ClientCtrl, CoreUtil } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-injected-connecting')
export class W3mInjectedConnecting extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @state() private isError = false

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.onConnect()
  }

  // -- private ------------------------------------------------------ //
  private readonly connector = ClientCtrl.client().getConnectorById('injected')

  private onGoToMobile() {}

  private async onConnect() {
    const { ready } = this.connector
    if (ready) {
      this.isError = false
      await UiUtil.handleConnectorConnection('injected', () => {
        this.isError = true
      })
    }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const routerData = CoreUtil.getConnectingRouterData()
    const { isMobile } = UiUtil.getCachedRouterWalletPlatforms()

    return html`
      <w3m-modal-content>
        <w3m-connector-waiting
          walletId=${routerData.id}
          imageId=${routerData.image_id}
          label=${`Continue in ${routerData.name}...`}
          .isError=${this.isError}
        ></w3m-connector-waiting>
      </w3m-modal-content>

      <w3m-info-footer>
        <w3m-text color="secondary" variant="small-thin">
          Connection can be declined if multiple wallets are installed or previous request is still
          active
        </w3m-text>

        <div>
          <w3m-button
            variant="outline"
            .onClick=${this.onConnect.bind(this)}
            .disabled=${!this.isError}
            .iconRight=${SvgUtil.RETRY_ICON}
          >
            Retry
          </w3m-button>

          ${isMobile
            ? html`<w3m-button .onClick=${this.onGoToMobile} .iconLeft=${SvgUtil.MOBILE_ICON}>
                Mobile
              </w3m-button>`
            : null}
        </div>
      </w3m-info-footer>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-injected-connecting': W3mInjectedConnecting
  }
}
