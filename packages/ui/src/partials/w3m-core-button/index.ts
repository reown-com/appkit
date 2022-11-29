import { ClientCtrl } from '@web3modal/core'
import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-core-button')
export class W3mCoreButton extends LitElement {
  // -- state & properties ------------------------------------------- //
  @state() public isConnected = false
  @property() public label? = 'Connect Wallet'
  @property() public icon?: 'hide' | 'show' = 'show'

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.isConnected = ClientCtrl.client().getAccount().isConnected
    this.accountUnsub = ClientCtrl.client().watchAccount(accountState => {
      this.isConnected = accountState.isConnected
    })
  }

  public disconnectedCallback() {
    this.accountUnsub?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly accountUnsub?: () => void = undefined

  // -- render ------------------------------------------------------- //
  protected render() {
    return this.isConnected
      ? html`<w3m-account-button></w3m-account-button>`
      : html`<w3m-connect-button
          label=${ifDefined(this.label)}
          icon=${ifDefined(this.icon)}
        ></w3m-connect-button>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-core-button': W3mCoreButton
  }
}
