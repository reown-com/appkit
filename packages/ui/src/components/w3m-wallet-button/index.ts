import { ConfigCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { scss } from '../../style/utils'
import { global } from '../../utils/Theme'
import { getWalletFirstName } from '../../utils/UiHelpers'
import '../w3m-text'
import '../w3m-wallet-image'
import styles from './styles.css'

@customElement('w3m-wallet-button')
export class W3mWalletButton extends LitElement {
  public static styles = [global, styles]

  // -- state & properties ------------------------------------------- //
  @property() public onClick: () => void = () => null
  @property() public name = ''
  @property() public label?: string = undefined
  @property() public src?: string = undefined

  protected dynamicStyles() {
    const isDark = ConfigCtrl.state.theme === 'dark'

    return html`
      <style>
        .w3m-wallet-button:hover w3m-wallet-image {
          filter: brightness(${isDark ? '110%' : '104%'});
        }
      </style>
    `
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      ${this.dynamicStyles()}

      <button class="w3m-wallet-button" @click=${this.onClick}>
        <div class="w3m-wallet-button-wrap">
          <w3m-wallet-image name=${this.name} .src=${this.src}></w3m-wallet-image>
          <w3m-text variant="xsmall-normal">
            ${this.label ?? getWalletFirstName(this.name)}
          </w3m-text>
        </div>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-wallet-button': W3mWalletButton
  }
}
