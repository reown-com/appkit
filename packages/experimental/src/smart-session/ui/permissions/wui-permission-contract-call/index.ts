import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import { UiHelperUtil, customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-details-group'
import '@reown/appkit-ui/wui-details-group-item'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-text'

import styles from './styles.js'

@customElement('wui-permission-contract-call')
export class WuiPermissionContractCall extends LitElement {
  // -- State & Properties --------------------------------- //
  public static override styles = styles

  @property({ type: Array }) public functions?: { functionName: string }[] = []
  @property({ type: String }) public contractAddress?: `0x${string}`
  @property({ type: Number }) public expiry?: number

  // -- Render -------------------------------------------- //
  public override render() {
    if (!this.contractAddress || !this.expiry) {
      return null
    }

    return html`
      <wui-flex flexDirection="column" alignItems="center">
        <wui-details-group>
          <wui-details-group-item name="Type">
            <wui-text variant="md-medium" color="primary"> Contract Call </wui-text>
          </wui-details-group-item>
          <wui-details-group-item name="Contract">
            <wui-text variant="md-medium" color="primary">
              ${UiHelperUtil.getTruncateString({
                string: this.contractAddress,
                truncate: 'middle',
                charsStart: 4,
                charsEnd: 4
              })}
            </wui-text>
          </wui-details-group-item>
          <wui-details-group-item name="Functions">
            <wui-text variant="md-medium" color="primary">
              ${this.functions?.map(f => f.functionName).join(', ')}
            </wui-text>
          </wui-details-group-item>
          <wui-flex justifyContent="space-between">
            <wui-text color="secondary">Duration</wui-text>
            <wui-flex flexDirection="column" alignItems="flex-end" gap="3">
              <wui-text variant="sm-regular" color="primary">
                ~ ${Math.round((1000 * this.expiry - Date.now()) / 1000 / 3600)} hours
              </wui-text>
              <wui-text variant="sm-medium" color="secondary">
                Expiring ${new Date(1000 * this.expiry).toDateString()}
              </wui-text>
            </wui-flex>
          </wui-flex>
        </wui-details-group>
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-permission-contract-call': WuiPermissionContractCall
  }

  namespace JSX {
    interface IntrinsicElements {
      'wui-permission-contract-call': Partial<WuiPermissionContractCall>
    }
  }
}
