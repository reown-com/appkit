import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import styles from './styles'

@customElement('wui-example-composite')
export class WuiExampleComposite extends LitElement {
  public static styles = [styles]

  @property({ type: Boolean }) public uppercase = false

  public render() {
    return html`<p class=${this.uppercase && 'uppercase'}>Example composite</p>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-example-composite': WuiExampleComposite
  }
}
