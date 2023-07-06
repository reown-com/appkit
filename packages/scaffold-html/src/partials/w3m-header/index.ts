import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('w3m-header')
export class W3mHeader extends LitElement {
  // -- Render -------------------------------------------- //
  public render() {
    return html`
      <wui-flex>
        <slot></slot>
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-header': W3mHeader
  }
}
