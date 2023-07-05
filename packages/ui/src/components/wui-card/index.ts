import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import { resetStyles } from '../../utils/ThemeUtil'
import styles from './styles'

@customElement('wui-card')
export class WuiCard extends LitElement {
  public static styles = [resetStyles, styles]

  public render() {
    return html`<slot></slot>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-card': WuiCard
  }
}
