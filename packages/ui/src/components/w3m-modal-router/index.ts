import type { RouterView } from '@web3modal/core'
import { RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { animate } from 'motion'
import { global } from '../../utils/Theme'
import { getShadowRootElement } from '../../utils/UiHelpers'
import '../../views/w3m-account-view'
import '../../views/w3m-coinbase-extension-connector-view'
import '../../views/w3m-coinbase-mobile-connector-view'
import '../../views/w3m-connect-wallet-view'
import '../../views/w3m-get-wallet-view'
import '../../views/w3m-injected-connector-view'
import '../../views/w3m-ledger-desktop-connector-view'
import '../../views/w3m-metamask-connector-view'
import '../../views/w3m-select-network-view'
import '../../views/w3m-wallet-explorer-view'
import '../../views/w3m-walletconnect-connector-view'
import styles from './styles'

@customElement('w3m-modal-router')
export class W3mModalRouter extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @state() public view: RouterView = RouterCtrl.state.view
  @state() public prevView: RouterView = RouterCtrl.state.view

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe = RouterCtrl.subscribe(routerState => {
      if (this.view !== routerState.view) this.onChangeRoute()
    })
  }

  public firstUpdated() {
    this.resizeObserver = new ResizeObserver(([content]) => {
      const newHeight = `${content.borderBoxSize[0].blockSize}px`
      if (this.oldHeight !== '0px') {
        animate(this.routerEl, { height: [this.oldHeight, newHeight] }, { duration: 0.2 })
        animate(
          this.routerEl,
          { opacity: [0, 1], scale: [0.99, 1] },
          { duration: 0.37, delay: 0.03 }
        )
      }
      this.oldHeight = newHeight
    })
    this.resizeObserver.observe(this.contentEl)
  }

  public disconnectedCallback() {
    this.unsubscribe?.()
    this.resizeObserver?.disconnect()
  }

  // -- private ------------------------------------------------------ //
  private readonly unsubscribe?: () => void = undefined
  private oldHeight = '0px'
  private resizeObserver?: ResizeObserver = undefined

  private get routerEl() {
    return getShadowRootElement(this, '.w3m-modal-router')
  }

  private get contentEl() {
    return getShadowRootElement(this, '.w3m-modal-router-content')
  }

  private viewTemplate() {
    switch (this.view) {
      case 'ConnectWallet':
        return html`<w3m-connect-wallet-view></w3m-connect-wallet-view>`
      case 'SelectNetwork':
        return html`<w3m-select-network-view></w3m-select-network-view>`
      case 'WalletConnectConnector':
        return html`<w3m-walletconnect-connector-view></w3m-walletconnect-connector-view>`
      case 'CoinbaseMobileConnector':
        return html`<w3m-coinbase-mobile-connector-view></w3m-coinbase-mobile-connector-view>`
      case 'CoinbaseExtensionConnector':
        return html`<w3m-coinbase-extension-connector-view></w3m-coinbase-extension-connector-view>`
      case 'InjectedConnector':
        return html`<w3m-injected-connector-view></w3m-injected-connector-view>`
      case 'MetaMaskConnector':
        return html`<w3m-metamask-connector-view></w3m-metamask-connector-view>`
      case 'GetWallet':
        return html`<w3m-get-wallet-view></w3m-get-wallet-view>`
      case 'LedgerDesktopConnector':
        return html`<w3m-ledger-desktop-connector-view></w3m-ledger-desktop-connector-view>`
      case 'WalletExplorer':
        return html`<w3m-wallet-explorer-view></w3m-wallet-explorer-view>`
      case 'Account':
        return html`<w3m-account-view></w3m-account-view>`
      default:
        return html`<div>Not Found</div>`
    }
  }

  private async onChangeRoute() {
    await animate(this.routerEl, { opacity: [1, 0], scale: [1, 1.02] }, { duration: 0.15 }).finished
    this.view = RouterCtrl.state.view
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`<div class="w3m-modal-router">
      <div class="w3m-modal-router-content">${this.viewTemplate()}</div>
    </div>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-modal-router': W3mModalRouter
  }
}
