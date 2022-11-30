import { ClientCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-account-button')
export class W3mAccountButton extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @property() public balance?: 'hide' | 'show' = 'hide'

  // -- render ------------------------------------------------------- //
  protected render() {
    const { address } = ClientCtrl.client().getAccount()

    return html`
      <button @click=${ClientCtrl.client().disconnect}>
        <w3m-avatar address=${ifDefined(address)}></w3m-avatar>
        <w3m-text variant="medium-normal" color="inverse">
          ${UiUtil.truncate(address ?? '')}
        </w3m-text>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-button': W3mAccountButton
  }
}
