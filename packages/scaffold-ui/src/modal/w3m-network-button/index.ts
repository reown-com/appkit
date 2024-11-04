import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import type { WuiNetworkButton } from '@reown/appkit-ui'
import styles from './styles.js'

@customElement('w3m-network-button')
export class W3mNetworkButton extends LitElement {
  public static override styles = styles

  @property({ type: Boolean }) public disabled?: WuiNetworkButton['disabled'] = false
  @property({ type: String }) public label?: string

  public override render() {
    return html`
      <appkit-network-button .disabled=${Boolean(this.disabled)} label=${ifDefined(this.label)}>
        <slot></slot>
      </appkit-network-button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-network-button': W3mNetworkButton
  }
}
