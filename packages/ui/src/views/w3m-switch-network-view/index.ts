import { ClientCtrl, OptionsCtrl, RouterCtrl } from '@web3modal/core'
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
  private getRouterData() {
    const data = RouterCtrl.state.data?.SwitchNetwork
    if (!data) {
      throw new Error('Missing router data')
    }

    return data
  }

  private async onSwitchNetwork() {
    try {
      this.isError = false
      const chain = this.getRouterData()
      await ClientCtrl.client().switchNetwork({ chainId: chain.id })
      OptionsCtrl.setSelectedChain(chain)
      RouterCtrl.replace('Account')
    } catch {
      this.isError = true
    }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { id, name } = this.getRouterData()

    return html`
      <w3m-modal-header title=${`Connect to ${name}`}></w3m-modal-header>

      <w3m-modal-content>
        <w3m-network-waiting chainId=${id} label="Approve in your wallet" .isError=${this.isError}>
        </w3m-network-waiting>

        <w3m-button
          .onClick=${this.onSwitchNetwork.bind(this)}
          .disabled=${!this.isError}
          .iconRight=${SvgUtil.RETRY_ICON}
        >
          Try Again
        </w3m-button>
      </w3m-modal-content>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-switch-network-view': W3mSwitchNetworkView
  }
}
