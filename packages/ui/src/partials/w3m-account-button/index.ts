import { ModalCtrl, OptionsCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-account-button')
export class W3mAccountButton extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    UiUtil.rejectStandaloneButtonComponent()
  }

  // -- state & properties ------------------------------------------- //
  @property() public balance?: 'hide' | 'show' = 'hide'
  @property() public avatar?: 'hide' | 'show' = 'show'

  private onOpen() {
    const { isStandalone } = OptionsCtrl.state
    if (!isStandalone) {
      ModalCtrl.open({ route: 'Account' })
    }
  }

  // -- private ------------------------------------------------------ //
  private accountTemplate() {
    const isAvatar = this.avatar === 'show'

    return html`
      ${isAvatar ? html`<w3m-avatar></w3m-avatar>` : null}
      <w3m-address-text></w3m-address-text>
    `
  }

  // -- render ------------------------------------------------------- //
  protected render() {
    const isBalance = this.balance === 'show'
    const isNoAvatar = this.avatar === 'hide'
    const classes = {
      'w3m-no-avatar': isNoAvatar
    }

    return isBalance
      ? html`
          <div>
            <w3m-balance></w3m-balance>
            <button @click=${this.onOpen} class=${classMap(classes)}>
              ${this.accountTemplate()}
            </button>
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
