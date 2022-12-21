import { ModalCtrl, OptionsCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-account-button')
export class W3mAccountButton extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @property() public balance?: 'hide' | 'show' = 'hide'

  private onOpen() {
    const { isStandalone } = OptionsCtrl.state
    if (!isStandalone) {
      ModalCtrl.open({ route: 'Account' })
    }
  }

  // -- private ------------------------------------------------------ //
  private accountTemplate() {
    return html`
      <w3m-avatar></w3m-avatar>
      <w3m-address-text></w3m-address-text>
    `
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const isBalance = this.balance === 'show'

    return isBalance
      ? html`
          <div>
            <w3m-balance></w3m-balance>
            <button @click=${this.onOpen}>${this.accountTemplate()}</button>
          </div>
        `
      : html`<w3m-button-big @click=${this.onOpen}>${this.accountTemplate()}</w3m-button-big>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-button': W3mAccountButton
  }
}
