import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-shimmer'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil'
import styles from './styles'
import { networkSvg } from '../../assets/svg/network'
import type { CardSelectType } from '../../utils/TypesUtil'

@customElement('wui-card-select-loader')
export class WuiCardSelectLoader extends LitElement {
  public static styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public type: CardSelectType = 'wallet'

  // -- Render -------------------------------------------- //
  public render() {
    return html`
      ${this.shimmerTemplate()}
      <wui-shimmer width="56px" height="20px" borderRadius="xs"></wui-shimmer>
    `
  }

  private shimmerTemplate() {
    if (this.type === 'network') {
      return html` <wui-shimmer
          type=${this.type}
          width="48px"
          height="54px"
          borderRadius="xs"
        ></wui-shimmer>
        ${networkSvg}`
    }

    return html` <wui-shimmer width="56px" height="56px" borderRadius="xs"></wui-shimmer>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-card-select-loader': WuiCardSelectLoader
  }
}
