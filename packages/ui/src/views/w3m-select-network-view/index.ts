import { ClientCtrl, OptionsCtrl, RouterCtrl, ToastCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-select-network-view')
export class W3mSelectNetworkView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- private ------------------------------------------------------ //
  private async onSelectChain(chainId: number) {
    try {
      if (OptionsCtrl.state.isConnected) {
        await ClientCtrl.client().switchNetwork({ chainId })
        RouterCtrl.replace('Account')
      } else {
        RouterCtrl.push('ConnectWallet')
      }
    } catch {
      ToastCtrl.openToast('Permission to switch networks declined', 'error')
    }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { chains } = OptionsCtrl.state

    return html`
      <w3m-modal-header title="Select network"></w3m-modal-header>
      <w3m-modal-content>
        <div class="w3m-grid">
          ${chains?.map(
            chain =>
              html`
                <w3m-network-button
                  name=${chain.name}
                  chainId=${chain.id}
                  .onClick=${async () => {
                    await this.onSelectChain(chain.id)
                    OptionsCtrl.setSelectedChain(chain)
                  }}
                >
                  ${chain.name}
                </w3m-network-button>
              `
          )}
        </div>
      </w3m-modal-content>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-select-network-view': W3mSelectNetworkView
  }
}
