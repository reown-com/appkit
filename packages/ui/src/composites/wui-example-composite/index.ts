import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('wui-example-composite')
export class WuiExampleComposite extends LitElement {
  public render() {
    return html`<p>Example composite</p>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-example-composite': WuiExampleComposite
  }
}
