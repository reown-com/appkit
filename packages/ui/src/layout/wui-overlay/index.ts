import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import styles from './styles'

@customElement('wui-overlay')
export class WuiOverlay extends LitElement {
  public static styles = [styles]

  public render() {
    return html`<slot></slot>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-overlay': WuiOverlay
  }
}
