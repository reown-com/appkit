import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'
import '../wui-tooltip/index.js'
import '../../components/wui-icon/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { IconType } from '../../utils/TypeUtil.js'

@customElement('wui-tooltip-select')
export class WuiTooltipSelect extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() text = ''

  @property() icon: IconType = 'card'

  // -- Render -------------------------------------------- //
  public override render() {
    return html`<button
        @mouseenter=${this.onMouseEnter.bind(this)}
        @mouseleave=${this.onMouseLeave.bind(this)}
        ontouchstart
      >
        <wui-icon color="accent-100" name=${this.icon} size="lg"></wui-icon>
      </button>
      <wui-tooltip variant="shade" message=${this.text} placement="top"></wui-tooltip>`
  }

  // -- Private ------------------------------------------- //
  private onMouseEnter() {
    const element = this.shadowRoot?.querySelector('wui-tooltip')
    if (element) {
      element?.animate([{ opacity: 0 }, { opacity: 1 }], {
        fill: 'forwards',
        easing: 'ease',
        duration: 250
      })
    }
  }

  private onMouseLeave() {
    const element = this.shadowRoot?.querySelector('wui-tooltip')
    if (element) {
      element?.animate([{ opacity: 1 }, { opacity: 0 }], {
        fill: 'forwards',
        easing: 'ease',
        duration: 200
      })
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-tooltip-select': WuiTooltipSelect
  }
}
