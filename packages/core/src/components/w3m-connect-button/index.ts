import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import walletConnectIcon from '../../images/walletConnectIcon'
import colors from '../../theme/colors'
import fonts from '../../theme/fonts'
import global from '../../theme/global'
import '../w3m-spinner'
import styles from './styles'

/**
 * Component
 */
@customElement('w3m-connect-button')
export class W3mConnectButton extends LitElement {
  public static styles = [global, fonts(), styles]

  @property() public label?: string = 'Connect Wallet'
  @property() public icon?: boolean = true
  @property() public loading?: boolean = false
  @property() private readonly classes = {
    'w3m-button-loading': Boolean(this.loading),
    'w3m-font': true,
    'w3m-font-medium-normal': true
  }

  private iconTemplate() {
    return this.icon ? walletConnectIcon : null
  }

  protected render() {
    return html`
      <button class=${classMap(this.classes)} .disabled=${this.loading}>
        ${this.loading
          ? html`<w3m-spinner color=${colors().dark.foreground.accent}></loading-spinner>`
          : html`${this.iconTemplate()} <span>${this.label}</span>`}
      </button>
    `
  }
}

/**
 * Types
 */
declare global {
  interface HTMLElementTagNameMap {
    'w3m-connect-button': W3mConnectButton
  }
}
