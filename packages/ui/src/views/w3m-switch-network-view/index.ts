import { ClientCtrl, CoreUtil, OptionsCtrl, RouterCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { SvgUtil } from '../../utils/SvgUtil'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-switch-network-view')
export class W3mSwitchNetworkView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties -------------------------------------------- //
  @state() private isError = false

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.onSwitchNetwork()
  }

  // -- private ------------------------------------------------------ //

  private async onSwitchNetwork() {
    try {
      this.isError = false
      const chain = CoreUtil.getSwitchNetworkRouterData()
      await ClientCtrl.client().switchNetwork({ chainId: chain.id })
      OptionsCtrl.setSelectedChain(chain)
      RouterCtrl.reset('Account')
    } catch {
      this.isError = true
    }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { id, name } = CoreUtil.getSwitchNetworkRouterData()

    return html`
      <w3m-modal-header
        title=${`Connect to ${name}`}
        data-testid="view-switch-network-header"
      ></w3m-modal-header>

      <w3m-modal-content data-testid="view-switch-network-content">
        <w3m-network-waiting chainId=${id} label="Approve in your wallet" .isError=${this.isError}>
        </w3m-network-waiting>
      </w3m-modal-content>

      <w3m-info-footer data-testid="view-switch-network-footer">
        <w3m-text color="secondary" variant="small-thin">
          Switch can be declined if chain is not supported by a wallet or previous request is still
          active
        </w3m-text>

        <w3m-button
          .onClick=${this.onSwitchNetwork.bind(this)}
          .disabled=${!this.isError}
          .iconRight=${SvgUtil.RETRY_ICON}
          data-testid="view-switch-network-retry-button"
        >
          Try Again
        </w3m-button>
      </w3m-info-footer>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-switch-network-view': W3mSwitchNetworkView
  }
}
