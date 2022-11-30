import { ClientCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { ThemeUtil } from '../../utils/ThemeUtil'
import { UiUtil } from '../../utils/UiUtil'
import styles from './styles.css'

@customElement('w3m-account-button')
export class W3mAccountButton extends LitElement {
  public static styles = [ThemeUtil.globalCss, styles]

  // -- state & properties ------------------------------------------- //
  @state() private address?: string = undefined
  @property() public balance?: 'hide' | 'show' = 'hide'

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.address = ClientCtrl.client().getAccount().address
    this.accountUnsub = ClientCtrl.client().watchAccount(accountState => {
      this.address = accountState.address
    })
  }

  public disconnectedCallback() {
    this.accountUnsub?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly accountUnsub?: () => void = undefined

  // -- render ------------------------------------------------------- //
  protected render() {
    return html`
      <button @click=${ClientCtrl.client().disconnect}>
        <w3m-avatar address=${ifDefined(this.address)}></w3m-avatar>
        <w3m-text variant="medium-normal" color="inverse">
          ${UiUtil.truncate(this.address ?? '')}
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
