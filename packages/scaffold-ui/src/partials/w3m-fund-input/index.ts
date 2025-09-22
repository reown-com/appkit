import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-input-amount'
import '@reown/appkit-ui/wui-link'
import '@reown/appkit-ui/wui-text'

@customElement('w3m-fund-input')
export class W3mFundInput extends LitElement {
  // -- State & Properties -------------------------------- //
  @property({ type: Number }) public amount?: number

  @property({ type: Number }) public maxDecimals?: number | undefined = undefined

  @property({ type: Number }) public maxIntegers?: number | undefined = undefined

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex alignItems="center" gap="1">
        <wui-input-amount
          widthVariant="fit"
          fontSize="h2"
          .maxDecimals=${ifDefined(this.maxDecimals)}
          .maxIntegers=${ifDefined(this.maxIntegers)}
          .value=${this.amount ? String(this.amount) : ''}
        ></wui-input-amount>
        <wui-text variant="md-regular" color="secondary">USD</wui-text>
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-fund-input': W3mFundInput
  }
}
