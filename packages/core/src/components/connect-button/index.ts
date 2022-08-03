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
export class ConnectButtonW3M extends LitElement {
  public static styles = [global, fonts(), styles]

  @property() public label?: string = 'Connect Wallet'
  @property() public icon?: 'no' | 'yes' = 'yes'

  private iconTemplate() {
    return this.icon === 'yes' ? walletConnectIcon : null
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
    'connect-button': ConnectButtonW3M
  }
}
