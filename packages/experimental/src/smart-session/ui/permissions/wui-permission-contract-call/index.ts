import { customElement, UiHelperUtil } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'
import { property } from 'lit/decorators.js'

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
            <wui-text variant="small-400" color="fg-100"> Contract Call </wui-text>
          </wui-details-group-item>
          <wui-details-group-item name="Contract">
            <wui-text variant="small-400" color="fg-100">
              ${UiHelperUtil.getTruncateString({
                string: this.contractAddress,
                truncate: 'middle',
                charsStart: 4,
                charsEnd: 4
              })}
            </wui-text>
          </wui-details-group-item>
          <wui-details-group-item name="Functions">
            <wui-text variant="small-400" color="fg-100">
              ${this.functions?.map(f => f.functionName).join(', ')}
            </wui-text>
          </wui-details-group-item>
          <wui-flex justifyContent="space-between">
            <wui-text color="fg-200">Duration</wui-text>
            <wui-flex flexDirection="column" alignItems="flex-end" gap="s">
              <wui-text variant="small-400" color="fg-100">
                ~ ${Math.round((1000 * this.expiry - Date.now()) / 1000 / 3600)} hours
              </wui-text>
              <wui-text variant="tiny-600" color="fg-300">
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
