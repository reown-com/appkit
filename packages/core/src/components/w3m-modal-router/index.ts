import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { animate } from 'motion'
import { subscribe } from 'valtio/vanilla'
import RouterCtrl, { RouterView } from '../../controllers/RouterCtrl'
import { getShadowRootElement } from '../../utils/Helpers'
import '../../views/w3m-connect-wallet-view'
import '../../views/w3m-select-network-view'

@customElement('w3m-modal-router')
export class W3mModalRouter extends LitElement {
  // -- state & properties ------------------------------------------- //
  @state() public view: RouterView = RouterCtrl.state.view

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe = subscribe(RouterCtrl.state, () => {
      if (this.view !== RouterCtrl.state.view) this.onChangeRoute()
    })
  }

  public disconnectedCallback() {
    this.unsubscribe?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly unsubscribe?: () => void = undefined

  private get routerEl() {
    return getShadowRootElement(this, '.w3m-modal-router')
  }

  private viewTemplate() {
    switch (this.view) {
      case 'ConnectWallet':
        return html`<w3m-connect-wallet-view></w3m-connect-wallet-view>`
      case 'SelectNetwork':
        return html`<w3m-select-network-view></w3m-select-network-view>`
      default:
        return html`<div>Unknown View</div>`
    }
  }

  private async onChangeRoute() {
    await animate(this.routerEl, { opacity: [1, 0], scale: [1, 1.02] }, { duration: 0.2 }).finished
    this.view = RouterCtrl.state.view
    animate(this.routerEl, { opacity: [0, 1], scale: [0.98, 1] }, { duration: 0.2 })
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html` <div class="w3m-modal-router">${this.viewTemplate()}</div>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-modal-router': W3mModalRouter
  }
}
