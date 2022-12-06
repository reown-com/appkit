import { ClientCtrl, OptionsCtrl, RouterCtrl, ToastCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-switch-network-view')
export class W3mSwitchNetworkView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

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
      const chain = this.getRouterData()
      await ClientCtrl.client().switchNetwork({ chainId: chain.id })
      OptionsCtrl.setSelectedChain(chain)
      RouterCtrl.replace('Account')
    } catch {
      RouterCtrl.goBack()
      ToastCtrl.openToast('Permission to switch networks declined', 'error')
    }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { id, name } = this.getRouterData()

    return html`
      <w3m-modal-header title=${`Connect to ${name}`}></w3m-modal-header>

      <w3m-modal-content>
        <div class="w3m-wrapper">
          <w3m-network-image chainId=${id}></w3m-network-image>

          <div class="w3m-connecting-title">
            <w3m-spinner></w3m-spinner>
            <w3m-text variant="large-bold" color="secondary">Approve in your wallet</w3m-text>
          </div>
        </div>
      </w3m-modal-content>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-switch-network-view': W3mSwitchNetworkView
  }
}
