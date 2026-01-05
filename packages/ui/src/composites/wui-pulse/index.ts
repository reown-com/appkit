import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import { vars } from '../../utils/ThemeHelperUtil.js'
import { resetStyles } from '../../utils/ThemeUtil.js'
import type { PulseVariant } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

// -- Constants ------------------------------------------ //
const DEFAULT_RINGS = 3
const DEFAULT_DURATION = 2
const DEFAULT_OPACITY = 0.3
const DEFAULT_SIZE = '200px'

const COLOR_BY_VARIANT = {
  'accent-primary': vars.tokens.core.backgroundAccentPrimary
} as const

@customElement('wui-pulse')
export class WuiPulse extends LitElement {
  public static override styles = [resetStyles, styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Number }) public rings = DEFAULT_RINGS
  @property({ type: Number }) public duration = DEFAULT_DURATION
  @property({ type: Number }) public opacity = DEFAULT_OPACITY
  @property() public size = DEFAULT_SIZE
  @property() public variant: PulseVariant = 'accent-primary'

  // -- Render -------------------------------------------- //
  public override render() {
    const color = COLOR_BY_VARIANT[this.variant]

    this.style.cssText = `
      --pulse-size: ${this.size};
      --pulse-duration: ${this.duration}s;
      --pulse-color: ${color};
      --pulse-opacity: ${this.opacity};
    `

    const ringElements = Array.from({ length: this.rings }, (_, i) =>
      this.renderRing(i, this.rings)
    )

    return html`
      <div class="pulse-container">
        <div class="pulse-rings">${ringElements}</div>
        <div class="pulse-content">
          <slot></slot>
        </div>
      </div>
    `
  }

  private renderRing(index: number, total: number) {
    const delay = (index / total) * this.duration
    const style = `animation-delay: ${delay}s;`

    return html`<div class="pulse-ring" style=${style}></div>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-pulse': WuiPulse
  }
}
