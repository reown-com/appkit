import { ClientCtrl, CoreUtil } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-injected-connecting-view')
export class W3mInjectedConnectingView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @state() private isError = false

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.openInjectedApp()
  }

  // -- private ------------------------------------------------------ //
  private readonly connector = ClientCtrl.client().getConnectorById('injected')

  private async openInjectedApp() {
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
    const { name, id, image_id } = CoreUtil.getWalletRouterData()
    const { isMobile, isDesktop, isWeb } = UiUtil.getCachedRouterWalletPlatforms()

    return html`
      <w3m-modal-header title=${name} data-testid="view-injected-header"></w3m-modal-header>

      <w3m-modal-content data-testid="view-injected-content">
        <w3m-connector-waiting
          walletId=${id}
          imageId=${image_id}
          label=${`Continue in ${name}...`}
          .isError=${this.isError}
        ></w3m-connector-waiting>
      </w3m-modal-content>

      <w3m-info-footer data-testid="view-injected-footer">
        <w3m-text color="secondary" variant="small-thin">
          Connection can be declined if multiple wallets are installed or previous request is still
          active
        </w3m-text>

        <w3m-platform-selection
          .isMobile=${isMobile}
          .isDesktop=${isDesktop}
          .isWeb=${isWeb}
          .isRetry=${true}
        >
          <w3m-button
            .onClick=${this.openInjectedApp.bind(this)}
            .disabled=${!this.isError}
            .iconRight=${SvgUtil.RETRY_ICON}
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
    'w3m-injected-connecting-view': W3mInjectedConnectingView
  }
}
