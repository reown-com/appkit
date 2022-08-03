import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import fonts from '../../theme/fonts'
import global from '../../theme/global'
import styles from './styles'

/**
 * Component
 */
@customElement('connect-button')
export class ConnectButtonWC extends LitElement {
  public static styles = [global, fonts(), styles]

  @property({ type: String })
  public label?: string = 'Connect Wallet'

  protected render() {
    return html`<button class="w3m-text ">${this.label}</button>`
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
