import { html, LitElement } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import { subscribe } from 'valtio/vanilla'
import RouterCtrl, { RouterView } from '../../controllers/RouterCtrl'
import '../w3m-spinner'
import '../w3m-text'

@customElement('w3m-modal-router')
export class W3mModalRouter extends LitElement {
  // -- state & properties ------------------------------------------- //
  @state() public view: RouterView = 'ConnectWallet'

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe = subscribe(RouterCtrl.state, () => {
      this.view = RouterCtrl.state.view
    })
  }

  public disconnectedCallback() {
    this.unsubscribe?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly unsubscribe?: () => void = undefined

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`<div></div> `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-modal-router': W3mModalRouter
  }
}
