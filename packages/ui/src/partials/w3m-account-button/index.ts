import { EventsCtrl, ModalCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import styles from './styles.css'

@customElement('w3m-account-button')
export class W3mAccountButton extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
  }

  // -- state & properties ------------------------------------------- //
  @property() public balance?: 'hide' | 'show' = 'hide'

  @property() public avatar?: 'hide' | 'show' = 'show'

  private onOpen() {
    EventsCtrl.click({ name: 'ACCOUNT_BUTTON' })
    ModalCtrl.open({ route: 'Account' })
  }

  // -- private ------------------------------------------------------ //
  private accountTemplate() {
    const isAvatar = this.avatar === 'show'

    return html`
      ${isAvatar ? html`<w3m-avatar data-testid="partial-account-avatar"></w3m-avatar>` : null}
      <w3m-address-text data-testid="partial-account-address"></w3m-address-text>
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
            <w3m-balance data-testid="partial-account-balance"></w3m-balance>
            <button
              @click=${this.onOpen}
              class=${classMap(classes)}
              data-testid="partial-account-open-button"
            >
              ${this.accountTemplate()}
            </button>
          </div>
        `
      : html`<w3m-button-big @click=${this.onOpen} data-testid="partial-account-open-button">
          ${this.accountTemplate()}
        </w3m-button-big>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-button': W3mAccountButton
  }
}
