import type { SwitchNetworkData } from '@web3modal/core'
import {
  AccountCtrl,
  ClientCtrl,
  ModalCtrl,
  OptionsCtrl,
  RouterCtrl,
  ToastCtrl
} from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-select-network-view')
export class W3mSelectNetworkView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- private ------------------------------------------------------ //
  private async onSelectChain(chain: SwitchNetworkData) {
    try {
      const { selectedChain, walletConnectVersion, isInjectedMobile } = OptionsCtrl.state
      const { isConnected } = AccountCtrl.state
      if (isConnected) {
        if (selectedChain?.id === chain.id) {
          RouterCtrl.replace('Account')
        } else if (walletConnectVersion === 2) {
          await ClientCtrl.client().switchNetwork({ chainId: chain.id })
          RouterCtrl.replace('Account')
        } else {
          RouterCtrl.push('SwitchNetwork', { SwitchNetwork: chain })
        }
      } else if (isInjectedMobile) {
        OptionsCtrl.setSelectedChain(chain)
        ModalCtrl.close()
      } else {
        OptionsCtrl.setSelectedChain(chain)
        RouterCtrl.push('ConnectWallet')
      }
    } catch (err) {
      console.error(err)
      ToastCtrl.openToast(UiUtil.getErrorMessage(err), 'error')
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
                  .onClick=${async () => this.onSelectChain(chain)}
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
