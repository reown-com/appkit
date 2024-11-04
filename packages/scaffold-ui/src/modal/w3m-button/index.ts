import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import type { W3mAccountButton } from '../w3m-account-button/index.js'
import type { W3mConnectButton } from '../w3m-connect-button/index.js'
import styles from './styles.js'

@customElement('w3m-button')
export class W3mButton extends LitElement {
  public static override styles = styles

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public disabled?: W3mAccountButton['disabled'] = false

  @property() public balance?: W3mAccountButton['balance'] = undefined

  @property() public size?: W3mConnectButton['size'] = undefined

  @property() public label?: W3mConnectButton['label'] = undefined

  @property() public loadingLabel?: W3mConnectButton['loadingLabel'] = undefined

  @property() public charsStart?: W3mAccountButton['charsStart'] = 4

  @property() public charsEnd?: W3mAccountButton['charsEnd'] = 6

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <appkit-button
        .disabled=${this.disabled}
        balance=${ifDefined(this.balance)}
        size=${ifDefined(this.size)}
        label=${ifDefined(this.label)}
        loadingLabel=${ifDefined(this.loadingLabel)}
        .charsStart=${this.charsStart}
        .charsEnd=${this.charsEnd}
      ></appkit-button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-button': W3mButton
  }
}
