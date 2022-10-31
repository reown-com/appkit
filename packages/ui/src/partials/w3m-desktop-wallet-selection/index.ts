import { ClientCtrl, CoreHelpers, RouterCtrl } from '@web3modal/core'
import type { TemplateResult } from 'lit'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import '../../components/w3m-modal-content'
import '../../components/w3m-modal-footer'
import '../../components/w3m-text'
import '../../components/w3m-view-all-wallets-button'
import '../../components/w3m-wallet-button'
import '../../partials/w3m-walletconnect-button'
import '../../partials/w3m-walletconnect-qr'
import { DESKTOP_ICON, MOBILE_ICON } from '../../utils/Svgs'
import { global } from '../../utils/Theme'
import { getDefaultWalletNames } from '../../utils/UiHelpers'
import styles, { dynamicStyles } from './styles'

@customElement('w3m-desktop-wallet-selection')
export class W3mDesktopWalletSelection extends LitElement {
  public static styles = [global, styles]

  // -- private ------------------------------------------------------ //
  private onWalletConnect() {
    RouterCtrl.push('WalletConnectConnector')
  }

  private onCoinbaseWallet() {
    if (CoreHelpers.isCoinbaseExtension()) RouterCtrl.push('CoinbaseExtensionConnector')
    else RouterCtrl.push('CoinbaseMobileConnector')
  }

  private onLedgerWallet() {
    RouterCtrl.push('LedgerDesktopConnector')
  }

  private onMetaMaskWallet() {
    RouterCtrl.push('MetaMaskConnector')
  }

  private onInjectedWallet() {
    RouterCtrl.push('InjectedConnector')
  }

  private metaMaskTemplate() {
    return html`
      <w3m-wallet-button name="MetaMask" .onClick=${this.onMetaMaskWallet}></w3m-wallet-button>
    `
  }

  private injectedTemplate(name: string) {
    return html`
      <w3m-wallet-button name=${name} .onClick=${this.onInjectedWallet}></w3m-wallet-button>
    `
  }

  private dynamicSlots() {
    const defaultNames = getDefaultWalletNames()
    const injected = ClientCtrl.ethereum().getConnectorById('injected')
    const metamask = ClientCtrl.ethereum().getConnectorById('metaMask')
    let slot1: TemplateResult<1> | null = null
    let slot2: TemplateResult<1> | null = null
    if (injected.ready && !defaultNames.includes(injected.name)) {
      slot1 = this.injectedTemplate(injected.name)
      slot2 = this.metaMaskTemplate()
    } else if (metamask.ready && !defaultNames.includes(injected.name)) {
      slot1 = this.metaMaskTemplate()
      slot2 = this.injectedTemplate(injected.name)
    } else {
      slot1 = this.metaMaskTemplate()
      slot2 = this.injectedTemplate('Brave Wallet')
    }

    return { slot1, slot2 }
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const { slot1, slot2 } = this.dynamicSlots()

    return html`
      ${dynamicStyles()}

      <w3m-modal-content>
        <div class="w3m-title">
          ${MOBILE_ICON}
          <w3m-text variant="small-normal" color="accent">Mobile</w3m-text>
        </div>
        <w3m-walletconnect-qr></w3m-walletconnect-qr>
      </w3m-modal-content>

      <w3m-modal-footer>
        <div class="w3m-title w3m-title-desktop">
          ${DESKTOP_ICON}
          <w3m-text variant="small-normal" color="accent">Desktop</w3m-text>
        </div>
        <div class="w3m-view-row">
          ${slot1} ${slot2}
          <w3m-wallet-button name="Ledger Live" .onClick=${this.onLedgerWallet}></w3m-wallet-button>
          <w3m-view-all-wallets-button></w3m-view-all-wallets-button>
        </div>
      </w3m-modal-footer>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-desktop-wallet-selection': W3mDesktopWalletSelection
  }
}
