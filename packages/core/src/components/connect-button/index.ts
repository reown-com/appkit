import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import styles from './styles'

/**
 * Component
 */
@customElement('connect-button')
export class ConnectButtonWC extends LitElement {
  public static styles = styles

  @property({ type: String })
  public label?: string = 'Connect Wallet'

  public render() {
    return html`<button>${this.label}</button>`
  }
}

/**
 * Types
 */
declare global {
  interface HTMLElementTagNameMap {
    'connect-button': ConnectButtonWC
  }
}
