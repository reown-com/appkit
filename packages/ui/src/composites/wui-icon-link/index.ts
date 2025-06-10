import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import { colorStyles, elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { ColorType, IconType, SizeType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

@customElement('wui-icon-link')
export class WuiIconLink extends LitElement {
  public static override styles = [resetStyles, elementStyles, colorStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public size: SizeType = 'md'

  @property({ type: Boolean }) public disabled = false

  @property() public icon: IconType = 'copy'

  @property() public iconColor: ColorType = 'inherit'

  // -- Render -------------------------------------------- //
  public override render() {
    this.dataset['size'] = this.size

    let borderRadius = ''
    let padding = ''

    switch (this.size) {
      case 'lg':
        borderRadius = '--wui-border-radius-xs'
        padding = '--wui-spacing-1xs'
        break

      case 'sm':
        borderRadius = '--wui-border-radius-3xs'
        padding = '--wui-spacing-xxs'
        break

      default:
        borderRadius = '--wui-border-radius-xxs'
        padding = '--wui-spacing-2xs'
        break
    }

    this.style.cssText = `
    --local-border-radius: var(${borderRadius});
    --local-padding: var(${padding});
    `

    return html`
      <button ?disabled=${this.disabled}>
        <wui-icon color=${this.iconColor} size=${this.size} name=${this.icon}></wui-icon>
      </button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-icon-link': WuiIconLink
  }
}
