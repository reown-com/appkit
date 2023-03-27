import { ClientCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-injected-connector-view')
export class W3mInjectedConnectorView extends LitElement {
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
    const optimisticName = UiUtil.getWalletName(this.connector.name)
    const optimisticWalletId = UiUtil.getWalletId(this.connector.id)

    return html`
      <w3m-modal-header title=${optimisticName}></w3m-modal-header>
      <w3m-modal-content>
        <w3m-connector-waiting
          walletId=${optimisticWalletId}
          label=${`Continue in ${optimisticName}`}
          .isError=${this.isError}
        ></w3m-connector-waiting>
      </w3m-modal-content>

      <w3m-info-footer>
        <w3m-text color="secondary" variant="small-thin">
          Connection can be declined if multiple wallets are installed or previous request is still
          active
        </w3m-text>

        <w3m-button
          variant="outline"
          .onClick=${this.onConnect.bind(this)}
          .disabled=${!this.isError}
          .iconRight=${SvgUtil.RETRY_ICON}
        >
          Try Again
        </w3m-button>
      </w3m-info-footer>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-injected-connector-view': W3mInjectedConnectorView
  }
}
