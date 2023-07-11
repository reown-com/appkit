import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import '../../components/wui-shimmer'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil'
import styles from './styles'
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
        <svg width="48" height="53" fill="none">
          <path
            d="M20.041 1.061a7.915 7.915 0 0 1 7.918 0l16.082 9.29A7.922 7.922 0 0 1 48 17.21v18.578c0 2.83-1.51 5.445-3.959 6.86l-16.082 9.29a7.915 7.915 0 0 1-7.918 0l-16.082-9.29A7.922 7.922 0 0 1 0 35.79V17.211c0-2.83 1.51-5.445 3.959-6.86l16.082-9.29Z"
          />
        </svg>`
    }

    return html` <wui-shimmer width="56px" height="56px" borderRadius="xs"></wui-shimmer>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-card-select-loader': WuiCardSelectLoader
  }
}
