import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import globalCss from '../../theme/globalCss'
import styles from './styles'

/**
 * Component
 */
@customElement('connect-button')
export class ConnectButtonWC extends LitElement {
  public static styles = [globalCss, styles]

  @property({ type: String })
  public label?: string = 'Connect Wallet'

  protected render() {
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
