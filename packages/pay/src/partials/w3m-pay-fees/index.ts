import { LitElement, html } from 'lit'

import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-image'
import '@reown/appkit-ui/wui-text'

import styles from './styles.js'

const BASE_LOGO_URL =
  'https://pbs.twimg.com/profile_images/1945608199500910592/rnk6ixxH_400x400.jpg'

@customElement('w3m-pay-fees')
export class W3mPayFees extends LitElement {
  public static override styles = [styles]

  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  public constructor() {
    super()
  }

  // -- Lifecycle ----------------------------------------- //
  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" gap="4">
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Pay</wui-text>
          <wui-text variant="md-regular" color="primary">20 USDC</wui-text>
        </wui-flex>

        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Network Fee</wui-text>

          <wui-flex flexDirection="column" alignItems="flex-end" gap="2">
            <wui-text variant="md-regular" color="primary">0.30 USDC</wui-text>

            <wui-flex alignItems="center" gap="01">
              <wui-image src=${BASE_LOGO_URL} size="xs"></wui-image>
              <wui-text variant="sm-regular" color="secondary">Base</wui-text>
            </wui-flex>
          </wui-flex>
        </wui-flex>

        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-text variant="md-regular" color="secondary">Service Fee</wui-text>
          <wui-text variant="md-regular" color="primary">0.05 USDC</wui-text>
        </wui-flex>
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-pay-fees': W3mPayFees
  }
}
