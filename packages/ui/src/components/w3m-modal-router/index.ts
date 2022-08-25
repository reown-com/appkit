import type { RouterView } from '@web3modal/core'
import { RouterCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { animate } from 'motion'
import { getShadowRootElement } from '../../utils/Helpers'
import { global } from '../../utils/Theme'
import '../../views/w3m-connect-wallet-view'
import '../../views/w3m-qrcode-view'
import '../../views/w3m-select-network-view'
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
    this.resizeObserver = new ResizeObserver(([conetnt]) => {
      const newHeight = `${conetnt.borderBoxSize[0].blockSize}px`
      if (this.oldHeight !== '0px') {
        animate(this.routerEl, { height: [this.oldHeight, newHeight] }, { duration: 0.175 })
        animate(this.routerEl, { opacity: [0, 1], scale: [0.96, 1] }, { duration: 0.2 })
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
      case 'QrCode':
        return html`<w3m-qrcode-view></w3m-qrcode-view>`
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
