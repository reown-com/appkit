import { LitElement, html } from 'lit'

import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-text'

import styles from './styles.js'

const REOWN_LOGO_URL =
  'https://pbs.twimg.com/profile_images/1832911695947223040/uStftanD_400x400.jpg'
const BASE_LOGO_URL =
  'https://pbs.twimg.com/profile_images/1945608199500910592/rnk6ixxH_400x400.jpg'
const RELAY_LOGO_URL =
  'https://pbs.twimg.com/profile_images/1960334543052816384/ejODKCzq_400x400.jpg'

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
      <wui-flex flexDirection="column" gap="3" .padding=${['01', '0', '01', '0'] as const}>
        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-flex alignItems="center" gap="1">
            <wui-image src=${BASE_LOGO_URL} size="xs"></wui-image>
            <wui-text variant="sm-regular" color="secondary">Network</wui-text>
          </wui-flex>

          <wui-text variant="sm-regular" color="primary">0.05 USDC</wui-text>
        </wui-flex>

        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-flex alignItems="center" gap="1">
            <wui-image src=${RELAY_LOGO_URL} size="xs"></wui-image>
            <wui-text variant="sm-regular" color="secondary">Provider</wui-text>
          </wui-flex>

          <wui-flex alignItems="flex-end" flexDirection="column" gap="1">
            <wui-text variant="sm-regular" color="primary">0.05 USDC</wui-text>
            <wui-text variant="sm-regular" color="secondary">(Network 0.05 USDC)</wui-text>
          </wui-flex>
        </wui-flex>

        <wui-flex alignItems="center" justifyContent="space-between">
          <wui-flex alignItems="center" gap="1">
            <wui-image src=${REOWN_LOGO_URL} size="xs"></wui-image>
            <wui-text variant="sm-regular" color="secondary">Reown</wui-text>
          </wui-flex>

          <wui-text variant="sm-regular" color="primary">0.05 USDC</wui-text>
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
