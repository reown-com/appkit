import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { global } from '../../utils/Theme'
import '../w3m-modal-backcard'
import '../w3m-text'
import styles from './styles'

@customElement('w3m-account-modal')
export class W3mAccountModal extends LitElement {
  public static styles = [global, styles]

  /*
   * -- state & properties ------------------------------------------- //
   * @property() public variant?: Variant = 'fill'
   * @property() public disabled? = false
   * @property() public iconLeft?: TemplateResult<2> = undefined
   * @property() public iconRight?: TemplateResult<2> = undefined
   * @property() public onClick: () => void = () => null
   */

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <div class="w3m-modal-container">
          <w3m-modal-backcard></w3m-modal-backcard>
          <div class="w3m-modal-card">
            <w3m-text>Account Modal</w3m-text>
          </div>
        </div>
      </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-modal': W3mAccountModal
  }
}
