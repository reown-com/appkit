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
import { customElement, state } from 'lit/decorators.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-select-network-view')
export class W3mSelectNetworkView extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @state() private connectedChains: string[] | 'ALL' = 'ALL'

  @state() private isUnsupportedChains = false

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.getConnectedChainIds()
  }

  // -- private ------------------------------------------------------ //
  private async getConnectedChainIds() {
    this.connectedChains = await ClientCtrl.client().getConnectedChainIds()
  }

  private async onSelectChain(chain: SwitchNetworkData) {
    try {
      const { selectedChain, isPreferInjected } = OptionsCtrl.state
      const { isConnected } = AccountCtrl.state
      if (isConnected) {
        if (selectedChain?.id === chain.id) {
          RouterCtrl.reset('Account')
          // Use of "" inside string is intentional
        } else if (UiUtil.getWagmiWalletType() === '"walletConnect"') {
          await ClientCtrl.client().switchNetwork({ chainId: chain.id })
          RouterCtrl.reset('Account')
        } else {
          RouterCtrl.push('SwitchNetwork', { SwitchNetwork: chain })
        }
      } else if (isPreferInjected) {
        OptionsCtrl.setSelectedChain(chain)
        ModalCtrl.close()
      } else {
        OptionsCtrl.setSelectedChain(chain)
        RouterCtrl.push('ConnectWallet')
      }
    } catch (err) {
      console.error(err)
      ToastCtrl.openToast('Unsupported chain', 'error')
    }
  }

  private isUnsuportedChainId(chainId: number) {
    if (typeof this.connectedChains === 'string' && this.connectedChains !== 'ALL') {
      this.isUnsupportedChains = true

      return true
    }

    if (Array.isArray(this.connectedChains) && !this.connectedChains.includes(String(chainId))) {
      this.isUnsupportedChains = true

      return true
    }

    return false
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { chains } = OptionsCtrl.state
    const decoratedChains = chains?.map(chain => ({
      ...chain,
      unsupported: this.isUnsuportedChainId(chain.id)
    }))
    const sortedChains = decoratedChains?.sort(
      (a, b) => Number(a.unsupported) - Number(b.unsupported)
    )

    return html`
      <w3m-modal-header
        title="Select network"
        data-testid="view-select-network-header"
      ></w3m-modal-header>
      <w3m-modal-content data-testid="view-select-network-content">
        <div>
          ${sortedChains?.map(
            chain => html`
              <w3m-network-button
                name=${chain.name}
                chainId=${chain.id}
                .unsupported=${chain.unsupported}
                .onClick=${async () => this.onSelectChain(chain)}
                data-testid="view-select-network-button-${chain.id}"
              >
                ${chain.name}
              </w3m-network-button>
            `
          )}
        </div>
      </w3m-modal-content>

      ${this.isUnsupportedChains
        ? html`<w3m-info-footer>
            <w3m-text color="secondary" variant="small-thin">
              Your connected wallet may not support some of the networks available for this dapp
            </w3m-text>
          </w3m-info-footer>`
        : null}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-select-network-view': W3mSelectNetworkView
  }
}
