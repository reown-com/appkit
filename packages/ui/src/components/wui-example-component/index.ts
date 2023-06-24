import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import styles from './styles'

@customElement('wui-example-component')
export class WuiExampleComponent extends LitElement {
  public static styles = [styles]

  @property() public color: 'blue' | 'orange' | 'red' = 'red'

  public render() {
    return html`<p class=${this.color}>Example component</p>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-example-component': WuiExampleComponent
  }
}
