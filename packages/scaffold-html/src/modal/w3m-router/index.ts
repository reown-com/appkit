import { RouterController } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, state } from 'lit/decorators.js'

@customElement('w3m-router')
export class W3mRouter extends LitElement {
  // -- State & Properties -------------------------------- //
  @state() private view = RouterController.state.view

  public constructor() {
    super()
    RouterController.subscribe('view', view => (this.view = view))
  }

  // -- Render -------------------------------------------- //
  public render() {
    return this.viewTemplate()
  }

  // -- Private ------------------------------------------- //
  private viewTemplate() {
    switch (this.view) {
      case 'Connect':
        return html`<w3m-connect-view></w3m-connect-view>`
      default:
        return html`<w3m-connect-view></w3m-connect-view>`
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-router': W3mRouter
  }
}
