import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('wui-example-component')
export class WuiExampleComponent extends LitElement {
  public render() {
    return html`<p>Example component</p>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-example-component': WuiExampleComponent
  }
}
