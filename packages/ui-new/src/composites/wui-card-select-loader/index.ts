import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import { networkSvgMd } from '../../assets/svg/networkMd.js'
import '../../components/wui-shimmer/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { CardSelectType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-card-select-loader')
export class WuiCardSelectLoader extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public type: CardSelectType = 'wallet'

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      ${this.shimmerTemplate()}
      <wui-shimmer width="56px" height="20px" borderRadius="xs"></wui-shimmer>
    `
  }

  private shimmerTemplate() {
    if (this.type === 'network') {
      return html` <wui-shimmer
          data-type=${this.type}
          width="48px"
          height="54px"
          borderRadius="xs"
        ></wui-shimmer>
        ${networkSvgMd}`
    }

    return html`<wui-shimmer width="56px" height="56px" borderRadius="xs"></wui-shimmer>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-card-select-loader': WuiCardSelectLoader
  }
}
