import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-image/index.js'
import '../../components/wui-text/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-compatible-network')
export class WuiCompatibleNetwork extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Array }) networkImages: string[] = ['']

  @property() public text = ''

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <button>
        <wui-text variant="md-regular" color="inherit">${this.text}</wui-text>
        <wui-flex>
          ${this.networksTemplate()}
          <wui-icon name="chevronRight" size="sm" color="inherit"></wui-icon>
        </wui-flex>
      </button>
    `
  }

  // -- Private ------------------------------------------- //
  private networksTemplate() {
    const slicedNetworks = this.networkImages.slice(0, 5)

    return html` <wui-flex class="networks">
      ${slicedNetworks?.map(
        network =>
          html` <wui-flex class="network-icon"> <wui-image src=${network}></wui-image> </wui-flex>`
      )}
    </wui-flex>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-compatible-network': WuiCompatibleNetwork
  }
}
