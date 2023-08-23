import type { RouterView } from '@web3modal/core'
import { RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { animate } from 'motion'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-modal-router')
export class W3mModalRouter extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @state() public view: RouterView = RouterCtrl.state.view

  @state() public prevView: RouterView = RouterCtrl.state.view

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe = RouterCtrl.subscribe(routerState => {
      if (this.view !== routerState.view) {
        this.onChangeRoute()
      }
    })
  }

  public firstUpdated() {
    this.resizeObserver = new ResizeObserver(([conetnt]) => {
      const newHeight = `${conetnt.contentRect.height}px`
      if (this.oldHeight !== '0px') {
        animate(this.routerEl, { height: [this.oldHeight, newHeight] }, { duration: 0.2 })
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
    return UiUtil.getShadowRootElement(this, '.w3m-router')
  }

  private get contentEl() {
    return UiUtil.getShadowRootElement(this, '.w3m-content')
  }

  private viewTemplate() {
    switch (this.view) {
      case 'ConnectWallet':
        return html`<w3m-connect-wallet-view></w3m-connect-wallet-view>`
      case 'SelectNetwork':
        return html`<w3m-select-network-view></w3m-select-network-view>`
      case 'InjectedConnecting':
        return html`<w3m-injected-connecting-view></w3m-injected-connecting-view>`
      case 'DesktopConnecting':
        return html`<w3m-desktop-connecting-view></w3m-desktop-connecting-view>`
      case 'MobileConnecting':
        return html`<w3m-mobile-connecting-view></w3m-mobile-connecting-view>`
      case 'WebConnecting':
        return html`<w3m-web-connecting-view></w3m-web-connecting-view>`
      case 'MobileQrcodeConnecting':
        return html`<w3m-mobile-qr-connecting-view></w3m-mobile-qr-connecting-view>`
      case 'GetWallet':
        return html`<w3m-get-wallet-view></w3m-get-wallet-view>`
      case 'WalletExplorer':
        return html`<w3m-wallet-explorer-view></w3m-wallet-explorer-view>`
      case 'Qrcode':
        return html`<w3m-qrcode-view></w3m-qrcode-view>`
      case 'Help':
        return html`<w3m-help-view></w3m-help-view>`
      case 'Account':
        return html`<w3m-account-view></w3m-account-view>`
      case 'SwitchNetwork':
        return html`<w3m-switch-network-view></w3m-switch-network-view>`
      case 'InstallWallet':
        return html`<w3m-install-wallet-view></w3m-install-wallet-view>`
      default:
        return html`<div>Not Found</div>`
    }
  }

  private async onChangeRoute() {
    await animate(
      this.routerEl,
      { opacity: [1, 0], scale: [1, 1.02] },
      { duration: 0.15, delay: 0.1 }
    ).finished
    this.view = RouterCtrl.state.view
    animate(this.routerEl, { opacity: [0, 1], scale: [0.99, 1] }, { duration: 0.37, delay: 0.05 })
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <div class="w3m-router">
        <div class="w3m-content">${this.viewTemplate()}</div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-modal-router': W3mModalRouter
  }
}
