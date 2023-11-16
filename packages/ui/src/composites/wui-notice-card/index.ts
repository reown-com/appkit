import { html, LitElement } from 'lit'
import '../../layout/wui-flex/index.js'
import '../../components/wui-text/index.js'
import '../../composites/wui-button/index.js'
import { resetStyles, elementStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-notice-card')
export class WuiNoticeCard extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button>
        <wui-flex gap="m">
          <wui-flex flexDirection="column" gap="3xs">
            <wui-text variant="paragraph-500" color="fg-100">
              Enjoy all your wallet potential Copy
            </wui-text>
            <wui-text variant="small-400" color="fg-200">
              Switch to a Non Custodial Wallet in a minute
            </wui-text>
          </wui-flex>
        </wui-flex>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-notice-card': WuiNoticeCard
  }
}
