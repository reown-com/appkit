import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import styles from './styles.js'

@customElement('wui-loading-thumbnail')
export class WuiLoadingThumbnail extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Number }) public radius = 36

  // -- Render -------------------------------------------- //
  public override render() {
    return this.svgLoaderTemplate()
  }

  private svgLoaderTemplate() {
    const radius = this.radius > 50 ? 50 : this.radius
    const standardValue = 36
    const radiusFactor = standardValue - radius
    const dashArrayStart = 116 + radiusFactor
    const dashArrayEnd = 245 + radiusFactor
    const dashOffset = 360 + radiusFactor * 1.75

    return html`
      <svg viewBox="0 0 110 110" width="110" height="110">
        <rect
          x="2"
          y="2"
          width="106"
          height="106"
          rx=${radius}
          stroke-dasharray="${dashArrayStart} ${dashArrayEnd}"
          stroke-dashoffset=${dashOffset}
        />
      </svg>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-loading-thumbnail': WuiLoadingThumbnail
  }
}
