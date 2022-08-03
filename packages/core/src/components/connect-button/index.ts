import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import walletConnectIcon from '../../icons/walletConnectIcon'
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
  @property({ type: Boolean })
  public icon?: boolean = true

  private iconTemplate() {
    return this.icon ? walletConnectIcon : null
  }

  protected render() {
    return html`
      <button class="w3m-font w3m-font-medium-normal">
        ${this.iconTemplate()}
        <span>${this.label}</span>
      </button>
    `
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
