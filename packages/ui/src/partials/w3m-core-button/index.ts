import { AccountCtrl, ConfigCtrl } from '@web3modal/core'
import { LitElement, html } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-core-button')
export class W3mCoreButton extends LitElement {
  // -- state & properties ------------------------------------------- //
  @state() public isConnected = false

  @property() public label? = 'Connect Wallet'

  @property() public icon?: 'hide' | 'show' = 'show'

  @property() public avatar?: 'hide' | 'show' = 'show'

  @property() public balance?: 'hide' | 'show' = 'hide'

  // -- lifecycle ---------------------------------------------------- //
  public constructor() {
    super()
    this.isConnected = AccountCtrl.state.isConnected
    this.unsubscribeAccount = AccountCtrl.subscribe(({ isConnected }) => {
      this.isConnected = isConnected
    })
  }

  public disconnectedCallback() {
    this.unsubscribeAccount?.()
  }

  // -- private ------------------------------------------------------ //
  private readonly unsubscribeAccount?: () => void = undefined

  // -- render ------------------------------------------------------- //
  protected render() {
    const { enableAccountView } = ConfigCtrl.state
    const isBalance = this.balance
    const isLabel = this.label
    const isIcon = this.icon
    const isAvatar = this.avatar

    return this.isConnected && enableAccountView
      ? html`<w3m-account-button
          .balance=${isBalance}
          .avatar=${isAvatar}
          data-testid="partial-core-account-button"
        ></w3m-account-button>`
      : html`
          <w3m-connect-button
            label=${ifDefined(this.isConnected ? 'Disconnect' : isLabel)}
            .icon=${isIcon}
            data-testid="partial-core-connect-button"
          >
          </w3m-connect-button>
        `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-core-button': W3mCoreButton
  }
}
