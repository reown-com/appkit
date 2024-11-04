import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import type { WuiAccountButton } from '@reown/appkit-ui'

@customElement('w3m-account-button')
export class W3mAccountButton extends LitElement {
  @property({ type: Boolean }) public disabled?: WuiAccountButton['disabled'] = false
  @property() public balance?: 'show' | 'hide' = 'show'
  @property() public charsStart?: WuiAccountButton['charsStart'] = 4
  @property() public charsEnd?: WuiAccountButton['charsEnd'] = 6

  public override render() {
    return html`
      <appkit-account-button
        .disabled=${Boolean(this.disabled)}
        balance=${ifDefined(this.balance)}
        .charsStart=${this.charsStart}
        .charsEnd=${this.charsEnd}
      ></appkit-account-button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-button': W3mAccountButton
  }
}
